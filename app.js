import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// !!! PEGA TU CONFIGURACIÓN DE FIREBASE AQUÍ !!!
const firebaseConfig = {
  // apiKey: "...",
  // authDomain: "...",
  // projectId: "...",
};

const app = initializeApp(firebaseConfig);
const dbFirestore = getFirestore(app);

// ESTRUCTURA INICIAL DE LA BASE DE DATOS
// Aquí puedes cambiar los nombres por los de tu cuadrilla
const estadoInicial = {
    puntosChicos: 0,
    puntosChicas: 0,
    jugadores: {
        "Jon": { equipo: "chicos", puntos: 0 },
        "Ander": { equipo: "chicos", puntos: 0 },
        "Iker": { equipo: "chicos", puntos: 0 },
        "Mikel": { equipo: "chicos", puntos: 0 },
        "Lucía": { equipo: "chicas", puntos: 0 },
        "Ane": { equipo: "chicas", puntos: 0 },
        "Nerea": { equipo: "chicas", puntos: 0 },
        "Maite": { equipo: "chicas", puntos: 0 }
    },
    historial: [] // Guardará cada evento: { id, fecha, jugador, equipo, accion, puntos }
};

let db = estadoInicial;

// ESCUCHA EN TIEMPO REAL A FIREBASE
onSnapshot(doc(dbFirestore, "juego", "caninolimpiadas"), (docRef) => {
    if (docRef.exists()) {
        db = docRef.data();
    } else {
        // Si no existe el documento, lo creamos por primera vez
        guardarDB();
    }
    actualizarUI();
});

async function guardarDB() {
    try { 
        await setDoc(doc(dbFirestore, "juego", "caninolimpiadas"), db); 
    } 
    catch (e) { console.error("Error al guardar:", e); }
}

// NAVEGACIÓN Y SEGURIDAD
window.intentarEntrarAdmin = function() {
    let pwd = prompt("Introduce la Contraseña de Administrador:");
    if (pwd === 'verano2026') { 
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
    // 1. Marcador Global
    document.getElementById('pts-chicos').innerText = db.puntosChicos;
    document.getElementById('pts-chicas').innerText = db.puntosChicas;

    // 2. Rankings Individuales
    const listaChicos = document.getElementById('ranking-chicos-list');
    const listaChicas = document.getElementById('ranking-chicas-list');
    listaChicos.innerHTML = ''; listaChicas.innerHTML = '';

    // Convertir objeto de jugadores a array y ordenar por puntos
    let arrayJugadores = Object.entries(db.jugadores).map(([nombre, datos]) => ({ nombre, ...datos }));
    arrayJugadores.sort((a, b) => b.puntos - a.puntos);

    arrayJugadores.forEach(j => {
        let html = `
            <div class="jugador-row">
                <span class="jugador-name">${j.nombre}</span>
                <span class="jugador-pts" style="color: ${j.equipo === 'chicos' ? 'var(--chico-color)' : 'var(--chica-color)'}">${j.puntos}</span>
            </div>
        `;
        if (j.equipo === 'chicos') listaChicos.innerHTML += html;
        else listaChicas.innerHTML += html;
    });

    // 3. Historial Público y Admin
    const histPublico = document.getElementById('historial-publico-list');
    const histAdmin = document.getElementById('historial-admin-list');
    histPublico.innerHTML = ''; histAdmin.innerHTML = '';

    // Mostrar los más recientes primero
    let historialReverso = [...db.historial].reverse();

    historialReverso.forEach(evento => {
        let signo = evento.puntos > 0 ? '+' : '';
        let colorPuntos = evento.puntos > 0 ? 'var(--gold)' : 'var(--danger)';
        
        // Vista Pública
        histPublico.innerHTML += `
            <div class="historial-item ${evento.equipo}">
                <div class="historial-info">
                    <span class="h-jugador">${evento.jugador}</span>
                    <span class="h-accion">${evento.accion}</span>
                </div>
                <div class="h-puntos" style="color:${colorPuntos}">${signo}${evento.puntos}</div>
            </div>
        `;

        // Vista Admin (Con botón de borrar)
        histAdmin.innerHTML += `
            <div class="historial-item ${evento.equipo}">
                <div class="historial-info">
                    <span class="h-jugador">${evento.jugador} <span style="font-weight:normal; font-size:0.8rem;">(${evento.fecha})</span></span>
                    <span class="h-accion">${evento.accion}</span>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <span class="h-puntos" style="color:${colorPuntos}">${signo}${evento.puntos}</span>
                    <button class="btn-delete" onclick="borrarEvento(${evento.id})">🗑️</button>
                </div>
            </div>
        `;
    });
}

// LÓGICA DE ADMIN (AÑADIR Y BORRAR)
function llenarSelectJugadores() {
    const select = document.getElementById('admin-jugador');
    select.innerHTML = '<option value="">Selecciona quién ha puntuado...</option>';
    
    let nombres = Object.keys(db.jugadores).sort();
    nombres.forEach(nombre => {
        let equipo = db.jugadores[nombre].equipo === 'chicos' ? '👦' : '👧';
        select.innerHTML += `<option value="${nombre}">${equipo} ${nombre}</option>`;
    });
}

window.registrarEvento = async function() {
    const nombre = document.getElementById('admin-jugador').value;
    const accion = document.getElementById('admin-accion').value;
    const puntos = parseInt(document.getElementById('admin-puntos').value);

    if (!nombre || !accion || isNaN(puntos)) {
        return alert("Rellena todos los campos correctamente.");
    }

    const equipo = db.jugadores[nombre].equipo;

    // Actualizar puntos
    db.jugadores[nombre].puntos += puntos;
    if (equipo === 'chicos') db.puntosChicos += puntos;
    else db.puntosChicas += puntos;

    // Crear registro en el historial
    const nuevoEvento = {
        id: Date.now(), // ID único basado en el timestamp
        fecha: new Date().toLocaleDateString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        jugador: nombre,
        equipo: equipo,
        accion: accion,
        puntos: puntos
    };

    db.historial.push(nuevoEvento);

    await guardarDB();
    
    // Limpiar formulario
    document.getElementById('admin-accion').value = '';
    document.getElementById('admin-puntos').value = '';
    alert("¡Puntos registrados con éxito!");
}

window.borrarEvento = async function(id) {
    if (!confirm("¿Seguro que quieres borrar este evento? Se restarán los puntos automáticamente.")) return;

    const index = db.historial.findIndex(e => e.id === id);
    if (index === -1) return;

    const evento = db.historial[index];

    // Revertir los puntos
    db.jugadores[evento.jugador].puntos -= evento.puntos;
    if (evento.equipo === 'chicos') db.puntosChicos -= evento.puntos;
    else db.puntosChicas -= evento.puntos;

    // Eliminar del array
    db.historial.splice(index, 1);

    await guardarDB();
}
