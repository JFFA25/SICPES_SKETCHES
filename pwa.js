/* Datos de ejemplo (equivalentes al prototipo móvil) para la versión PWA de escritorio. */
const PWA_MOCK = {
  student: { name: 'Luis Humberto', email: 'luis.humberto@email.com', room: '204', floor: 'Segundo piso', type: 'Individual', amount: 2500, due: '01/12/2025', notices: ['Tu comprobante de pago está en revisión.', 'El acceso principal tendrá mantenimiento el sábado.'] },
  reservations: [
    { name: 'Elena Pérez', type: 'Compartida', room: '105-A', amount: 1800, status: 'Pendiente' },
    { name: 'Edgar Cabrera', type: 'Individual', room: '302', amount: 2500, status: 'Aceptada' },
    { name: 'Luis Humberto', type: 'Individual', room: '204', amount: 2500, status: 'Pendiente' },
    { name: 'Mariana Torres', type: 'Compartida', room: '101-B', amount: 1800, status: 'Rechazada' }
  ],
  payments: [
    { name: 'Elena Pérez', room: '105-A', amount: 1800, date: '01/11/2025', status: 'Pendiente' },
    { name: 'Luis Humberto', room: '204', amount: 2500, date: '01/11/2025', status: 'Pendiente' },
    { name: 'Edgar Cabrera', room: '302', amount: 2500, date: '01/11/2025', status: 'En revisión' }
  ],
  floors: [{ name: 'Planta baja', rooms: ['PB-01', 'PB-02', 'PB-03'] }, { name: 'Primer piso', rooms: ['101', '102', '103', '105-A'] }, { name: 'Segundo piso', rooms: ['201', '202', '204'] }],
  prices: { Individual: 2500, Compartida: 1800 }
};

/* Catálogo de pantallas, códigos, roles y rutas visibles en la barra de direcciones. */
const PWA_SCREENS = {
  landing: { role: 'student', title: 'Landing', label: 'LANDING', route: '/' },
  studentLogin: { role: 'student', title: 'Iniciar sesión', label: 'INICIAR SESIÓN', route: '/login' },
  register: { role: 'student', title: 'Crear cuenta', label: 'CREAR CUENTA', route: '/registro' },
  loading: { role: 'shared', title: 'Sincronizando', label: 'SINCRONIZANDO', route: '/cargando' },
  home: { role: 'student', title: 'Inicio', label: 'INICIO', route: '/panel' },
  reserve: { role: 'student', title: 'Reservar habitación', label: 'RESERVAR HABITACIÓN', route: '/reservar' },
  payments: { role: 'student', title: 'Gestión de Pagos', label: 'GESTIÓN DE PAGOS', route: '/pagos' },
  profile: { role: 'student', title: 'Cuenta / Perfil', label: 'CUENTA / PERFIL', route: '/cuenta' },
  adminLogin: { role: 'admin', title: 'Acceso administrador', label: 'LOGIN ADMIN', route: '/admin' },
  reservations: { role: 'admin', title: 'Reservaciones', label: 'RESERVACIONES', route: '/admin/reservaciones' },
  pendingPayments: { role: 'admin', title: 'Pagos pendientes', label: 'PAGOS PENDIENTES', route: '/admin/pagos' },
  floors: { role: 'admin', title: 'Pisos', label: 'PISOS', route: '/admin/pisos' },
  settings: { role: 'admin', title: 'Configuración global', label: 'CONFIGURACIÓN', route: '/admin/configuracion' }
};
const PWA_CODES = { landing:'E1', studentLogin:'E2', register:'E3', loading:'E4', home:'E5', reserve:'E6', payments:'E7', profile:'E8', adminLogin:'A1', reservations:'A2', pendingPayments:'A3', floors:'A4', settings:'A5' };
const PWA_STUDENT = ['landing','studentLogin','register','loading','home','reserve','payments','profile'];
const PWA_ADMIN = ['adminLogin','reservations','pendingPayments','floors','settings'];
const PWA_ROOTS = new Set(['home','reserve','payments','profile','reservations','pendingPayments','floors','settings']);
/* Acciones disponibles por pantalla: [destino, texto visible]. */
const PWA_ACTIONS = {
  landing:[['studentLogin','Iniciar sesión'],['reserve','Explorar habitaciones']],
  studentLogin:[['loading','Entrar al panel'],['register','Crear una cuenta nueva']],
  register:[['loading','Registrarse']],
  loading:[['home','Terminar carga (estudiante)'],['reservations','Terminar carga (administrador)']],
  home:[['reserve','Barra lateral: Reservar'],['payments','Barra lateral: Pagos'],['profile','Barra lateral: Cuenta']],
  reserve:[['home','Confirmar reservación'],['payments','Barra lateral: Pagos'],['profile','Barra lateral: Cuenta']],
  payments:[['home','Barra lateral: Inicio'],['reserve','Barra lateral: Reservar'],['profile','Barra lateral: Cuenta']],
  profile:[['studentLogin','Cerrar sesión'],['home','Barra lateral: Inicio']],
  adminLogin:[['loading','Entrar al panel administrativo']],
  reservations:[['pendingPayments','Panel superior: Pagos'],['floors','Panel superior: Pisos'],['settings','Panel superior: Configuración']],
  pendingPayments:[['reservations','Panel superior: Reservaciones'],['floors','Panel superior: Pisos'],['settings','Panel superior: Configuración']],
  floors:[['reservations','Panel superior: Reservaciones'],['pendingPayments','Panel superior: Pagos'],['settings','Panel superior: Configuración']],
  settings:[['reservations','Panel superior: Reservaciones'],['pendingPayments','Panel superior: Pagos'],['floors','Panel superior: Pisos']]
};

