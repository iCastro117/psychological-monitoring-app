let encuestasGlobales = [];

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
    "¿Se le dificulta fue mantener la concentración durante la misión?",
    "¿Se siente afectado(a) emocionalmente por las situaciones observadas durante la misión?",
    "¿En qué medida experimentó preocupación o ansiedad por la seguridad de las víctimas, compañeros o de usted mismo(a)?",
    "Considero útil contar con herramientas tecnológicas que monitoreen el estado psicológico del equipo.",
    "Estaría dispuesto a registrar mi estado emocional en un software antes y después de cada emergencia."
];

document.addEventListener('DOMContentLoaded', function() {
    cargarEncuestas();
    configurarEventos();
});

function configurarEventos() {
    document.getElementById('btnRefrescar').addEventListener('click', cargarEncuestas);
    document.getElementById('busqueda').addEventListener('keyup', filtrarTabla);
    document.getElementById('filtroRiesgo').addEventListener('change', filtrarTabla);
    document.getElementById('ordenar').addEventListener('change', ordenarTabla);
    document.getElementById('btnCerrarDetalles').addEventListener('click', function() {
        document.getElementById('modalDetalles').classList.add('hidden');
    });
}

function cargarEncuestas() {
    fetch('/api/encuestas')
        .then(response => response.json())
        .then(data => {
            encuestasGlobales = data;
            actualizarEstadisticas();
            renderizarTabla(data);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('tablaEncuestas').innerHTML = `
                <tr class="text-center">
                    <td colspan="7" class="px-6 py-8 text-red-500">Error al cargar las encuestas</td>
                </tr>
            `;
        });
}

function actualizarEstadisticas() {
    document.getElementById('totalEncuestas').textContent = encuestasGlobales.length;
    
    const criticos = encuestasGlobales.filter(e => e.nivelRiesgo === 5).length;
    const altos = encuestasGlobales.filter(e => e.nivelRiesgo === 4).length;
    const medios = encuestasGlobales.filter(e => e.nivelRiesgo === 3).length;
    const bajos = encuestasGlobales.filter(e => e.nivelRiesgo === 2).length;
    
    document.getElementById('criticos').textContent = criticos;
    document.getElementById('altos').textContent = altos;
    document.getElementById('medios').textContent = medios;
    document.getElementById('bajos').textContent = bajos;
}

function renderizarTabla(encuestas) {
    const tabla = document.getElementById('tablaEncuestas');
    
    if (encuestas.length === 0) {
        tabla.innerHTML = `
            <tr class="text-center">
                <td colspan="7" class="px-6 py-8 text-gray-500">No hay encuestas disponibles</td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = encuestas.map(encuesta => {
        const riesgo = encuesta.nivelRiesgo || 1;
        const { color, etiqueta } = obtenerColorRiesgo(riesgo);
        const fecha = new Date(encuesta.fechaHora).toLocaleString('es-CO');
        
        return `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4">
                    <div class="w-6 h-6 rounded-full ${color} border-2 border-gray-300"></div>
                </td>
                <td class="px-6 py-4 font-semibold text-gray-800">${encuesta.rescatista.nombreCodigo}</td>
                <td class="px-6 py-4 text-gray-700">${encuesta.rescatista.rango}</td>
                <td class="px-6 py-4 text-gray-700">${encuesta.rescatista.unidad}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${fecha}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-sm font-semibold ${obtenerClaseRiesgo(riesgo)}">
                        ${etiqueta}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <button class="px-4 py-1 bg-green-700 text-white rounded hover:bg-green-800 text-sm transition" 
                        onclick="mostrarDetalles(${encuesta.idEncuesta})">
                        Ver
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function obtenerColorRiesgo(nivel) {
    const colores = {
        1: { color: 'bg-green-500', etiqueta: '✅ MÍNIMO' },
        2: { color: 'bg-blue-500', etiqueta: '⚠️ BAJO' },
        3: { color: 'bg-yellow-500', etiqueta: '🟠 MEDIO' },
        4: { color: 'bg-orange-500', etiqueta: '🔴 ALTO' },
        5: { color: 'bg-red-600', etiqueta: '🚨 CRÍTICO' }
    };
    return colores[nivel] || colores[1];
}

function obtenerClaseRiesgo(nivel) {
    const clases = {
        1: 'bg-green-100 text-green-800',
        2: 'bg-blue-100 text-blue-800',
        3: 'bg-yellow-100 text-yellow-800',
        4: 'bg-orange-100 text-orange-800',
        5: 'bg-red-100 text-red-800'
    };
    return clases[nivel] || clases[1];
}

function mostrarDetalles(idEncuesta) {
    const encuesta = encuestasGlobales.find(e => e.idEncuesta === idEncuesta);
    if (!encuesta) return;

    const modal = document.getElementById('modalDetalles');
    const contenido = document.getElementById('detallesContenido');

    let html = `
        <div class="mb-4 pb-4 border-b border-gray-200">
            <p><strong>Rescatista:</strong> ${encuesta.rescatista.nombreCodigo}</p>
            <p><strong>Rango:</strong> ${encuesta.rescatista.rango}</p>
            <p><strong>Unidad:</strong> ${encuesta.rescatista.unidad}</p>
            <p><strong>Fecha:</strong> ${new Date(encuesta.fechaHora).toLocaleString('es-CO')}</p>
            <p><strong>Nivel de Riesgo:</strong> <span class="${obtenerClaseRiesgo(encuesta.nivelRiesgo)} px-2 py-1 rounded">${obtenerColorRiesgo(encuesta.nivelRiesgo).etiqueta}</span></p>
        </div>
        <div class="space-y-2">
    `;

    for (let i = 1; i <= 23; i++) {
        const respuesta = encuesta['respuesta' + i];
        const escala = ['', 'Nunca', 'Rara vez', 'A veces', 'Frecuentemente', 'Siempre'];
        html += `
            <div class="border-b border-gray-100 pb-2">
                <p><strong>P${i}:</strong> ${preguntas[i-1]}</p>
                <p class="text-gray-600 ml-4">Respuesta: <strong>${escala[respuesta] || 'N/A'}</strong> (${respuesta}/5)</p>
            </div>
        `;
    }

    html += `</div>`;
    contenido.innerHTML = html;
    modal.classList.remove('hidden');
}

function filtrarTabla() {
    const busqueda = document.getElementById('busqueda').value.toLowerCase();
    const filtroRiesgo = document.getElementById('filtroRiesgo').value;

    let filtered = encuestasGlobales.filter(e => {
        const coincideBusqueda = e.rescatista.nombreCodigo.toLowerCase().includes(busqueda) ||
                                e.rescatista.rango.toLowerCase().includes(busqueda);
        const coincideRiesgo = filtroRiesgo === '' || e.nivelRiesgo.toString() === filtroRiesgo;
        return coincideBusqueda && coincideRiesgo;
    });

    ordenarTabla(filtered);
}

function ordenarTabla(encuestas = null) {
    const orden = document.getElementById('ordenar').value;
    let data = encuestas || encuestasGlobales;

    if (orden === 'fecha-desc') {
        data.sort((a, b) => b.fechaHora - a.fechaHora);
    } else if (orden === 'fecha-asc') {
        data.sort((a, b) => a.fechaHora - b.fechaHora);
    } else if (orden === 'riesgo-desc') {
        data.sort((a, b) => b.nivelRiesgo - a.nivelRiesgo);
    }

    renderizarTabla(data);
}
