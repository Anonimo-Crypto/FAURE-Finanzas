/**
 * CalculadoraFinanciera
 * Cálculo de ganancias, conversión de monedas, distribución automática de ahorros.
 * Distribución por defecto:
 * Emergencia 10% | Gastos negocio 20% | Sueldo 30% | Reinversión 20% | Casa 10% | Moto 10%
 */
class CalculadoraFinanciera {
  static convertirMoneda(cantidad, monedaOrigen, monedaDestino, tasas = null) {
    const config = tasas || ConfiguracionDB.obtener().tasasCambio;
    if (monedaOrigen === monedaDestino) return Number(cantidad);

    // Asumimos tasas respecto a CUP (moneda principal configurable)
    const tasaOrigen = monedaOrigen === 'CUP' ? 1 : (config[monedaOrigen] || 1);
    const tasaDestino = monedaDestino === 'CUP' ? 1 : (config[monedaDestino] || 1);

    // Primero a CUP, luego a destino
    const enCUP = Number(cantidad) * tasaOrigen;
    return enCUP / tasaDestino;
  }

  static calcularGananciaRemesa(cantidadEnviada, tasa, cantidadEntregada) {
    const valorRecibido = Number(cantidadEnviada) * Number(tasa);
    return valorRecibido - Number(cantidadEntregada);
  }

  /**
   * Distribuye un monto de ganancia según los porcentajes configurados
   */
  static distribuirGanancia(montoGanancia) {
    const porcentajes = ConfiguracionDB.obtener().porcentajesAhorro;
    const total = Number(montoGanancia) || 0;
    const resultado = {};

    Object.keys(porcentajes).forEach(clave => {
      const pct = porcentajes[clave] / 100;
      resultado[clave] = Math.round(total * pct * 100) / 100;
    });

    // Ajuste por redondeo
    const suma = Object.values(resultado).reduce((a, b) => a + b, 0);
    const diff = Math.round((total - suma) * 100) / 100;
    if (diff !== 0 && Object.keys(resultado).length > 0) {
      const primera = Object.keys(resultado)[0];
      resultado[primera] = Math.round((resultado[primera] + diff) * 100) / 100;
    }

    return resultado;
  }

  static resumenDistribucion(monto) {
    const dist = this.distribuirGanancia(monto);
    return {
      total: Number(monto),
      detalle: dist,
      texto: Object.entries(dist)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ')
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalculadoraFinanciera;
} else {
  window.CalculadoraFinanciera = CalculadoraFinanciera;
}
