/**
 * FAURE Finanzas v1.4
 * 100% offline · Contabilidad simulada
 */
const DB = {
  p: 'faure_',
  get(k, d) { try { const v = localStorage.getItem(this.p + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { localStorage.setItem(this.p + k, JSON.stringify(v)); }
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const Icons = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="16" cy="14" r="1.5" fill="currentColor"/></svg>',
  package: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5z"/><path d="M12 22V12"/><path d="M3 7l9 5 9-5"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
  arrowDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
  arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  calc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h8M8 14h2M12 14h2M16 14h2M8 18h2M12 18h2M16 18h2"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  get(n, s = 22) {
    const svg = this[n] || this.home;
    return svg.replace('<svg', `<svg width="${s}" height="${s}" aria-hidden="true"`);
  }
};

const App = {
  screen: 'home',
  params: {},
  VERSION: '1.4',
  notiQueue: [],
  notiShowing: false,
  calc: { open: false, minimized: true, expr: '', display: '0', pos: null },

  saldo() { return Number(DB.get('saldo', 0)) || 0; },
  setSaldo(n) { DB.set('saldo', Number(n) || 0); },
  adjust(n) { const s = this.saldo() + Number(n); this.setSaldo(s); return s; },
  ingresos() { return DB.get('ingresos', []); },
  gastos() { return DB.get('gastos', []); },
  retiros() { return DB.get('retiros', []); },
  remesas() { return DB.get('remesas', []); },
  metas() { return DB.get('metas', []); },
  config() { return Object.assign({ nombre: 'FAURE Finanzas', moneda: 'CUP', tema: 'dark' }, DB.get('config', {})); },

  // Objetivos con % de inversión (ninguno preconfigurado)
  pctTotalMetas() {
    return this.metas().reduce((s, m) => s + (Number(m.pct) || 0), 0);
  },

  // Calcula montos para un total dado según % de cada objetivo
  calcDistribucion(total) {
    const t = Number(total) || 0;
    return this.metas()
      .filter(m => Number(m.pct) > 0)
      .map(m => ({
        id: m.id,
        nombre: m.nombre,
        pct: Number(m.pct) || 0,
        cantidad: Math.round(t * (Number(m.pct) || 0)) / 100
      }));
  },

  // Aplica distribución: suma al saldo y a cada meta; notifica si se completan
  aplicarDistribucion(monto, origen) {
    const montoN = Number(monto) || 0;
    if (montoN <= 0) return [];
    this.adjust(montoN);
    const alloc = this.calcDistribucion(montoN);
    // Ajuste redondeo
    if (alloc.length) {
      const sum = alloc.reduce((a, b) => a + b.cantidad, 0);
      if (Math.abs(sum - montoN) > 0.001) {
        alloc[0].cantidad = Math.round((alloc[0].cantidad + (montoN - sum)) * 100) / 100;
      }
    }
    const lista = this.metas();
    const completadas = [];
    alloc.forEach(a => {
      const m = lista.find(x => x.id === a.id);
      if (m) {
        const antes = Number(m.acumulada) || 0;
        const obj = Number(m.objetivo) || 0;
        m.acumulada = antes + a.cantidad;
        if (obj > 0 && antes < obj && m.acumulada >= obj) {
          completadas.push(m.nombre);
        }
      }
    });
    DB.set('metas', lista);
    const hist = DB.get('distribuciones_hist', []);
    hist.unshift({ id: uid(), fecha: new Date().toISOString().slice(0, 10), origen, total: montoN, detalle: alloc });
    DB.set('distribuciones_hist', hist.slice(0, 100));
    completadas.forEach(nombre => this.enqueueNoti(nombre));
    return alloc;
  },

  enqueueNoti(nombreMeta) {
    this.notiQueue.push(nombreMeta);
    this.processNotiQueue();
  },

  processNotiQueue() {
    if (this.notiShowing || this.notiQueue.length === 0) return;
    this.notiShowing = true;
    const nombre = this.notiQueue.shift();
    this.showMetaNoti(nombre, () => {
      this.notiShowing = false;
      setTimeout(() => this.processNotiQueue(), 300);
    });
  },

  showMetaNoti(nombre, onDone) {
    document.querySelector('.meta-noti')?.remove();
    const el = document.createElement('div');
    el.className = 'meta-noti';
    el.innerHTML = `
      <div class="meta-noti-inner">
        <div class="meta-noti-title">Meta completada</div>
        <div class="meta-noti-name">${nombre}</div>
        <div class="meta-noti-sub">¡Objetivo alcanzado!</div>
      </div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { el.remove(); onDone && onDone(); }, 400);
    }, 2800);
  },

  resumen() {
    const ing = this.ingresos().reduce((s, i) => s + Number(i.cantidad), 0);
    const gas = this.gastos().reduce((s, g) => s + Number(g.cantidad), 0);
    const gan = this.remesas().filter(r => r.estado === 'Completada').reduce((s, r) => s + Number(r.ganancia), 0);
    const ahorros = this.metas().reduce((s, m) => s + Number(m.acumulada), 0);
    return { saldo: this.saldo(), ingresos: ing, gastos: gas, ganancias: gan, ahorros };
  },

  movimientos(lim = 10) {
    const m = [];
    this.ingresos().forEach(i => m.push({ tipo: 'Ingreso', fecha: i.fecha, cantidad: +i.cantidad, desc: i.tipo + (i.nota ? ' · ' + i.nota : ''), t: i.id }));
    this.gastos().forEach(g => m.push({ tipo: 'Gasto', fecha: g.fecha, cantidad: -g.cantidad, desc: g.categoria, t: g.id }));
    this.retiros().forEach(r => m.push({ tipo: 'Retiro', fecha: r.fecha, cantidad: -r.cantidad, desc: r.motivo || 'Retiro', t: r.id }));
    this.remesas().forEach(r => m.push({ tipo: 'Remesa', fecha: r.fecha, cantidad: +r.ganancia, desc: `${r.pais} · ${r.metodo}`, t: r.id }));
    return m.sort((a, b) => (b.t > a.t ? 1 : -1)).slice(0, lim);
  },

  fmt(n) {
    const mon = this.config().moneda || 'CUP';
    return new Intl.NumberFormat('es-CU', { maximumFractionDigits: 2 }).format(Number(n) || 0) + ' ' + mon;
  },

  init() {
    const cfg = this.config();
    document.documentElement.setAttribute('data-theme', cfg.tema === 'light' ? 'light' : 'dark');
    // Restore calc button position
    const pos = DB.get('calc_pos', null);
    if (pos) this.calc.pos = pos;
    setTimeout(() => {
      document.getElementById('splash')?.classList.add('hide');
      document.getElementById('app')?.classList.remove('hidden');
      this.go('home');
      this.renderCalcFab();
    }, 1800);
  },

  go(screen, params = {}) {
    this.screen = screen;
    this.params = params;
    const el = document.getElementById('app');
    const map = {
      home: () => this.viewHome(),
      finanzas: () => this.viewFinanzas(),
      remesa: () => this.viewRemesa(),
      metas: () => this.viewMetas(),
      config: () => this.viewConfig(),
      historial: () => this.viewHistorial()
    };
    el.innerHTML = (map[screen] || map.home)() + this.nav(screen);
    this.bind();
    this.renderCalcFab();
    if (this.calc.open && !this.calc.minimized) this.renderCalcPanel();
  },

  toast(msg) {
    document.querySelector('.toast')?.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  },

  modal(title, html) {
    const o = document.createElement('div');
    o.className = 'modal-overlay';
    o.innerHTML = `<div class="modal"><div class="modal-header"><h2>${title}</h2><button class="close-btn" id="mclose">×</button></div><div>${html}</div></div>`;
    document.body.appendChild(o);
    const close = () => o.remove();
    document.getElementById('mclose').onclick = close;
    o.onclick = e => { if (e.target === o) close(); };
    return o;
  },

  nav(active) {
    const items = [
      { id: 'home', icon: 'home', label: 'Inicio' },
      { id: 'finanzas', icon: 'wallet', label: 'Finanzas' },
      { id: 'remesa', icon: 'package', label: 'Remesa' },
      { id: 'metas', icon: 'target', label: 'Objetivos' },
      { id: 'config', icon: 'settings', label: 'Ajustes' }
    ];
    return `<div class="bottom-nav">${items.map(i => `
      <div class="nav-item ${active === i.id ? 'active' : ''}" data-go="${i.id}">
        <span class="ni">${Icons.get(i.icon, 22)}</span><span>${i.label}</span>
      </div>`).join('')}</div>`;
  },

  // ---- Views ----
  viewHome() {
    const r = this.resumen();
    const movs = this.movimientos(5);
    const metas = this.metas().filter(m => Number(m.pct) > 0);
    const pctSum = this.pctTotalMetas();
    const sc = r.saldo < 0 ? 'saldo-negativo' : '';
    return `
      <div class="header"><h1>FAURE Finanzas</h1><div class="subtitle">Controla · Ahorra · Crece</div></div>
      <div class="card">
        <div class="card-title">Disponible</div>
        <div class="saldo-grande ${sc}">${this.fmt(r.saldo)}</div>
        <div class="text-muted mt-8">Solo contabilidad · Sin dinero real</div>
      </div>
      <div class="grid-2" style="margin:0 16px;">
        <div class="stat"><div class="label">Ganancias</div><div class="value amount-pos">${this.fmt(r.ganancias)}</div></div>
        <div class="stat"><div class="label">Gastos</div><div class="value amount-neg">${this.fmt(r.gastos)}</div></div>
        <div class="stat"><div class="label">Ingresos</div><div class="value amount-pos">${this.fmt(r.ingresos)}</div></div>
        <div class="stat"><div class="label">En objetivos</div><div class="value">${this.fmt(r.ahorros)}</div></div>
      </div>
      <div class="section-title">Acciones</div>
      <div class="quick-actions">
        <div class="quick-btn" data-go="remesa"><div class="qi">${Icons.get('package', 24)}</div><span class="label">Remesa</span></div>
        <div class="quick-btn" data-act="ingreso"><div class="qi">${Icons.get('arrowDown', 24)}</div><span class="label">Ingreso</span></div>
        <div class="quick-btn" data-act="gasto"><div class="qi">${Icons.get('arrowUp', 24)}</div><span class="label">Gasto</span></div>
        <div class="quick-btn" data-act="retiro"><div class="qi">${Icons.get('card', 24)}</div><span class="label">Retiro</span></div>
      </div>
      <div class="section-title">Inversión en objetivos <a href="#" data-go="metas" style="color:var(--gold);font-size:0.75rem;float:right;">Gestionar</a></div>
      <div class="card">
        ${metas.length === 0
          ? '<div class="empty">Sin objetivos con % asignado.<br><small>Ve a Objetivos y define el % de inversión de cada uno.</small></div>'
          : metas.map(m => `
            <div class="dist-row">
              <span class="name">${m.nombre}</span>
              <div class="dist-bar-bg"><div class="dist-bar" style="width:${Math.min(100, m.pct)}%"></div></div>
              <span class="pct">${m.pct}%</span>
            </div>`).join('') +
            `<div class="text-muted mt-8" style="font-size:0.8rem;">Total asignado: <strong style="color:${Math.abs(pctSum - 100) < 0.5 ? 'var(--success)' : 'var(--warning)'}">${pctSum}%</strong></div>`
        }
      </div>
      <div class="section-title">Últimos movimientos <a href="#" data-go="historial" style="color:var(--gold);font-size:0.75rem;float:right;">Ver todo</a></div>
      <div class="card">
        ${movs.length === 0 ? '<div class="empty">Sin movimientos</div>' : movs.map(m => `
          <div class="list-item">
            <div><div class="title">${m.tipo}</div><div class="meta">${m.fecha} · ${m.desc}</div></div>
            <div class="amount ${m.cantidad >= 0 ? 'amount-pos' : 'amount-neg'}">${m.cantidad >= 0 ? '+' : ''}${this.fmt(m.cantidad)}</div>
          </div>`).join('')}
      </div>`;
  },

  viewFinanzas() {
    const tab = this.params.tab || 'ingresos';
    const tabs = ['ingresos', 'gastos', 'retiros'];
    let body = '';
    if (tab === 'ingresos') {
      const lista = this.ingresos();
      body = `<div style="padding:12px 16px;"><button class="btn btn-primary" data-act="ingreso">+ Nuevo ingreso</button></div>
        <div class="card">${lista.length ? lista.map(i => `
          <div class="list-item"><div><div class="title">${i.tipo}</div><div class="meta">${i.fecha}</div></div>
          <div class="amount amount-pos">+${this.fmt(i.cantidad)}</div></div>`).join('') : '<div class="empty">Sin ingresos</div>'}</div>`;
    } else if (tab === 'gastos') {
      const lista = this.gastos();
      body = `<div style="padding:12px 16px;"><button class="btn btn-primary" data-act="gasto">+ Nuevo gasto</button></div>
        <div class="card">${lista.length ? lista.map(g => `
          <div class="list-item"><div><div class="title">${g.categoria}</div><div class="meta">${g.fecha}</div></div>
          <div class="amount amount-neg">-${this.fmt(g.cantidad)}</div></div>`).join('') : '<div class="empty">Sin gastos</div>'}</div>`;
    } else {
      const lista = this.retiros();
      body = `<div style="padding:12px 16px;"><button class="btn btn-primary" data-act="retiro">+ Nuevo retiro</button>
        <p class="text-muted mt-8" style="font-size:0.8rem;">Permite saldo negativo</p></div>
        <div class="card">${lista.length ? lista.map(r => `
          <div class="list-item"><div><div class="title">${r.motivo || 'Retiro'}</div><div class="meta">${r.fecha}</div></div>
          <div class="amount amount-neg">-${this.fmt(r.cantidad)}</div></div>`).join('') : '<div class="empty">Sin retiros</div>'}</div>`;
    }
    return `
      <div class="header"><h1>Finanzas</h1><div class="subtitle">Movimientos</div></div>
      <div class="tabs">${tabs.map(t => `<div class="tab ${tab === t ? 'active' : ''}" data-tab="${t}">${t[0].toUpperCase() + t.slice(1)}</div>`).join('')}</div>
      ${body}`;
  },

  viewRemesa() {
    const metodos = ['Zelle', 'PayPal USD', 'PayPal EUR', 'Cash App', 'Bizum', 'IBAN', 'Western Union', 'MoneyGram', 'USDT'];
    return `
      <div class="header"><h1>Nueva remesa</h1><div class="subtitle">Registrar operación</div></div>
      <div class="card">
        <div class="form-group"><label>Fecha</label><input type="date" id="r-fecha" value="${new Date().toISOString().slice(0, 10)}" /></div>
        <div class="form-group"><label>País de origen</label><input type="text" id="r-pais" placeholder="España, USA..." /></div>
        <div class="form-group"><label>Método</label><select id="r-metodo">${metodos.map(m => `<option>${m}</option>`).join('')}</select></div>
        <div class="form-group"><label>Moneda</label><select id="r-moneda"><option>USD</option><option>EUR</option><option>CUP</option></select></div>
        <div class="form-group"><label>Cantidad enviada</label><input type="number" id="r-cant" min="0" step="0.01" /></div>
        <div class="form-group"><label>Tasa</label><input type="number" id="r-tasa" min="0" step="0.01" /></div>
        <div class="form-group"><label>Cantidad entregada</label><input type="number" id="r-ent" min="0" step="0.01" /></div>
        <div class="form-group"><label>Nota</label><input type="text" id="r-nota" /></div>
        <div id="r-prev" class="text-muted" style="font-size:0.85rem;margin-bottom:8px;"></div>
        <div id="r-dist-preview"></div>
        <label style="display:flex;align-items:center;gap:8px;margin:12px 0;font-size:0.85rem;">
          <input type="checkbox" id="r-dist" checked /> Distribuir ganancia entre objetivos
        </label>
        <button class="btn btn-primary" id="btn-remesa">Guardar remesa</button>
      </div>`;
  },

  viewMetas() {
    const metas = this.metas();
    const pctSum = this.pctTotalMetas();
    return `
      <div class="header"><h1>Objetivos</h1><div class="subtitle">Metas e inversión automática</div></div>
      <div style="padding:12px 16px;">
        <button class="btn btn-primary" data-act="meta">+ Nuevo objetivo</button>
        <p class="text-muted mt-8" style="font-size:0.8rem;">
          Asigna un % de inversión a cada objetivo. Al ingresar dinero se reparte según esos % y verás la cantidad exacta.
          Total asignado: <strong style="color:${Math.abs(pctSum - 100) < 0.5 ? 'var(--success)' : 'var(--warning)'}">${pctSum}%</strong>
        </p>
      </div>
      ${metas.length === 0 ? '<div class="card"><div class="empty">No hay objetivos.<br><small>Crea uno y define su % de inversión.</small></div></div>' :
        metas.map(m => {
          const pct = m.objetivo > 0 ? Math.min(100, Math.round((Number(m.acumulada) || 0) / m.objetivo * 100)) : 0;
          return `<div class="card">
            ${m.imagen ? `<img class="meta-cover" src="${m.imagen}" alt="" />` : '<div class="meta-cover-placeholder">Sin imagen de portada</div>'}
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong>${m.nombre}</strong>
              <span class="badge">${pct}%</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
            <div class="mt-8" style="display:flex;justify-content:space-between;font-size:0.85rem;">
              <span>${this.fmt(m.acumulada || 0)}</span>
              <span class="text-muted">de ${this.fmt(m.objetivo || 0)}</span>
            </div>
            <div class="mt-8" style="font-size:0.85rem;color:var(--gold);">
              Inversión automática: <strong>${Number(m.pct) || 0}%</strong>
            </div>
            <div class="btn-row">
              <button class="btn btn-secondary btn-sm" data-act="meta-add" data-id="${m.id}">+ Agregar</button>
              <button class="btn btn-outline btn-sm" data-act="meta-edit" data-id="${m.id}">Editar</button>
              <button class="btn btn-outline btn-sm" data-act="meta-img" data-id="${m.id}">${Icons.get('image', 16)} Foto</button>
              <button class="btn btn-danger btn-sm" data-act="meta-del" data-id="${m.id}">×</button>
            </div>
          </div>`;
        }).join('')}`;
  },

  viewHistorial() {
    const movs = this.movimientos(50);
    return `
      <div class="header"><h1>Historial</h1><div class="subtitle">Todos los movimientos</div></div>
      <div class="card">${movs.length ? movs.map(m => `
        <div class="list-item">
          <div><div class="title">${m.tipo}</div><div class="meta">${m.fecha} · ${m.desc}</div></div>
          <div class="amount ${m.cantidad >= 0 ? 'amount-pos' : 'amount-neg'}">${m.cantidad >= 0 ? '+' : ''}${this.fmt(m.cantidad)}</div>
        </div>`).join('') : '<div class="empty">Sin movimientos</div>'}</div>
      <div style="padding:12px 16px;"><button class="btn btn-outline" data-go="home">← Volver</button></div>`;
  },

  viewConfig() {
    const cfg = this.config();
    return `
      <div class="header"><h1>Ajustes</h1><div class="subtitle">Versión ${this.VERSION}</div></div>
      <div class="card">
        <div class="card-title">Apariencia</div>
        <div class="theme-modes">
          <button class="theme-mode-btn ${cfg.tema !== 'light' ? 'active' : ''}" data-tema="dark">Oscuro</button>
          <button class="theme-mode-btn ${cfg.tema === 'light' ? 'active' : ''}" data-tema="light">Claro</button>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Negocio</div>
        <div class="form-group"><label>Nombre</label><input type="text" id="c-nombre" value="${cfg.nombre}" /></div>
        <div class="form-group"><label>Moneda</label>
          <select id="c-moneda">
            <option ${cfg.moneda === 'CUP' ? 'selected' : ''}>CUP</option>
            <option ${cfg.moneda === 'USD' ? 'selected' : ''}>USD</option>
            <option ${cfg.moneda === 'EUR' ? 'selected' : ''}>EUR</option>
          </select>
        </div>
        <button class="btn btn-primary" id="c-save">Guardar</button>
      </div>
      <div class="card">
        <div class="card-title">Respaldo</div>
        <button class="btn btn-secondary" id="c-backup">Descargar copia</button>
        <div class="form-group mt-12"><label>Restaurar</label><input type="file" id="c-restore" accept=".json" /></div>
      </div>
      <div class="card">
        <div class="card-title">Acerca de</div>
        <p class="text-muted" style="font-size:0.85rem;line-height:1.6;">
          <strong style="color:var(--gold);">FAURE Finanzas</strong> · Versión ${this.VERSION}<br>
          Director y Productor: Jorge FAURE<br>
          Desarrollo: Oscar Antonio Alvarez Collado<br>
          Solo contabilidad simulada · 100% offline
        </p>
      </div>`;
  },


  // ---- Calculadora flotante ----
  _fabListeners: null,

  renderCalcFab() {
    document.getElementById('calc-fab')?.remove();
    document.getElementById('calc-backdrop')?.remove();
    if (this.calc.open && !this.calc.minimized) return;
    const btn = document.createElement('button');
    btn.id = 'calc-fab';
    btn.type = 'button';
    btn.className = 'calc-fab';
    btn.setAttribute('aria-label', 'Calculadora');
    btn.innerHTML = Icons.get('calc', 26);
    if (this.calc.pos) {
      btn.style.left = this.calc.pos.x + 'px';
      btn.style.top = this.calc.pos.y + 'px';
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
    }
    document.body.appendChild(btn);
    this.bindCalcFab(btn);
  },

  bindCalcFab(btn) {
    // Quitar listeners previos
    if (this._fabListeners) {
      const L = this._fabListeners;
      window.removeEventListener('mousemove', L.move);
      window.removeEventListener('mouseup', L.end);
      window.removeEventListener('touchmove', L.tmove);
      window.removeEventListener('touchend', L.tend);
      this._fabListeners = null;
    }

    let active = false;   // solo true si el gesto empezó EN el FAB
    let longPress = false;
    let dragging = false;
    let moved = false;
    let timer = null;
    let startX = 0, startY = 0, origX = 0, origY = 0;

    const onStart = (x, y) => {
      active = true;
      longPress = false;
      dragging = false;
      moved = false;
      startX = x; startY = y;
      const rect = btn.getBoundingClientRect();
      origX = rect.left; origY = rect.top;
      timer = setTimeout(() => {
        if (!active) return;
        longPress = true;
        dragging = true;
        btn.classList.add('dragging');
      }, 450);
    };

    const onMove = (x, y) => {
      if (!active) return;
      if (Math.abs(x - startX) > 10 || Math.abs(y - startY) > 10) {
        moved = true;
        if (!dragging) clearTimeout(timer);
      }
      if (!dragging) return;
      const nx = Math.max(0, Math.min(window.innerWidth - 56, origX + (x - startX)));
      const ny = Math.max(0, Math.min(window.innerHeight - 56, origY + (y - startY)));
      btn.style.left = nx + 'px';
      btn.style.top = ny + 'px';
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
      this.calc.pos = { x: nx, y: ny };
    };

    const onEnd = (e) => {
      if (!active) return; // <-- crítico: ignorar toques que no empezaron en el FAB
      active = false;
      clearTimeout(timer);
      if (dragging) {
        btn.classList.remove('dragging');
        DB.set('calc_pos', this.calc.pos);
        dragging = false;
        longPress = false;
        if (e) { e.preventDefault(); e.stopPropagation(); }
        return;
      }
      if (!longPress && !moved) {
        this.openCalculator();
      }
      longPress = false;
      moved = false;
    };

    const move = (e) => onMove(e.clientX, e.clientY);
    const end = (e) => onEnd(e);
    const tmove = (e) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const tend = (e) => onEnd(e);

    this._fabListeners = { move, end, tmove, tend };

    btn.addEventListener('mousedown', e => {
      e.preventDefault();
      e.stopPropagation();
      onStart(e.clientX, e.clientY);
    });
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      e.stopPropagation();
      if (e.touches[0]) onStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    window.addEventListener('touchmove', tmove, { passive: false });
    window.addEventListener('touchend', tend);
  },

  openCalculator() {
    this.calc.open = true;
    this.calc.minimized = false;
    document.getElementById('calc-fab')?.remove();
    this.renderCalcPanel();
  },

  minimizeCalculator() {
    this.calc.minimized = true;
    // mantiene open=true y el display/expr
    document.getElementById('calc-panel')?.remove();
    document.getElementById('calc-backdrop')?.remove();
    this.renderCalcFab();
  },

  closeCalculator() {
    this.calc.open = false;
    this.calc.minimized = true;
    this.calc.expr = '';
    this.calc.display = '0';
    document.getElementById('calc-panel')?.remove();
    document.getElementById('calc-backdrop')?.remove();
    this.renderCalcFab();
  },

  renderCalcPanel() {
    document.getElementById('calc-panel')?.remove();
    document.getElementById('calc-backdrop')?.remove();

    // Fondo bloquea toques a la interfaz de debajo
    const backdrop = document.createElement('div');
    backdrop.id = 'calc-backdrop';
    backdrop.className = 'calc-backdrop';
    backdrop.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); });
    backdrop.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); }, { passive: false });
    document.body.appendChild(backdrop);

    const p = document.createElement('div');
    p.id = 'calc-panel';
    p.className = 'calc-panel';
    p.innerHTML = `
      <div class="calc-bar">
        <span class="calc-bar-title">Calculadora</span>
        <div class="calc-bar-actions">
          <button type="button" class="calc-bar-btn" id="calc-min" title="Minimizar" aria-label="Minimizar">${Icons.get('minus', 18)}</button>
          <button type="button" class="calc-bar-btn" id="calc-close" title="Cerrar" aria-label="Cerrar">${Icons.get('close', 18)}</button>
        </div>
      </div>
      <div class="calc-display" id="calc-display">${this.calc.display}</div>
      <div class="calc-keys">
        ${['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','='].map(k =>
          `<button type="button" class="calc-key ${'÷×−+=C±%'.includes(k) ? 'op' : ''} ${k === '=' ? 'eq' : ''}" data-k="${k}">${k}</button>`
        ).join('')}
      </div>`;
    document.body.appendChild(p);

    // Evitar que toques atraviesen el panel
    p.addEventListener('click', e => e.stopPropagation());
    p.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });

    const minBtn = document.getElementById('calc-min');
    const closeBtn = document.getElementById('calc-close');

    const bindTap = (el, fn) => {
      if (!el) return;
      let last = 0;
      const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const now = Date.now();
        if (now - last < 350) return; // evita doble disparo click+touchend
        last = now;
        fn();
      };
      el.addEventListener('click', handler);
      el.addEventListener('touchend', handler, { passive: false });
    };

    bindTap(minBtn, () => this.minimizeCalculator());
    bindTap(closeBtn, () => this.closeCalculator());

    p.querySelectorAll('.calc-key').forEach(btn => {
      let last = 0;
      const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const now = Date.now();
        if (now - last < 350) return;
        last = now;
        this.calcKey(btn.dataset.k);
      };
      btn.addEventListener('click', handler);
      btn.addEventListener('touchend', handler, { passive: false });
    });
  },

  calcKey(k) {
    let d = this.calc.display;
    if (k === 'C') { this.calc.expr = ''; d = '0'; }
    else if (k === '±') { d = String(-(parseFloat(d) || 0)); }
    else if (k === '%') { d = String((parseFloat(d) || 0) / 100); }
    else if (k === '=') {
      try {
        const exp = (this.calc.expr + d).replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        if (!/^[\d.\s+\-*/()]+$/.test(exp)) throw 0;
        let r = Function('"use strict"; return (' + exp + ')')();
        if (typeof r !== 'number' || !isFinite(r)) throw 0;
        d = String(Math.round(r * 1e10) / 1e10);
        this.calc.expr = '';
      } catch { d = 'Error'; this.calc.expr = ''; }
    } else if ('÷×−+'.includes(k)) {
      this.calc.expr += d + k;
      d = '0';
    } else if (k === '.') {
      if (!d.includes('.')) d += '.';
    } else {
      d = (d === '0' || d === 'Error') ? k : d + k;
    }
    this.calc.display = d;
    const el = document.getElementById('calc-display');
    if (el) el.textContent = d;
  },

  // ---- Bind ----
  bind() {
    document.querySelectorAll('[data-go]').forEach(el => {
      el.onclick = e => { e.preventDefault(); this.go(el.dataset.go); };
    });
    document.querySelectorAll('[data-tab]').forEach(el => {
      el.onclick = () => this.go('finanzas', { tab: el.dataset.tab });
    });
    document.querySelectorAll('[data-act]').forEach(el => {
      el.onclick = () => this.action(el.dataset.act, el.dataset.id);
    });
    document.querySelectorAll('[data-tema]').forEach(el => {
      el.onclick = () => {
        const cfg = this.config();
        cfg.tema = el.dataset.tema;
        DB.set('config', cfg);
        document.documentElement.setAttribute('data-theme', cfg.tema === 'light' ? 'light' : 'dark');
        this.go('config');
      };
    });

    const updRem = () => {
      const c = +document.getElementById('r-cant')?.value || 0;
      const t = +document.getElementById('r-tasa')?.value || 0;
      const e = +document.getElementById('r-ent')?.value || 0;
      const g = c * t - e;
      const p = document.getElementById('r-prev');
      if (p) p.textContent = 'Ganancia estimada: ' + this.fmt(g);
      this.renderDistPreview('r-dist-preview', g);
    };
    ['r-cant', 'r-tasa', 'r-ent'].forEach(id => document.getElementById(id)?.addEventListener('input', updRem));

    document.getElementById('btn-remesa')?.addEventListener('click', () => {
      const cant = +document.getElementById('r-cant').value || 0;
      const tasa = +document.getElementById('r-tasa').value || 0;
      const ent = +document.getElementById('r-ent').value || 0;
      const gan = cant * tasa - ent;
      const rem = {
        id: uid(), fecha: document.getElementById('r-fecha').value,
        pais: document.getElementById('r-pais').value.trim() || 'Desconocido',
        metodo: document.getElementById('r-metodo').value, moneda: document.getElementById('r-moneda').value,
        enviada: cant, tasa, entregada: ent, ganancia: gan, nota: document.getElementById('r-nota').value, estado: 'Completada'
      };
      const lista = this.remesas(); lista.unshift(rem); DB.set('remesas', lista);
      if (document.getElementById('r-dist')?.checked && gan > 0) {
        const alloc = this.aplicarDistribucion(gan, 'Remesa');
        this.toast('Remesa · Distribuido: ' + this.fmt(gan));
      } else if (gan !== 0) {
        this.adjust(gan);
        this.toast('Remesa · Ganancia: ' + this.fmt(gan));
      } else this.toast('Remesa guardada');
      this.go('home');
    });

    document.getElementById('c-save')?.addEventListener('click', () => {
      const cfg = this.config();
      cfg.nombre = document.getElementById('c-nombre').value;
      cfg.moneda = document.getElementById('c-moneda').value;
      DB.set('config', cfg);
      this.toast('Guardado');
    });
    document.getElementById('c-backup')?.addEventListener('click', () => {
      const data = {};
      Object.keys(localStorage).filter(k => k.startsWith('faure_')).forEach(k => {
        data[k.replace('faure_', '')] = JSON.parse(localStorage.getItem(k));
      });
      data._meta = { app: 'FAURE Finanzas', version: this.VERSION, fecha: new Date().toISOString() };
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      a.download = `faure_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      this.toast('Copia descargada');
    });
    document.getElementById('c-restore')?.addEventListener('change', async e => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        Object.keys(data).forEach(k => { if (k !== '_meta') DB.set(k, data[k]); });
        this.toast('Restaurado'); this.go('home');
      } catch { this.toast('Archivo inválido'); }
    });
  },

  renderDistPreview(containerId, total) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const alloc = this.calcDistribucion(total);
    if (!alloc.length || !(Number(total) > 0)) { el.innerHTML = ''; return; }
    el.innerHTML = `<div class="dist-preview">
      <div class="dist-preview-title">Distribución de ${this.fmt(total)}</div>
      ${alloc.map(a => `
        <div class="dist-row">
          <span class="name">${a.nombre} (${a.pct}%)</span>
          <span class="pct">${this.fmt(a.cantidad)}</span>
        </div>`).join('')}
    </div>`;
  },

  action(act, id) {
    if (act === 'ingreso') {
      this.modal('Nuevo ingreso', `
        <div class="form-group"><label>Cantidad</label><input type="number" id="m-cant" min="0" step="0.01" /></div>
        <div class="form-group"><label>Tipo</label><select id="m-tipo"><option>General</option><option>Remesa</option><option>Otro</option></select></div>
        <div class="form-group"><label>Nota</label><input type="text" id="m-nota" /></div>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:0.85rem;">
          <input type="checkbox" id="m-dist" checked /> Distribuir entre objetivos
        </label>
        <div id="m-dist-preview"></div>
        <button class="btn btn-primary mt-8" id="m-ok">Guardar</button>`);
      const prev = () => this.renderDistPreview('m-dist-preview', document.getElementById('m-cant').value);
      document.getElementById('m-cant').addEventListener('input', prev);
      document.getElementById('m-ok').onclick = () => {
        const cant = +document.getElementById('m-cant').value || 0;
        const item = { id: uid(), fecha: new Date().toISOString().slice(0, 10), cantidad: cant, tipo: document.getElementById('m-tipo').value, nota: document.getElementById('m-nota').value };
        const lista = this.ingresos(); lista.unshift(item); DB.set('ingresos', lista);
        if (document.getElementById('m-dist')?.checked) {
          this.aplicarDistribucion(cant, 'Ingreso');
          this.toast('Ingreso distribuido: ' + this.fmt(cant));
        } else {
          this.adjust(cant);
          this.toast('Ingreso registrado');
        }
        document.querySelector('.modal-overlay')?.remove();
        this.go(this.screen === 'finanzas' ? 'finanzas' : 'home', this.params);
      };
    }
    if (act === 'gasto') {
      this.modal('Nuevo gasto', `
        <div class="form-group"><label>Cantidad</label><input type="number" id="m-cant" min="0" step="0.01" /></div>
        <div class="form-group"><label>Categoría</label>
          <select id="m-cat"><option>General</option><option>Negocio</option><option>Personal</option><option>Transporte</option><option>Comida</option></select></div>
        <div class="form-group"><label>Nota</label><input type="text" id="m-nota" /></div>
        <button class="btn btn-primary" id="m-ok">Guardar</button>`);
      document.getElementById('m-ok').onclick = () => {
        const cant = +document.getElementById('m-cant').value || 0;
        const item = { id: uid(), fecha: new Date().toISOString().slice(0, 10), cantidad: cant, categoria: document.getElementById('m-cat').value, nota: document.getElementById('m-nota').value };
        const lista = this.gastos(); lista.unshift(item); DB.set('gastos', lista);
        this.adjust(-cant);
        document.querySelector('.modal-overlay')?.remove();
        this.toast('Gasto registrado');
        this.go(this.screen === 'finanzas' ? 'finanzas' : 'home', this.params);
      };
    }
    if (act === 'retiro') {
      this.modal('Nuevo retiro', `
        <p class="text-muted" style="margin-bottom:10px;font-size:0.85rem;">Permite saldo negativo</p>
        <div class="form-group"><label>Cantidad</label><input type="number" id="m-cant" min="0" step="0.01" /></div>
        <div class="form-group"><label>Motivo</label><input type="text" id="m-motivo" /></div>
        <button class="btn btn-primary" id="m-ok">Registrar</button>`);
      document.getElementById('m-ok').onclick = () => {
        const cant = +document.getElementById('m-cant').value || 0;
        const item = { id: uid(), fecha: new Date().toISOString().slice(0, 10), cantidad: cant, motivo: document.getElementById('m-motivo').value };
        const lista = this.retiros(); lista.unshift(item); DB.set('retiros', lista);
        this.adjust(-cant);
        document.querySelector('.modal-overlay')?.remove();
        this.toast('Retiro registrado');
        this.go(this.screen === 'finanzas' ? 'finanzas' : 'home', this.params);
      };
    }
    if (act === 'meta') {
      this.modal('Nuevo objetivo', `
        <div class="form-group"><label>Nombre</label><input type="text" id="m-nombre" placeholder="Casa, Moto, Negocio..." /></div>
        <div class="form-group"><label>Cantidad objetivo</label><input type="number" id="m-obj" min="0" step="0.01" /></div>
        <div class="form-group"><label>% de inversión automática</label><input type="number" id="m-pct" min="0" max="100" step="1" value="0" placeholder="0" />
          <small class="text-muted">Del total ingresado, este % irá a este objetivo</small>
        </div>
        <div class="form-group"><label>Foto de portada (opcional)</label><input type="file" id="m-img" accept="image/*" /></div>
        <div id="m-preview"></div>
        <button class="btn btn-primary" id="m-ok">Crear</button>`);
      let imgData = null;
      document.getElementById('m-img').onchange = e => {
        const f = e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = ev => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas');
            let w = img.width, h = img.height;
            if (w > 800) { h = h * 800 / w; w = 800; }
            c.width = w; c.height = h;
            c.getContext('2d').drawImage(img, 0, 0, w, h);
            imgData = c.toDataURL('image/jpeg', 0.7);
            document.getElementById('m-preview').innerHTML = `<img class="meta-cover" src="${imgData}" />`;
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(f);
      };
      document.getElementById('m-ok').onclick = () => {
        const meta = {
          id: uid(),
          nombre: document.getElementById('m-nombre').value || 'Objetivo',
          objetivo: +document.getElementById('m-obj').value || 0,
          acumulada: 0,
          pct: +document.getElementById('m-pct').value || 0,
          imagen: imgData
        };
        const lista = this.metas(); lista.push(meta); DB.set('metas', lista);
        document.querySelector('.modal-overlay')?.remove();
        this.toast('Objetivo creado');
        this.go('metas');
      };
    }
    if (act === 'meta-edit') {
      const m = this.metas().find(x => x.id === id);
      if (!m) return;
      this.modal('Editar objetivo', `
        <div class="form-group"><label>Nombre</label><input type="text" id="m-nombre" value="${m.nombre}" /></div>
        <div class="form-group"><label>Cantidad objetivo</label><input type="number" id="m-obj" min="0" step="0.01" value="${m.objetivo || 0}" /></div>
        <div class="form-group"><label>% de inversión automática</label><input type="number" id="m-pct" min="0" max="100" step="1" value="${m.pct || 0}" />
          <small class="text-muted">Ej: si ingresas 10000 y pones 10%, a este objetivo le tocan 1000</small>
        </div>
        <button class="btn btn-primary" id="m-ok">Guardar</button>`);
      document.getElementById('m-ok').onclick = () => {
        const lista = this.metas();
        const item = lista.find(x => x.id === id);
        if (item) {
          item.nombre = document.getElementById('m-nombre').value || item.nombre;
          item.objetivo = +document.getElementById('m-obj').value || 0;
          item.pct = +document.getElementById('m-pct').value || 0;
          DB.set('metas', lista);
        }
        document.querySelector('.modal-overlay')?.remove();
        this.toast('Actualizado');
        this.go('metas');
      };
    }
    if (act === 'meta-add') {
      this.modal('Agregar a objetivo', `
        <div class="form-group"><label>Cantidad</label><input type="number" id="m-cant" min="0" step="0.01" /></div>
        <button class="btn btn-primary" id="m-ok">Agregar</button>`);
      document.getElementById('m-ok').onclick = () => {
        const cant = +document.getElementById('m-cant').value || 0;
        const lista = this.metas();
        const m = lista.find(x => x.id === id);
        if (m) {
          const antes = Number(m.acumulada) || 0;
          const obj = Number(m.objetivo) || 0;
          m.acumulada = antes + cant;
          DB.set('metas', lista);
          if (obj > 0 && antes < obj && m.acumulada >= obj) this.enqueueNoti(m.nombre);
        }
        document.querySelector('.modal-overlay')?.remove();
        this.toast('Agregado');
        this.go('metas');
      };
    }
    if (act === 'meta-img') {
      this.modal('Foto de portada', `
        <div class="form-group"><label>Selecciona una imagen</label><input type="file" id="m-img" accept="image/*" /></div>
        <div id="m-preview"></div>
        <button class="btn btn-primary" id="m-ok">Guardar foto</button>`);
      let imgData = null;
      document.getElementById('m-img').onchange = e => {
        const f = e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = ev => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas');
            let w = img.width, h = img.height;
            if (w > 800) { h = h * 800 / w; w = 800; }
            c.width = w; c.height = h;
            c.getContext('2d').drawImage(img, 0, 0, w, h);
            imgData = c.toDataURL('image/jpeg', 0.7);
            document.getElementById('m-preview').innerHTML = `<img class="meta-cover" src="${imgData}" />`;
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(f);
      };
      document.getElementById('m-ok').onclick = () => {
        if (!imgData) { this.toast('Elige una imagen'); return; }
        const lista = this.metas();
        const m = lista.find(x => x.id === id);
        if (m) { m.imagen = imgData; DB.set('metas', lista); }
        document.querySelector('.modal-overlay')?.remove();
        this.toast('Foto guardada');
        this.go('metas');
      };
    }
    if (act === 'meta-del') {
      if (confirm('¿Eliminar este objetivo?')) {
        DB.set('metas', this.metas().filter(m => m.id !== id));
        this.toast('Eliminado');
        this.go('metas');
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
