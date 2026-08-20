/**
 * ConfiguracionNegocio
 */
class ConfiguracionNegocio {
  static obtener() {
    return ConfiguracionDB.obtener();
  }

  static actualizar(datos) {
    ConfiguracionDB.guardar(datos);
  }

  static nombreNegocio() {
    return ConfiguracionDB.obtener().nombreNegocio || 'FAURE Finanzas';
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfiguracionNegocio;
} else {
  window.ConfiguracionNegocio = ConfiguracionNegocio;
}
