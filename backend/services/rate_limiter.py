"""Límite de preguntas por identidad (IP + sesión) en ventana deslizante."""

import threading
import time

from config import Config

_lock = threading.Lock()
_usage: dict[str, list[float]] = {}

WINDOW_SECONDS = Config.CHAT_WINDOW_HOURS * 3600


def _prune(timestamps, now):
    return [t for t in timestamps if now - t < WINDOW_SECONDS]


def check(identity):
    """Devuelve (permitido, restantes, segundos_de_espera) sin consumir cuota."""
    now = time.time()

    with _lock:
        hits = _prune(_usage.get(identity, []), now)
        _usage[identity] = hits

    remaining = Config.CHAT_MAX_QUESTIONS - len(hits)

    if remaining > 0:
        return True, remaining, 0

    retry_after = int(WINDOW_SECONDS - (now - min(hits)))
    return False, 0, max(retry_after, 1)


def consume(identity):
    """Registra una pregunta y devuelve cuántas quedan."""
    now = time.time()

    with _lock:
        hits = _prune(_usage.get(identity, []), now)
        hits.append(now)
        _usage[identity] = hits

    return max(Config.CHAT_MAX_QUESTIONS - len(hits), 0)
