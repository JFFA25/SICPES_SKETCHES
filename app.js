/* Datos editables del prototipo: nombres, montos y registros de ejemplo. */
const MOCK = {
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

/* Definición de pantallas, roles y etiquetas del mapa. */
const SCREENS = {
  landing: { role: 'student', title: 'Landing', label: 'LANDING' },
  studentLogin: { role: 'student', title: 'Iniciar sesión', label: 'INICIAR SESIÓN' },
  register: { role: 'student', title: 'Crear cuenta', label: 'CREAR CUENTA' },
  loading: { role: 'shared', title: 'Sincronizando', label: 'CARGA' },
  home: { role: 'student', title: 'Inicio', label: 'INICIO' },
  reserve: { role: 'student', title: 'Reservar habitación', label: 'RESERVAR HABITACIÓN' },
  payments: { role: 'student', title: 'Gestión de Pagos', label: 'GESTIÓN DE PAGOS' },
  profile: { role: 'student', title: 'Cuenta / Perfil', label: 'CUENTA / PERFIL' },
  adminLogin: { role: 'admin', title: 'Acceso administrador', label: 'LOGIN ADMIN' },
  reservations: { role: 'admin', title: 'Reservaciones', label: 'RESERVACIONES' },
  pendingPayments: { role: 'admin', title: 'Pagos pendientes', label: 'PAGOS PENDIENTES' },
  floors: { role: 'admin', title: 'Pisos', label: 'PISOS' },
  settings: { role: 'admin', title: 'Configuración global', label: 'CONFIGURACIÓN' }
};
const studentFlow = ['landing', 'studentLogin', 'register', 'loading', 'home', 'reserve', 'payments', 'profile'];
/* La pantalla de carga compartida (E4) se dibuja una sola vez en la fila estudiante. */
const adminFlow = ['adminLogin', 'reservations', 'pendingPayments', 'floors', 'settings'];
/* Códigos para identificar rápidamente cada pantalla en la lista y el diagrama. */
const SCREEN_CODES = { landing:'E1', studentLogin:'E2', register:'E3', loading:'E4', home:'E5', reserve:'E6', payments:'E7', profile:'E8', adminLogin:'A1', reservations:'A2', pendingPayments:'A3', floors:'A4', settings:'A5' };
const STUDENT_SCREENS = studentFlow;
const ADMIN_SCREENS = ['adminLogin','reservations','pendingPayments','floors','settings'];
const ROOT_SCREENS = new Set(['home','reserve','payments','profile','reservations','pendingPayments','floors','settings']);
/* Rutas visibles para el panel lateral: destino y acción que lleva a él. */
const SCREEN_ACTIONS = {
  landing:[['studentLogin','Iniciar sesión'],['reserve','Explorar habitaciones']],
  studentLogin:[['loading','Entrar'],['register','¿No tienes cuenta? Regístrate']],
  register:[['loading','Registrarse']], loading:[['home','Terminar carga (estudiante)'],['reservations','Terminar carga (administrador)']],
  home:[['reserve','Tarjeta Tu reservación'],['payments','Tarjeta Próximo pago'],['reserve','Peticiones en la barra inferior'],['payments','Pagos en la barra inferior'],['profile','Cuenta en la barra inferior']],
  reserve:[['home','Reservar · Confirmar'],['home','Inicio en la barra inferior'],['payments','Pagos en la barra inferior'],['profile','Cuenta en la barra inferior']],
  payments:[['home','Inicio en la barra inferior'],['reserve','Peticiones en la barra inferior'],['profile','Cuenta en la barra inferior']],
  profile:[['studentLogin','Cerrar sesión'],['home','Inicio en la barra inferior'],['reserve','Peticiones en la barra inferior'],['payments','Pagos en la barra inferior']],
  adminLogin:[['loading','Entrar']],
  reservations:[['pendingPayments','Pagos en la barra inferior'],['floors','Pisos en la barra inferior'],['settings','Configuración en la barra inferior']],
  pendingPayments:[['reservations','Reservaciones en la barra inferior'],['floors','Pisos en la barra inferior'],['settings','Configuración en la barra inferior']],
  floors:[['reservations','Reservaciones en la barra inferior'],['pendingPayments','Pagos en la barra inferior'],['settings','Configuración en la barra inferior']],
  settings:[['reservations','Reservaciones en la barra inferior'],['pendingPayments','Pagos en la barra inferior'],['floors','Pisos en la barra inferior']]
};
const state = { screen: 'landing', role: 'student', history: [], type: 'Individual', filter: 'Todas', paymentFilter: 'Todos', zones: false, loadingTimer: null, toastTimer: null };
const phone = document.querySelector('#phoneScreen');
const toastEl = document.querySelector('#toast');

function money(value) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value); }
function esc(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function toast(message) { toastEl.textContent = message; toastEl.classList.add('show'); clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400); }
function go(screen, options = {}) {
  if (!SCREENS[screen]) return;
  if (state.screen !== screen && !options.replace) state.history.push(state.screen);
  state.screen = screen;
  if (screen === 'landing' || screen === 'studentLogin' || screen === 'register') state.role = 'student';
  if (screen === 'adminLogin') state.role = 'admin';
  render();
}
function back() { const previous = state.history.pop(); if (previous) { state.screen = previous; render(); } else toast('No hay una pantalla anterior.'); }
function setRole(role) { state.role = role; state.history = []; go(role === 'student' ? 'landing' : 'adminLogin', { replace: true }); }
function header(backControl = !ROOT_SCREENS.has(state.screen)) { return `<header class="app-header"><span class="app-logo">SICPES <span>/ RESIDENCIAL</span></span>${backControl ? '<button class="back-link clickable" data-action="back">← ATRÁS</button>' : '<span class="mono-label">DEMO</span>'}</header>`; }
function field(label, placeholder, type='text', value='') { return `<label class="field"><span>${label}</span><input type="${type}" placeholder="${placeholder}" value="${esc(value)}"></label>`; }
function nav(role, active) {
  const items = role === 'student' ? [['home','⌂','Inicio'],['reserve','＋','Peticiones'],['payments','$','Pagos'],['profile','◎','Cuenta']] : [['reservations','▤','Reservaciones'],['pendingPayments','$','Pagos'],['floors','▥','Pisos'],['settings','⚙','Configuración']];
  return `<nav class="bottom-nav" aria-label="Navegación inferior">${items.map(([id,icon,label]) => `<button class="nav-item clickable ${active===id?'active':''}" data-go="${id}"><span class="nav-icon">${icon}</span>${label}</button>`).join('')}</nav>`;
}
function appShell(content, role, active) { return `<div class="app-scroll">${content}</div>${nav(role,active)}`; }
function screenLanding() { return `<div class="app-scroll">${header(false)}<span class="mono-label">VIVIENDA UNIVERSITARIA · 2025</span><h1 class="screen-title">Encuentra tu espacio ideal para vivir y estudiar</h1><p class="screen-subtitle">Una residencia segura, cómoda y cerca de tu campus.</p><div class="image-placeholder tall">[ IMAGEN ]</div><button class="button primary clickable" data-go="reserve">Explorar habitaciones →</button><button class="button secondary clickable" data-go="studentLogin">Iniciar sesión</button><div class="feature-grid"><article class="feature clickable" data-go="studentLogin"><strong>Residencias verificadas</strong><small>ESPACIOS SEGUROS</small></article><article class="feature clickable" data-go="studentLogin"><strong>Gestión centralizada</strong><small>TODO EN UN LUGAR</small></article></div></div>`; }
function screenStudentLogin() { return `<div class="app-scroll">${header()}<span class="mono-label">PORTAL DEL RESIDENTE</span><h1 class="screen-title">Qué gusto verte<br>de nuevo.</h1><p class="screen-subtitle">Ingresa a tu cuenta para continuar.</p>${field('CORREO ELECTRÓNICO','nombre@correo.com','email')}${field('CONTRASEÑA','••••••••','password')}<button class="button primary clickable" data-action="student-login">Entrar</button><div class="divider">O CONTINÚA CON</div><div class="social-row"><button data-action="social">Google</button><button data-action="social">Facebook</button><button data-action="social">LinkedIn</button></div><p class="inline-link">¿No tienes cuenta? <button class="clickable" data-go="register">Regístrate</button></p></div>`; }
function screenRegister() { return `<div class="app-scroll">${header()}<span class="mono-label">NUEVO RESIDENTE</span><h1 class="screen-title">Crear cuenta</h1><p class="screen-subtitle">Registra tus datos para comenzar.</p>${field('NOMBRE COMPLETO','Nombre y apellidos')}${field('CORREO ELECTRÓNICO','nombre@correo.com','email')}${field('CONTRASEÑA','Mínimo 8 caracteres','password')}${field('CONFIRMAR CONTRASEÑA','Repite tu contraseña','password')}<label class="checkline"><input type="checkbox"> Acepto los términos y condiciones y el aviso de privacidad.</label><button class="button primary clickable" data-action="register">Registrarse</button><p class="inline-link">¿Ya tienes cuenta? <button class="clickable" data-go="studentLogin">Iniciar sesión</button></p></div>`; }
function screenLoading() { return `<div class="app-scroll">${header(false)}<div style="height:115px"></div><div class="image-placeholder" style="height:95px">SICPES</div><h1 class="screen-title" style="text-align:center">Preparando tu espacio</h1><p class="screen-subtitle" style="text-align:center">Sincronizando registros residenciales…</p><div class="progress-track"><div class="progress-fill" id="progressFill"></div></div><div class="progress-caption"><span id="progressText">Conectando con SICPES</span><span id="progressPercent">0%</span></div></div>`; }
function screenHome() { return appShell(`${header(false)}<span class="mono-label">PANEL DEL RESIDENTE</span><h1 class="screen-title">Bienvenido,<br>${esc(MOCK.student.name)}</h1><p class="screen-subtitle">Aquí tienes el resumen de tu residencia.</p><h2 class="section-title">Tu reservación</h2><article class="card clickable" data-go="reserve"><div class="card-head"><span class="card-title">Residencia SICPES</span><span class="status">ACTIVA</span></div><div class="data-grid"><div class="data-cell"><small>Piso</small><strong>${MOCK.student.floor}</strong></div><div class="data-cell"><small>Tipo</small><strong>${MOCK.student.type}</strong></div><div class="data-cell"><small>Habitación</small><strong>${MOCK.student.room}</strong></div><div class="data-cell"><small>Ingreso</small><strong>01/09/2025</strong></div></div></article><h2 class="section-title">Próximo pago</h2><article class="card clickable" data-go="payments"><div class="card-head"><span class="card-title">${money(900)}</span><span class="status">PENDIENTE</span></div><p class="muted">Vence el ${MOCK.student.due} · Cuota de mantenimiento</p></article><h2 class="section-title">Avisos</h2>${MOCK.student.notices.map(n=>`<div class="notice clickable" data-go="payments">${esc(n)}</div>`).join('')}`, 'student','home'); }
function screenReserve() { const type=state.type, amount=MOCK.prices[type]; return appShell(`${header()}<span class="mono-label">REGISTRO DE ESTUDIANTES</span><h1 class="screen-title">Reserva tu habitación</h1><p class="screen-subtitle">Elige el espacio que mejor se adapte a ti.</p>${field('FECHA DE INGRESO','','date','2025-12-01')}<div class="field"><span>TIPO DE HABITACIÓN</span><div class="choice-row"><button class="choice ${type==='Individual'?'selected':''}" data-type="Individual">Individual</button><button class="choice ${type==='Compartida'?'selected':''}" data-type="Compartida">Compartida</button></div></div><label class="field"><span>PISO</span><select><option>Segundo piso</option><option>Primer piso</option><option>Planta baja</option></select></label><label class="field"><span>HABITACIÓN</span><select><option>204 · Disponible</option><option>202 · Disponible</option><option>201 · Disponible</option></select></label><div class="price-box"><span class="mono-label">MONTO MENSUAL</span><strong id="reserveAmount">${money(amount)}</strong></div><button class="button primary clickable" data-action="reserve">Reservar</button>`, 'student','reserve'); }
function screenPayments() { return appShell(`${header()}<span class="mono-label">ESTADO DE CUENTA</span><h1 class="screen-title">Gestión de Pagos</h1><p class="screen-subtitle">Consulta tus cuotas y comprobantes.</p><h2 class="section-title">Tu próximo pago</h2><article class="card"><div class="card-head"><span class="card-title">${money(900)}</span><span class="status">PENDIENTE</span></div><div class="data-grid"><div class="data-cell"><small>Concepto</small><strong>Mantenimiento</strong></div><div class="data-cell"><small>Vencimiento</small><strong>01/12/2025</strong></div></div><button class="button primary clickable" style="margin-top:14px" data-action="request-payment">Solicitar pago</button></article><h2 class="section-title">Cargar comprobante</h2><label class="file-drop clickable">＋ &nbsp; Selecciona un archivo<input id="receiptFile" type="file" accept="image/*,.pdf"></label><h2 class="section-title">Historial de pagos</h2><div class="empty-state">Aún no hay pagos registrados.<br>Cuando realices uno, aparecerá aquí.</div>`, 'student','payments'); }
function screenProfile() { return appShell(`${header()}<span class="mono-label">MI CUENTA</span><h1 class="screen-title">Cuenta / Perfil</h1><div class="image-placeholder" style="height:100px;width:100px;border-radius:50%;margin:20px auto">[ FOTO ]</div><article class="card"><div class="data-cell"><small>Nombre completo</small><strong>${esc(MOCK.student.name)}</strong></div><hr style="border:0;border-top:1px solid #eee;margin:12px 0"><div class="data-cell"><small>Correo</small><strong>${esc(MOCK.student.email)}</strong></div><hr style="border:0;border-top:1px solid #eee;margin:12px 0"><div class="data-grid"><div class="data-cell"><small>Rol</small><strong>Estudiante</strong></div><div class="data-cell"><small>Habitación</small><strong>204</strong></div></div></article><button class="button clickable" data-action="logout">Cerrar sesión</button>`, 'student','profile'); }
function filterTabs(values, active, key) { return `<div class="tabs">${values.map(v=>`<button class="filter-tab ${v===active?'active':''}" data-filter="${esc(v)}" data-filter-key="${key}">${esc(v)}</button>`).join('')}</div>`; }
function screenReservations() { const filtered=state.filter==='Todas'?MOCK.reservations:MOCK.reservations.filter(r=>r.status===state.filter); return appShell(`${header(false)}<span class="mono-label">PANEL ADMINISTRATIVO SICPES</span><h1 class="screen-title">Reservaciones</h1><div class="stats">${[['Total',MOCK.reservations.length],['Pendientes',MOCK.reservations.filter(x=>x.status==='Pendiente').length],['Aceptadas',MOCK.reservations.filter(x=>x.status==='Aceptada').length],['Rechazadas',MOCK.reservations.filter(x=>x.status==='Rechazada').length]].map(([a,b])=>`<div class="stat"><strong>${b}</strong><small>${a}</small></div>`).join('')}</div>${filterTabs(['Todas','Pendiente','Aceptada','Rechazada'],state.filter,'reservation')}${filtered.map(r=>`<article class="card admin-card clickable" data-action="reservation-card"><div class="card-head"><div><h3>${esc(r.name)}</h3><span class="muted">${r.type} · Hab. ${r.room}</span></div><span class="status">${r.status.toUpperCase()}</span></div><div class="card-head" style="margin-top:12px"><span class="muted">Monto mensual</span><strong style="font-size:12px">${money(r.amount)}</strong></div></article>`).join('')}`, 'admin','reservations'); }
function screenPendingPayments() { const filtered=state.paymentFilter==='Todos'?MOCK.payments:MOCK.payments.filter(p=>p.status===state.paymentFilter); return appShell(`${header(false)}<span class="mono-label">CONTROL DE COBROS</span><h1 class="screen-title">Pagos pendientes</h1><div class="stats"><div class="stat"><strong>${MOCK.payments.length}</strong><small>Total</small></div><div class="stat"><strong>${MOCK.payments.filter(p=>p.status==='Pendiente').length}</strong><small>Pendientes</small></div><div class="stat"><strong>1</strong><small>En revisión</small></div><div class="stat"><strong>${money(6300)}</strong><small>Por cobrar</small></div></div>${filterTabs(['Todos','Pendiente','En revisión'],'Todos'===state.paymentFilter?'Todos':state.paymentFilter,'payment')}${filtered.map(p=>`<article class="card admin-card clickable" data-action="payment-card"><div class="card-head"><div><h3>${esc(p.name)}</h3><span class="muted">Habitación ${p.room} · ${p.date}</span></div><span class="status">${p.status.toUpperCase()}</span></div><div class="card-head" style="margin-top:12px"><span class="muted">Cuota mensual</span><strong style="font-size:12px">${money(p.amount)}</strong></div></article>`).join('')}`, 'admin','pendingPayments'); }
function screenFloors() { return appShell(`${header()}<span class="mono-label">INVENTARIO RESIDENCIAL</span><h1 class="screen-title">Pisos y habitaciones</h1><p class="screen-subtitle">Administra los espacios disponibles.</p><article class="card"><h2 class="section-title" style="margin-top:0">Agregar piso</h2>${field('NOMBRE DEL PISO','Ej. Tercer piso')}<label class="field"><span>HABITACIONES (SEPARADAS POR COMAS)</span><textarea id="roomInput" rows="2" placeholder="301, 302, 303"></textarea></label><button class="button primary clickable" data-action="add-floor">Agregar habitaciones</button></article><h2 class="section-title">Pisos existentes</h2>${MOCK.floors.map((f,i)=>`<article class="card"><div class="card-head"><strong class="card-title">${esc(f.name)}</strong><button class="back-link clickable" data-remove-floor="${i}" aria-label="Eliminar ${esc(f.name)}">Eliminar</button></div><p class="muted">${f.rooms.length} habitaciones · ${f.rooms.map(esc).join(', ')}</p></article>`).join('')}`, 'admin','floors'); }
function screenSettings() { return appShell(`${header()}<span class="mono-label">PREFERENCIAS DEL SISTEMA</span><h1 class="screen-title">Configuración global</h1><p class="screen-subtitle">Precios y datos administrativos.</p><article class="card"><h2 class="section-title" style="margin-top:0">Precios mensuales</h2>${field('HABITACIÓN INDIVIDUAL (MXN)','$2,500','number',MOCK.prices.Individual)}${field('HABITACIÓN COMPARTIDA (MXN)','$1,800','number',MOCK.prices.Compartida)}${field('CORREO DEL ADMINISTRADOR','admin@sicpes.mx','email','admin@sicpes.mx')}<button class="button primary clickable" data-action="save-settings">Guardar cambios</button></article><h2 class="section-title">Notificaciones del sistema</h2>${[['Nuevas reservaciones',true],['Pagos pendientes',true],['Avisos a residentes',false]].map(([label,on])=>`<label class="switch-row">${label}<input class="switch" type="checkbox" ${on?'checked':''}></label>`).join('')}`, 'admin','settings'); }

