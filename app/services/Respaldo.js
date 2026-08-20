/**
 * Respaldo - Crear copia de seguridad y restaurar datos
 * Permite recuperar cuenta en otro teléfono (vía archivo JSON)
 */
class Respaldo {
  static crearCopia() {
    const data = BaseDatos.exportarTodo();
    data._meta = {
      app: 'FAURE Finanzas',
      version: '1.0.0',
      fecha: new Date().toISOString(),
      nota: 'Copia de seguridad - Solo contabilidad simulada'
    };
    return data;
  }

  static descargarCopia() {
    const data = this.crearCopia();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faure_finanzas_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }

  static restaurarDesdeObjeto(data) {
    if (!data || !data._meta || data._meta.app !== 'FAURE Finanzas') {
      throw new Error('Archivo de respaldo no válido para FAURE Finanzas');
    }
    // Eliminar meta antes de importar
    const { _meta, ...resto } = data;
    BaseDatos.importarTodo(resto);
    return true;
  }

  static async restaurarDesdeArchivo(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          this.restaurarDesdeObjeto(data);
          resolve(true);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Error leyendo archivo'));
      reader.readAsText(file);
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Respaldo;
} else {
  window.Respaldo = Respaldo;
}
