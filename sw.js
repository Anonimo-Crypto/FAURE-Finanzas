const CACHE = 'faure-finanzas-v4';
const ASSETS = [
  './', './index.html', './app.css', './app.js', './manifest.json',
  './icons/icon.svg', './icons/icons.js', './icons/192.png', './icons/512.png',
  './app/models/Remesa.js', './app/models/Ingreso.js', './app/models/Gasto.js',
  './app/models/Retiro.js', './app/models/Meta.js',
  './app/database/BaseDatos.js', './app/database/OperacionesDB.js', './app/database/ConfiguracionDB.js',
  './app/services/CalculadoraFinanciera.js', './app/services/Respaldo.js', './app/services/Notificaciones.js',
  './app/reports/ReportesDiarios.js', './app/reports/ReportesMensuales.js', './app/reports/ReportesAnuales.js',
  './app/settings/PorcentajesAhorro.js', './app/settings/Monedas.js',
  './app/settings/ConfiguracionNegocio.js', './app/settings/Tema.js'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
