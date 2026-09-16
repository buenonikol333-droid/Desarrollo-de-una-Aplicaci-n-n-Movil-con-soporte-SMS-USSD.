from flask import Blueprint, jsonify
from app.models import Precio, Comprador
from app.extensions import db

market_bp = Blueprint("market", __name__)


@market_bp.get("/precios/vigente")
def precio_vigente():
    precio = (
        Precio.query.filter_by(estado="activo")
        .order_by(Precio.fecha_publicacion.desc())
        .first()
    )
    if not precio:
        return jsonify({"valor": None, "unidad": "Tonelada", "fecha": None}), 200

    return jsonify(
        {
            "valor": float(precio.valor_moneda),
            "unidad": precio.unidad,
            "fecha": precio.fecha_publicacion.strftime("%d/%m/%Y"),
        }
    )


@market_bp.get("/compradores/cercanos")
def compradores_cercanos():
    compradores = Comprador.query.filter_by(estado="activo").limit(10).all()
    return jsonify(
        [
            {
                "id": c.id,
                "nombre": c.empresa,
                "distanciaKm": 0,  # placeholder hasta integrar cálculo real por coordenadas
                "verificado": True,
                "logoUrl": None,
            }
            for c in compradores
        ]
    )
