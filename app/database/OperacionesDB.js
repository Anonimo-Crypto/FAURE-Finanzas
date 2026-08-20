/**
 * OperacionesDB - Remesas, Ingresos, Gastos, Retiros, Metas
 * Todo es contabilidad simulada. No hay dinero real.
 */
class OperacionesDB {
  static KEY_REMESAS = 'remesas';
  static KEY_INGRESOS = 'ingresos';
  static KEY_GASTOS = 'gastos';
  static KEY_RETIROS = 'retiros';
  static KEY_METAS = 'metas';
  static KEY_SALDO = 'saldo_disponible';

  // --- Saldo ---
  static obtenerSaldo() {
    return Number(BaseDatos.obtener(this.KEY_SALDO, 0)) || 0;
  }

  static actualizarSaldo(nuevoSaldo) {
    BaseDatos.guardar(this.KEY_SALDO, Number(nuevoSaldo) || 0);
  }

  static ajustarSaldo(monto) {
    const actual = this.obtenerSaldo();
    const nuevo = actual + Number(monto);
    this.actualizarSaldo(nuevo);
    return nuevo;
  }

  // --- Remesas ---
  static obtenerRemesas() {
    const data = BaseDatos.obtener(this.KEY_REMESAS, []);
    return data.map(r => Remesa.fromJSON(r));
  }

  static guardarRemesas(lista) {
    BaseDatos.guardar(this.KEY_REMESAS, lista.map(r => r.toJSON()));
  }

  static crearRemesa(remesa) {
    const lista = this.obtenerRemesas();
    remesa.calcularGanancia();
    lista.unshift(remesa);
    this.guardarRemesas(lista);
    // Al completar una remesa se suma la ganancia al saldo (simulado)
    if (remesa.estado === 'Completada') {
      this.ajustarSaldo(remesa.ganancia);
    }
    return remesa;
  }

  static actualizarRemesa(id, cambios) {
    const lista = this.obtenerRemesas();
    const idx = lista.findIndex(r => r.id === id);
    if (idx === -1) return null;
    const anterior = lista[idx];
    Object.assign(lista[idx], cambios);
    lista[idx].calcularGanancia();
    this.guardarRemesas(lista);
    // Ajuste de saldo si cambia de estado a Completada
    if (anterior.estado !== 'Completada' && lista[idx].estado === 'Completada') {
      this.ajustarSaldo(lista[idx].ganancia);
    }
    return lista[idx];
  }

  // --- Ingresos ---
  static obtenerIngresos() {
    const data = BaseDatos.obtener(this.KEY_INGRESOS, []);
    return data.map(i => Ingreso.fromJSON(i));
  }

  static crearIngreso(ingreso) {
    const lista = this.obtenerIngresos();
    lista.unshift(ingreso);
    BaseDatos.guardar(this.KEY_INGRESOS, lista.map(i => i.toJSON()));
    this.ajustarSaldo(ingreso.cantidad);
    return ingreso;
  }

  // --- Gastos ---
  static obtenerGastos() {
    const data = BaseDatos.obtener(this.KEY_GASTOS, []);
    return data.map(g => Gasto.fromJSON(g));
  }

  static crearGasto(gasto) {
    const lista = this.obtenerGastos();
    lista.unshift(gasto);
    BaseDatos.guardar(this.KEY_GASTOS, lista.map(g => g.toJSON()));
    this.ajustarSaldo(-gasto.cantidad);
    return gasto;
  }

  // --- Retiros ---
  static obtenerRetiros() {
    const data = BaseDatos.obtener(this.KEY_RETIROS, []);
    return data.map(r => Retiro.fromJSON(r));
  }

  static crearRetiro(retiro) {
    const lista = this.obtenerRetiros();
    lista.unshift(retiro);
    BaseDatos.guardar(this.KEY_RETIROS, lista.map(r => r.toJSON()));
    // Permite saldo negativo
    this.ajustarSaldo(-retiro.cantidad);
    return retiro;
  }

  // --- Metas ---
  static obtenerMetas() {
    const data = BaseDatos.obtener(this.KEY_METAS, []);
    return data.map(m => Meta.fromJSON(m));
  }

  static guardarMetas(lista) {
    BaseDatos.guardar(this.KEY_METAS, lista.map(m => m.toJSON()));
  }

  static crearMeta(meta) {
    const lista = this.obtenerMetas();
    lista.push(meta);
    this.guardarMetas(lista);
    return meta;
  }

  static actualizarMeta(id, cambios) {
    const lista = this.obtenerMetas();
    const idx = lista.findIndex(m => m.id === id);
    if (idx === -1) return null;
    Object.assign(lista[idx], cambios);
    this.guardarMetas(lista);
    return lista[idx];
  }

  static eliminarMeta(id) {
    const lista = this.obtenerMetas().filter(m => m.id !== id);
    this.guardarMetas(lista);
  }

  // Resumen general
  static obtenerResumen() {
    const saldo = this.obtenerSaldo();
    const ingresos = this.obtenerIngresos().reduce((s, i) => s + i.cantidad, 0);
    const gastos = this.obtenerGastos().reduce((s, g) => s + g.cantidad, 0);
    const retiros = this.obtenerRetiros().reduce((s, r) => s + r.cantidad, 0);
    const remesas = this.obtenerRemesas();
    const gananciasRemesas = remesas
      .filter(r => r.estado === 'Completada')
      .reduce((s, r) => s + r.ganancia, 0);
    const metas = this.obtenerMetas();
    const ahorrosMetas = metas.reduce((s, m) => s + m.cantidadAcumulada, 0);

    return {
      saldoDisponible: saldo,
      totalIngresos: ingresos,
      totalGastos: gastos,
      totalRetiros: retiros,
      gananciasRemesas,
      ahorrosMetas,
      cantidadRemesas: remesas.length,
      cantidadMetas: metas.length
    };
  }

  // Últimos movimientos (combinados)
  static obtenerUltimosMovimientos(limite = 10) {
    const movimientos = [];

    this.obtenerIngresos().forEach(i => {
      movimientos.push({
        tipo: 'Ingreso',
        id: i.id,
        fecha: i.fecha,
        cantidad: i.cantidad,
        descripcion: i.tipo + (i.nota ? ' - ' + i.nota : ''),
        timestamp: i.fechaCreacion
      });
    });

    this.obtenerGastos().forEach(g => {
      movimientos.push({
        tipo: 'Gasto',
        id: g.id,
        fecha: g.fecha,
        cantidad: -g.cantidad,
        descripcion: g.categoria + (g.nota ? ' - ' + g.nota : ''),
        timestamp: g.fechaCreacion
      });
    });

    this.obtenerRetiros().forEach(r => {
      movimientos.push({
        tipo: 'Retiro',
        id: r.id,
        fecha: r.fecha,
        cantidad: -r.cantidad,
        descripcion: r.motivo || 'Retiro',
        timestamp: r.fechaCreacion
      });
    });

    this.obtenerRemesas().forEach(rem => {
      movimientos.push({
        tipo: 'Remesa',
        id: rem.id,
        fecha: rem.fecha,
        cantidad: rem.ganancia,
        descripcion: `${rem.paisOrigen} · ${rem.metodoEnvio} · ${rem.estado}`,
        timestamp: rem.fechaCreacion
      });
    });

    return movimientos
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limite);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = OperacionesDB;
} else {
  window.OperacionesDB = OperacionesDB;
}
