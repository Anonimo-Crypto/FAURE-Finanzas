/**
 * ReportesMensuales
 */
class ReportesMensuales {
  static generar(anio = null, mes = null) {
    const ahora = new Date();
    const y = anio || ahora.getFullYear();
    const m = mes !== null ? mes : ahora.getMonth(); // 0-11

    const filtro = (fechaStr) => {
      const d = new Date(fechaStr);
      return d.getFullYear() === y && d.getMonth() === m;
    };

    const ingresos = OperacionesDB.obtenerIngresos().filter(i => filtro(i.fecha));
    const gastos = OperacionesDB.obtenerGastos().filter(g => filtro(g.fecha));
    const retiros = OperacionesDB.obtenerRetiros().filter(r => filtro(r.fecha));
    const remesas = OperacionesDB.obtenerRemesas().filter(r => filtro(r.fecha));

    const totalIngresos = ingresos.reduce((s, i) => s + i.cantidad, 0);
    const totalGastos = gastos.reduce((s, g) => s + g.cantidad, 0);
    const totalRetiros = retiros.reduce((s, r) => s + r.cantidad, 0);
    const gananciasRemesas = remesas
      .filter(r => r.estado === 'Completada')
      .reduce((s, r) => s + r.ganancia, 0);

    return {
      anio: y,
      mes: m + 1,
      nombreMes: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][m],
      ingresos: { cantidad: ingresos.length, total: totalIngresos },
      gastos: { cantidad: gastos.length, total: totalGastos },
      retiros: { cantidad: retiros.length, total: totalRetiros },
      remesas: { cantidad: remesas.length, ganancias: gananciasRemesas },
      balance: totalIngresos + gananciasRemesas - totalGastos - totalRetiros
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReportesMensuales;
} else {
  window.ReportesMensuales = ReportesMensuales;
}
