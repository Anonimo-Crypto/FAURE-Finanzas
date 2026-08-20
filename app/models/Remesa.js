/**
 * Modelo: Remesa
 * Guarda operaciones de remesas / envíos de dinero (simulados, solo contabilidad)
 */
class Remesa {
  constructor({
    id = null,
    fecha = new Date().toISOString().split('T')[0],
    paisOrigen = '',
    metodoEnvio = 'Zelle', // Zelle, PayPal USD, PayPal EUR, Cash App, Bizum, IBAN, PostePay, Western Union, MoneyGram, USDT
    monedaEnviada = 'USD',
    cantidadEnviada = 0,
    tasaUtilizada = 1,
    cantidadEntregada = 0,
    ganancia = 0,
    estado = 'Pendiente', // Pendiente, En proceso, Completada, Cancelada
    tipoEntrega = 'Pago inmediato', // Pago inmediato, Entrega programada, Domicilio, Trato presencial
    nota = '',
    colaboradorId = null,
    fechaCreacion = new Date().toISOString()
  } = {}) {
    this.id = id || 'rem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    this.fecha = fecha;
    this.paisOrigen = paisOrigen;
    this.metodoEnvio = metodoEnvio;
    this.monedaEnviada = monedaEnviada;
    this.cantidadEnviada = Number(cantidadEnviada) || 0;
    this.tasaUtilizada = Number(tasaUtilizada) || 1;
    this.cantidadEntregada = Number(cantidadEntregada) || 0;
    this.ganancia = Number(ganancia) || 0;
    this.estado = estado;
    this.tipoEntrega = tipoEntrega;
    this.nota = nota;
    this.colaboradorId = colaboradorId;
    this.fechaCreacion = fechaCreacion;
  }

  calcularGanancia() {
    // Ganancia simple: diferencia entre lo recibido (cantidadEnviada * tasa) y lo entregado
    const valorRecibido = this.cantidadEnviada * this.tasaUtilizada;
    this.ganancia = valorRecibido - this.cantidadEntregada;
    return this.ganancia;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data) {
    return new Remesa(data);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Remesa;
} else {
  window.Remesa = Remesa;
}
