from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.extensions import db
from app.models import Usuario, Comprador, Transportador

auth_bp = Blueprint("auth", __name__)

ROLES_VALIDOS = {"palmicultor", "comprador", "transportador", "administrador"}


@auth_bp.post("/register")
def register():
    data = request.get_json(force=True) or {}

    nombre_completo = (data.get("nombre_completo") or "").strip()
    telefono = (data.get("telefono") or "").strip()
    ubicacion = (data.get("ubicacion") or "").strip()
    password = data.get("password") or ""
    rol = (data.get("rol") or "").strip().lower()

    if not nombre_completo or not telefono or not password:
        return jsonify({"message": "Nombre, teléfono y contraseña son obligatorios."}), 400

    if rol not in ROLES_VALIDOS:
        return jsonify({"message": "Rol inválido."}), 400

    if len(password) < 6:
        return jsonify({"message": "La contraseña debe tener al menos 6 caracteres."}), 400

    if Usuario.query.filter_by(telefono=telefono).first():
        return jsonify({"message": "Ya existe una cuenta con ese teléfono."}), 409

    usuario = Usuario(
        nombre_completo=nombre_completo,
        telefono=telefono,
        password_hash=generate_password_hash(password),
        rol=rol,
        estado="activo",
    )
    db.session.add(usuario)
    db.session.flush()  # obtiene usuario.id antes del commit

    # Crea el perfil específico según el rol (ubicacion se guarda como referencia inicial)
    if rol == "comprador":
        db.session.add(Comprador(usuario_id=usuario.id, empresa=nombre_completo, ubicacion=ubicacion))
    elif rol == "transportador":
        db.session.add(Transportador(usuario_id=usuario.id, ubicacion=ubicacion))

    db.session.commit()

    token = create_access_token(identity=str(usuario.id), additional_claims={"rol": usuario.rol})
    return jsonify({"token": token, "usuario": _serialize(usuario)}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(force=True) or {}
    identifier = (data.get("identifier") or "").strip()
    password = data.get("password") or ""

    if not identifier or not password:
        return jsonify({"message": "Ingresa tu teléfono/correo y tu contraseña."}), 400

    usuario = Usuario.query.filter(
        (Usuario.telefono == identifier) | (Usuario.correo == identifier)
    ).first()

    if not usuario or not check_password_hash(usuario.password_hash, password):
        return jsonify({"message": "Credenciales incorrectas."}), 401

    if usuario.estado != "activo":
        return jsonify({"message": "Tu cuenta no está activa. Contacta al administrador."}), 403

    token = create_access_token(identity=str(usuario.id), additional_claims={"rol": usuario.rol})
    return jsonify({"token": token, "usuario": _serialize(usuario)}), 200


def _serialize(usuario: Usuario):
    return {
        "id": usuario.id,
        "nombre_completo": usuario.nombre_completo,
        "telefono": usuario.telefono,
        "correo": usuario.correo,
        "rol": usuario.rol,
        "estado": usuario.estado,
    }
