/**
 * Notificaciones - Avisos in-app (nueva entrega, metas, pagos pendientes, etc.)
 * Versión local sin push real.
 */
class Notificaciones {
  static KEY = 'notificaciones';

  static obtenerTodas() {
    return BaseDatos.obtener(this.KEY, []);
  }

  static agregar(titulo, mensaje, tipo = 'info') {
    const lista = this.obtenerTodas();
    const noti = {
      id: 'noti_' + Date.now(),
      titulo,
      mensaje,
      tipo, // info, success, warning, danger
      leida: false,
      fecha: new Date().toISOString()
    };
    lista.unshift(noti);
    // Mantener solo las últimas 50
    BaseDatos.guardar(this.KEY, lista.slice(0, 50));
    return noti;
  }

  static marcarLeida(id) {
    const lista = this.obtenerTodas();
    const idx = lista.findIndex(n => n.id === id);
    if (idx !== -1) {
      lista[idx].leida = true;
      BaseDatos.guardar(this.KEY, lista);
    }
  }

  static marcarTodasLeidas() {
    const lista = this.obtenerTodas().map(n => ({ ...n, leida: true }));
    BaseDatos.guardar(this.KEY, lista);
  }

  static noLeidas() {
    return this.obtenerTodas().filter(n => !n.leida).length;
  }

  // Helpers de eventos de negocio
  static avisarNuevaRemesa(remesa) {
    this.agregar('Nueva remesa', `${remesa.paisOrigen} · ${remesa.cantidadEnviada} ${remesa.monedaEnviada}`, 'info');
  }

  static avisarMetaCompletada(meta) {
    this.agregar('¡Meta alcanzada!', `${meta.icono} ${meta.nombre} completada al 100%`, 'success');
  }

  static avisarSaldoBajo(saldo) {
    if (saldo < 0) {
      this.agregar('Saldo negativo', `El saldo actual es ${saldo}. Revisa retiros.`, 'warning');
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Notificaciones;
} else {
  window.Notificaciones = Notificaciones;
}
