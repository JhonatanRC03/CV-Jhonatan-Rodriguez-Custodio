import hashlib
import json
import logging
import time

from flask import Blueprint, Response, jsonify, request, stream_with_context

from config import Config
from services import chat_service, cv_service, rate_limiter

log = logging.getLogger(__name__)

api = Blueprint("api", __name__, url_prefix="/api")

SECTIONS = (
    "profile",
    "experience",
    "projects",
    "skills",
    "certifications",
    "education",
    "mentoring",
)


def _sse(event, data):
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def _identity():
    """Cuota por IP del visitante, almacenada como hash para no guardar la IP en claro."""
    ip = request.remote_addr or "unknown"

    # Solo se confía en la cabecera del proxy si el despliegue lo declara explícitamente.
    if Config.TRUST_PROXY:
        forwarded = request.headers.get("X-Forwarded-For", "")
        if forwarded:
            ip = forwarded.split(",")[0].strip()

    return hashlib.sha256(ip.encode()).hexdigest()


@api.get("/cv")
def get_cv():
    return jsonify(cv_service.load_cv())


@api.get("/<section>")
def get_section(section):
    if section not in SECTIONS:
        return jsonify({"error": "Sección no encontrada"}), 404
    return jsonify(cv_service.get_section(section))


@api.get("/chat/quota")
def chat_quota():
    _, remaining, retry_after = rate_limiter.check(_identity())
    return jsonify(
        {
            "remaining": remaining,
            "limit": Config.CHAT_MAX_QUESTIONS,
            "retryAfter": retry_after,
            "model": Config.AZURE_AI_DEPLOYMENT,
        }
    )


@api.post("/chat")
def chat():
    payload = request.get_json(silent=True) or {}
    message = str(payload.get("message", "")).strip()

    if not message:
        return jsonify({"error": "Escribe una pregunta."}), 400

    if len(message) > Config.CHAT_MAX_CHARS:
        return jsonify({"error": f"Máximo {Config.CHAT_MAX_CHARS} caracteres."}), 400

    identity = _identity()
    allowed, remaining, retry_after = rate_limiter.check(identity)

    if not allowed:
        hours = round(retry_after / 3600, 1)
        return (
            jsonify(
                {
                    "error": (
                        f"Alcanzaste el límite de {Config.CHAT_MAX_QUESTIONS} preguntas. "
                        f"Podrás continuar en {hours} h. Mientras tanto, escríbele directamente."
                    ),
                    "remaining": 0,
                    "retryAfter": retry_after,
                }
            ),
            429,
        )

    history = payload.get("history") if isinstance(payload.get("history"), list) else []

    def events():
        started = time.perf_counter()
        yield _sse("start", {"model": Config.AZURE_AI_DEPLOYMENT, "remaining": remaining})

        left = remaining
        charged = False

        try:
            for kind, data in chat_service.stream_answer(message, history):
                if kind == "delta":
                    # Solo se cobra si el modelo respondió: un fallo no gasta cuota.
                    if not charged:
                        left = rate_limiter.consume(identity)
                        charged = True
                    yield _sse("delta", {"text": data})
                else:
                    yield _sse("usage", data or {})
        except Exception:
            log.exception("Fallo al consultar el modelo")
            yield _sse("error", {"error": "El asistente no está disponible ahora."})
            return

        yield _sse(
            "done",
            {"latency": round(time.perf_counter() - started, 2), "remaining": left},
        )

    return Response(
        stream_with_context(events()),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
