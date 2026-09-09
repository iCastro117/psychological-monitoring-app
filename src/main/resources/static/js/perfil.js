// Detalle de un rescatista en perfil.html: toma el id de la encuesta de la URL (?id=),
// lo pide a GET /api/encuestas/{id} y con eso arma la ficha, las métricas, la gráfica de
// barras, las dimensiones y el listado de las 23 respuestas. Se llega aquí desde el botón VER del dashboard.

// Las mismas 23 preguntas de app.js y en el mismo orden. Aquí solo sirven para mostrar el texto de cada respuesta.
const preguntas = [
    "Después de la última emergencia atendida me he sentido emocionalmente agotado.",
    "He tenido pensamientos recurrentes sobre la emergencia que atendí recientemente.",
    "He presentado dificultades para dormir después de la última operación.",
    "Siento que me he recuperado emocionalmente de la última emergencia atendida.",
    "Me siento físicamente cansado debido a la intervención reciente.",
    "Siento que tengo la concentración necesaria para participar en una nueva emergencia.",
    "Me siento mentalmente preparado para enfrentar una nueva operación de rescate.",
    "La emergencia anterior generó en mí un impacto emocional significativo.",
    "Considero que el apoyo de mi equipo me ayuda a manejar situaciones emocionalmente difíciles.",
    "Antes de entrar a una nueva emergencia siento niveles de estrés o tensión.",
    "Siento confianza en mi capacidad para responder adecuadamente en una nueva operación.",
    "Me siento emocionalmente estable en este momento.",
    "He presentado irritabilidad o cambios de humor después de la emergencia anterior.",
    "Siento que el descanso posterior a la última emergencia fue suficiente.",
    "Considero importante evaluar mi estado psicológico antes de entrar a una nueva misión.",
    "Me siento motivado para participar en una nueva operación de rescate.",
    "Siento que el trabajo en emergencias puede afectar mi bienestar emocional.",
    "En este momento siento tranquilidad emocional.",
    "¿Se le dificulta mantener la concentración durante la misión?",
    "¿Se siente afectado(a) emocionalmente por las situaciones observadas durante la misión?",
    "¿En qué medida experimentó preocupación o ansiedad por la seguridad de las víctimas, compañeros o de usted mismo(a)?",
    "Considero útil contar con herramientas tecnológicas que monitoreen el estado psicológico del equipo.",
    "Estaría dispuesto a registrar mi estado emocional en un software antes y después de cada emergencia."
];

// El texto de cada valor. La posición 0 va vacía para que el índice coincida con la respuesta (1 a 5).
const ESCALA = ['', 'Nunca', 'Rara vez', 'A veces', 'Frecuentemente', 'Siempre'];

// Dimensiones de evaluación (grupos de preguntas)
// De cada grupo se saca el promedio y sale una barra en el panel de dimensiones.
const DIMENSIONES = [
    { nombre: 'Agotamiento emocional',     preguntas: [1, 5, 8],      icono: '😔' },
    { nombre: 'Intrusión / Trauma',         preguntas: [2, 3, 19, 20], icono: '🧠' },
    { nombre: 'Preparación operacional',    preguntas: [6, 7, 11, 16], icono: '⚡' },
    { nombre: 'Estabilidad emocional',      preguntas: [4, 12, 14, 18],icono: '⚖️' },
    { nombre: 'Estrés y ansiedad',          preguntas: [10, 13, 21],   icono: '😰' },
    { nombre: 'Apoyo y percepción social',  preguntas: [9, 15, 17, 22],icono: '🤝' },
];

