/**
 * Sincronizacion - La app es 100% offline.
 * No hay backend ni APIs externas.
 */
class Sincronizacion {
  static estaOnline() {
    return false; // Intencionalmente offline-first
  }
  static async sincronizar() {
    return {
      ok: true,
      mensaje: 'Modo offline. Todos los datos se guardan solo en este dispositivo.',
      online: false
    };
  }
}
window.Sincronizacion = Sincronizacion;
