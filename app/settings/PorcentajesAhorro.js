/**
 * PorcentajesAhorro - Configuración de distribución automática
 */
class PorcentajesAhorro {
  static obtener() {
    return ConfiguracionDB.obtener().porcentajesAhorro;
  }

  static actualizar(nuevos) {
    // Validar que sumen ~100
    const suma = Object.values(nuevos).reduce((a, b) => a + Number(b), 0);
    if (Math.abs(suma - 100) > 1) {
      return { ok: false, mensaje: `Los porcentajes deben sumar 100 (actual: ${suma})` };
    }
    ConfiguracionDB.actualizarPorcentajes(nuevos);
    return { ok: true };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PorcentajesAhorro;
} else {
  window.PorcentajesAhorro = PorcentajesAhorro;
}
