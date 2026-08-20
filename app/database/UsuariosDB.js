/**
 * UsuariosDB - Gestión de usuarios, colaboradores y socios
 * 100% offline (localStorage)
 */
class UsuariosDB {
  static KEY_USUARIOS = 'usuarios';
  static KEY_COLABORADORES = 'colaboradores';
  static KEY_SOCIOS = 'socios';
  static KEY_SESION = 'sesion_actual';

  // Cuenta local especial que desbloquea Admin en el dispositivo
  static CUENTA_ADMIN_ESPECIAL = '1eracuentasecundariadegd@gmail.com';

  static obtenerUsuarios() {
    const data = BaseDatos.obtener(this.KEY_USUARIOS, []);
    return data.map(u => Usuario.fromJSON(u));
  }

  static guardarUsuarios(lista) {
    BaseDatos.guardar(this.KEY_USUARIOS, lista.map(u => u.toJSON()));
  }

  static crearUsuario(usuario) {
    const lista = this.obtenerUsuarios();
    lista.push(usuario);
    this.guardarUsuarios(lista);
    return usuario;
  }

  static buscarPorUsuario(nombreUsuario) {
    const u = (nombreUsuario || '').toLowerCase();
    return this.obtenerUsuarios().find(x => x.usuario.toLowerCase() === u && x.activo);
  }

  static actualizarUsuario(id, cambios) {
    const lista = this.obtenerUsuarios();
    const idx = lista.findIndex(u => u.id === id);
    if (idx === -1) return null;
    Object.assign(lista[idx], cambios);
    this.guardarUsuarios(lista);
    return lista[idx];
  }

  static guardarSesion(usuario) {
    BaseDatos.guardar(this.KEY_SESION, {
      id: usuario.id,
      usuario: usuario.usuario,
      tipo: usuario.tipo,
      nombre: usuario.nombre,
      timestamp: Date.now()
    });
  }

  static obtenerSesion() {
    return BaseDatos.obtener(this.KEY_SESION, null);
  }

  static cerrarSesion() {
    BaseDatos.eliminar(this.KEY_SESION);
  }

  static obtenerColaboradores() {
    const data = BaseDatos.obtener(this.KEY_COLABORADORES, []);
    return data.map(c => Colaborador.fromJSON(c));
  }

  static guardarColaboradores(lista) {
    BaseDatos.guardar(this.KEY_COLABORADORES, lista.map(c => c.toJSON()));
  }

  static crearColaborador(colab) {
    const lista = this.obtenerColaboradores();
    lista.push(colab);
    this.guardarColaboradores(lista);
    return colab;
  }

  static actualizarColaborador(id, cambios) {
    const lista = this.obtenerColaboradores();
    const idx = lista.findIndex(c => c.id === id);
    if (idx === -1) return null;
    Object.assign(lista[idx], cambios);
    this.guardarColaboradores(lista);
    return lista[idx];
  }

  static eliminarColaborador(id) {
    this.guardarColaboradores(this.obtenerColaboradores().filter(c => c.id !== id));
  }

  static obtenerSocios() {
    const data = BaseDatos.obtener(this.KEY_SOCIOS, []);
    return data.map(s => Socio.fromJSON(s));
  }

  static guardarSocios(lista) {
    BaseDatos.guardar(this.KEY_SOCIOS, lista.map(s => s.toJSON()));
  }

  static crearSocio(socio) {
    const lista = this.obtenerSocios();
    lista.push(socio);
    this.guardarSocios(lista);
    return socio;
  }

  static actualizarSocio(id, cambios) {
    const lista = this.obtenerSocios();
    const idx = lista.findIndex(s => s.id === id);
    if (idx === -1) return null;
    Object.assign(lista[idx], cambios);
    this.guardarSocios(lista);
    return lista[idx];
  }

  static eliminarSocio(id) {
    this.guardarSocios(this.obtenerSocios().filter(s => s.id !== id));
  }

  static desbloquearAdminEnDispositivo() {
    BaseDatos.guardar('dispositivo_admin_desbloqueado', {
      cuenta: this.CUENTA_ADMIN_ESPECIAL,
      fecha: new Date().toISOString(),
      activo: true
    });
  }

  static esDispositivoAdminDesbloqueado() {
    const data = BaseDatos.obtener('dispositivo_admin_desbloqueado', null);
    return data && data.activo === true && data.cuenta === this.CUENTA_ADMIN_ESPECIAL;
  }

  static verificarDesbloqueoAdminDispositivo() {
    const sesion = this.obtenerSesion();
    if (sesion && sesion.usuario && sesion.usuario.toLowerCase() === this.CUENTA_ADMIN_ESPECIAL.toLowerCase()) {
      this.desbloquearAdminEnDispositivo();
    }
  }

  static inicializarAdminPorDefecto() {
    const usuarios = this.obtenerUsuarios();
    if (!usuarios.find(u => u.usuario === 'admin')) {
      const admin = new Usuario({
        nombre: 'Administrador FAURE',
        usuario: 'admin',
        contrasena: 'admin123',
        tipo: 'Administrador',
        pin: '1234',
        permisos: ['todo']
      });
      this.crearUsuario(admin);
    }
    this.verificarDesbloqueoAdminDispositivo();
  }
}
window.UsuariosDB = UsuariosDB;