const pwaState = { screen: 'landing', role: 'student', history: [], type: 'Individual', filter: 'Todas', paymentFilter: 'Todos', zones: false, loadingTimer: null, toastTimer: null, mapScrollY: 0 };

const pwaScreenEl = document.querySelector('#pwaScreen');
const pwaToastEl = document.querySelector('#pwaToast');

function pwaMoney(value) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value); }
function pwaEsc(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function pwaToast(message) { pwaToastEl.textContent = message; pwaToastEl.classList.add('show'); clearTimeout(pwaState.toastTimer); pwaState.toastTimer = setTimeout(() => pwaToastEl.classList.remove('show'), 2400); }

function pwaGo(screen, options = {}) {
  if (!PWA_SCREENS[screen]) return;
  if (pwaState.screen !== screen && !options.replace) pwaState.history.push(pwaState.screen);
  pwaState.screen = screen;
  if (screen === 'landing' || screen === 'studentLogin' || screen === 'register') pwaState.role = 'student';
  if (screen === 'adminLogin') pwaState.role = 'admin';
  pwaRender();
}
function pwaBack() { const previous = pwaState.history.pop(); if (previous) { pwaState.screen = previous; pwaRender(); } else pwaToast('No hay una pantalla anterior.'); }
function pwaSetRole(role) { pwaState.role = role; pwaState.history = []; pwaGo(role === 'student' ? 'landing' : 'adminLogin', { replace: true }); }

/* --- Piezas compartidas de la interfaz web --- */
function pwaField(label, placeholder, type = 'text', value = '') {
  return `<label class="pwa-field"><span>${label}</span><input type="${type}" placeholder="${placeholder}" value="${pwaEsc(value)}"></label>`;
}
function pwaTopnav(role) {
  const links = role === 'student'
    ? [['home','Inicio'],['reserve','Reservar'],['payments','Pagos'],['profile','Cuenta']]
    : [['reservations','Reservaciones'],['pendingPayments','Pagos pendientes'],['floors','Pisos'],['settings','Configuración']];
  return `<header class="pwa-app-top"><span class="pwa-app-logo">SICPES <span>/ RESIDENCIAL</span></span><nav class="pwa-app-links">${links.map(([id,label]) => `<button class="pwa-app-link" data-pwa-go="${id}">${label}</button>`).join('')}</nav><div class="pwa-app-user"><span class="pwa-avatar"></span>${role === 'student' ? pwaEsc(PWA_MOCK.student.name) : 'Admin SICPES'}</div></header>`;
}
function pwaSidebar(role, active) {
  const items = role === 'student'
    ? [['home','⌂','Inicio'],['reserve','＋','Reservar'],['payments','$','Pagos'],['profile','◎','Cuenta']]
    : [['reservations','▤','Reservaciones'],['pendingPayments','$','Pagos'],['floors','▥','Pisos'],['settings','⚙','Configuración']];
  return `<aside class="pwa-app-side"><span class="pwa-side-label">${role === 'student' ? 'RESIDENTE' : 'ADMINISTRACIÓN'}</span>${items.map(([id,icon,label]) => `<button class="pwa-side-item ${active===id?'active':''}" data-pwa-go="${id}"><span class="pwa-side-icon">${icon}</span>${label}</button>`).join('')}</aside>`;
}
function pwaShell(role, active, content) {
  return `${pwaTopnav(role)}<div class="pwa-app-body">${pwaSidebar(role,active)}<div class="pwa-app-main">${content}</div></div>`;
}
function pwaAuthShell(content) {
  return `<div class="pwa-auth">${content}</div>`;
}
function pwaTable(headers, rows) {
  return `<div class="pwa-table"><div class="pwa-tr pwa-thead">${headers.map(h => `<span>${h}</span>`).join('')}</div>${rows.map(cells => `<div class="pwa-tr">${cells.map(c => `<span>${c}</span>`).join('')}</div>`).join('')}</div>`;
}
function pwaStatus(status) {
  const cls = status === 'Aceptada' ? 'ok' : status === 'Rechazada' ? 'no' : status === 'En revisión' ? 'rev' : 'pend';
  return `<span class="pwa-status pwa-${cls}">${pwaEsc(status.toUpperCase())}</span>`;
}

/* --- Pantallas · Rol estudiante --- */
function pwaLanding() {
  return `${pwaTopnav('student')}<div class="pwa-landing"><div class="pwa-landing-copy"><span class="pwa-eyebrow">VIVIENDA UNIVERSITARIA · 2025</span><h1 class="pwa-display">Encuentra tu espacio ideal para vivir y estudiar</h1><p class="pwa-lead">Una residencia segura, cómoda y cerca de tu campus. Gestiona reservaciones y pagos desde un solo panel web.</p><div class="pwa-cta-row"><button class="pwa-button pwa-primary" data-pwa-go="reserve">Explorar habitaciones →</button><button class="pwa-button pwa-secondary" data-pwa-go="studentLogin">Iniciar sesión</button></div><div class="pwa-feature-row"><article class="pwa-feature"><strong>Residencias verificadas</strong><small>ESPACIOS SEGUROS</small></article><article class="pwa-feature"><strong>Gestión centralizada</strong><small>TODO EN UN LUGAR</small></article><article class="pwa-feature"><strong>Pagos en línea</strong><small>SIN TRÁMITES</small></article></div></div><div class="pwa-landing-art"><div class="pwa-image-placeholder">[ IMAGEN PRINCIPAL ]</div><div class="pwa-art-note">Vista previa del panel de residente</div></div></div>`;
}
function pwaStudentLogin() {
  return pwaAuthShell(`<div class="pwa-auth-art"><span class="pwa-eyebrow">PORTAL DEL RESIDENTE</span><h2 class="pwa-auth-title">Gestiona tu residencia desde el navegador</h2><p class="pwa-lead">Consulta tu habitación, tus pagos y avisos en un panel pensado para escritorio.</p><div class="pwa-image-placeholder pwa-tall">[ IMAGEN ]</div></div><div class="pwa-auth-card"><span class="pwa-eyebrow">INICIAR SESIÓN</span><h2 class="pwa-card-title">Qué gusto verte de nuevo.</h2>${pwaField('CORREO ELECTRÓNICO','nombre@correo.com','email')}${pwaField('CONTRASEÑA','••••••••','password')}<button class="pwa-button pwa-primary pwa-block" data-pwa-action="student-login">Entrar</button><div class="pwa-divider">O CONTINÚA CON</div><div class="pwa-social"><button data-pwa-action="social">Google</button><button data-pwa-action="social">Facebook</button><button data-pwa-action="social">LinkedIn</button></div><p class="pwa-inline-link">¿No tienes cuenta? <button data-pwa-go="register">Regístrate</button></p></div>`);
}
function pwaRegister() {
  return pwaAuthShell(`<div class="pwa-auth-art"><span class="pwa-eyebrow">NUEVO RESIDENTE</span><h2 class="pwa-auth-title">Crea tu cuenta en minutos</h2><p class="pwa-lead">Registra tus datos una sola vez y administra tu estancia desde la web.</p><ul class="pwa-checklist"><li>Reserva tu habitación</li><li>Sube comprobantes de pago</li><li>Recibe avisos del residencial</li></ul></div><div class="pwa-auth-card"><span class="pwa-eyebrow">CREAR CUENTA</span><h2 class="pwa-card-title">Datos del residente</h2><div class="pwa-form-grid">${pwaField('NOMBRE COMPLETO','Nombre y apellidos')}${pwaField('CORREO ELECTRÓNICO','nombre@correo.com','email')}${pwaField('CONTRASEÑA','Mínimo 8 caracteres','password')}${pwaField('CONFIRMAR CONTRASEÑA','Repite tu contraseña','password')}</div><label class="pwa-checkline"><input type="checkbox"> Acepto los términos y condiciones y el aviso de privacidad.</label><button class="pwa-button pwa-primary pwa-block" data-pwa-action="register">Registrarse</button><p class="pwa-inline-link">¿Ya tienes cuenta? <button data-pwa-go="studentLogin">Iniciar sesión</button></p></div>`);
}
function pwaLoading() {
  return `<div class="pwa-loading"><div class="pwa-image-placeholder pwa-logo-box">SICPES</div><h2 class="pwa-card-title">Preparando tu espacio</h2><p class="pwa-lead">Sincronizando registros residenciales…</p><div class="pwa-progress"><div class="pwa-progress-fill" id="pwaProgressFill"></div></div><div class="pwa-progress-caption"><span id="pwaProgressText">Conectando con SICPES</span><span id="pwaProgressPercent">0%</span></div></div>`;
}
function pwaHome() {
  const s = PWA_MOCK.student;
  const content = `<div class="pwa-page-head"><div><span class="pwa-eyebrow">PANEL DEL RESIDENTE</span><h2 class="pwa-page-title">Bienvenido, ${pwaEsc(s.name)}</h2><p class="pwa-lead">Resumen de tu residencia y próximos movimientos.</p></div></div><div class="pwa-stat-grid">${[['Habitación', s.room],['Piso', s.floor],['Tipo', s.type],['Próximo pago', pwaMoney(900)]].map(([l,v]) => `<div class="pwa-stat"><small>${l}</small><strong>${v}</strong></div>`).join('')}</div><div class="pwa-dash-grid"><article class="pwa-card"><div class="pwa-card-head"><span class="pwa-card-title">Tu reservación</span>${pwaStatus('Aceptada')}</div><div class="pwa-data-grid"><div class="pwa-data-cell"><small>Residencia</small><strong>SICPES</strong></div><div class="pwa-data-cell"><small>Ingreso</small><strong>01/09/2025</strong></div></div><button class="pwa-button pwa-secondary pwa-block" data-pwa-go="reserve">Ver detalle</button></article><article class="pwa-card"><div class="pwa-card-head"><span class="pwa-card-title">${pwaMoney(900)}</span>${pwaStatus('Pendiente')}</div><p class="pwa-muted">Vence el ${s.due} · Cuota de mantenimiento</p><button class="pwa-button pwa-primary pwa-block" data-pwa-go="payments">Ir a pagos</button></article></div><article class="pwa-card"><h3 class="pwa-card-title">Avisos</h3>${s.notices.map(n => `<div class="pwa-notice" data-pwa-go="payments">${pwaEsc(n)}</div>`).join('')}</article>`;
  return pwaShell('student','home',content);
}
function pwaReserve() {
  const type = pwaState.type, amount = PWA_MOCK.prices[type];
  const content = `<div class="pwa-page-head"><div><span class="pwa-eyebrow">REGISTRO DE ESTUDIANTES</span><h2 class="pwa-page-title">Reserva tu habitación</h2><p class="pwa-lead">Elige el espacio que mejor se adapte a ti.</p></div></div><div class="pwa-form-layout"><div class="pwa-card">${pwaField('FECHA DE INGRESO','','date','2025-12-01')}<div class="pwa-field"><span>TIPO DE HABITACIÓN</span><div class="pwa-choice-row"><button class="pwa-choice ${type==='Individual'?'selected':''}" data-pwa-type="Individual">Individual</button><button class="pwa-choice ${type==='Compartida'?'selected':''}" data-pwa-type="Compartida">Compartida</button></div></div><div class="pwa-form-grid"><label class="pwa-field"><span>PISO</span><select><option>Segundo piso</option><option>Primer piso</option><option>Planta baja</option></select></label><label class="pwa-field"><span>HABITACIÓN</span><select><option>204 · Disponible</option><option>202 · Disponible</option><option>201 · Disponible</option></select></label></div><button class="pwa-button pwa-primary pwa-block" data-pwa-action="reserve">Reservar</button></div><aside class="pwa-card pwa-summary"><span class="pwa-eyebrow">RESUMEN</span><h3 class="pwa-card-title">Habitación ${type}</h3><div class="pwa-data-grid"><div class="pwa-data-cell"><small>Monto mensual</small><strong>${pwaMoney(amount)}</strong></div><div class="pwa-data-cell"><small>Depósito</small><strong>${pwaMoney(amount)}</strong></div></div><p class="pwa-muted">La asignación final se confirma al terminar el registro.</p></aside></div>`;
  return pwaShell('student','reserve',content);
}
function pwaPayments() {
  const content = `<div class="pwa-page-head"><div><span class="pwa-eyebrow">ESTADO DE CUENTA</span><h2 class="pwa-page-title">Gestión de Pagos</h2><p class="pwa-lead">Consulta tus cuotas y comprobantes.</p></div><button class="pwa-button pwa-primary" data-pwa-action="request-payment">Solicitar pago</button></div><div class="pwa-dash-grid"><article class="pwa-card"><div class="pwa-card-head"><span class="pwa-card-title">${pwaMoney(900)}</span>${pwaStatus('Pendiente')}</div><div class="pwa-data-grid"><div class="pwa-data-cell"><small>Concepto</small><strong>Mantenimiento</strong></div><div class="pwa-data-cell"><small>Vencimiento</small><strong>01/12/2025</strong></div></div></article><article class="pwa-card"><h3 class="pwa-card-title">Cargar comprobante</h3><label class="pwa-file-drop">＋ &nbsp; Selecciona un archivo o arrástralo aquí<input id="pwaReceiptFile" type="file" accept="image/*,.pdf"></label></article></div><article class="pwa-card"><h3 class="pwa-card-title">Historial de pagos</h3><div class="pwa-empty">Aún no hay pagos registrados.<br>Cuando realices uno, aparecerá aquí.</div></article>`;
  return pwaShell('student','payments',content);
}
function pwaProfile() {
  const s = PWA_MOCK.student;
  const content = `<div class="pwa-page-head"><div><span class="pwa-eyebrow">MI CUENTA</span><h2 class="pwa-page-title">Cuenta / Perfil</h2><p class="pwa-lead">Datos de tu cuenta de residente.</p></div></div><div class="pwa-profile-grid"><aside class="pwa-card pwa-profile-card"><div class="pwa-avatar-big">[ FOTO ]</div><strong>${pwaEsc(s.name)}</strong><span class="pwa-muted">Estudiante</span><button class="pwa-button pwa-secondary pwa-block" data-pwa-action="logout">Cerrar sesión</button></aside><div class="pwa-card"><h3 class="pwa-card-title">Información personal</h3><div class="pwa-data-grid"><div class="pwa-data-cell"><small>Nombre completo</small><strong>${pwaEsc(s.name)}</strong></div><div class="pwa-data-cell"><small>Correo</small><strong>${pwaEsc(s.email)}</strong></div><div class="pwa-data-cell"><small>Habitación</small><strong>${s.room}</strong></div><div class="pwa-data-cell"><small>Piso</small><strong>${s.floor}</strong></div></div></div></div>`;
  return pwaShell('student','profile',content);
}

/* --- Pantallas · Rol administrador --- */
function pwaAdminLogin() {
  return pwaAuthShell(`<div class="pwa-auth-art pwa-admin-art"><span class="pwa-eyebrow">SICPES · ACCESO RESTRINGIDO</span><h2 class="pwa-auth-title">Panel administrativo</h2><p class="pwa-lead">Gestiona reservaciones, cobros e inventario desde un escritorio.</p><div class="pwa-image-placeholder pwa-tall">[ IMAGEN ]</div></div><div class="pwa-auth-card"><span class="pwa-eyebrow">INICIAR SESIÓN</span><h2 class="pwa-card-title">Acceso administrador</h2>${pwaField('CORREO ADMINISTRADOR','admin@sicpes.mx','email')}${pwaField('CONTRASEÑA','••••••••','password')}<button class="pwa-button pwa-primary pwa-block" data-pwa-action="admin-login">Entrar</button><p class="pwa-form-note">Acceso exclusivo para personal autorizado.</p></div>`);
}
function pwaFilterTabs(values, active, key) {
  return `<div class="pwa-tabs">${values.map(v => `<button class="pwa-filter-tab ${v===active?'active':''}" data-pwa-filter="${pwaEsc(v)}" data-pwa-filter-key="${key}">${pwaEsc(v)}</button>`).join('')}</div>`;
}
function pwaReservations() {
  const filtered = pwaState.filter === 'Todas' ? PWA_MOCK.reservations : PWA_MOCK.reservations.filter(r => r.status === pwaState.filter);
  const stats = [['Total', PWA_MOCK.reservations.length],['Pendientes', PWA_MOCK.reservations.filter(x => x.status==='Pendiente').length],['Aceptadas', PWA_MOCK.reservations.filter(x => x.status==='Aceptada').length],['Rechazadas', PWA_MOCK.reservations.filter(x => x.status==='Rechazada').length]];
  const rows = filtered.map(r => [pwaEsc(r.name), `${r.type} · Hab. ${r.room}`, pwaMoney(r.amount), pwaStatus(r.status)]);
  const content = `<div class="pwa-page-head"><div><span class="pwa-eyebrow">PANEL ADMINISTRATIVO SICPES</span><h2 class="pwa-page-title">Reservaciones</h2><p class="pwa-lead">Revisa y administra las solicitudes de los estudiantes.</p></div></div><div class="pwa-stat-grid">${stats.map(([l,v]) => `<div class="pwa-stat"><strong>${v}</strong><small>${l}</small></div>`).join('')}</div>${pwaFilterTabs(['Todas','Pendiente','Aceptada','Rechazada'], pwaState.filter, 'reservation')}<article class="pwa-card">${pwaTable(['Solicitante','Detalle','Monto mensual','Estado'], rows)}</article>`;
  return pwaShell('admin','reservations',content);
}
function pwaPendingPayments() {
  const filtered = pwaState.paymentFilter === 'Todos' ? PWA_MOCK.payments : PWA_MOCK.payments.filter(p => p.status === pwaState.paymentFilter);
  const stats = [['Total', PWA_MOCK.payments.length],['Pendientes', PWA_MOCK.payments.filter(p => p.status==='Pendiente').length],['En revisión', 1],['Por cobrar', pwaMoney(6300)]];
  const rows = filtered.map(p => [pwaEsc(p.name), `Habitación ${p.room}`, p.date, pwaMoney(p.amount), pwaStatus(p.status)]);
  const content = `<div class="pwa-page-head"><div><span class="pwa-eyebrow">CONTROL DE COBROS</span><h2 class="pwa-page-title">Pagos pendientes</h2><p class="pwa-lead">Da seguimiento a las cuotas por cobrar.</p></div></div><div class="pwa-stat-grid">${stats.map(([l,v]) => `<div class="pwa-stat"><strong>${v}</strong><small>${l}</small></div>`).join('')}</div>${pwaFilterTabs(['Todos','Pendiente','En revisión'], pwaState.paymentFilter, 'payment')}<article class="pwa-card">${pwaTable(['Residente','Habitación','Fecha','Cuota mensual','Estado'], rows)}</article>`;
  return pwaShell('admin','pendingPayments',content);
}
function pwaFloors() {
  const content = `<div class="pwa-page-head"><div><span class="pwa-eyebrow">INVENTARIO RESIDENCIAL</span><h2 class="pwa-page-title">Pisos y habitaciones</h2><p class="pwa-lead">Administra los espacios disponibles.</p></div></div><div class="pwa-form-layout"><article class="pwa-card"><h3 class="pwa-card-title">Agregar piso</h3>${pwaField('NOMBRE DEL PISO','Ej. Tercer piso')}<label class="pwa-field"><span>HABITACIONES (SEPARADAS POR COMAS)</span><textarea id="pwaRoomInput" rows="2" placeholder="301, 302, 303"></textarea></label><button class="pwa-button pwa-primary pwa-block" data-pwa-action="add-floor">Agregar habitaciones</button></article><div class="pwa-floor-grid">${PWA_MOCK.floors.map((f,i) => `<article class="pwa-card pwa-floor-card"><div class="pwa-card-head"><strong class="pwa-card-title">${pwaEsc(f.name)}</strong><button class="pwa-back-link" data-pwa-remove-floor="${i}">Eliminar</button></div><p class="pwa-muted">${f.rooms.length} habitaciones</p><div class="pwa-room-tags">${f.rooms.map(r => `<span>${pwaEsc(r)}</span>`).join('')}</div></article>`).join('')}</div></div>`;
  return pwaShell('admin','floors',content);
}
function pwaSettings() {
  const content = `<div class="pwa-page-head"><div><span class="pwa-eyebrow">PREFERENCIAS DEL SISTEMA</span><h2 class="pwa-page-title">Configuración global</h2><p class="pwa-lead">Precios y datos administrativos.</p></div></div><div class="pwa-form-layout"><article class="pwa-card"><h3 class="pwa-card-title">Precios mensuales</h3><div class="pwa-form-grid">${pwaField('HABITACIÓN INDIVIDUAL (MXN)','$2,500','number',PWA_MOCK.prices.Individual)}${pwaField('HABITACIÓN COMPARTIDA (MXN)','$1,800','number',PWA_MOCK.prices.Compartida)}${pwaField('CORREO DEL ADMINISTRADOR','admin@sicpes.mx','email','admin@sicpes.mx')}</div><button class="pwa-button pwa-primary" data-pwa-action="save-settings">Guardar cambios</button></article><article class="pwa-card"><h3 class="pwa-card-title">Notificaciones del sistema</h3>${[['Nuevas reservaciones',true],['Pagos pendientes',true],['Avisos a residentes',false]].map(([label,on]) => `<label class="pwa-switch-row">${label}<input class="pwa-switch" type="checkbox" ${on?'checked':''}></label>`).join('')}</article></div>`;
  return pwaShell('admin','settings',content);
}

const PWA_RENDERERS = { landing:pwaLanding, studentLogin:pwaStudentLogin, register:pwaRegister, loading:pwaLoading, home:pwaHome, reserve:pwaReserve, payments:pwaPayments, profile:pwaProfile, adminLogin:pwaAdminLogin, reservations:pwaReservations, pendingPayments:pwaPendingPayments, floors:pwaFloors, settings:pwaSettings };

function pwaRender() {
  if (pwaState.screen !== 'loading') clearInterval(pwaState.loadingTimer);
  pwaScreenEl.classList.add('leaving');
  setTimeout(() => {
    pwaScreenEl.innerHTML = PWA_RENDERERS[pwaState.screen]();
    pwaScreenEl.classList.remove('leaving');
    document.querySelector('#pwaScreenLabel').textContent = PWA_SCREENS[pwaState.screen].label;
    document.querySelector('#pwaRoute').textContent = PWA_SCREENS[pwaState.screen].route;
    document.querySelector('#pwaRoleCaption').textContent = pwaState.role === 'student' ? 'ESTUDIANTE' : 'ADMINISTRADOR';
    document.querySelectorAll('.pwa-role-tab').forEach(b => b.classList.toggle('active', b.dataset.pwaRole === pwaState.role));
    document.body.classList.toggle('pwa-zones-on', pwaState.zones);
    document.querySelector('#pwaBack').hidden = PWA_ROOTS.has(pwaState.screen);
    pwaRenderPanel();
    if (pwaState.screen === 'loading') pwaRunLoading();
  }, 110);
}
function pwaRenderPanel() {
  const screens = pwaState.role === 'student' ? PWA_STUDENT : PWA_ADMIN;
  const list = document.querySelector('#pwaScreenList');
  list.innerHTML = screens.map(id => `<button class="pwa-screen-link ${id===pwaState.screen?'active':''}" type="button" data-pwa-go="${id}"><span>${PWA_CODES[id]}</span><span>${PWA_SCREENS[id].title}</span></button>`).join('');
  if (pwaState.role === 'admin' && pwaState.screen === 'loading') list.insertAdjacentHTML('beforeend', `<button class="pwa-screen-link active" type="button" data-pwa-go="loading"><span>E4</span><span>Carga compartida</span></button>`);
  const options = PWA_ACTIONS[pwaState.screen] || [];
  document.querySelector('#pwaDestinations').innerHTML = options.length ? options.map(([id,action]) => `<button class="pwa-destination-link" type="button" data-pwa-go="${id}"><span>${pwaEsc(action)}</span><b>→ ${PWA_CODES[id]} · ${pwaEsc(PWA_SCREENS[id].title)}</b></button>`).join('') : '<p class="pwa-no-destinations">Esta pantalla no tiene destinos directos.</p>';
  document.querySelector('#pwaScreenCount').textContent = `${screens.length} pantallas · ${pwaState.role === 'student' ? 'Rol Estudiante' : 'Rol Administrador'}`;
}
function pwaRunLoading() {
  clearInterval(pwaState.loadingTimer);
  let progress = 0;
  pwaState.loadingTimer = setInterval(() => {
    progress = Math.min(progress + 8, 100);
    const fill = document.querySelector('#pwaProgressFill');
    if (!fill) { clearInterval(pwaState.loadingTimer); return; }
    fill.style.width = `${progress}%`;
    document.querySelector('#pwaProgressPercent').textContent = `${progress}%`;
    if (progress === 100) { clearInterval(pwaState.loadingTimer); setTimeout(() => pwaGo(pwaState.role === 'admin' ? 'reservations' : 'home', { replace: true }), 450); }
  }, 100);
}

/* --- Mapa de navegación (SVG de coordenadas fijas, adaptado a escritorio) --- */
const PWA_NS = 'http://www.w3.org/2000/svg';
const PWA_MAP = {
  student: {
    title: 'ROL ESTUDIANTE · FLUJO WEB', viewBox: '0 0 1256 420', marker: 'pwaArrowStudent',
    thumbs: [['landing',40,200,['Landing']],['studentLogin',216,200,['Iniciar','sesión']],['register',304,30,['Crear','cuenta']],['loading',392,200,['Sincronizando'],'COMPARTIDA'],['home',568,200,['Inicio']],['reserve',744,200,['Reservar','habitación']],['payments',920,200,['Gestión de','Pagos']],['profile',1096,200,['Cuenta /','Perfil']]],
    edges: [['M160,248 H216','Iniciar sesión',188,190,'middle'],['M336,248 H392','Entrar',364,190,'middle'],['M512,248 H568','Cargar',540,190,'middle'],['M688,248 H744','Reservar',716,190,'middle'],['M864,248 H920','Pagos',892,190,'middle'],['M1040,248 H1096','Cuenta',1068,190,'middle'],['M276,200 V78 H304','Crear cuenta',268,140,'end'],['M424,78 H452 V200','Registrarse',460,140,'start'],['M804,296 V320 Q804,336 788,336 H644 Q628,336 628,320 V296','Confirmar',716,354,'middle'],['M1156,296 V360 Q1156,376 1140,376 H292 Q276,376 276,360 V296','Cerrar sesión',716,394,'middle']]
  },
  admin: {
    title: 'ROL ADMINISTRADOR · FLUJO WEB', note: 'Acceso desde A1; navegación superior de escritorio', viewBox: '0 0 1256 240', marker: 'pwaArrowAdmin',
    thumbs: [['adminLogin',216,60,['Acceso','administrador']],['reservations',392,60,['Reservaciones']],['pendingPayments',568,60,['Pagos','pendientes']],['floors',744,60,['Pisos']],['settings',920,60,['Configuración','global']]],
    edges: [['M336,108 H392','Entrar',364,50,'middle'],['M512,108 H568','Pagos',540,50,'middle'],['M688,108 H744','Pisos',716,50,'middle'],['M864,108 H920','Configurar',892,50,'middle'],['M980,156 V180 Q980,196 964,196 H292 Q276,196 276,180 V156','Cerrar sesión',628,214,'middle']]
  }
};
function pwaOpenMap() {
  const view = document.querySelector('#pwaMapView');
  if (!view.hidden) return;
  pwaState.mapScrollY = window.scrollY;
  view.hidden = false;
  pwaBuildMap();
}
function pwaCloseMap() {
  const view = document.querySelector('#pwaMapView');
  if (view.hidden) return;
  view.hidden = true;
  window.scrollTo(0, pwaState.mapScrollY);
}
function pwaThumb(item) {
  const [id,x,y,lines,badge] = item;
  const current = pwaState.screen === id, code = PWA_CODES[id];
  const title = lines.map((line,i) => `<text x="${x+8}" y="${y+32+i*14}" font-family="Space Grotesk, Arial, sans-serif" font-size="12" font-weight="700" fill="#111">${pwaEsc(line)}</text>`).join('');
  const bars = [104,78,92].map((width,i) => `<rect x="${x+8}" y="${y+56+i*7}" width="${width}" height="3" rx="1.5" fill="#dcdcdc"/>`).join('');
  const tag = badge ? `<rect x="${x+58}" y="${y+5}" width="56" height="14" rx="7" fill="#f3f3f3" stroke="#ddd" stroke-width="1"/><text x="${x+86}" y="${y+15}" text-anchor="middle" font-family="Space Mono, monospace" font-size="7" font-weight="700" fill="#666">${badge}</text>` : '';
  return `<g class="pwa-thumb${current?' current':''}" data-pwa-go="${id}" role="button" tabindex="0" aria-label="${pwaEsc(`${code} · ${PWA_SCREENS[id].title}`)}"><rect class="pwa-thumb-box" x="${x}" y="${y}" width="120" height="96" rx="6" fill="${current?'#f5fff7':'#fff'}" stroke="${current?'#16a34a':'#ccc'}" stroke-width="${current?2:1}"/><text x="${x+8}" y="${y+15}" font-family="Space Mono, monospace" font-size="10" font-weight="700" fill="#666">${code}</text>${tag}${title}${bars}<rect x="${x+8}" y="${y+80}" width="48" height="8" rx="2" fill="${current?'#16a34a':'#d0d0d0'}"/></g>`;
}
function pwaMapCard(flow) {
  const note = flow.note ? `<p class="pwa-role-note">${pwaEsc(flow.note)}</p>` : '';
  const paths = flow.edges.map(([d,label,lx,ly,anchor]) => `<path d="${d}" fill="none" stroke="#555" stroke-width="1.5" marker-end="url(#${flow.marker})"/><text x="${lx}" y="${ly}" text-anchor="${anchor}" font-family="Space Mono, monospace" font-size="11" fill="#444" paint-order="stroke" stroke="#fff" stroke-width="5" stroke-linejoin="round">${pwaEsc(label)}</text>`).join('');
  return `<section class="pwa-map-card"><h3 class="pwa-map-role">${flow.title}</h3>${note}<svg class="pwa-map-svg" xmlns="${PWA_NS}" viewBox="${flow.viewBox}" role="img" aria-label="${pwaEsc(`Mapa de navegación · ${flow.title}`)}"><defs><marker id="${flow.marker}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#555"/></marker></defs>${flow.thumbs.map(pwaThumb).join('')}${paths}</svg></section>`;
}
function pwaBuildMap() {
  document.querySelector('#pwaMapCanvas').innerHTML = pwaMapCard(PWA_MAP.student) + pwaMapCard(PWA_MAP.admin);
}

/* Alterna entre la sección de sketches móviles y la sección PWA dentro de index.html. */
function pwaSetView(view) {
  const isPwa = view === 'pwa';
  document.body.classList.toggle('pwa-mode', isPwa);
  document.querySelectorAll('.pwa-view-tab').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  const mobileView = document.querySelector('#mobileView');
  const pwaView = document.querySelector('#pwaView');
  if (mobileView) mobileView.hidden = isPwa;
  if (pwaView) pwaView.hidden = !isPwa;
  document.querySelectorAll('[data-view-for="mobile"]').forEach(el => { el.hidden = isPwa; });
  document.querySelectorAll('[data-view-for="pwa"]').forEach(el => { el.hidden = !isPwa; });
  if (isPwa) {
    const diagram = document.querySelector('#diagramView');
    if (diagram) diagram.hidden = true;
    pwaRender();
  } else {
    const pwaMap = document.querySelector('#pwaMapView');
    if (pwaMap) pwaMap.hidden = true;
  }
}

/* Un solo controlador delega los clics de las pantallas dinámicas. */
document.addEventListener('click', e => {
  const target = e.target.closest('button,a,article,.pwa-feature,.pwa-notice,.pwa-file-drop,.pwa-thumb');
  if (!target) return;
  if (target.dataset.view) { pwaSetView(target.dataset.view); return; }
  if (target.hasAttribute('data-pwa-close-map')) { pwaCloseMap(); return; }
  if (target.dataset.pwaRole) { pwaSetRole(target.dataset.pwaRole); return; }
  if (target.dataset.pwaGo) { if (!document.querySelector('#pwaMapView').hidden) pwaCloseMap(); pwaGo(target.dataset.pwaGo); return; }
  if (target.dataset.pwaAction === 'back') { pwaBack(); return; }
  if (target.dataset.pwaType) { pwaState.type = target.dataset.pwaType; pwaRender(); return; }
  if (target.dataset.pwaFilter) { if (target.dataset.pwaFilterKey === 'reservation') pwaState.filter = target.dataset.pwaFilter; else pwaState.paymentFilter = target.dataset.pwaFilter; pwaRender(); return; }
  if (target.dataset.pwaAction === 'student-login') { pwaState.role = 'student'; pwaGo('loading'); return; }
  if (target.dataset.pwaAction === 'admin-login') { pwaState.role = 'admin'; pwaGo('loading'); return; }
  if (target.dataset.pwaAction === 'register') { const checked = pwaScreenEl.querySelector('input[type=checkbox]')?.checked; if (!checked) { pwaToast('Acepta los términos para continuar.'); return; } pwaState.role = 'student'; pwaGo('loading'); return; }
  if (target.dataset.pwaAction === 'reserve') { pwaToast('¡Reservación confirmada!'); setTimeout(() => pwaGo('home'), 700); return; }
  if (target.dataset.pwaAction === 'request-payment') { pwaToast('Solicitud de pago enviada.'); return; }
  if (target.dataset.pwaAction === 'logout') { pwaState.history = []; pwaSetRole('student'); pwaGo('studentLogin', { replace: true }); return; }
  if (target.dataset.pwaAction === 'social') { pwaToast(`Continuar con ${target.textContent} (demo)`); return; }
  if (target.dataset.pwaAction === 'add-floor') { const fields = pwaScreenEl.querySelectorAll('.pwa-card input'); const name = fields[0]?.value.trim(); const rooms = pwaScreenEl.querySelector('#pwaRoomInput')?.value.split(',').map(x => x.trim()).filter(Boolean) || []; if (!name || !rooms.length) { pwaToast('Agrega el nombre del piso y al menos una habitación.'); return; } PWA_MOCK.floors.unshift({ name, rooms }); pwaToast('Piso agregado.'); pwaRender(); return; }
  if (target.dataset.pwaRemoveFloor !== undefined) { PWA_MOCK.floors.splice(Number(target.dataset.pwaRemoveFloor), 1); pwaToast('Piso eliminado.'); pwaRender(); return; }
  if (target.dataset.pwaAction === 'save-settings') { const inputs = pwaScreenEl.querySelectorAll('input[type=number]'); PWA_MOCK.prices.Individual = Number(inputs[0].value) || PWA_MOCK.prices.Individual; PWA_MOCK.prices.Compartida = Number(inputs[1].value) || PWA_MOCK.prices.Compartida; pwaToast('Cambios guardados.'); return; }
});
document.addEventListener('change', e => { if (e.target.id === 'pwaReceiptFile' && e.target.files.length) pwaToast(`Archivo listo: ${e.target.files[0].name}`); });
document.querySelector('#pwaBack').addEventListener('click', pwaBack);
document.querySelector('#pwaMap').addEventListener('click', pwaOpenMap);
document.querySelector('#pwaZones').addEventListener('click', () => { pwaState.zones = !pwaState.zones; document.body.classList.toggle('pwa-zones-on', pwaState.zones); document.querySelector('#pwaZones').textContent = pwaState.zones ? 'Ocultar zonas clicables' : 'Mostrar zonas clicables'; });
window.addEventListener('keydown', e => { if (e.key === 'Escape') pwaCloseMap(); });
window.addEventListener('resize', () => {});

pwaRender();
