/**
 * ConfiguracionDB - Porcentajes de ahorro, monedas, negocio
 */
class ConfiguracionDB {
  static KEY = 'configuracion';

  static defaults() {
    return {
      monedaPrincipal: 'CUP',
      nombreNegocio: 'FAURE Finanzas',
      porcentajesAhorro: {
        emergencia: 10,
        gastosNegocio: 20,
        sueldo: 30,
        reinversion: 20,
        casa: 10,
        moto: 10
      },
      monedasSoportadas: ['CUP', 'USD', 'EUR', 'MLC'],
      tasasCambio: {
        USD: 320,
        EUR: 350,
        MLC: 280
      },
      recordarSesion: true,
      pinActivo: true
    };
  }

  static obtener() {
    return { ...this.defaults(), ...BaseDatos.obtener(this.KEY, {}) };
  }

  static guardar(config) {
    const actual = this.obtener();
    BaseDatos.guardar(this.KEY, { ...actual, ...config });
  }

  static actualizarPorcentajes(porcentajes) {
    const config = this.obtener();
    config.porcentajesAhorro = { ...config.porcentajesAhorro, ...porcentajes };
    this.guardar(config);
  }

  static actualizarTasa(moneda, tasa) {
    const config = this.obtener();
    config.tasasCambio[moneda] = Number(tasa);
    this.guardar(config);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfiguracionDB;
} else {
  window.ConfiguracionDB = ConfiguracionDB;
}
