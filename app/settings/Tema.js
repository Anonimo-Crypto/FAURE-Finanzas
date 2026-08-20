/**
 * Tema - Modo claro/oscuro + color de acento
 * Preferencia del sistema por defecto. Todo offline.
 */
class Tema {
  static KEY = 'tema_config';
  static ACENTOS = {
    teal:   { name: 'Verde azulado', value: '#0f766e', soft: '#ccfbf1' },
    blue:   { name: 'Azul',          value: '#1d4ed8', soft: '#dbeafe' },
    indigo: { name: 'Índigo',        value: '#4338ca', soft: '#e0e7ff' },
    purple: { name: 'Morado',        value: '#7c3aed', soft: '#ede9fe' },
    rose:   { name: 'Rosa',          value: '#e11d48', soft: '#ffe4e6' },
    orange: { name: 'Naranja',       value: '#ea580c', soft: '#ffedd5' },
    green:  { name: 'Verde',         value: '#15803d', soft: '#dcfce7' },
    slate:  { name: 'Gris',          value: '#475569', soft: '#f1f5f9' }
  };

  static defaults() {
    return { modo: 'system', acento: 'teal' };
  }

  static obtener() {
    return { ...this.defaults(), ...(BaseDatos.obtener(this.KEY, {}) || {}) };
  }

  static guardar(cfg) {
    const actual = this.obtener();
    BaseDatos.guardar(this.KEY, { ...actual, ...cfg });
    this.aplicar();
  }

  static resolverModo(modo) {
    if (modo === 'light' || modo === 'dark') return modo;
    // system
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  static aplicar() {
    const cfg = this.obtener();
    const modo = this.resolverModo(cfg.modo);
    const acento = this.ACENTOS[cfg.acento] || this.ACENTOS.teal;

    document.documentElement.setAttribute('data-theme', modo);
    document.documentElement.style.setProperty('--accent', acento.value);
    document.documentElement.style.setProperty('--accent-soft', acento.soft);
    document.documentElement.style.setProperty('--accent-rgb', this.hexToRgb(acento.value));

    const meta = document.getElementById('meta-theme-color');
    if (meta) meta.setAttribute('content', modo === 'dark' ? '#0f172a' : acento.value);
  }

  static hexToRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h, 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }

  static init() {
    this.aplicar();
    // Escuchar cambios del sistema si está en modo system
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.obtener().modo === 'system') this.aplicar();
      });
    } catch (_) {}
  }
}
window.Tema = Tema;
