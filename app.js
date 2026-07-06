import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// !!! PEGA TU CONFIGURACIÓN DE FIREBASE AQUÍ !!!
const firebaseConfig = {

  apiKey: "AIzaSyC0SbLDaFg2f49aGB8wLj5P59xJfjBeiEM",

  authDomain: "caninolimiadas2026.firebaseapp.com",

  projectId: "caninolimiadas2026",

  storageBucket: "caninolimiadas2026.firebasestorage.app",

  messagingSenderId: "620200509275",

  appId: "1:620200509275:web:ac8539bfbcbdf5851be47e",

  measurementId: "G-EK5K8ZWVJC"

};


const app = initializeApp(firebaseConfig);
const dbFirestore = getFirestore(app);

// ESTRUCTURA INICIAL (CON LA CUADRILLA OFICIAL)
const estadoInicial = {
    puntosChicos: 0,
    puntosChicas: 0,
    jugadores: {
        // CHICOS
        "Gurtu": { equipo: "chicos", puntos: 0, underdog: true },
        "Oier": { equipo: "chicos", puntos: 0, underdog: false },
        "Jorky": { equipo: "chicos", puntos: 0, underdog: false },
        "Gorka": { equipo: "chicos", puntos: 0, underdog: false },
        "Shime": { equipo: "chicos", puntos: 0, underdog: false },
        "Saul": { equipo: "chicos", puntos: 0, underdog: false },
        "Bartu": { equipo: "chicos", puntos: 0, underdog: false },
        "Bosco": { equipo: "chicos", puntos: 0, underdog: false },
        "Mentxi": { equipo: "chicos", puntos: 0, underdog: false },
        
        // CHICAS
        "Lucia": { equipo: "chicas", puntos: 0, underdog: true },
        "Bego": { equipo: "chicas", puntos: 0, underdog: false },
        "AmaiaN": { equipo: "chicas", puntos: 0, underdog: false },
        "AmaiaD": { equipo: "chicas", puntos: 0, underdog: false },
        "Leire": { equipo: "chicas", puntos: 0, underdog: false }
    },
    historial: [] 
};

let db = estadoInicial;

// ESCUCHA FIREBASE (OJO: HEMOS CAMBIADO EL NOMBRE A "caninolimpiadas_oficial" PARA LIMPIAR LOS DATOS VIEJOS)
onSnapshot(doc(dbFirestore, "juego", "caninolimpiadas_oficial"), (docRef) => {
    if (docRef.exists()) {
        db = docRef.data();
    } else {
        guardarDB();
    }
    actualizarUI();
});

async function guardarDB() {
    try { await setDoc(doc(dbFirestore, "juego", "caninolimpiadas_oficial"), db); } 
    catch (e) { console.error("Error al guardar:", e); }
}

// NAVEGACIÓN Y SEGURIDAD (Con tu nueva contraseña)
window.intentarEntrarAdmin = function() {
    let pwd = prompt("Introduce la Contraseña del Admin Supremo:");
    if (pwd === 'Mataspice6') { 
        llenarSelectJugadores();
        mostrarPantalla('screen-admin'); 
    } 
    else if (pwd !== null) alert("Contraseña incorrecta ❌");
}

window.mostrarPantalla = function(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0,0);
}