// Colores y textos del recuadro de resultado según el nivel de riesgo que calculó el backend.
const RIESGO_CONFIG = {
    1: { color: '#16a34a', bgClass: 'bg-green-50',   border: 'border-green-400',  texto: 'text-green-800',  badge: 'bg-green-100 text-green-800', titulo: 'SIN RIESGO PSICOLÓGICO SIGNIFICATIVO', desc: 'El estado emocional del rescatista se encuentra dentro de los parámetros normales. Puede continuar con sus operaciones.' },
    2: { color: '#2563eb', bgClass: 'bg-blue-50',    border: 'border-blue-400',   texto: 'text-blue-800',   badge: 'bg-blue-100 text-blue-800',   titulo: 'RIESGO PSICOLÓGICO BAJO',               desc: 'Se detectan indicadores leves. Se recomienda seguimiento de rutina y actividades de bienestar.' },
    3: { color: '#ca8a04', bgClass: 'bg-yellow-50',  border: 'border-yellow-400', texto: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-800',titulo: 'RIESGO PSICOLÓGICO MODERADO',            desc: 'Se detectan indicadores de alerta. Es recomendable una evaluación con el psicólogo de la unidad.' },
    4: { color: '#ea580c', bgClass: 'bg-orange-50',  border: 'border-orange-400', texto: 'text-orange-800', badge: 'bg-orange-100 text-orange-800',titulo: 'RIESGO PSICOLÓGICO ALTO',                desc: 'Se detectan señales significativas de estrés o trauma. Se requiere atención psicológica a corto plazo.' },
    5: { color: '#dc2626', bgClass: 'bg-red-50',     border: 'border-red-500',    texto: 'text-red-800',    badge: 'bg-red-100 text-red-800',     titulo: 'RIESGO PSICOLÓGICO CRÍTICO',             desc: 'Se detectan indicadores severos. Se requiere intervención psicológica inmediata. No recomendado para operaciones.' },
};

// ─── Carga del perfil ────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const id     = params.get('id');

    if (!id) {
        mostrarError();
        return;
    }

    fetch(`/api/encuestas/${id}`)
        .then(r => {
            if (!r.ok) throw new Error('No encontrado');
            return r.json();
        })
        .then(encuesta => {
            renderizarPerfil(encuesta);
        })
        .catch(() => mostrarError());
});

// ─── Renderizado principal ────────────────────────────────────────────────────

