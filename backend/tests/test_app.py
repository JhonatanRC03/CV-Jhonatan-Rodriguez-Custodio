"""Pruebas rápidas de la API y de la coherencia de los datos.

Se ejecutan desde la carpeta backend:  python -m pytest
No llaman al modelo: solo validan rutas, datos y reglas que no requieren red.
"""

import json

import pytest

from app import app as flask_app
from config import Config
from services import rate_limiter

DIAGRAM_KINDS = {
    "user", "compute", "ai", "agent", "data", "security",
    "observability", "integration", "external",
}


@pytest.fixture()
def client():
    flask_app.config["TESTING"] = True
    return flask_app.test_client()


def _read(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


# ── Datos ──────────────────────────────────────────────

@pytest.mark.parametrize("lang", Config.LANGUAGES)
def test_cv_loads_in_every_language(client, lang):
    res = client.get(f"/api/cv?lang={lang}")
    assert res.status_code == 200
    cv = res.get_json()
    assert cv["profile"]["name"]
    assert len(cv["projects"]) >= 1


def test_both_languages_have_same_projects_in_same_order(client):
    es = [p["id"] for p in client.get("/api/cv?lang=es").get_json()["projects"]]
    en = [p["id"] for p in client.get("/api/cv?lang=en").get_json()["projects"]]
    assert es == en


def test_every_project_has_english_translation():
    missing = [
        path.name
        for path in Config.PROJECTS_DIR.glob("*.json")
        if not (Config.DATA_DIR / "en" / "projects" / path.name).exists()
    ]
    assert not missing, f"Falta la traducción en data/en/projects/: {missing}"


def test_translated_project_keeps_same_id():
    for path in Config.PROJECTS_DIR.glob("*.json"):
        translated = Config.DATA_DIR / "en" / "projects" / path.name
        if translated.exists():
            assert _read(path)["id"] == _read(translated)["id"], path.name


@pytest.mark.parametrize("lang", Config.LANGUAGES)
def test_diagram_nodes_use_known_kinds(client, lang):
    for project in client.get(f"/api/cv?lang={lang}").get_json()["projects"]:
        for layer in project.get("architecture", {}).get("layers", []):
            for node in layer["nodes"]:
                assert node.get("kind", "compute") in DIAGRAM_KINDS, (project["id"], node)


def test_unknown_language_falls_back_to_spanish(client):
    cv = client.get("/api/cv?lang=fr").get_json()
    assert cv == client.get("/api/cv?lang=es").get_json()


def test_unknown_section_returns_404(client):
    assert client.get("/api/nope").status_code == 404


# ── Chat (sin llamar al modelo) ───────────────────────

def test_chat_rejects_empty_message_in_requested_language(client):
    res = client.post("/api/chat", json={"message": "  ", "lang": "en"})
    assert res.status_code == 400
    assert res.get_json()["error"] == "Please type a question."


def test_chat_rejects_too_long_message(client):
    res = client.post("/api/chat", json={"message": "x" * (Config.CHAT_MAX_CHARS + 1)})
    assert res.status_code == 400


def test_quota_endpoint(client):
    data = client.get("/api/chat/quota").get_json()
    assert data["limit"] == Config.CHAT_MAX_QUESTIONS
    assert 0 <= data["remaining"] <= data["limit"]


def test_rate_limiter_blocks_after_limit():
    identity = "test-identity"
    rate_limiter._usage.pop(identity, None)

    for _ in range(Config.CHAT_MAX_QUESTIONS):
        allowed, _, _ = rate_limiter.check(identity)
        assert allowed
        rate_limiter.consume(identity)

    allowed, remaining, retry_after = rate_limiter.check(identity)
    assert not allowed and remaining == 0 and retry_after > 0
    rate_limiter._usage.pop(identity, None)


def test_proxy_header_only_trusted_when_enabled(client, monkeypatch):
    from routes import api as api_module

    def identity_for(ip):
        with flask_app.test_request_context(headers={"X-Real-IP": ip}):
            return api_module._identity()

    monkeypatch.setattr(Config, "TRUST_PROXY", False)
    assert identity_for("1.1.1.1") == identity_for("2.2.2.2")

    monkeypatch.setattr(Config, "TRUST_PROXY", True)
    assert identity_for("1.1.1.1") != identity_for("2.2.2.2")


# ── Frontend y cabeceras ──────────────────────────────

def test_frontend_is_served_and_revalidated(client):
    res = client.get("/")
    assert res.status_code == 200
    assert res.headers["Cache-Control"] == "no-cache"
    assert client.get("/js/main.js").headers["Cache-Control"] == "no-cache"


def test_images_are_cached(client):
    res = client.get("/assets/img/profile.jpg")
    assert res.status_code == 200
    assert "max-age" in res.headers["Cache-Control"]


def test_security_headers(client):
    headers = client.get("/").headers
    assert headers["X-Content-Type-Options"] == "nosniff"
    assert headers["X-Frame-Options"] == "DENY"