// ACTUALIZACIÓN DE INTERFAZ
function actualizarUI() {
    document.getElementById('pts-chicos').innerText = db.puntosChicos;
    document.getElementById('pts-chicas').innerText = db.puntosChicas;

    const listaChicos = document.getElementById('ranking-chicos-list');
    const listaChicas = document.getElementById('ranking-chicas-list');
    listaChicos.innerHTML = ''; listaChicas.innerHTML = '';

    let arrayJugadores = Object.entries(db.jugadores).map(([nombre, datos]) => ({ nombre, ...datos }));
    arrayJugadores.sort((a, b) => b.puntos - a.puntos);

    arrayJugadores.forEach(j => {
        // Cartelito de Underdog más visible
        let estrella = j.underdog ? ' <span style="font-size: 0.75rem; background: var(--gold); color: #000; padding: 2px 6px; border-radius: 10px; margin-left: 5px; font-weight: bold;">⭐ Underdog</span>' : '';
        let html = `
            <div class="jugador-row">
                <span class="jugador-name">${j.nombre}${estrella}</span>
                <span class="jugador-pts" style="color: ${j.equipo === 'chicos' ? 'var(--chico-color)' : 'var(--chica-color)'}">${j.puntos}</span>
            </div>
        `;
        if (j.equipo === 'chicos') listaChicos.innerHTML += html;
        else listaChicas.innerHTML += html;
    });

    const histPublico = document.getElementById('historial-publico-list');
    const histAdmin = document.getElementById('historial-admin-list');
    histPublico.innerHTML = ''; histAdmin.innerHTML = '';

    let historialReverso = [...db.historial].reverse();

    historialReverso.forEach(evento => {
        let signoIndiv = evento.cambioIndiv > 0 ? '+' : '';
        let colorPuntos = evento.cambioIndiv > 0 ? 'var(--gold)' : (evento.cambioIndiv < 0 ? 'var(--danger)' : '#94a3b8');
        
        let textoPuntos = `${signoIndiv}${evento.cambioIndiv} pts`;
        if (evento.tipoEspecial === 'lopez') textoPuntos = `+100 Equipo`;
        
        // Vista Pública (Muestra la anécdota destacada)
        histPublico.innerHTML += `
            <div class="historial-item ${evento.equipo}" style="flex-direction: column; align-items: flex-start; gap: 8px;">
                <div style="display: flex; justify-content: space-between; width: 100%;">
                    <span class="h-jugador" style="color: ${evento.equipo === 'chicos' ? 'var(--chico-color)' : 'var(--chica-color)'};">${evento.jugador} <span style="font-size: 0.8rem; color:#64748b;">(${evento.fecha})</span></span>
                    <span class="h-puntos" style="color:${colorPuntos}">${textoPuntos}</span>
                </div>
                <div style="font-size: 0.9rem; font-weight: bold; color: var(--text-main);">${evento.accion}</div>
                <div style="font-size: 0.9rem; color: #cbd5e1; font-style: italic; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; width: 100%;">💬 "${evento.desc}"</div>
            </div>
        `;

        // Vista Admin
        histAdmin.innerHTML += `
            <div class="historial-item ${evento.equipo}">
                <div class="historial-info">
                    <span class="h-jugador">${evento.jugador} <span style="font-weight:normal; font-size:0.8rem;">(${evento.fecha})</span></span>
                    <span class="h-accion">${evento.accion}</span>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <span class="h-puntos" style="color:${colorPuntos}">${textoPuntos}</span>
                    <button class="btn-delete" onclick="borrarEvento(${evento.id})">🗑️</button>
                </div>
            </div>
        `;
    });
}

function llenarSelectJugadores() {
    const select = document.getElementById('admin-jugador');
    select.innerHTML = '<option value="">Selecciona quién ha puntuado...</option>';
    let nombres = Object.keys(db.jugadores).sort();
    nombres.forEach(nombre => {
        let equipo = db.jugadores[nombre].equipo === 'chicos' ? '👦' : '👧';
        let underdog = db.jugadores[nombre].underdog ? ' (⭐ Underdog)' : '';
        select.innerHTML += `<option value="${nombre}">${equipo} ${nombre}${underdog}</option>`;
    });
}

