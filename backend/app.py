from flask import Flask, abort, send_from_directory
from flask_cors import CORS

from config import Config
from routes.api import api


def register_frontend(app):
    """Sirve el frontend estático desde el mismo origen que la API.

    Así basta un único proceso (local o en PythonAnywhere) y el frontend llama a
    `/api` sin URL absoluta ni CORS. Si el hosting ya mapea archivos estáticos
    (p. ej. "Static files" en PythonAnywhere), esas reglas tienen prioridad y
    estas rutas simplemente no se usan.
    """
    root = Config.FRONTEND_DIR

    if not root.exists():
        return

    @app.get("/")
    def index():
        return send_from_directory(root, "index.html")

    @app.get("/<path:filename>")
    def frontend_file(filename):
        if filename.startswith("api/"):
            abort(404)
        return send_from_directory(root, filename)


# HTML, JS y CSS se revalidan en cada visita (respuesta 304 si no cambiaron):
# tras un despliegue nadie mezcla el HTML nuevo con un JS viejo en caché.
# Imágenes e iconos cambian poco y pueden cachearse una semana.
REVALIDATE = ("text/html", "text/css", "javascript", "application/json")
LONG_CACHE = ("image/",)


def add_headers(response):
    content_type = response.content_type or ""

    if any(kind in content_type for kind in REVALIDATE):
        response.headers["Cache-Control"] = "no-cache"
    elif content_type.startswith(LONG_CACHE):
        response.headers["Cache-Control"] = "public, max-age=604800"

    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("X-Frame-Options", "DENY")
    return response


def create_app():
    app = Flask(__name__, static_folder=None)
    app.config.from_object(Config)
    app.json.ensure_ascii = False
    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})
    app.register_blueprint(api)
    register_frontend(app)
    app.after_request(add_headers)
    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=Config.DEBUG, port=Config.PORT)
