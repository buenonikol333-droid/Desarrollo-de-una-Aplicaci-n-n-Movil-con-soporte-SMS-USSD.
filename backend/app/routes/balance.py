from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models import PronosticoProduccion, Lote, Finca, BalanceIndustrial
from app.utils import role_required, current_user_id

balance_bp = Blueprint("balance", __name__)

# RN05 — balance de extracción industrial por cada 100 kg de fruto fresco.
PORCENTAJES = {
    "humedad": 10,
    "tusas": 20,
    "fibras": 15,
    "aguas_impurezas": 21,
    "cuesco": 7,
    "palmiste": 5,
    "aceite_crudo": 22,
}
ETIQUETAS = {
    "humedad": "Pérdida por humedad en autoclaves",
    "tusas": "Tusas / raquis vacíos",
    "fibras": "Fibras del prensado",
    "aguas_impurezas": "Aguas lodosas / impurezas",
    "cuesco": "Descarte de endocarpio / cuesco",
    "palmiste": "Almendras secas / palmiste",
    "aceite_crudo": "Aceite crudo de palma extraído",
}


@balance_bp.post("/balance/calcular")
@role_required("palmicultor")
def calcular_balance():
    data = request.get_json(force=True) or {}

    entrada_kg = data.get("entrada_kg")
    pronostico_id = data.get("pronostico_id")

    if pronostico_id:
        pronostico = (
            PronosticoProduccion.query.join(Lote)
            .join(Finca)
            .filter(PronosticoProduccion.id == pronostico_id, Finca.usuario_id == current_user_id())
            .first()
        )
        if not pronostico:
            return jsonify({"message": "El pronóstico indicado no existe o no te pertenece."}), 400
        entrada_kg = pronostico.produccion_estimada_kg
    elif entrada_kg is None:
        return jsonify({"message": "Indica los kg de fruto fresco de entrada o un pronóstico."}), 400

    entrada_kg = float(entrada_kg)
    if entrada_kg <= 0:
        return jsonify({"message": "La cantidad de entrada debe ser mayor a cero."}), 400

    desglose = {
        clave: {
            "etiqueta": ETIQUETAS[clave],
            "porcentaje": pct,
            "kg": round(entrada_kg * pct / 100, 3),
        }
        for clave, pct in PORCENTAJES.items()
    }
    aceite_crudo_kg = desglose["aceite_crudo"]["kg"]

    registro = BalanceIndustrial(
        usuario_id=current_user_id(),
        pronostico_id=pronostico_id,
        entrada_kg=entrada_kg,
        desglose=desglose,
        aceite_crudo_kg=aceite_crudo_kg,
    )
    db.session.add(registro)
    db.session.commit()

    return jsonify(_serialize(registro)), 201


@balance_bp.get("/balance/historial")
@role_required("palmicultor")
def historial_balance():
    registros = (
        BalanceIndustrial.query.filter_by(usuario_id=current_user_id())
        .order_by(BalanceIndustrial.fecha.desc())
        .limit(50)
        .all()
    )
    return jsonify([_serialize(r) for r in registros])


def _serialize(r: BalanceIndustrial):
    return {
        "id": r.id,
        "entrada_kg": r.entrada_kg,
        "desglose": r.desglose,
        "aceite_crudo_kg": r.aceite_crudo_kg,
        "rendimiento_porcentaje": PORCENTAJES["aceite_crudo"],
        "pronostico_id": r.pronostico_id,
        "fecha": r.fecha.isoformat() if r.fecha else None,
    }
