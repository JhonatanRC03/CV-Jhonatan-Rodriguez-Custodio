import json
from functools import lru_cache

from config import Config


@lru_cache(maxsize=1)
def load_cv():
    with open(Config.CV_DATA_PATH, encoding="utf-8") as f:
        return json.load(f)


def get_section(name):
    return load_cv().get(name)
