/**
 * PIN - Seguridad adicional con PIN de 4 dígitos
 */
class PIN {
  static KEY = 'pin_hash_simple'; // En producción usar hash real

  static configurar(pin) {
    if (!/^\d{4}$/.test(pin)) {
      return { ok: false, mensaje: 'El PIN debe ser de 4 dígitos numéricos.' };
    }
    BaseDatos.guardar(this.KEY, pin); // Demo: guardado en claro. Producción: hash.
    return { ok: true };
  }

  static validar(pinIngresado) {
    const guardado = BaseDatos.obtener(this.KEY, null);
    if (!guardado) return { ok: false, mensaje: 'No hay PIN configurado.' };
    if (guardado === pinIngresado) return { ok: true };
    return { ok: false, mensaje: 'PIN incorrecto.' };
  }

  static tienePIN() {
    return BaseDatos.existe(this.KEY);
  }

  static eliminar() {
    BaseDatos.eliminar(this.KEY);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PIN;
} else {
  window.PIN = PIN;
}
