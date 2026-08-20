/**
 * Modelo: Meta (objetivos de ahorro)
 * Ejemplo: 🏍️ Moto
 */
class Meta {
  constructor({
    id = null,
    nombre = '',
    icono = '🎯',
    cantidadObjetivo = 0,
    cantidadAcumulada = 0,
    fechaCreacion = new Date().toISOString(),
    activa = true
  } = {}) {
    this.id = id || 'meta_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    this.nombre = nombre;
    this.icono = icono;
    this.cantidadObjetivo = Number(cantidadObjetivo) || 0;
    this.cantidadAcumulada = Number(cantidadAcumulada) || 0;
    this.fechaCreacion = fechaCreacion;
    this.activa = activa;
  }

  get porcentajeCompletado() {
    if (this.cantidadObjetivo <= 0) return 0;
    return Math.min(100, Math.round((this.cantidadAcumulada / this.cantidadObjetivo) * 100));
  }

  agregarDinero(monto) {
    this.cantidadAcumulada += Number(monto) || 0;
    if (this.cantidadAcumulada < 0) this.cantidadAcumulada = 0;
  }

  retirarDinero(monto) {
    this.cantidadAcumulada -= Number(monto) || 0;
    if (this.cantidadAcumulada < 0) this.cantidadAcumulada = 0;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data) {
    return new Meta(data);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Meta;
} else {
  window.Meta = Meta;
}
