/**
 * FAURE FINANZAS - App principal
 * 100% offline · Contabilidad simulada · Sin cuentas ni admin
 */
const App = {
  currentScreen: 'home',
  params: {},

  init() {
    Tema.init();
    const logoEl = document.getElementById('splash-logo');
    if (logoEl && window.Icons) logoEl.innerHTML = Icons.get('logo', 72);

    setTimeout(() => {
      const splash = document.getElementById('splash');
      if (splash) splash.classList.add('hide');
      document.getElementById('app').classList.remove('hidden');
      this.navigate('home');
    }, 1800);
  },

  navigate(screen, params = {}) {
    this.currentScreen = screen;
    this.params = params;
    const app = document.getElementById('app');
    const map = {
      home: () => this.renderHome(),
      finanzas: () => this.renderFinanzas(),
      nuevaRemesa: () => this.renderNuevaRemesa(),
      metas: () => this.renderMetas(),
      historial: () => this.renderHistorial(),
      configuracion: () => this.renderConfiguracion(),
      reportes: () => this.renderReportes()
    };
    app.innerHTML = (map[screen] || map.home)();
    app.innerHTML += this.renderBottomNav(screen);
    this.bindEvents();
  },

  toast(msg, duration = 2500) {
    document.querySelector('.toast')?.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), duration);
  },

  showModal(title, bodyHtml) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="close-btn" id="modal-close">${Icons.get('close', 18)}</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    document.getElementById('modal-close').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
    return overlay;
  },

  fmt(n) {
    const moneda = Monedas.monedaPrincipal() || 'CUP';
    return new Intl.NumberFormat('es-CU', { maximumFractionDigits: 2 }).format(Number(n) || 0) + ' ' + moneda;
  },

  // ========== HOME ==========
  renderHome() {
    const r = OperacionesDB.obtenerResumen();
    const movs = OperacionesDB.obtenerUltimosMovimientos(5);
    const saldoClass = r.saldoDisponible < 0 ? 'saldo-negativo' : '';
    return `
      <div class="header">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1>FAURE Finanzas</h1>
            <div class="subtitle">Resumen del negocio</div>
          </div>
          <div class="header-actions">
            <button class="icon-btn" data-nav="reportes" title="Reportes">${Icons.get('chart', 20)}</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Dinero disponible</div>
        <div class="saldo-grande ${saldoClass}">${this.fmt(r.saldoDisponible)}</div>
        <div class="text-muted mt-8"></div>
      </div>
      <div class="grid-2" style="margin:0 16px;">
        <div class="stat"><div class="label">Ganancias remesas</div><div class="value amount-pos">${this.fmt(r.gananciasRemesas)}</div></div>
        <div class="stat"><div class="label">Gastos</div><div class="value amount-neg">${this.fmt(r.totalGastos)}</div></div>
        <div class="stat"><div class="label">Ingresos</div><div class="value amount-pos">${this.fmt(r.totalIngresos)}</div></div>
        <div class="stat"><div class="label">Ahorros (metas)</div><div class="value">${this.fmt(r.ahorrosMetas)}</div></div>
      </div>
      <div class="section-title">Acciones rápidas</div>
      <div class="quick-actions">
        <div class="quick-btn" data-nav="nuevaRemesa"><div class="qi">${Icons.get('package')}</div><span class="label">Remesa</span></div>
        <div class="quick-btn" data-action="nuevoIngreso"><div class="qi">${Icons.get('arrowDown')}</div><span class="label">Ingreso</span></div>
        <div class="quick-btn" data-action="nuevoGasto"><div class="qi">${Icons.get('arrowUp')}</div><span class="label">Gasto</span></div>
        <div class="quick-btn" data-action="nuevoRetiro"><div class="qi">${Icons.get('card')}</div><span class="label">Retiro</span></div>
      </div>
      <div class="section-title">Últimos movimientos</div>
      <div class="card">
        ${movs.length === 0 ? `<div class="empty"><div class="ei">${Icons.get('wallet', 40)}</div>Sin movimientos aún</div>` :
          movs.map(m => `
            <div class="list-item">
              <div class="left"><div class="title">${m.tipo}</div><div class="meta">${m.fecha} · ${m.descripcion}</div></div>
              <div class="amount ${m.cantidad >= 0 ? 'amount-pos' : 'amount-neg'}">${m.cantidad >= 0 ? '+' : ''}${this.fmt(m.cantidad)}</div>
            </div>`).join('')}
      </div>`;
  },

  // ========== FINANZAS ==========
  renderFinanzas() {
    const tab = this.params.tab || 'ingresos';
    return `
      <div class="header"><h1>Finanzas</h1><div class="subtitle">Control de movimientos</div></div>
      <div class="tabs">
        <div class="tab ${tab==='ingresos'?'active':''}" data-tab="ingresos">Ingresos</div>
        <div class="tab ${tab==='gastos'?'active':''}" data-tab="gastos">Gastos</div>
        <div class="tab ${tab==='retiros'?'active':''}" data-tab="retiros">Retiros</div>
      </div>
      <div id="finanzas-content">${this.renderFinanzasTab(tab)}</div>`;
  },

  renderFinanzasTab(tab) {
    if (tab === 'ingresos') {
      const lista = OperacionesDB.obtenerIngresos();
      return `<div style="padding:12px 16px;"><button class="btn btn-primary" data-action="nuevoIngreso">${Icons.get('plus')} Nuevo ingreso</button></div>
        <div class="card">${lista.length === 0 ? '<div class="empty">Sin ingresos</div>' : lista.map(i => `
          <div class="list-item"><div class="left"><div class="title">${i.tipo}</div><div class="meta">${i.fecha}${i.nota?' · '+i.nota:''}</div></div>
          <div class="amount amount-pos">+${this.fmt(i.cantidad)}</div></div>`).join('')}</div>`;
    }
    if (tab === 'gastos') {
      const lista = OperacionesDB.obtenerGastos();
      return `<div style="padding:12px 16px;"><button class="btn btn-primary" data-action="nuevoGasto">${Icons.get('plus')} Nuevo gasto</button></div>
        <div class="card">${lista.length === 0 ? '<div class="empty">Sin gastos</div>' : lista.map(g => `
          <div class="list-item"><div class="left"><div class="title">${g.categoria}</div><div class="meta">${g.fecha}${g.nota?' · '+g.nota:''}</div></div>
          <div class="amount amount-neg">-${this.fmt(g.cantidad)}</div></div>`).join('')}</div>`;
    }
    const lista = OperacionesDB.obtenerRetiros();
    return `<div style="padding:12px 16px;"><button class="btn btn-primary" data-action="nuevoRetiro">${Icons.get('plus')} Nuevo retiro</button>
      <p class="text-muted mt-8" style="font-size:0.8rem;">Se permite saldo negativo.</p></div>
      <div class="card">${lista.length === 0 ? '<div class="empty">Sin retiros</div>' : lista.map(r => `
        <div class="list-item"><div class="left"><div class="title">${r.motivo||'Retiro'}</div><div class="meta">${r.fecha}</div></div>
        <div class="amount amount-neg">-${this.fmt(r.cantidad)}</div></div>`).join('')}</div>`;
  },

  // ========== NUEVA REMESA ==========
  renderNuevaRemesa() {
    const metodos = ['Zelle','PayPal USD','PayPal EUR','Cash App','Bizum','IBAN','PostePay','Western Union','MoneyGram','USDT'];
    const tipos = ['Pago inmediato','Entrega programada','Domicilio','Trato presencial'];
    return `
      <div class="header"><h1>Nueva remesa</h1><div class="subtitle">Registrar operación</div></div>
      <div class="card">
        <div class="form-group"><label>Fecha</label><input type="date" id="rem-fecha" value="${new Date().toISOString().split('T')[0]}" /></div>
        <div class="form-group"><label>País de origen</label><input type="text" id="rem-pais" placeholder="Ej: España, USA..." /></div>
        <div class="form-group"><label>Método de envío</label><select id="rem-metodo">${metodos.map(m=>`<option>${m}</option>`).join('')}</select></div>
        <div class="form-group"><label>Moneda enviada</label><select id="rem-moneda"><option>USD</option><option>EUR</option><option>CUP</option></select></div>
        <div class="form-group"><label>Cantidad enviada</label><input type="number" id="rem-cantidad" min="0" step="0.01" /></div>
        <div class="form-group"><label>Tasa utilizada</label><input type="number" id="rem-tasa" min="0" step="0.01" /></div>
        <div class="form-group"><label>Cantidad entregada</label><input type="number" id="rem-entregada" min="0" step="0.01" /></div>
        <div class="form-group"><label>Tipo de entrega</label><select id="rem-tipo">${tipos.map(t=>`<option>${t}</option>`).join('')}</select></div>
        <div class="form-group"><label>Nota</label><textarea id="rem-nota" rows="2"></textarea></div>
        <div id="rem-ganancia-preview" class="text-muted mb-8" style="font-size:0.85rem;"></div>
        <button class="btn btn-primary" id="btn-guardar-remesa">Guardar remesa</button>
      </div>`;
  },

  // ========== METAS ==========
  renderMetas() {
    const metas = OperacionesDB.obtenerMetas();
    return `
      <div class="header"><h1>Metas</h1><div class="subtitle">Objetivos de ahorro</div></div>
      <div style="padding:12px 16px;"><button class="btn btn-primary" data-action="nuevaMeta">${Icons.get('plus')} Nueva meta</button></div>
      ${metas.length === 0 ? `<div class="card"><div class="empty"><div class="ei">${Icons.get('target',40)}</div>Crea tu primera meta</div></div>` :
        metas.map(m => `
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div><strong>${m.icono||'🎯'} ${m.nombre}</strong></div>
              <span class="badge badge-info">${m.porcentajeCompletado}%</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${m.porcentajeCompletado}%"></div></div>
            <div class="mt-8" style="display:flex;justify-content:space-between;font-size:0.85rem;">
              <span>${this.fmt(m.cantidadAcumulada)}</span><span class="text-muted">de ${this.fmt(m.cantidadObjetivo)}</span>
            </div>
            <div class="btn-row">
              <button class="btn btn-secondary btn-sm" data-action="agregarMeta" data-id="${m.id}">+ Agregar</button>
              <button class="btn btn-outline btn-sm" data-action="retirarMeta" data-id="${m.id}">− Retirar</button>
              <button class="btn btn-danger btn-sm" data-action="eliminarMeta" data-id="${m.id}">Eliminar</button>
            </div>
          </div>`).join('')}`;
  },

  // ========== HISTORIAL ==========
  renderHistorial() {
    const movs = OperacionesDB.obtenerUltimosMovimientos(50);
    return `
      <div class="header"><h1>Historial</h1><div class="subtitle">Todos los movimientos</div></div>
      <div class="card">${movs.length === 0 ? '<div class="empty">Sin movimientos</div>' :
        movs.map(m => `
          <div class="list-item">
            <div class="left"><div class="title">${m.tipo}</div><div class="meta">${m.fecha} · ${m.descripcion}</div></div>
            <div class="amount ${m.cantidad>=0?'amount-pos':'amount-neg'}">${m.cantidad>=0?'+':''}${this.fmt(m.cantidad)}</div>
          </div>`).join('')}</div>`;
  },

  // ========== CONFIGURACION ==========
  renderConfiguracion() {
    const config = ConfiguracionDB.obtener();
    const pct = config.porcentajesAhorro;
    const tema = Tema.obtener();
    const modos = [
      { id: 'system', label: 'Sistema', icon: 'settings' },
      { id: 'light', label: 'Claro', icon: 'sun' },
      { id: 'dark', label: 'Oscuro', icon: 'moon' }
    ];
    return `
      <div class="header"><h1>Configuración</h1><div class="subtitle">Ajustes y apariencia</div></div>

      <div class="card">
        <div class="card-title">Apariencia</div>
        <label style="font-size:0.8rem;font-weight:600;color:var(--text-muted);">Modo</label>
        <div class="theme-modes mt-8">
          ${modos.map(m => `
            <button type="button" class="theme-mode-btn ${tema.modo===m.id?'active':''}" data-tema-modo="${m.id}">
              ${Icons.get(m.icon, 22)} ${m.label}
            </button>`).join('')}
        </div>
        <label style="font-size:0.8rem;font-weight:600;color:var(--text-muted);margin-top:16px;display:block;">Color de acento</label>
        <div class="accent-grid">
          ${Object.entries(Tema.ACENTOS).map(([k,v]) => `
            <button type="button" class="accent-swatch ${tema.acento===k?'active':''}" data-acento="${k}"
              style="background:${v.value}" title="${v.name}"></button>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-title">Negocio</div>
        <div class="form-group"><label>Nombre del negocio</label><input type="text" id="cfg-nombre" value="${config.nombreNegocio}" /></div>
        <div class="form-group"><label>Moneda principal</label>
          <select id="cfg-moneda">${config.monedasSoportadas.map(m=>`<option value="${m}" ${m===config.monedaPrincipal?'selected':''}>${m}</option>`).join('')}</select>
        </div>
        <button class="btn btn-primary" id="btn-guardar-cfg">Guardar configuración</button>
      </div>

      <div class="card">
        <div class="card-title">Porcentajes de distribución</div>
        ${Object.entries(pct).map(([k,v]) => `
          <div class="form-group"><label>${k} (%)</label>
          <input type="number" class="pct-input" data-key="${k}" value="${v}" min="0" max="100" /></div>`).join('')}
        <button class="btn btn-secondary" id="btn-guardar-pct">Actualizar porcentajes</button>
      </div>

      <div class="card">
        <div class="card-title">Respaldo</div>
        <button class="btn btn-secondary" id="btn-backup">${Icons.get('backup')} Descargar copia de seguridad</button>
        <div class="form-group mt-12"><label>Restaurar desde archivo</label><input type="file" id="file-restore" accept=".json" /></div>
      </div>

      <div class="card">
        <div class="card-title">Acerca de</div>
        <p class="text-muted" style="font-size:0.85rem;line-height:1.5;">
          <strong>FAURE Finanzas</strong><br>
          Director y Productor: Jorge FAURE<br>
          Desarrollo: Oscar Antonio Alvarez Collado<br>
          Versión 1.4 · Solo contabilidad simulada · 100% offline
        </p>
      </div>`;
  },

  // ========== REPORTES ==========
  renderReportes() {
    const d = ReportesDiarios.generar();
    const m = ReportesMensuales.generar();
    return `
      <div class="header"><h1>Reportes</h1><div class="subtitle">Resúmenes</div></div>
      <div class="card"><div class="card-title">Hoy (${d.fecha})</div>
        <div class="grid-2">
          <div class="stat"><div class="label">Ingresos</div><div class="value amount-pos">${this.fmt(d.ingresos.total)}</div></div>
          <div class="stat"><div class="label">Gastos</div><div class="value amount-neg">${this.fmt(d.gastos.total)}</div></div>
          <div class="stat"><div class="label">Remesas</div><div class="value">${this.fmt(d.remesas.ganancias)}</div></div>
          <div class="stat"><div class="label">Balance</div><div class="value">${this.fmt(d.balanceDia)}</div></div>
        </div>
      </div>
      <div class="card"><div class="card-title">${m.nombreMes} ${m.anio}</div>
        <div class="grid-2">
          <div class="stat"><div class="label">Ingresos</div><div class="value amount-pos">${this.fmt(m.ingresos.total)}</div></div>
          <div class="stat"><div class="label">Gastos</div><div class="value amount-neg">${this.fmt(m.gastos.total)}</div></div>
          <div class="stat"><div class="label">Remesas</div><div class="value">${this.fmt(m.remesas.ganancias)}</div></div>
          <div class="stat"><div class="label">Balance</div><div class="value">${this.fmt(m.balance)}</div></div>
        </div>
      </div>
      <div style="padding:12px 16px;"><button class="btn btn-secondary" data-nav="home">← Volver</button></div>`;
  },

  renderBottomNav(active) {
    const items = [
      { id: 'home', icon: 'home', label: 'Inicio' },
      { id: 'finanzas', icon: 'wallet', label: 'Finanzas' },
      { id: 'nuevaRemesa', icon: 'package', label: 'Remesa' },
      { id: 'metas', icon: 'target', label: 'Metas' },
      { id: 'configuracion', icon: 'settings', label: 'Ajustes' }
    ];
    return `<div class="bottom-nav">${items.map(i => `
      <div class="nav-item ${active===i.id?'active':''}" data-nav="${i.id}">
        ${Icons.get(i.icon, 22)}<span>${i.label}</span>
      </div>`).join('')}</div>`;
  },

  // ========== EVENTS ==========
  bindEvents() {
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.onclick = () => this.navigate(el.dataset.nav);
    });

    document.querySelectorAll('[data-tema-modo]').forEach(btn => {
      btn.onclick = () => { Tema.guardar({ modo: btn.dataset.temaModo }); this.navigate('configuracion'); };
    });
    document.querySelectorAll('[data-acento]').forEach(btn => {
      btn.onclick = () => { Tema.guardar({ acento: btn.dataset.acento }); this.navigate('configuracion'); };
    });

    document.querySelectorAll('.tab[data-tab]').forEach(tab => {
      tab.onclick = () => this.navigate('finanzas', { tab: tab.dataset.tab });
    });

    document.querySelectorAll('[data-action]').forEach(el => {
      el.onclick = () => this.handleAction(el.dataset.action, el.dataset.id);
    });

    const btnRem = document.getElementById('btn-guardar-remesa');
    if (btnRem) {
      const updatePreview = () => {
        const cant = Number(document.getElementById('rem-cantidad')?.value) || 0;
        const tasa = Number(document.getElementById('rem-tasa')?.value) || 0;
        const ent = Number(document.getElementById('rem-entregada')?.value) || 0;
        const gan = CalculadoraFinanciera.calcularGananciaRemesa(cant, tasa, ent);
        const prev = document.getElementById('rem-ganancia-preview');
        if (prev) prev.textContent = `Ganancia estimada: ${this.fmt(gan)}`;
      };
      ['rem-cantidad','rem-tasa','rem-entregada'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updatePreview);
      });
      btnRem.onclick = () => {
        const remesa = new Remesa({
          fecha: document.getElementById('rem-fecha').value,
          paisOrigen: document.getElementById('rem-pais').value.trim() || 'Desconocido',
          metodoEnvio: document.getElementById('rem-metodo').value,
          monedaEnviada: document.getElementById('rem-moneda').value,
          cantidadEnviada: document.getElementById('rem-cantidad').value,
          tasaUtilizada: document.getElementById('rem-tasa').value,
          cantidadEntregada: document.getElementById('rem-entregada').value,
          tipoEntrega: document.getElementById('rem-tipo').value,
          nota: document.getElementById('rem-nota').value,
          estado: 'Completada'
        });
        remesa.calcularGanancia();
        OperacionesDB.crearRemesa(remesa);
        Notificaciones.avisarNuevaRemesa(remesa);
        this.toast('Remesa guardada · Ganancia: ' + this.fmt(remesa.ganancia));
        this.navigate('home');
      };
    }

    document.getElementById('btn-guardar-cfg')?.addEventListener('click', () => {
      ConfiguracionDB.guardar({
        nombreNegocio: document.getElementById('cfg-nombre').value,
        monedaPrincipal: document.getElementById('cfg-moneda').value
      });
      this.toast('Configuración guardada');
    });

    document.getElementById('btn-guardar-pct')?.addEventListener('click', () => {
      const nuevos = {};
      document.querySelectorAll('.pct-input').forEach(inp => { nuevos[inp.dataset.key] = Number(inp.value) || 0; });
      const res = PorcentajesAhorro.actualizar(nuevos);
      this.toast(res.ok ? 'Porcentajes actualizados' : res.mensaje);
    });

    document.getElementById('btn-backup')?.addEventListener('click', () => {
      Respaldo.descargarCopia();
      this.toast('Copia descargada');
    });

    document.getElementById('file-restore')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        await Respaldo.restaurarDesdeArchivo(file);
        this.toast('Datos restaurados');
        this.navigate('home');
      } catch (err) { this.toast('Error: ' + err.message); }
    });
  },

  handleAction(action, id) {
    if (action === 'nuevoIngreso') {
      this.showModal('Nuevo ingreso', `
        <div class="form-group"><label>Cantidad</label><input type="number" id="m-cant" min="0" step="0.01" /></div>
        <div class="form-group"><label>Tipo</label><select id="m-tipo"><option>General</option><option>Remesa</option><option>Otro</option></select></div>
        <div class="form-group"><label>Nota</label><input type="text" id="m-nota" /></div>
        <button class="btn btn-primary" id="m-ok">Guardar</button>`);
      document.getElementById('m-ok').onclick = () => {
        OperacionesDB.crearIngreso(new Ingreso({
          cantidad: document.getElementById('m-cant').value,
          tipo: document.getElementById('m-tipo').value,
          nota: document.getElementById('m-nota').value
        }));
        document.querySelector('.modal-overlay')?.remove();
        this.toast('Ingreso registrado');
        this.navigate(this.currentScreen === 'finanzas' ? 'finanzas' : 'home', this.params);
      };
    }
    if (action === 'nuevoGasto') {
      this.showModal('Nuevo gasto', `
        <div class="form-group"><label>Cantidad</label><input type="number" id="m-cant" min="0" step="0.01" /></div>
        <div class="form-group"><label>Categoría</label>
          <select id="m-cat"><option>General</option><option>Negocio</option><option>Personal</option><option>Transporte</option><option>Comida</option></select></div>
        <div class="form-group"><label>Nota</label><input type="text" id="m-nota" /></div>
        <button class="btn btn-primary" id="m-ok">Guardar</button>`);
      document.getElementById('m-ok').onclick = () => {
        OperacionesDB.crearGasto(new Gasto({
          cantidad: document.getElementById('m-cant').value,
          categoria: document.getElementById('m-cat').value,
          nota: document.getElementById('m-nota').value
        }));
        document.querySelector('.modal-overlay')?.remove();
        this.toast('Gasto registrado');
        this.navigate(this.currentScreen === 'finanzas' ? 'finanzas' : 'home', this.params);
      };
    }
    if (action === 'nuevoRetiro') {
      this.showModal('Nuevo retiro', `
        <p class="text-muted mb-8">Se permite saldo negativo.</p>
        <div class="form-group"><label>Cantidad</label><input type="number" id="m-cant" min="0" step="0.01" /></div>
        <div class="form-group"><label>Motivo</label><input type="text" id="m-motivo" /></div>
        <button class="btn btn-primary" id="m-ok">Registrar</button>`);
      document.getElementById('m-ok').onclick = () => {
        OperacionesDB.crearRetiro(new Retiro({
          cantidad: document.getElementById('m-cant').value,
          motivo: document.getElementById('m-motivo').value
        }));
        Notificaciones.avisarSaldoBajo(OperacionesDB.obtenerSaldo());
        document.querySelector('.modal-overlay')?.remove();
        this.toast('Retiro registrado');
        this.navigate(this.currentScreen === 'finanzas' ? 'finanzas' : 'home', this.params);
      };
    }
    if (action === 'nuevaMeta') {
      this.showModal('Nueva meta', `
        <div class="form-group"><label>Nombre</label><input type="text" id="m-nombre" placeholder="Ej: Moto" /></div>
        <div class="form-group"><label>Icono (emoji)</label><input type="text" id="m-icono" value="🎯" maxlength="2" /></div>
        <div class="form-group"><label>Cantidad objetivo</label><input type="number" id="m-obj" min="0" step="0.01" /></div>
        <button class="btn btn-primary" id="m-ok">Crear</button>`);
      document.getElementById('m-ok').onclick = () => {
        OperacionesDB.crearMeta(new Meta({
          nombre: document.getElementById('m-nombre').value || 'Meta',
          icono: document.getElementById('m-icono').value || '🎯',
          cantidadObjetivo: document.getElementById('m-obj').value
        }));
        document.querySelector('.modal-overlay')?.remove();
        this.toast('Meta creada'); this.navigate('metas');
      };
    }
    if (action === 'agregarMeta' || action === 'retirarMeta') {
      const esAdd = action === 'agregarMeta';
      this.showModal(esAdd ? 'Agregar a meta' : 'Retirar de meta', `
        <div class="form-group"><label>Cantidad</label><input type="number" id="m-cant" min="0" step="0.01" /></div>
        <button class="btn btn-primary" id="m-ok">${esAdd ? 'Agregar' : 'Retirar'}</button>`);
      document.getElementById('m-ok').onclick = () => {
        const monto = Number(document.getElementById('m-cant').value) || 0;
        const meta = OperacionesDB.obtenerMetas().find(m => m.id === id);
        if (meta) {
          if (esAdd) meta.agregarDinero(monto); else meta.retirarDinero(monto);
          OperacionesDB.actualizarMeta(id, meta);
          if (meta.porcentajeCompletado >= 100) Notificaciones.avisarMetaCompletada(meta);
        }
        document.querySelector('.modal-overlay')?.remove();
        this.toast(esAdd ? 'Dinero agregado' : 'Dinero retirado');
        this.navigate('metas');
      };
    }
    if (action === 'eliminarMeta') {
      if (confirm('¿Eliminar esta meta?')) {
        OperacionesDB.eliminarMeta(id);
        this.toast('Meta eliminada'); this.navigate('metas');
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
