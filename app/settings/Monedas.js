/**
 * Monedas - Configuración de monedas y tasas
 */
class Monedas {
  static listar() {
    return ConfiguracionDB.obtener().monedasSoportadas;
  }

  static tasas() {
    return ConfiguracionDB.obtener().tasasCambio;
  }

  static actualizarTasa(moneda, tasa) {
    ConfiguracionDB.actualizarTasa(moneda, tasa);
  }

  static monedaPrincipal() {
    return ConfiguracionDB.obtener().monedaPrincipal;
  }

  static setMonedaPrincipal(moneda) {
    ConfiguracionDB.guardar({ monedaPrincipal: moneda });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Monedas;
} else {
  window.Monedas = Monedas;
}