function render() {
  const renderers={landing:screenLanding,studentLogin:screenStudentLogin,register:screenRegister,loading:screenLoading,home:screenHome,reserve:screenReserve,payments:screenPayments,profile:screenProfile,adminLogin:screenAdminLogin,reservations:screenReservations,pendingPayments:screenPendingPayments,floors:screenFloors,settings:screenSettings};
  if(state.screen!=='loading') clearInterval(state.loadingTimer);
  phone.classList.add('leaving');
  setTimeout(()=>{ phone.innerHTML=renderers[state.screen](); phone.classList.remove('leaving'); phone.classList.add('entering'); requestAnimationFrame(()=>phone.classList.remove('entering')); document.querySelector('#screenLabel').textContent=SCREENS[state.screen].label; document.querySelector('#roleCaption').textContent=state.role==='student'?'ESTUDIANTE':'ADMINISTRADOR'; document.querySelectorAll('.role-tab').forEach(b=>b.classList.toggle('active',b.dataset.role===state.role)); document.body.classList.toggle('zones-on',state.zones); document.querySelector('#backButton').hidden=ROOT_SCREENS.has(state.screen); renderScreenPanel(); if(state.screen==='loading') runLoading(); },120);
}
function renderScreenPanel() {
  const screens=state.role==='student'?STUDENT_SCREENS:ADMIN_SCREENS;
  const list=document.querySelector('#roleScreens');
  list.innerHTML=screens.map(id=>`<button class="screen-link ${id===state.screen?'active':''}" type="button" data-go="${id}"><span>${SCREEN_CODES[id]}</span><span>${SCREENS[id].title}</span></button>`).join('');
  if(state.role==='admin'&&state.screen==='loading') list.insertAdjacentHTML('beforeend',`<button class="screen-link active" type="button" data-go="loading"><span>E4</span><span>Carga compartida</span></button>`);
  const options=SCREEN_ACTIONS[state.screen]||[];
  document.querySelector('#screenDestinations').innerHTML=options.length?options.map(([id,action])=>`<button class="destination-link" type="button" data-go="${id}"><span>${esc(action)}</span><b>→ ${SCREEN_CODES[id]} · ${esc(SCREENS[id].title)}</b></button>`).join(''):'<p class="no-destinations">Esta pantalla no tiene destinos directos.</p>';
  document.querySelector('#screenCount').textContent=`${screens.length} pantallas · ${state.role==='student'?'Rol Estudiante':'Rol Administrador'}`;
}
/* Escala uniforme el marco completo y reserva su tamaño visible en el layout. */
function updatePhoneScale() {
  const headerHeight=document.querySelector('.topbar').getBoundingClientRect().height;
  const scale=Math.max(.6,Math.min(1,(window.innerHeight-headerHeight-90)/868));
  const holder=document.querySelector('.phone-holder');
  document.documentElement.style.setProperty('--phone-scale',scale);
  holder.style.width=`${414*scale}px`;
  holder.style.height=`${868*scale}px`;
  document.querySelector('.device-label').style.width=`${414*scale}px`;
}
function screenAdminLogin() { return `<div class="app-scroll">${header(false)}<div style="height:56px"></div><span class="mono-label">SICPES · ACCESO RESTRINGIDO</span><h1 class="screen-title">Panel administrativo</h1><p class="screen-subtitle">Inicia sesión para gestionar la residencia.</p>${field('CORREO ADMINISTRADOR','admin@sicpes.mx','email')}${field('CONTRASEÑA','••••••••','password')}<button class="button primary clickable" data-action="admin-login">Entrar</button><p class="form-note">Acceso exclusivo para personal autorizado.</p></div>`; }
function runLoading() { clearInterval(state.loadingTimer); let progress=0; state.loadingTimer=setInterval(()=>{ progress=Math.min(progress+8,100); const fill=document.querySelector('#progressFill'); if(!fill){clearInterval(state.loadingTimer);return;} fill.style.width=`${progress}%`; document.querySelector('#progressPercent').textContent=`${progress}%`; if(progress===100){clearInterval(state.loadingTimer);setTimeout(()=>go(state.role==='admin'?'reservations':'home',{replace:true}),450);} },100); }
const diagramState={scrollY:0,bodyOverflow:''};
const SVG_NS='http://www.w3.org/2000/svg';
/* Coordenadas fijas del mapa: nada se calcula midiendo el DOM. */
const DIAGRAM={
  student:{
    title:'ROL ESTUDIANTE',viewBox:'0 0 1256 420',marker:'sicpesArrowStudent',
    thumbs:[
      ['landing',40,200,['Landing']],
      ['studentLogin',216,200,['Iniciar','sesión']],
      ['register',304,30,['Crear','cuenta']],
      ['loading',392,200,['Sincronizando'],'COMPARTIDA'],
      ['home',568,200,['Inicio']],
      ['reserve',744,200,['Reservar','habitación']],
      ['payments',920,200,['Gestión de','Pagos']],
      ['profile',1096,200,['Cuenta /','Perfil']]
    ],
    edges:[
      ['M160,248 H216','Iniciar sesión',188,190,'middle'],
      ['M336,248 H392','Entrar',364,190,'middle'],
      ['M512,248 H568','Cargar',540,190,'middle'],
      ['M688,248 H744','Reservar',716,190,'middle'],
      ['M864,248 H920','Pagos',892,190,'middle'],
      ['M1040,248 H1096','Cuenta',1068,190,'middle'],
      ['M276,200 V78 H304','Crear cuenta',268,140,'end'],
      ['M424,78 H452 V200','Registrarse',460,140,'start'],
      ['M804,296 V320 Q804,336 788,336 H644 Q628,336 628,320 V296','Confirmar',716,354,'middle'],
      ['M1156,296 V360 Q1156,376 1140,376 H292 Q276,376 276,360 V296','Cerrar sesión',716,394,'middle']
    ]
  },
  admin:{
    title:'ROL ADMINISTRADOR',note:'Acceso desde E2 con cuenta admin',viewBox:'0 0 1256 240',marker:'sicpesArrowAdmin',
    thumbs:[
      ['adminLogin',216,60,['Acceso','administrador']],
      ['reservations',392,60,['Reservaciones']],
      ['pendingPayments',568,60,['Pagos','pendientes']],
      ['floors',744,60,['Pisos']],
      ['settings',920,60,['Configuración','global']]
    ],
    edges:[
      ['M336,108 H392','Entrar',364,50,'middle'],
      ['M512,108 H568','Pagos',540,50,'middle'],
      ['M688,108 H744','Pisos',716,50,'middle'],
      ['M864,108 H920','Configurar',892,50,'middle'],
      ['M980,156 V180 Q980,196 964,196 H292 Q276,196 276,180 V156','Cerrar sesión',628,214,'middle']
    ]
  }
};
function openDiagram() {
  const view=document.querySelector('#diagramView');
  if(!view.hidden)return;
  diagramState.scrollY=window.scrollY;
  diagramState.bodyOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  view.hidden=false;
  buildDiagram();
}
function closeDiagram() {
  const view=document.querySelector('#diagramView');
  if(view.hidden)return;
  view.hidden=true;
  document.body.style.overflow=diagramState.bodyOverflow;
  window.scrollTo(0,diagramState.scrollY);
}
function diagramThumb(item){
  const [id,x,y,lines,badge]=item;
  const current=state.screen===id,code=SCREEN_CODES[id];
  const title=lines.map((line,i)=>`<text x="${x+8}" y="${y+32+i*14}" font-family="Space Grotesk, Arial, sans-serif" font-size="12" font-weight="700" fill="#111">${esc(line)}</text>`).join('');
  const bars=[104,78,92].map((width,i)=>`<rect x="${x+8}" y="${y+56+i*7}" width="${width}" height="3" rx="1.5" fill="#dcdcdc"/>`).join('');
  const tag=badge?`<rect x="${x+58}" y="${y+5}" width="56" height="14" rx="7" fill="#f3f3f3" stroke="#ddd" stroke-width="1"/><text x="${x+86}" y="${y+15}" text-anchor="middle" font-family="Space Mono, monospace" font-size="7" font-weight="700" fill="#666">${badge}</text>`:'';
  return `<g class="thumb${current?' current':''}" data-go="${id}" role="button" tabindex="0" aria-label="${esc(`${code} · ${SCREENS[id].title}`)}">
      <rect class="thumb-box" x="${x}" y="${y}" width="120" height="96" rx="6" fill="${current?'#f5fff7':'#fff'}" stroke="${current?'#16a34a':'#ccc'}" stroke-width="${current?2:1}"/>
      <text x="${x+8}" y="${y+15}" font-family="Space Mono, monospace" font-size="10" font-weight="700" fill="#666">${code}</text>
      ${tag}
      ${title}
      ${bars}
      <rect x="${x+8}" y="${y+80}" width="48" height="8" rx="2" fill="${current?'#16a34a':'#d0d0d0'}"/>
    </g>`;
}
function diagramPaths(flow){
  return flow.edges.map(([d,label,lx,ly,anchor])=>`<path d="${d}" fill="none" stroke="#555" stroke-width="1.5" marker-end="url(#${flow.marker})"/><text x="${lx}" y="${ly}" text-anchor="${anchor}" font-family="Space Mono, monospace" font-size="11" fill="#444" paint-order="stroke" stroke="#fff" stroke-width="5" stroke-linejoin="round">${esc(label)}</text>`).join('');
}
function diagramCard(flow){
  const note=flow.note?`<p class="role-note">${esc(flow.note)}</p>`:'';
  return `<section class="diagram-card"><h3 class="diagram-role">${flow.title}</h3>${note}<svg class="diagram-svg" xmlns="${SVG_NS}" viewBox="${flow.viewBox}" role="img" aria-label="${esc(`Diagrama de navegación · ${flow.title}`)}"><defs><marker id="${flow.marker}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#555"/></marker></defs>${flow.thumbs.map(diagramThumb).join('')}${diagramPaths(flow)}</svg></section>`;
}
function buildDiagram() {
  document.querySelector('#diagramCanvas').innerHTML=diagramCard(DIAGRAM.student)+diagramCard(DIAGRAM.admin);
}

