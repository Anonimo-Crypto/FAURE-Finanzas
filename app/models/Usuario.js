/**
 * Modelo: Usuario
 * Tipos: Administrador, Colaborador, Socio
 * Guarda: Nombre, Usuario, Contraseña, Tipo, Permisos, PIN
 */
class Usuario {
  constructor({
    id = null,
    nombre = '',
    usuario = '',
    contrasena = '',
    tipo = 'Colaborador', // Administrador | Colaborador | Socio
    permisos = [],
    pin = '',
    telefono = '',
    zona = '',
    activo = true,
    fechaCreacion = new Date().toISOString()
  } = {}) {
    this.id = id || 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    this.nombre = nombre;
    this.usuario = usuario;
    this.contrasena = contrasena; // En producción debería estar hasheada
    this.tipo = tipo;
    this.permisos = permisos;
    this.pin = pin;
    this.telefono = telefono;
    this.zona = zona;
    this.activo = activo;
    this.fechaCreacion = fechaCreacion;
  }

  esAdmin() {
    return this.tipo === 'Administrador';
  }

  tienePermiso(permiso) {
    if (this.esAdmin()) return true;
    return this.permisos.includes(permiso);
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data) {
    return new Usuario(data);
  }
}

// Export for modules / browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Usuario;
} else {
  window.Usuario = Usuario;
}
