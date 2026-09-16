from datetime import datetime
from app.extensions import db


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    nombre_completo = db.Column(db.String(150), nullable=False)
    telefono = db.Column(db.String(20), unique=True, nullable=False, index=True)
    correo = db.Column(db.String(150), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), nullable=False)  # palmicultor | transportador | comprador | administrador
    estado = db.Column(db.String(20), default="activo")
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)

    fincas = db.relationship("Finca", backref="propietario", lazy=True)
    transportador = db.relationship("Transportador", backref="usuario", uselist=False)
    comprador = db.relationship("Comprador", backref="usuario", uselist=False)
    notificaciones = db.relationship("Notificacion", backref="usuario", lazy=True)


class Finca(db.Model):
    __tablename__ = "fincas"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    nombre = db.Column(db.String(150), nullable=False)
    ubicacion = db.Column(db.String(200))
    municipio = db.Column(db.String(100), default="Tumaco")
    vereda = db.Column(db.String(100))
    coordenadas_lat = db.Column(db.Float)
    coordenadas_long = db.Column(db.Float)
    area_hectareas = db.Column(db.Float)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    estado = db.Column(db.String(20), default="activa")

    lotes = db.relationship("Lote", backref="finca", lazy=True)


class Lote(db.Model):
    __tablename__ = "lotes"

    id = db.Column(db.Integer, primary_key=True)
    finca_id = db.Column(db.Integer, db.ForeignKey("fincas.id"), nullable=False)
    codigo = db.Column(db.String(60), nullable=False)  # nomenclatura flexible (RN02)
    nombre = db.Column(db.String(100))
    bloque = db.Column(db.String(50))
    sector = db.Column(db.String(50))
    area_hectareas = db.Column(db.Float)
    anio_siembra = db.Column(db.Integer)
    numero_palmas = db.Column(db.Integer)
    material_sembrado = db.Column(db.String(50))
    topografia = db.Column(db.String(50))
    drenaje = db.Column(db.String(50))
    estado_sanitario = db.Column(db.String(50))
    numero_lineas = db.Column(db.Integer)
    estado = db.Column(db.String(20), default="activo")

    ciclos_cosecha = db.relationship("CicloCosecha", backref="lote", lazy=True)
    registros_polinizacion = db.relationship("RegistroPolinizacion", backref="lote", lazy=True)
    registros_produccion = db.relationship("RegistroProduccion", backref="lote", lazy=True)
    pronosticos = db.relationship("PronosticoProduccion", backref="lote", lazy=True)


class CicloCosecha(db.Model):
    __tablename__ = "ciclos_cosecha"

    id = db.Column(db.Integer, primary_key=True)
    lote_id = db.Column(db.Integer, db.ForeignKey("lotes.id"), nullable=False)
    fecha_ultima_cosecha = db.Column(db.Date)
    fecha_inicio = db.Column(db.Date)
    duracion_dias = db.Column(db.Integer)  # 7-12 jóvenes / 9-15 adultas (RN03)
    proxima_fecha_estimada = db.Column(db.Date)
    observaciones = db.Column(db.Text)
    estado = db.Column(db.String(20), default="Programado")
    # Programado | Próximo | En curso | Completado | Retrasado


class RegistroPolinizacion(db.Model):
    __tablename__ = "registros_polinizacion"

    id = db.Column(db.Integer, primary_key=True)
    lote_id = db.Column(db.Integer, db.ForeignKey("lotes.id"), nullable=False)
    fecha = db.Column(db.Date, default=datetime.utcnow)
    numero_inflorescencias = db.Column(db.Integer)
    cantidad_producto = db.Column(db.Float)
    gramos_por_inflorescencia = db.Column(db.Float)
    responsable = db.Column(db.String(150))
    observaciones = db.Column(db.Text)


class RegistroProduccion(db.Model):
    __tablename__ = "registros_produccion"

    id = db.Column(db.Integer, primary_key=True)
    lote_id = db.Column(db.Integer, db.ForeignKey("lotes.id"), nullable=False)
    fecha = db.Column(db.Date, default=datetime.utcnow)
    palmas_evaluadas = db.Column(db.Integer)
    inflorescencias = db.Column(db.Integer)
    racimos_pequenos = db.Column(db.Integer)
    racimos_medianos = db.Column(db.Integer)
    racimos_maduros = db.Column(db.Integer)
    racimos_totales = db.Column(db.Integer)
    palmas_improductivas = db.Column(db.Integer)
    peso_promedio_racimo = db.Column(db.Float)
    fruto_suelto = db.Column(db.Float)
    observaciones = db.Column(db.Text)


