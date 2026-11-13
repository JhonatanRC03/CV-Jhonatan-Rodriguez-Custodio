"""Carga el CV y los proyectos desde disco, en el idioma pedido.

Los proyectos viven en archivos independientes bajo `data/projects/`. El prefijo
numérico del nombre define el orden, así que añadir un proyecto es soltar un
archivo nuevo: no hay índice que mantener.

Idiomas: el español es el original (`data/`). Cada traducción replica la misma
estructura en `data/<lang>/` (por ejemplo `data/en/cv.json` y
`data/en/projects/02-risk-agents.json`). Si falta un archivo traducido se usa
el original, así que un proyecto nuevo nunca desaparece de la versión en inglés.

Hay dos vistas del mismo dato:
  · `load_cv()`      — detalle completo, alimenta la web (modal de arquitectura).
  · `load_cv_brief()`— resumen, alimenta el prompt del asistente.
El diagrama y el flujo no aportan nada a la conversación y triplicarían
el contexto enviado al modelo en cada pregunta.
"""

import json
from functools import lru_cache

from config import Config

REQUIRED_PROJECT_FIELDS = ("id", "title", "category", "description", "tech")

# Campos del proyecto que sí son útiles para responder preguntas.
PROJECT_BRIEF_FIELDS = ("title", "category", "status", "description", "problem", "tech")


def normalize_lang(lang):
    lang = (lang or "").lower()[:2]
    return lang if lang in Config.LANGUAGES else Config.DEFAULT_LANGUAGE


def _read(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _localized(path, lang):
    """Ruta traducida si existe; si no, la original."""
    if lang == Config.DEFAULT_LANGUAGE:
        return path

    translated = Config.DATA_DIR / lang / path.relative_to(Config.DATA_DIR)
    return translated if translated.exists() else path


@lru_cache(maxsize=len(Config.LANGUAGES))
def load_projects(lang=Config.DEFAULT_LANGUAGE):
    projects = []

    for path in sorted(Config.PROJECTS_DIR.glob("*.json")):
        project = _read(_localized(path, lang))
        missing = [f for f in REQUIRED_PROJECT_FIELDS if f not in project]

        if missing:
            raise ValueError(f"{path.name} ({lang}): faltan campos {missing}")

        projects.append(project)

    return projects


@lru_cache(maxsize=len(Config.LANGUAGES))
def load_cv(lang=Config.DEFAULT_LANGUAGE):
    cv = _read(_localized(Config.CV_DATA_PATH, lang))
    return {**cv, "projects": load_projects(lang)}


@lru_cache(maxsize=len(Config.LANGUAGES))
def load_cv_brief(lang=Config.DEFAULT_LANGUAGE):
    """CV con los proyectos resumidos, para el contexto del asistente."""
    projects = [
        {k: p[k] for k in PROJECT_BRIEF_FIELDS if k in p} for p in load_projects(lang)
    ]
    cv = _read(_localized(Config.CV_DATA_PATH, lang))
    return {**cv, "projects": projects}


def get_section(name, lang=Config.DEFAULT_LANGUAGE):
    return load_cv(lang).get(name)


def get_project(project_id, lang=Config.DEFAULT_LANGUAGE):
    return next((p for p in load_projects(lang) if p["id"] == project_id), None)
