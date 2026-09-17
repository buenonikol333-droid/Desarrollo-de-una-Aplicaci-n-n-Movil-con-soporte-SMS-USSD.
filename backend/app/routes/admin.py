from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models import (
    Usuario,
    Transportador,
    Finca,
    Lote,
    PublicacionMercado,
    SolicitudTransporte,
    Comprador,
)
from app.utils import role_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.get("/admin/usuarios")
@role_required("administrador")
def listar_usuarios():
    rol = request.args.get("rol")
    query = Usuario.query
    if rol:
        query = query.filter_by(rol=rol)
    usuarios = query.order_by(Usuario.fecha_registro.desc()).all()
    return jsonify([_serialize_usuario(u) for u in usuarios])


@admin_bp.patch("/admin/usuarios/<int:usuario_id>/estado")
@role_required("administrador")
def cambiar_estado_usuario(usuario_id):
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"message": "Usuario no encontrado."}), 404

    data = request.get_json(force=True) or {}
    nuevo_estado = data.get("estado")
    if nuevo_estado not in ("activo", "suspendido"):
        return jsonify({"message": "Estado inválido."}), 400

    usuario.estado = nuevo_estado
    db.session.commit()
    return jsonify(_serialize_usuario(usuario))


@admin_bp.get("/admin/transportadores/pendientes")
@role_required("administrador")
def transportadores_pendientes():
    pendientes = Transportador.query.filter_by(estado="pendiente").all()
    return jsonify([_serialize_transportador(t) for t in pendientes])


@admin_bp.get("/admin/transportadores")
@role_required("administrador")
def listar_transportadores():
    transportadores = Transportador.query.all()
    return jsonify([_serialize_transportador(t) for t in transportadores])


@admin_bp.patch("/admin/transportadores/<int:transportador_id>/validar")
@role_required("administrador")
def validar_transportador(transportador_id):
    t = Transportador.query.get(transportador_id)
    if not t:
        return jsonify({"message": "Transportador no encontrado."}), 404

    data = request.get_json(force=True) or {}
    nuevo_estado = data.get("estado")
    if nuevo_estado not in ("aprobado", "rechazado", "pendiente"):
        return jsonify({"message": "Estado inválido."}), 400

    t.estado = nuevo_estado
    db.session.commit()
    return jsonify(_serialize_transportador(t))


@admin_bp.get("/admin/reportes")
@role_required("administrador")
def reportes_generales():
    """Estadísticas agregadas — nunca información personal ni ubicaciones exactas."""
    total_usuarios = Usuario.query.count()
    por_rol = {
        rol: Usuario.query.filter_by(rol=rol).count()
        for rol in ("palmicultor", "comprador", "transportador", "administrador")
    }
    total_fincas = Finca.query.filter_by(estado="activa").count()
    total_lotes = Lote.query.filter_by(estado="activo").count()
    total_hectareas = db.session.query(db.func.coalesce(db.func.sum(Finca.area_hectareas), 0)).scalar()

    publicaciones_activas = PublicacionMercado.query.filter_by(estado="activa").count()
    publicaciones_vendidas = PublicacionMercado.query.filter_by(estado="vendida").count()
    toneladas_publicadas = (
        db.session.query(db.func.coalesce(db.func.sum(PublicacionMercado.cantidad_toneladas), 0))
        .filter(PublicacionMercado.estado == "activa")
        .scalar()
    )

    solicitudes_por_estado = {}
    for (estado,) in db.session.query(SolicitudTransporte.estado).distinct():
        solicitudes_por_estado[estado] = SolicitudTransporte.query.filter_by(estado=estado).count()

    transportadores_pendientes_count = Transportador.query.filter_by(estado="pendiente").count()
    compradores_activos = Comprador.query.filter_by(estado="activo").count()

    return jsonify(
        {
            "usuarios": {"total": total_usuarios, "por_rol": por_rol},
            "produccion": {
                "total_fincas": total_fincas,
                "total_lotes": total_lotes,
                "total_hectareas": float(total_hectareas or 0),
            },
            "mercado": {
                "publicaciones_activas": publicaciones_activas,
                "publicaciones_vendidas": publicaciones_vendidas,
                "toneladas_publicadas": float(toneladas_publicadas or 0),
            },
            "logistica": {
                "solicitudes_por_estado": solicitudes_por_estado,
                "transportadores_pendientes": transportadores_pendientes_count,
            },
            "compradores_activos": compradores_activos,
        }
    )


def _serialize_usuario(u: Usuario):
    return {
        "id": u.id,
        "nombre_completo": u.nombre_completo,
        "telefono": u.telefono,
        "correo": u.correo,
        "rol": u.rol,
        "estado": u.estado,
        "fecha_registro": u.fecha_registro.isoformat() if u.fecha_registro else None,
    }


def _serialize_transportador(t: Transportador):
    usuario = Usuario.query.get(t.usuario_id)
    return {
        "id": t.id,
        "usuario_id": t.usuario_id,
        "nombre_completo": usuario.nombre_completo if usuario else None,
        "telefono": usuario.telefono if usuario else None,
        "ubicacion": t.ubicacion,
        "disponible": t.disponible,
        "estado": t.estado,
        "total_vehiculos": len(t.vehiculos),
    }
