/**
 * RecuperacionCuenta - Código de recuperación y recuperación de acceso
 */
class RecuperacionCuenta {
  static generarCodigo() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
  }

  static guardarCodigo(usuarioId, codigo) {
    BaseDatos.guardar('codigo_recuperacion_' + usuarioId, {
      codigo,
      expira: Date.now() + 15 * 60 * 1000 // 15 minutos
    });
  }

  static validarCodigo(usuarioId, codigoIngresado) {
    const data = BaseDatos.obtener('codigo_recuperacion_' + usuarioId, null);
    if (!data) return false;
    if (Date.now() > data.expira) {
      BaseDatos.eliminar('codigo_recuperacion_' + usuarioId);
      return false;
    }
    return data.codigo === codigoIngresado;
  }

  static resetearContrasena(usuarioId, nuevaContrasena) {
    return UsuariosDB.actualizarUsuario(usuarioId, { contrasena: nuevaContrasena });
  }

  /**
   * Flujo simple de recuperación (simulado, sin email real)
   * En una app real se enviaría por SMS/email.
   */
  static iniciarRecuperacion(nombreUsuario) {
    const user = UsuariosDB.buscarPorUsuario(nombreUsuario);
    if (!user) return { ok: false, mensaje: 'Usuario no encontrado' };
    const codigo = this.generarCodigo();
    this.guardarCodigo(user.id, codigo);
    // En demo mostramos el código (en producción se enviaría)
    return {
      ok: true,
      mensaje: 'Código generado (demo)',
      codigoDemo: codigo, // Solo para esta versión de demostración
      usuarioId: user.id
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecuperacionCuenta;
} else {
  window.RecuperacionCuenta = RecuperacionCuenta;
}
