"""Carga el CV y los proyectos desde disco.

Los proyectos viven en archivos independientes bajo `data/projects/`. El prefijo
numérico del nombre define el orden, así que añadir un proyecto es soltar un
archivo nuevo: no hay índice que mantener.

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


def _read(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def load_projects():
    projects = []

    for path in sorted(Config.PROJECTS_DIR.glob("*.json")):
        project = _read(path)
        missing = [f for f in REQUIRED_PROJECT_FIELDS if f not in project]

        if missing:
            raise ValueError(f"{path.name}: faltan campos {missing}")

        projects.append(project)

    return projects


@lru_cache(maxsize=1)
def load_cv():
    return {**_read(Config.CV_DATA_PATH), "projects": load_projects()}


@lru_cache(maxsize=1)
def load_cv_brief():
    """CV con los proyectos resumidos, para el contexto del asistente."""
    projects = [
        {k: p[k] for k in PROJECT_BRIEF_FIELDS if k in p} for p in load_projects()
    ]
    return {**_read(Config.CV_DATA_PATH), "projects": projects}


def get_section(name):
    return load_cv().get(name)


def get_project(project_id):
    return next((p for p in load_projects() if p["id"] == project_id), None)
