from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models import Precio, Comprador, PublicacionMercado, Lote, Finca
from app.utils import role_required, current_user_id, paginate_args

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
                "distanciaKm": 0,  # placeholder hasta integrar cálculo real por coordenadas del usuario
                "verificado": True,
                "logoUrl": None,
            }
            for c in compradores
        ]
    )


@market_bp.get("/compradores/<int:comprador_id>")
@jwt_required()
def detalle_comprador(comprador_id):
    comprador = Comprador.query.filter_by(id=comprador_id, estado="activo").first()
    if not comprador:
        return jsonify({"message": "Comprador no encontrado."}), 404
    precio_actual = (
        Precio.query.filter_by(comprador_id=comprador.id, estado="activo")
        .order_by(Precio.fecha_publicacion.desc())
        .first()
    )
    return jsonify(
        {
            "id": comprador.id,
            "empresa": comprador.empresa,
            "descripcion": comprador.descripcion,
            "telefono": comprador.telefono,
            "correo": comprador.correo,
            "ubicacion": comprador.ubicacion,
            "precio_vigente": float(precio_actual.valor_moneda) if precio_actual else None,
            "unidad": precio_actual.unidad if precio_actual else None,
        }
    )


# ---------------------------------------------------------- publicaciones --

@market_bp.get("/mercado/publicaciones")
@role_required("palmicultor")
def mis_publicaciones():
    publicaciones = (
        PublicacionMercado.query.filter_by(palmicultor_id=current_user_id())
        .order_by(PublicacionMercado.fecha_publicacion.desc())
        .all()
    )
    return jsonify([_serialize(p) for p in publicaciones])


@market_bp.post("/mercado/publicaciones")
@role_required("palmicultor")
def crear_publicacion():
    data = request.get_json(force=True) or {}

    cantidad = data.get("cantidad_toneladas")
    if not cantidad or float(cantidad) <= 0:
        return jsonify({"message": "La cantidad en toneladas es obligatoria."}), 400

    lote_id = data.get("lote_id")
    if lote_id:
        lote = Lote.query.get(lote_id)
        if not lote or not Finca.query.filter_by(id=lote.finca_id, usuario_id=current_user_id()).first():
            return jsonify({"message": "El lote indicado no existe o no te pertenece."}), 400

    publicacion = PublicacionMercado(
        palmicultor_id=current_user_id(),
        lote_id=lote_id,
        cantidad_toneladas=float(cantidad),
        precio_esperado=data.get("precio_esperado"),
        unidad=data.get("unidad") or "Tonelada",
        # RN01: nunca se guarda ubicación exacta de la finca en la publicación pública, solo el municipio.
        municipio=(data.get("municipio") or "Tumaco").strip(),
        descripcion=(data.get("descripcion") or "").strip() or None,
        estado="activa",
    )
    db.session.add(publicacion)
    db.session.commit()
    return jsonify(_serialize(publicacion)), 201


@market_bp.put("/mercado/publicaciones/<int:publicacion_id>")
@role_required("palmicultor")
def editar_publicacion(publicacion_id):
    publicacion = _get_own_publicacion(publicacion_id)
    if not publicacion:
        return jsonify({"message": "Publicación no encontrada."}), 404

    data = request.get_json(force=True) or {}
    for campo in ("cantidad_toneladas", "precio_esperado", "unidad", "municipio", "descripcion"):
        if campo in data:
            setattr(publicacion, campo, data[campo])

    db.session.commit()
    return jsonify(_serialize(publicacion))


@market_bp.patch("/mercado/publicaciones/<int:publicacion_id>/estado")
@role_required("palmicultor")
def cambiar_estado_publicacion(publicacion_id):
    publicacion = _get_own_publicacion(publicacion_id)
    if not publicacion:
        return jsonify({"message": "Publicación no encontrada."}), 404

    data = request.get_json(force=True) or {}
    nuevo_estado = data.get("estado")
    if nuevo_estado not in ("activa", "vendida", "cancelada"):
        return jsonify({"message": "Estado inválido."}), 400

    publicacion.estado = nuevo_estado
    db.session.commit()
    return jsonify(_serialize(publicacion))


@market_bp.get("/mercado/vitrina")
@role_required("comprador", "administrador")
def vitrina_publica():
    """Vitrina pública para compradores. RN01: nunca expone ubicación exacta,
    coordenadas ni información privada de producción — solo cantidad, precio
    esperado, unidad, municipio, descripción y fecha."""
    limit, offset = paginate_args(request)
    municipio = request.args.get("municipio")
    precio_min = request.args.get("precio_min", type=float)
    precio_max = request.args.get("precio_max", type=float)

    query = PublicacionMercado.query.filter_by(estado="activa")
    if municipio:
        query = query.filter(PublicacionMercado.municipio.ilike(f"%{municipio}%"))
    if precio_min is not None:
        query = query.filter(PublicacionMercado.precio_esperado >= precio_min)
    if precio_max is not None:
        query = query.filter(PublicacionMercado.precio_esperado <= precio_max)

    publicaciones = (
        query.order_by(PublicacionMercado.fecha_publicacion.desc()).offset(offset).limit(limit).all()
    )
    return jsonify([_serialize(p) for p in publicaciones])


@market_bp.get("/mercado/publicaciones/<int:publicacion_id>/detalle")
@role_required("comprador", "administrador")
def detalle_publicacion_publica(publicacion_id):
    publicacion = PublicacionMercado.query.filter_by(id=publicacion_id, estado="activa").first()
    if not publicacion:
        return jsonify({"message": "Publicación no encontrada."}), 404
    return jsonify(_serialize(publicacion))


def _get_own_publicacion(publicacion_id):
    return PublicacionMercado.query.filter_by(id=publicacion_id, palmicultor_id=current_user_id()).first()


def _serialize(p: PublicacionMercado):
    return {
        "id": p.id,
        "cantidad_toneladas": p.cantidad_toneladas,
        "precio_esperado": float(p.precio_esperado) if p.precio_esperado is not None else None,
        "unidad": p.unidad,
        "municipio": p.municipio,
        "descripcion": p.descripcion,
        "estado": p.estado,
        "fecha_publicacion": p.fecha_publicacion.isoformat() if p.fecha_publicacion else None,
    }
