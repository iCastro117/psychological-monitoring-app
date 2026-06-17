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

const escala = [
    { valor: 1, etiqueta: "Nunca", color: "bg-green-100 hover:bg-green-200", bordeColor: "border-green-300", textoColor: "text-green-900" },
    { valor: 2, etiqueta: "Rara vez", color: "bg-green-50 hover:bg-green-100", bordeColor: "border-green-200", textoColor: "text-gray-700" },
    { valor: 3, etiqueta: "A veces", color: "bg-yellow-100 hover:bg-yellow-200", bordeColor: "border-yellow-300", textoColor: "text-yellow-900" },
    { valor: 4, etiqueta: "Frecuentemente", color: "bg-orange-100 hover:bg-orange-200", bordeColor: "border-orange-300", textoColor: "text-orange-900" },
    { valor: 5, etiqueta: "Siempre", color: "bg-red-100 hover:bg-red-200", bordeColor: "border-red-300", textoColor: "text-red-900" }
];

let respuestasSeleccionadas = {};

document.addEventListener('DOMContentLoaded', function() {
    generarPreguntas();
    configurarEventos();
});

function generarPreguntas() {
    const container = document.getElementById('preguntasContainer');
    container.innerHTML = '';

    preguntas.forEach((pregunta, index) => {
        const numPregunta = index + 1;
        const divPregunta = document.createElement('div');
        divPregunta.className = 'bg-white border-l-4 border-green-700 p-6 rounded-lg shadow-md hover:shadow-lg transition';
        divPregunta.id = `pregunta-${numPregunta}`;

        let html = `
            <div class="mb-4">
                <label class="block text-gray-800 font-semibold mb-2">
                    <span class="text-green-700 font-bold">${numPregunta}.</span> ${pregunta}
                </label>
                <p class="text-xs text-gray-500 mb-3">Seleccione una opción:</p>
            </div>
            <div class="grid grid-cols-5 gap-2">
        `;

        escala.forEach((opcion) => {
            const inputId = `r${numPregunta}_${opcion.valor}`;
            html += `
                <label class="cursor-pointer">
                    <input type="radio" name="respuesta${numPregunta}" value="${opcion.valor}" class="hidden respuesta-radio" data-pregunta="${numPregunta}">
                    <div class="p-3 rounded-lg border-2 transition text-center ${opcion.color} ${opcion.bordeColor} hover:scale-105 transform" id="${inputId}">
                        <div class="font-bold text-lg">${opcion.valor}</div>
                        <div class="text-xs font-semibold">${opcion.etiqueta}</div>
                    </div>
                </label>
            `;
        });

        html += `</div>`;
        divPregunta.innerHTML = html;
        container.appendChild(divPregunta);

        // Event listeners para cada opción
        const radios = divPregunta.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener('change', function() {
                respuestasSeleccionadas[numPregunta] = parseInt(this.value);
                actualizarProgreso();
                actualizarVisualPregunta(numPregunta);
            });
        });
    });
}

function actualizarVisualPregunta(numPregunta) {
    const pregunta = document.getElementById(`pregunta-${numPregunta}`);
    if (!pregunta) return;

    pregunta.querySelectorAll('.border-2').forEach(div => {
        div.classList.remove('ring-4', 'ring-green-700', 'scale-105', 'shadow-lg');
    });

    const respuesta = respuestasSeleccionadas[numPregunta];
    if (respuesta) {
        const selected = document.getElementById(`r${numPregunta}_${respuesta}`);
        if (selected) {
            selected.classList.add('ring-4', 'ring-green-700', 'scale-105', 'shadow-lg');
        }
    }
}

function actualizarProgreso() {
    const total = preguntas.length;
    const respondidas = Object.keys(respuestasSeleccionadas).length;
    const porcentaje = Math.round((respondidas / total) * 100);

    document.getElementById('progreso').textContent = respondidas;
    document.getElementById('porcentaje').textContent = porcentaje + '%';
    document.getElementById('barraProgreso').style.width = porcentaje + '%';
}

