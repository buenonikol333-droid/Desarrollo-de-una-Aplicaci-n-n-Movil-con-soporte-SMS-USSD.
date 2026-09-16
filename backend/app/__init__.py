from flask import Flask
from flask_cors import CORS
from config import Config
from app.extensions import db, migrate, jwt


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    from app.routes.auth import auth_bp
    from app.routes.market import market_bp
    from app.routes.logistics import logistics_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(market_bp, url_prefix="/api")
    app.register_blueprint(logistics_bp, url_prefix="/api")

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    return app