class PronosticoProduccion(db.Model):
    __tablename__ = "pronosticos_produccion"

    id = db.Column(db.Integer, primary_key=True)
    lote_id = db.Column(db.Integer, db.ForeignKey("lotes.id"), nullable=False)
    fecha_calculo = db.Column(db.DateTime, default=datetime.utcnow)
    racimos_estimados = db.Column(db.Float)
    peso_promedio = db.Column(db.Float)
    produccion_estimada_kg = db.Column(db.Float)
    produccion_estimada_ton = db.Column(db.Float)
    metodologia = db.Column(db.String(100), default="RN04 - muestreo 4-5%")
    observaciones = db.Column(db.Text)


class Transportador(db.Model):
    __tablename__ = "transportadores"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False, unique=True)
    ubicacion = db.Column(db.String(200))
    disponible = db.Column(db.Boolean, default=True)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vehiculos = db.relationship("Vehiculo", backref="transportador", lazy=True)


class Vehiculo(db.Model):
    __tablename__ = "vehiculos"

    id = db.Column(db.Integer, primary_key=True)
    transportador_id = db.Column(db.Integer, db.ForeignKey("transportadores.id"), nullable=False)
    placa = db.Column(db.String(10), unique=True, nullable=False)
    tipo_vehiculo = db.Column(db.String(50))
    capacidad_toneladas = db.Column(db.Float)
    disponible = db.Column(db.Boolean, default=True)
    estado = db.Column(db.String(20), default="activo")


class Comprador(db.Model):
    __tablename__ = "compradores"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False, unique=True)
    empresa = db.Column(db.String(150), nullable=False)
    descripcion = db.Column(db.Text)
    telefono = db.Column(db.String(20))
    correo = db.Column(db.String(150))
    ubicacion = db.Column(db.String(200))
    latitud = db.Column(db.Float)
    longitud = db.Column(db.Float)
    estado = db.Column(db.String(20), default="activo")

    precios = db.relationship("Precio", backref="comprador", lazy=True)


class Precio(db.Model):
    __tablename__ = "precios"

    id = db.Column(db.Integer, primary_key=True)
    comprador_id = db.Column(db.Integer, db.ForeignKey("compradores.id"), nullable=False)
    producto = db.Column(db.String(100), default="Fruto de palma de aceite")
    valor_moneda = db.Column(db.Numeric(12, 2), nullable=False)
    unidad = db.Column(db.String(50), default="Tonelada")
    fecha_publicacion = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    fuente = db.Column(db.String(100))
    estado = db.Column(db.String(20), default="activo")  # activo/inactivo (histórico)


class PuntoComercializacion(db.Model):
    __tablename__ = "puntos_comercializacion"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    descripcion = db.Column(db.Text)
    ubicacion = db.Column(db.String(200))
    latitud = db.Column(db.Float)
    longitud = db.Column(db.Float)
    contacto = db.Column(db.String(100))
    estado = db.Column(db.String(20), default="activo")


class SolicitudTransporte(db.Model):
    __tablename__ = "solicitudes_transporte"

    id = db.Column(db.Integer, primary_key=True)
    palmicultor_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    transportador_id = db.Column(db.Integer, db.ForeignKey("transportadores.id"))
    vehiculo_id = db.Column(db.Integer, db.ForeignKey("vehiculos.id"))
    finca_id = db.Column(db.Integer, db.ForeignKey("fincas.id"), nullable=False)
    lote_id = db.Column(db.Integer, db.ForeignKey("lotes.id"))
    comprador_id = db.Column(db.Integer, db.ForeignKey("compradores.id"))
    fecha_solicitud = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_servicio = db.Column(db.Date)
    hora_servicio = db.Column(db.Time)
    cantidad_estimada = db.Column(db.Float)
    origen = db.Column(db.String(200))
    destino = db.Column(db.String(200))
    tarifa_sugerida = db.Column(db.Numeric(12, 2))
    tarifa_acordada = db.Column(db.Numeric(12, 2))
    observaciones = db.Column(db.Text)
    estado = db.Column(db.String(20), default="Pendiente")
    # Pendiente | Enviada | Aceptada | Rechazada | En camino | Completada | Cancelada


class Notificacion(db.Model):
    __tablename__ = "notificaciones"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    tipo = db.Column(db.String(50))
    titulo = db.Column(db.String(150))
    mensaje = db.Column(db.Text)
    leida = db.Column(db.Boolean, default=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
