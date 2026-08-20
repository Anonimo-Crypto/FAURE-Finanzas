/**
 * Modelo: Retiro
 * Permite saldo negativo (según requerimiento)
 */
class Retiro {
  constructor({
    id = null,
    fecha = new Date().toISOString().split('T')[0],
    cantidad = 0,
    motivo = '',
    nota = '',
    fechaCreacion = new Date().toISOString()
  } = {}) {
    this.id = id || 'ret_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    this.fecha = fecha;
    this.cantidad = Number(cantidad) || 0;
    this.motivo = motivo;
    this.nota = nota;
    this.fechaCreacion = fechaCreacion;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data) {
    return new Retiro(data);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Retiro;
} else {
  window.Retiro = Retiro;
}
