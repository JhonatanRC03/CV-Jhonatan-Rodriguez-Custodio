from flask import Blueprint, jsonify, request

from services import chat_service, cv_service

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


@api.get("/cv")
def get_cv():
    return jsonify(cv_service.load_cv())


@api.get("/<section>")
def get_section(section):
    if section not in SECTIONS:
        return jsonify({"error": "Sección no encontrada"}), 404
    return jsonify(cv_service.get_section(section))


@api.post("/chat")
def chat():
    payload = request.get_json(silent=True) or {}
    reply = chat_service.answer(payload.get("message", ""))
    return jsonify({"reply": reply})


@api.post("/contact")
def contact():
    payload = request.get_json(silent=True) or {}
    missing = [f for f in ("name", "email", "message") if not payload.get(f, "").strip()]
    if missing:
        return jsonify({"error": "Campos requeridos", "fields": missing}), 400

    return jsonify({"message": "Mensaje recibido. Gracias por escribir."}), 201