// EL MOTOR MATEMÁTICO SUPREMO
window.registrarEvento = async function() {
    const nombre = document.getElementById('admin-jugador').value;
    const selectAccion = document.getElementById('admin-accion');
    const basePuntos = parseInt(selectAccion.value);
    const accionText = selectAccion.options[selectAccion.selectedIndex].text;
    const tipoEspecial = selectAccion.options[selectAccion.selectedIndex].dataset.tipo;
    
    const esCapitan = document.getElementById('admin-capitan').checked;
    const esEx = document.getElementById('admin-es-ex').checked;
    const esTrio = document.getElementById('admin-trio').checked;
    const racha = parseInt(document.getElementById('admin-racha').value);
    const desc = document.getElementById('admin-desc').value.trim();

    if (!nombre || !accionText) return alert("Selecciona jugador y acción.");
    if (desc === '') return alert("¡La anécdota es OBLIGATORIA! Queremos salseo.");

    const jugadorData = db.jugadores[nombre];
    const equipo = jugadorData.equipo;

    let cambioIndiv = 0;
    let cambioEquipo = 0;

    // LÓGICA DE PUNTUACIÓN
    if (tipoEspecial === 'normal') {
        // 1. Calculamos la base cruda (Positiva o Negativa si es ex)
        let subtotal = esEx ? (basePuntos * -1) : basePuntos;
        
        // 2. Sumamos modificadores directos
        subtotal += racha;
        if (esTrio) subtotal += 2;

        // 3. Aplicamos Multiplicadores al total
        let mult = 1;
        if (jugadorData.underdog) mult *= 2;
        if (esCapitan) mult *= 2;

        cambioIndiv = subtotal * mult;
        cambioEquipo = cambioIndiv;
    } 
    else if (tipoEspecial === 'lopez') {
        // Regla Lopez: +100 al equipo, el jugador se lleva la gloria individual también
        cambioIndiv = 100;
        cambioEquipo = 100;
    }
    else if (tipoEspecial === 'serio') {
        // Pierde todo
        cambioIndiv = -jugadorData.puntos;
        cambioEquipo = cambioIndiv; // El equipo pierde lo que aportaba
    }
    else if (tipoEspecial === 'vuelve-ex') {
        // Pierde todo + 50 de penalización al equipo
        cambioIndiv = -jugadorData.puntos;
        cambioEquipo = -50 + cambioIndiv; 
    }

    // APLICAR A LA BASE DE DATOS
    db.jugadores[nombre].puntos += cambioIndiv;
    if (equipo === 'chicos') db.puntosChicos += cambioEquipo;
    else db.puntosChicas += cambioEquipo;

    // GUARDAR EN HISTORIAL PARA PODER AUDITAR/DESHACER
    let tags = [];
    if (esCapitan) tags.push("©️ Capitán");
    if (esEx) tags.push("❌ Era EX");
    if (esTrio) tags.push("🔥 Trío");
    if (racha > 0) tags.push(`🔄 Racha +${racha}`);
    let accionFull = tags.length > 0 ? `${accionText} [${tags.join(' | ')}]` : accionText;

    const nuevoEvento = {
        id: Date.now(),
        fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
        jugador: nombre,
        equipo: equipo,
        accion: accionFull,
        desc: desc,
        tipoEspecial: tipoEspecial,
        cambioIndiv: cambioIndiv,
        cambioEquipo: cambioEquipo
    };

    db.historial.push(nuevoEvento);

    await guardarDB();
    
    // Limpiar formulario
    document.getElementById('admin-capitan').checked = false;
    document.getElementById('admin-es-ex').checked = false;
    document.getElementById('admin-trio').checked = false;
    document.getElementById('admin-racha').value = "0";
    document.getElementById('admin-desc').value = '';
    
    alert(`¡Salseo registrado!\n${nombre} ${cambioIndiv >= 0 ? '+' : ''}${cambioIndiv} pts.\nEquipo: ${cambioEquipo >= 0 ? '+' : ''}${cambioEquipo} pts.`);
}

// LA MÁQUINA DEL TIEMPO (DESHACER ERRORES)
window.borrarEvento = async function(id) {
    if (!confirm("¿Seguro que quieres borrar este evento? El sistema hará la matemática inversa para dejar todo como estaba.")) return;

    const index = db.historial.findIndex(e => e.id === id);
    if (index === -1) return;
    const evento = db.historial[index];

    // Revertir la matemática exacta que generó ese evento
    db.jugadores[evento.jugador].puntos -= evento.cambioIndiv;
    if (evento.equipo === 'chicos') db.puntosChicos -= evento.cambioEquipo;
    else db.puntosChicas -= evento.cambioEquipo;

    db.historial.splice(index, 1);
    await guardarDB();
}
