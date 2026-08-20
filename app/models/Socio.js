/**
 * Modelo: Socio
 */
class Socio {
  constructor({
    id = null,
    nombre = '',
    telefono = '',
    usuario = '',
    permisos = [],
    porcentajeParticipacion = 0,
    activo = true,
    fechaCreacion = new Date().toISOString()
  } = {}) {
    this.id = id || 'soc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    this.nombre = nombre;
    this.telefono = telefono;
    this.usuario = usuario;
    this.permisos = permisos;
    this.porcentajeParticipacion = Number(porcentajeParticipacion) || 0;
    this.activo = activo;
    this.fechaCreacion = fechaCreacion;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data) {
    return new Socio(data);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Socio;
} else {
  window.Socio = Socio;
}
