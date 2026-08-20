/**
 * ReportesAnuales
 */
class ReportesAnuales {
  static generar(anio = null) {
    const y = anio || new Date().getFullYear();
    const meses = [];
    for (let m = 0; m < 12; m++) {
      meses.push(ReportesMensuales.generar(y, m));
    }

    const totalIngresos = meses.reduce((s, m) => s + m.ingresos.total, 0);
    const totalGastos = meses.reduce((s, m) => s + m.gastos.total, 0);
    const totalRetiros = meses.reduce((s, m) => s + m.retiros.total, 0);
    const totalGananciasRemesas = meses.reduce((s, m) => s + m.remesas.ganancias, 0);

    return {
      anio: y,
      meses,
      resumen: {
        totalIngresos,
        totalGastos,
        totalRetiros,
        totalGananciasRemesas,
        balanceAnual: totalIngresos + totalGananciasRemesas - totalGastos - totalRetiros
      }
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReportesAnuales;
} else {
  window.ReportesAnuales = ReportesAnuales;
}
