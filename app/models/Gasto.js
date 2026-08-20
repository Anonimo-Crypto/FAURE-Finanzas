/**
 * Modelo: Gasto
 */
class Gasto {
  constructor({
    id = null,
    fecha = new Date().toISOString().split('T')[0],
    cantidad = 0,
    categoria = 'General', // General, Negocio, Personal, Transporte, etc.
    nota = '',
    fechaCreacion = new Date().toISOString()
  } = {}) {
    this.id = id || 'gas_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    this.fecha = fecha;
    this.cantidad = Number(cantidad) || 0;
    this.categoria = categoria;
    this.nota = nota;
    this.fechaCreacion = fechaCreacion;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data) {
    return new Gasto(data);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Gasto;
} else {
  window.Gasto = Gasto;
}
