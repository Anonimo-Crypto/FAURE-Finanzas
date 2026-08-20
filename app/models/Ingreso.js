/**
 * Modelo: Ingreso
 */
class Ingreso {
  constructor({
    id = null,
    fecha = new Date().toISOString().split('T')[0],
    cantidad = 0,
    tipo = 'General', // General, Remesa, Otro
    nota = '',
    categoria = 'Ingreso',
    fechaCreacion = new Date().toISOString()
  } = {}) {
    this.id = id || 'ing_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    this.fecha = fecha;
    this.cantidad = Number(cantidad) || 0;
    this.tipo = tipo;
    this.nota = nota;
    this.categoria = categoria;
    this.fechaCreacion = fechaCreacion;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data) {
    return new Ingreso(data);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Ingreso;
} else {
  window.Ingreso = Ingreso;
}
