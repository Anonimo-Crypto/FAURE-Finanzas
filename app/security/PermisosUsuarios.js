/**
 * PermisosUsuarios - Control de acceso por tipo de usuario
 */
class PermisosUsuarios {
  static PERMISOS = {
    Administrador: [
      'ver_home', 'ver_finanzas', 'nueva_remesa', 'metas', 'historial',
      'configuracion', 'administracion', 'colaboradores', 'socios',
      'reportes', 'respaldo', 'todo'
    ],
    Colaborador: [
      'ver_home', 'ver_finanzas', 'nueva_remesa', 'historial'
    ],
    Socio: [
      'ver_home', 'ver_finanzas', 'historial', 'reportes'
    ]
  };

  static puede(usuarioOTipo, permiso) {
    const tipo = typeof usuarioOTipo === 'string' ? usuarioOTipo : (usuarioOTipo?.tipo || '');
    if (tipo === 'Administrador') return true;
    const lista = this.PERMISOS[tipo] || [];
    return lista.includes(permiso) || lista.includes('todo');
  }

  static permisosDe(tipo) {
    return this.PERMISOS[tipo] || [];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PermisosUsuarios;
} else {
  window.PermisosUsuarios = PermisosUsuarios;
}