function configurarEventos() {
    const form = document.getElementById('encuestaForm');
    const btnEnviar = document.getElementById('btnEnviar');
    const modalConfirmacion = document.getElementById('modalConfirmacion');
    const btnConfirmar = document.getElementById('btnConfirmar');
    const btnCancelar = document.getElementById('btnCancelar');
    const btnNueva = document.getElementById('btnNueva');
    const btnCerrarError = document.getElementById('btnCerrarError');

    btnEnviar.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (!validarFormulario()) {
            return;
        }

        modalConfirmacion.classList.remove('hidden');
    });

    btnConfirmar.addEventListener('click', enviarEncuesta);
    
    btnCancelar.addEventListener('click', function() {
        modalConfirmacion.classList.add('hidden');
    });

    btnNueva.addEventListener('click', function() {
        document.getElementById('modalExito').classList.add('hidden');
        form.reset();
        respuestasSeleccionadas = {};
        generarPreguntas();
        actualizarProgreso();
        window.scrollTo(0, 0);
    });

    btnCerrarError.addEventListener('click', function() {
        document.getElementById('modalError').classList.add('hidden');
    });

    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (e.target.id === 'modalConfirmacion') {
            modalConfirmacion.classList.add('hidden');
        }
    });
}

function validarFormulario() {
    const nombreCodigo = document.getElementById('nombreCodigo').value.trim();
    const rango = document.getElementById('rango').value;
    const unidad = document.getElementById('unidad').value.trim();

    if (!nombreCodigo) {
        mostrarError("Por favor ingrese su nombre o código");
        return false;
    }

    if (!rango) {
        mostrarError("Por favor seleccione su rango militar");
        return false;
    }

    if (!unidad) {
        mostrarError("Por favor ingrese su unidad");
        return false;
    }

    if (Object.keys(respuestasSeleccionadas).length !== preguntas.length) {
        mostrarError("Por favor responda todas las preguntas antes de enviar");
        return false;
    }

    return true;
}

function enviarEncuesta() {
    const nombreCodigo = document.getElementById('nombreCodigo').value.trim();
    const rango = document.getElementById('rango').value;
    const unidad = document.getElementById('unidad').value.trim();

    const respuestas = [];
    for (let i = 1; i <= preguntas.length; i++) {
        respuestas.push(respuestasSeleccionadas[i] || 0);
    }

    const datos = {
        nombreCodigo: nombreCodigo,
        rango: rango,
        unidad: unidad,
        respuestas: respuestas
    };

    fetch('/api/enviar-encuesta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('modalConfirmacion').classList.add('hidden');
        
        if (data.success) {
            mostrarExito(data.nivelRiesgo, data.etiquetaRiesgo);
        } else {
            mostrarError(data.mensaje);
        }
    })
    .catch(error => {
        document.getElementById('modalConfirmacion').classList.add('hidden');
        mostrarError("Error al enviar la encuesta: " + error.message);
        console.error('Error:', error);
    });
}

function mostrarExito(nivelRiesgo, etiqueta) {
    const modalExito = document.getElementById('modalExito');
    const textoRiesgo = document.getElementById('nivelRiesgoTexto');

    const mensajes = {
        1: "Nivel de Riesgo: MÍNIMO ✅ - Continúe con sus operaciones",
        2: "Nivel de Riesgo: BAJO ⚠️ - Monitoreo recomendado",
        3: "Nivel de Riesgo: MEDIO 🟠 - Requiere atención",
        4: "Nivel de Riesgo: ALTO 🔴 - Contactar psicólogo",
        5: "Nivel de Riesgo: CRÍTICO 🚨 - Intervención inmediata"
    };

    textoRiesgo.textContent = mensajes[nivelRiesgo] || "Nivel desconocido";
    textoRiesgo.className = 'text-lg font-semibold mb-6 ' + (nivelRiesgo >= 3 ? 'text-red-600' : 'text-green-600');
    
    modalExito.classList.remove('hidden');
}

function mostrarError(mensaje) {
    const modalError = document.getElementById('modalError');
    document.getElementById('mensajeError').textContent = mensaje;
    modalError.classList.remove('hidden');
}
