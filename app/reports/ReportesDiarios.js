/**
 * ReportesDiarios
 */
class ReportesDiarios {
  static generar(fecha = null) {
    const dia = fecha || new Date().toISOString().split('T')[0];
    const ingresos = OperacionesDB.obtenerIngresos().filter(i => i.fecha === dia);
    const gastos = OperacionesDB.obtenerGastos().filter(g => g.fecha === dia);
    const retiros = OperacionesDB.obtenerRetiros().filter(r => r.fecha === dia);
    const remesas = OperacionesDB.obtenerRemesas().filter(r => r.fecha === dia);

    const totalIngresos = ingresos.reduce((s, i) => s + i.cantidad, 0);
    const totalGastos = gastos.reduce((s, g) => s + g.cantidad, 0);
    const totalRetiros = retiros.reduce((s, r) => s + r.cantidad, 0);
    const gananciasRemesas = remesas
      .filter(r => r.estado === 'Completada')
      .reduce((s, r) => s + r.ganancia, 0);

    return {
      fecha: dia,
      ingresos: { cantidad: ingresos.length, total: totalIngresos, lista: ingresos },
      gastos: { cantidad: gastos.length, total: totalGastos, lista: gastos },
      retiros: { cantidad: retiros.length, total: totalRetiros, lista: retiros },
      remesas: { cantidad: remesas.length, ganancias: gananciasRemesas, lista: remesas },
      balanceDia: totalIngresos + gananciasRemesas - totalGastos - totalRetiros
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReportesDiarios;
} else {
  window.ReportesDiarios = ReportesDiarios;
}