// Recibe la encuesta del backend y llena de una vez todas las secciones de la página.
function renderizarPerfil(e) {
    document.getElementById('cargando').classList.add('hidden');
    document.getElementById('contenidoPerfil').classList.remove('hidden');

    const nivel  = e.nivelRiesgo || 1;
    const cfg    = RIESGO_CONFIG[nivel] || RIESGO_CONFIG[1];
    const nombre = e.rescatista?.nombreCompleto || 'Desconocido';
    const cedula = e.rescatista?.cedula         || '—';
    const fecha  = e.fechaHora
        ? new Date(e.fechaHora).toLocaleString('es-CO')
        : '—';

    // Cabecera
    document.getElementById('perfilNombre').textContent = nombre;
    document.getElementById('perfilCedula').textContent = `C.C. ${cedula}`;
    document.getElementById('perfilFecha').textContent  = `Evaluación: ${fecha}`;
    document.getElementById('perfilBadge').textContent  = `Nivel ${nivel}`;
    document.getElementById('perfilBadge').className    =
        `px-4 py-2 rounded-xl font-bold text-base ${cfg.badge}`;

    // Predicción (sin icono)
    const pred = document.getElementById('prediccionCard');
    pred.className =
        `rounded-2xl p-6 text-center shadow-md border-2 transition ${cfg.bgClass} ${cfg.border}`;
    document.getElementById('prediccionTitulo').textContent    = cfg.titulo;
    document.getElementById('prediccionTitulo').className      = `text-2xl sm:text-3xl font-black mb-2 ${cfg.texto}`;
    document.getElementById('prediccionDescripcion').textContent = cfg.desc;
    document.getElementById('prediccionDescripcion').className   = `text-sm sm:text-base max-w-lg mx-auto ${cfg.texto} opacity-90`;

    // Obtener array de respuestas (índice 0-22)
    // El backend las manda sueltas como respuesta1...respuesta23; aquí se juntan en una sola lista.
    const respuestas = [];
    for (let i = 1; i <= 23; i++) {
        respuestas.push(e[`respuesta${i}`] || 0);
    }

    // Métricas rápidas
    // Las preguntas 1, 2, 3, 8 y 13 son las de mayor alerta: su suma es el puntaje crítico de la tarjeta.
    const criticas  = [respuestas[0], respuestas[1], respuestas[2], respuestas[7], respuestas[12]];
    const puntajeCr = criticas.reduce((a, b) => a + b, 0);
    const promedio  = (respuestas.reduce((a, b) => a + b, 0) / respuestas.length).toFixed(1);
    const altas     = respuestas.filter(r => r >= 4).length;
    const bajas     = respuestas.filter(r => r <= 2).length;

    document.getElementById('metricaPuntaje').textContent = puntajeCr;
    document.getElementById('metricaPromedio').textContent = promedio;
    document.getElementById('metricaAltas').textContent   = altas;
    document.getElementById('metricaBajas').textContent   = bajas;

    // Gráfica de barras
    const colores = respuestas.map(r => {
        if (r >= 5) return '#dc2626';
        if (r >= 4) return '#ea580c';
        if (r >= 3) return '#ca8a04';
        if (r >= 2) return '#2563eb';
        return '#16a34a';
    });

    new Chart(document.getElementById('respuestasChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: respuestas.map((_, i) => `P${i + 1}`),
            datasets: [{
                label: 'Respuesta',
                data: respuestas,
                backgroundColor: colores,
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 0, max: 5, ticks: { stepSize: 1 } },
                x: { ticks: { font: { size: 10 } } }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: ctx => `Pregunta ${ctx[0].dataIndex + 1}`,
                        afterBody: ctx => ESCALA[ctx[0].raw] || ''
                    }
                }
            }
        }
    });

    // Análisis por dimensiones
    const catContainer = document.getElementById('categoriasContainer');
    catContainer.innerHTML = DIMENSIONES.map(dim => {
        const vals = dim.preguntas.map(p => respuestas[p - 1] || 0);
        const prom = vals.reduce((a, b) => a + b, 0) / vals.length;
        const pct  = Math.round((prom / 5) * 100);
        const col  = pct >= 70 ? 'bg-red-500' : pct >= 50 ? 'bg-yellow-500' : pct >= 30 ? 'bg-blue-500' : 'bg-green-500';

        return `
        <div>
            <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">${dim.icono} ${dim.nombre}</span>
                <span class="text-xs font-bold text-gray-600">${prom.toFixed(1)} / 5</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2.5">
                <div class="${col} h-2.5 rounded-full transition-all" style="width:${pct}%"></div>
            </div>
        </div>`;
    }).join('');

    // Detalle respuestas
    const detalleContainer = document.getElementById('detalleRespuestas');
    detalleContainer.innerHTML = respuestas.map((val, i) => {
        const nivel_r = val >= 5 ? 'bg-red-50 border-red-200' :
                        val >= 4 ? 'bg-orange-50 border-orange-200' :
                        val >= 3 ? 'bg-yellow-50 border-yellow-200' :
                                   'bg-green-50 border-green-100';
        const texto   = val >= 4 ? 'text-red-700 font-bold' : 'text-gray-600 font-semibold';

        return `
        <div class="flex gap-3 p-3 rounded-lg border ${nivel_r}">
            <span class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center
                         justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                ${i + 1}
            </span>
            <div class="flex-1 min-w-0">
                <p class="text-xs text-gray-600 leading-snug">${preguntas[i]}</p>
            </div>
            <div class="flex-shrink-0 text-right">
                <span class="${texto} text-sm">${val}/5</span>
                <p class="text-xs text-gray-400">${ESCALA[val] || '—'}</p>
            </div>
        </div>`;
    }).join('');
}

function mostrarError() {
    document.getElementById('cargando').classList.add('hidden');
    document.getElementById('panelError').classList.remove('hidden');
}
