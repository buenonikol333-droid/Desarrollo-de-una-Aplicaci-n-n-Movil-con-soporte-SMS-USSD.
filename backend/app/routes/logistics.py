from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Vehiculo, SolicitudTransporte

logistics_bp = Blueprint("logistics", __name__)


@logistics_bp.get("/logistica/estado")
def estado_logistica():
    disponibles = Vehiculo.query.filter_by(disponible=True, estado="activo").count()
    return jsonify(
        {
            "vehiculosDisponibles": disponibles,
            "estadoVias": "Sin novedades en las rutas",
            "ultimoDespacho": "Sin despachos recientes",
        }
    )


@logistics_bp.post("/transporte/solicitudes")
@jwt_required()
def crear_solicitud():
    palmicultor_id = get_jwt_identity()
    data = request.get_json(force=True) or {}

    solicitud = SolicitudTransporte(
        palmicultor_id=palmicultor_id,
        finca_id=data.get("finca_id"),
        lote_id=data.get("lote_id"),
        comprador_id=data.get("comprador_id"),
        cantidad_estimada=data.get("cantidad_estimada"),
        origen=data.get("origen"),
        destino=data.get("destino"),
        tarifa_sugerida=data.get("tarifa_sugerida"),
        observaciones=data.get("observaciones"),
        estado="Pendiente",
    )
    db.session.add(solicitud)
    db.session.commit()

    return jsonify({"id": solicitud.id, "estado": solicitud.estado}), 201