/* La exportación serializa los dos <svg> tal como se ven y los pinta a escala 2x. */
function diagramExportMarkup(svg,title){
  const vb=svg.getAttribute('viewBox').trim().split(/\s+/).map(Number);
  const width=vb[2],height=vb[3],head=44;
  const out=document.createElementNS(SVG_NS,'svg');
  out.setAttribute('xmlns',SVG_NS);
  out.setAttribute('width',width);
  out.setAttribute('height',height+head);
  out.setAttribute('viewBox',`0 0 ${width} ${height+head}`);
  const frame=document.createElementNS(SVG_NS,'rect');
  frame.setAttribute('x','0.5');frame.setAttribute('y','0.5');
  frame.setAttribute('width',width-1);frame.setAttribute('height',height+head-1);
  frame.setAttribute('fill','#fff');frame.setAttribute('stroke','#d9d9d9');
  out.appendChild(frame);
  const label=document.createElementNS(SVG_NS,'text');
  label.setAttribute('x','2');label.setAttribute('y','28');
  label.setAttribute('font-family','Space Mono, monospace');label.setAttribute('font-size','16');
  label.setAttribute('font-weight','700');label.setAttribute('letter-spacing','1.5');label.setAttribute('fill','#666');
  label.textContent=title;
  out.appendChild(label);
  const group=document.createElementNS(SVG_NS,'g');
  group.setAttribute('transform',`translate(0,${head})`);
  Array.from(svg.children).forEach(node=>group.appendChild(node.cloneNode(true)));
  out.appendChild(group);
  return new XMLSerializer().serializeToString(out);
}
function svgImageLoader(markup){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=()=>reject(new Error('SVG'));
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(markup);
  });
}
function downloadDiagramPNG() {
  const cards=[...document.querySelectorAll('#diagramCanvas .diagram-card')];
  if(cards.length<2)return;
  const titles=cards.map(card=>card.querySelector('.diagram-role').textContent.trim());
  const sources=cards.map((card,i)=>diagramExportMarkup(card.querySelector('svg'),titles[i]));
  Promise.all(sources.map(svgImageLoader)).then(images=>{
    const margin=24,gap=28,scale=2;
    const width=(images[0]&&images[0].width||1256)+margin*2;
    const height=margin+images.reduce((sum,img)=>sum+img.height,0)+gap*(images.length-1)+margin;
    const canvas=document.createElement('canvas');
    canvas.width=Math.round(width*scale);
    canvas.height=Math.round(height*scale);
    const ctx=canvas.getContext('2d');
    ctx.scale(scale,scale);
    ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);
    let y=margin;
    images.forEach(img=>{ctx.drawImage(img,margin,y,img.width,img.height);y+=img.height+gap;});
    const link=document.createElement('a');
    link.download='sicpes-diagrama-navegacion.png';
    link.href=canvas.toDataURL('image/png');
    link.click();
  }).catch(()=>toast('No se pudo generar la imagen del diagrama.'));
}

