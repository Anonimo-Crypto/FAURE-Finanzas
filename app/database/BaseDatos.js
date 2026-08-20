/**
 * BaseDatos - Capa de persistencia local (localStorage)
 * Trabaja 100% offline. Solo contabilidad simulada.
 */
const DB_PREFIX = 'faure_finanzas_';

class BaseDatos {
  static guardar(clave, datos) {
    try {
      localStorage.setItem(DB_PREFIX + clave, JSON.stringify(datos));
      return true;
    } catch (e) {
      console.error('Error guardando en BaseDatos:', e);
      return false;
    }
  }

  static obtener(clave, valorDefault = null) {
    try {
      const raw = localStorage.getItem(DB_PREFIX + clave);
      if (raw === null) return valorDefault;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error leyendo BaseDatos:', e);
      return valorDefault;
    }
  }

  static eliminar(clave) {
    localStorage.removeItem(DB_PREFIX + clave);
  }

  static existe(clave) {
    return localStorage.getItem(DB_PREFIX + clave) !== null;
  }

  static limpiarTodo() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(DB_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  }

  static exportarTodo() {
    const data = {};
    Object.keys(localStorage)
      .filter(k => k.startsWith(DB_PREFIX))
      .forEach(k => {
        data[k.replace(DB_PREFIX, '')] = JSON.parse(localStorage.getItem(k));
      });
    return data;
  }

  static importarTodo(data) {
    if (!data || typeof data !== 'object') return false;
    Object.keys(data).forEach(clave => {
      this.guardar(clave, data[clave]);
    });
    return true;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseDatos;
} else {
  window.BaseDatos = BaseDatos;
}
