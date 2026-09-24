from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request


def role_required(*roles):
    """Exige JWT válido y que el rol del usuario esté en `roles`."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("rol") not in roles:
                return jsonify({"message": "No tienes permiso para realizar esta acción."}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def current_user_id():
    return int(get_jwt_identity())


def paginate_args(request, default_limit=50, max_limit=200):
    try:
        limit = min(int(request.args.get("limit", default_limit)), max_limit)
    except (TypeError, ValueError):
        limit = default_limit
    try:
        offset = max(int(request.args.get("offset", 0)), 0)
    except (TypeError, ValueError):
        offset = 0
    return limit, offset
