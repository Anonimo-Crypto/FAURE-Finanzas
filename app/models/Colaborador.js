/**
 * Modelo: Colaborador
 */
class Colaborador {
  constructor({
    id = null,
    nombre = '',
    telefono = '',
    usuario = '',
    zona = '',
    entregasRealizadas = 0,
    ganancias = 0,
    activo = true,
    bloqueado = false,
    fechaCreacion = new Date().toISOString()
  } = {}) {
    this.id = id || 'col_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    this.nombre = nombre;
    this.telefono = telefono;
    this.usuario = usuario;
    this.zona = zona;
    this.entregasRealizadas = Number(entregasRealizadas) || 0;
    this.ganancias = Number(ganancias) || 0;
    this.activo = activo;
    this.bloqueado = bloqueado;
    this.fechaCreacion = fechaCreacion;
  }

  registrarEntrega(ganancia = 0) {
    this.entregasRealizadas += 1;
    this.ganancias += Number(ganancia) || 0;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data) {
    return new Colaborador(data);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Colaborador;
} else {
  window.Colaborador = Colaborador;
}
