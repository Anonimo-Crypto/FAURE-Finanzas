/**
 * LoginSecurity - Acceso local (100% offline)
 * La cuenta especial desbloquea admin al iniciar sesión en el dispositivo.
 * No se inventa contraseña: la primera vez que se usa la cuenta especial,
 * la contraseña escrita queda como contraseña local de esa cuenta.
 */
class LoginSecurity {
  static intentosFallidos = 0;
  static maxIntentos = 5;
  static bloqueadoHasta = 0;

  static login(usuario, contrasena, recordar = false) {
    if (Date.now() < this.bloqueadoHasta) {
      const mins = Math.ceil((this.bloqueadoHasta - Date.now()) / 60000);
      return { ok: false, mensaje: `Demasiados intentos. Espera ${mins} minuto(s).` };
    }

    const emailEsp = UsuariosDB.CUENTA_ADMIN_ESPECIAL;
    const esEspecial = (usuario || '').toLowerCase() === emailEsp.toLowerCase();
    let user = UsuariosDB.buscarPorUsuario(usuario);

    // Primera vez con la cuenta especial: crear con la contraseña que el usuario acaba de escribir
    if (!user && esEspecial && contrasena) {
      user = new Usuario({
        nombre: 'Admin Principal FAURE',
        usuario: emailEsp,
        contrasena: contrasena,
        tipo: 'Administrador',
        pin: '',
        permisos: ['todo'],
        activo: true
      });
      UsuariosDB.crearUsuario(user);
    }

    if (!user || user.contrasena !== contrasena) {
      this.intentosFallidos++;
      if (this.intentosFallidos >= this.maxIntentos) {
        this.bloqueadoHasta = Date.now() + 5 * 60 * 1000;
        this.intentosFallidos = 0;
        return { ok: false, mensaje: 'Cuenta bloqueada temporalmente por seguridad.' };
      }
      return { ok: false, mensaje: 'Usuario o contraseña incorrectos.' };
    }

    if (!user.activo) {
      return { ok: false, mensaje: 'Usuario desactivado.' };
    }

    // Desbloqueo admin en este dispositivo
    if (esEspecial) {
      user.tipo = 'Administrador';
      user.permisos = ['todo'];
      UsuariosDB.actualizarUsuario(user.id, { tipo: 'Administrador', permisos: ['todo'], activo: true });
      UsuariosDB.desbloquearAdminEnDispositivo();
    }

    this.intentosFallidos = 0;
    UsuariosDB.guardarSesion(user);

    if (recordar) BaseDatos.guardar('recordar_usuario', usuario);
    else BaseDatos.eliminar('recordar_usuario');

    return { ok: true, usuario: user, adminDesbloqueado: esEspecial };
  }

  static logout() {
    UsuariosDB.cerrarSesion();
  }

  static sesionActiva() {
    const sesion = UsuariosDB.obtenerSesion();
    if (!sesion) return null;
    if (Date.now() - sesion.timestamp > 7 * 24 * 60 * 60 * 1000) {
      this.logout();
      return null;
    }
    return sesion;
  }

  static obtenerUsuarioRecordado() {
    return BaseDatos.obtener('recordar_usuario', '');
  }
}
window.LoginSecurity = LoginSecurity;
