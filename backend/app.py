from flask import Flask
from flask_cors import CORS

from config import Config
from routes.api import api


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, origins=Config.CORS_ORIGINS)
    app.register_blueprint(api)
    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=Config.DEBUG, port=Config.PORT)
