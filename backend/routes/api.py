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

MESSAGES = {
    "es": {
        "not_found": "Sección no encontrada",
        "empty": "Escribe una pregunta.",
        "too_long": "Máximo {n} caracteres.",
        "limit": (
            "Alcanzaste el límite de {n} preguntas. Podrás continuar en {h} h. "
            "Mientras tanto, escríbele directamente."
        ),
        "unavailable": "El asistente no está disponible ahora.",
    },
    "en": {
        "not_found": "Section not found",
        "empty": "Please type a question.",
        "too_long": "Maximum {n} characters.",
        "limit": (
            "You reached the limit of {n} questions. You can continue in {h} h. "
            "In the meantime, feel free to contact him directly."
        ),
        "unavailable": "The assistant is not available right now.",
    },
}


def _lang(payload=None):
    raw = request.args.get("lang") or (payload or {}).get("lang")
    return cv_service.normalize_lang(raw)


def _msg(lang, key, **kwargs):
    return MESSAGES[lang][key].format(**kwargs)


def _sse(event, data):
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def _identity():
    """Cuota por IP del visitante, almacenada como hash para no guardar la IP en claro."""
    ip = request.remote_addr or "unknown"

    # Solo se confía en las cabeceras del proxy si el despliegue lo declara explícitamente.
    # PythonAnywhere entrega la IP del visitante en X-Real-IP; sin esto, remote_addr
    # es la del balanceador y todos los visitantes compartirían la misma cuota.
    if Config.TRUST_PROXY:
        real_ip = request.headers.get("X-Real-IP", "").strip()
        forwarded = request.headers.get("X-Forwarded-For", "")
        if real_ip:
            ip = real_ip
        elif forwarded:
            ip = forwarded.split(",")[0].strip()

    return hashlib.sha256(ip.encode()).hexdigest()


@api.get("/cv")
def get_cv():
    return jsonify(cv_service.load_cv(_lang()))


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


@api.get("/<section>")
def get_section(section):
    lang = _lang()
    if section not in SECTIONS:
        return jsonify({"error": _msg(lang, "not_found")}), 404
    return jsonify(cv_service.get_section(section, lang))


@api.post("/chat")
def chat():
    payload = request.get_json(silent=True) or {}
    lang = _lang(payload)
    message = str(payload.get("message", "")).strip()

    if not message:
        return jsonify({"error": _msg(lang, "empty")}), 400

    if len(message) > Config.CHAT_MAX_CHARS:
        return jsonify({"error": _msg(lang, "too_long", n=Config.CHAT_MAX_CHARS)}), 400

    identity = _identity()
    allowed, remaining, retry_after = rate_limiter.check(identity)

    if not allowed:
        hours = round(retry_after / 3600, 1)
        return (
            jsonify(
                {
                    "error": _msg(lang, "limit", n=Config.CHAT_MAX_QUESTIONS, h=hours),
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
            for kind, data in chat_service.stream_answer(message, history, lang):
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
            yield _sse("error", {"error": _msg(lang, "unavailable")})
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