/* Un solo controlador delega los clics de pantallas dinámicas. */
document.addEventListener('click',e=>{
  const target=e.target.closest('button,a,article,.feature,.notice,.file-drop,.thumb'); if(!target)return;
  if(target.hasAttribute('data-close-diagram')){closeDiagram();return;}
  if(target.dataset.role){setRole(target.dataset.role);return;}
  if(target.dataset.go){if(!document.querySelector('#diagramView').hidden)closeDiagram();go(target.dataset.go);return;}
  if(target.dataset.action==='back'){back();return;}
  if(target.dataset.type){state.type=target.dataset.type;render();return;}
  if(target.dataset.filter){const key=target.dataset.filterKey; if(key==='reservation')state.filter=target.dataset.filter;else state.paymentFilter=target.dataset.filter;render();return;}
  if(target.dataset.action==='student-login'){state.role='student';go('loading');return;}
  if(target.dataset.action==='admin-login'){state.role='admin';go('loading');return;}
  if(target.dataset.action==='register'){const checked=phone.querySelector('input[type=checkbox]')?.checked;if(!checked){toast('Acepta los términos para continuar.');return;}state.role='student';go('loading');return;}
  if(target.dataset.action==='reserve'){toast('¡Reservación confirmada!');setTimeout(()=>go('home'),700);return;}
  if(target.dataset.action==='request-payment'){toast('Solicitud de pago enviada.');return;}
  if(target.dataset.action==='logout'){state.history=[];setRole('student');go('studentLogin',{replace:true});return;}
  if(target.dataset.action==='social'){toast(`Continuar con ${target.textContent} (demo)`);return;}
  if(target.dataset.action==='reservation-card'){toast('Detalle de reservación seleccionado.');return;}
  if(target.dataset.action==='payment-card'){toast('Pago seleccionado para revisión.');return;}
  if(target.dataset.action==='add-floor'){const fields=phone.querySelectorAll('.field input');const name=fields[0]?.value.trim();const rooms=phone.querySelector('#roomInput')?.value.split(',').map(x=>x.trim()).filter(Boolean)||[];if(!name||!rooms.length){toast('Agrega el nombre del piso y al menos una habitación.');return;}MOCK.floors.unshift({name,rooms});toast('Piso agregado.');render();return;}
  if(target.dataset.removeFloor!==undefined){const i=Number(target.dataset.removeFloor);MOCK.floors.splice(i,1);toast('Piso eliminado.');render();return;}
  if(target.dataset.action==='save-settings'){const inputs=phone.querySelectorAll('input[type=number]');MOCK.prices.Individual=Number(inputs[0].value)||MOCK.prices.Individual;MOCK.prices.Compartida=Number(inputs[1].value)||MOCK.prices.Compartida;toast('Cambios guardados.');return;}
});
document.addEventListener('change',e=>{if(e.target.id==='receiptFile'&&e.target.files.length)toast(`Archivo listo: ${e.target.files[0].name}`);});
document.querySelector('#backButton').addEventListener('click',back);
document.querySelector('#diagramToggle').addEventListener('click',openDiagram);
document.querySelector('#downloadDiagram').addEventListener('click',downloadDiagramPNG);
document.querySelector('#zonesToggle').addEventListener('click',()=>{state.zones=!state.zones;document.body.classList.toggle('zones-on',state.zones);document.querySelector('#zonesToggle').textContent=state.zones?'Ocultar zonas clicables':'Mostrar zonas clicables';});
window.addEventListener('keydown',e=>{
  if(e.key==='Escape')closeDiagram();
  if(e.key==='Enter'&&e.target instanceof Element&&e.target.classList.contains('thumb')){e.preventDefault();const id=e.target.dataset.go;if(id){closeDiagram();go(id);}}
});
window.addEventListener('resize',()=>{updatePhoneScale();});
updatePhoneScale();
render();

