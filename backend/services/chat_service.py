"""Asistente basado en reglas sobre los datos del CV (sin dependencias externas)."""

import unicodedata

from services.cv_service import load_cv

FALLBACK = (
    "Puedo contarte sobre su experiencia en Azure e IA generativa, sus proyectos "
    "RAG y multiagente, sus certificaciones Microsoft o cómo contactarlo. "
    "¿Qué te interesa?"
)


def _normalize(text):
    text = unicodedata.normalize("NFD", text.lower())
    return "".join(c for c in text if unicodedata.category(c) != "Mn")


def _answer_azure(cv):
    codes = ", ".join(c["code"] for c in cv["certifications"])
    return (
        f"Jhonatan trabaja a diario sobre Microsoft Azure y cuenta con las "
        f"certificaciones {codes}. Ha implementado Azure AI Foundry, Azure OpenAI, "
        f"Azure AI Search, Document Intelligence, Azure Functions y AKS en proyectos "
        f"reales para el MEF y el BCP."
    )


def _answer_projects(cv):
    titles = " · ".join(p["title"] for p in cv["projects"][:4])
    return (
        f"Algunos de sus proyectos destacados: {titles}. "
        f"Puedes ver el detalle completo en la sección de Proyectos."
    )


def _answer_experience(cv):
    current = cv["experience"][0]
    return (
        f"Actualmente es {current['role']} en {current['company']} "
        f"({current['period']}), donde lidera soluciones de IA generativa para "
        f"instituciones financieras y públicas. Antes trabajó en Shintek (España) "
        f"en ciencia de datos y visión por computadora."
    )


def _answer_rag(cv):
    return (
        "Diseña sistemas RAG multimodales en producción: búsqueda híbrida con "
        "semantic ranker sobre Azure AI Search, extracción documental con Document "
        "Intelligence y respuestas con citas trazables al documento fuente. "
        "El caso más representativo es GyS AVI para el Ministerio de Economía y Finanzas."
    )


def _answer_agents(cv):
    return (
        "Construye arquitecturas multiagente con Azure AI Foundry Agent Framework, "
        "Semantic Kernel y MCP. Ejemplos: Risk Agents para riesgo crediticio y un "
        "sistema de seis agentes secuenciales para disputas bancarias con "
        "Human-in-the-Loop antes de acciones irreversibles."
    )


def _answer_contact(cv):
    p = cv["profile"]
    return f"Puedes escribirle a {p['email']}, llamarlo al {p['phone']} o conectar en LinkedIn: {p['linkedin']}"


def _answer_skills(cv):
    cats = ", ".join(s["category"] for s in cv["skills"][:5])
    return f"Su stack cubre {cats} y más. Revisa la sección de Stack Tecnológico para el detalle."


def _answer_education(cv):
    e = cv["education"][0]
    return f"Es {e['degree']} por la {e['institution']} ({e['period']}), complementado con formación en Data Science y Data Analysis."


def _answer_mentoring(cv):
    items = " · ".join(m["title"] for m in cv["mentoring"])
    return f"Ha participado como mentor y facilitador en: {items}."


INTENTS = [
    (("azure", "cloud", "certificacion", "certificado", "microsoft", "ai-102", "dp-100"), _answer_azure),
    (("rag", "multimodal", "busqueda", "search", "chatbot", "documento"), _answer_rag),
    (("agente", "agentes", "multiagente", "mcp", "foundry", "semantic kernel", "orquesta"), _answer_agents),
    (("proyecto", "proyectos", "portafolio", "trabajo realizado"), _answer_projects),
    (("experiencia", "trabajo", "empresa", "laboral", "anios", "years"), _answer_experience),
    (("contacto", "correo", "email", "telefono", "linkedin", "contratar", "escribir"), _answer_contact),
    (("skill", "habilidad", "stack", "tecnologia", "lenguaje", "python"), _answer_skills),
    (("educacion", "universidad", "estudio", "carrera", "bachiller"), _answer_education),
    (("mentor", "hackaton", "hackathon", "taller", "charla"), _answer_mentoring),
]


def answer(question):
    if not question or not question.strip():
        return FALLBACK

    normalized = _normalize(question)
    cv = load_cv()

    for keywords, handler in INTENTS:
        if any(kw in normalized for kw in keywords):
            return handler(cv)

    return FALLBACK
