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

const escala = [
    { valor: 1, etiqueta: "Nunca",          bg: "bg-green-100",  hover: "hover:bg-green-200",  borde: "border-green-300",  texto: "text-green-900"  },
    { valor: 2, etiqueta: "Rara vez",       bg: "bg-green-50",   hover: "hover:bg-green-100",  borde: "border-green-200",  texto: "text-gray-700"   },
    { valor: 3, etiqueta: "A veces",        bg: "bg-yellow-100", hover: "hover:bg-yellow-200", borde: "border-yellow-300", texto: "text-yellow-900" },
    { valor: 4, etiqueta: "Frecuentemente", bg: "bg-orange-100", hover: "hover:bg-orange-200", borde: "border-orange-300", texto: "text-orange-900" },
    { valor: 5, etiqueta: "Siempre",        bg: "bg-red-100",    hover: "hover:bg-red-200",    borde: "border-red-300",    texto: "text-red-900"    }
];

let respuestasSeleccionadas = {};

// ─── Inicialización ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    generarPreguntas();
    configurarEventos();
});

// ─── Genera las 23 preguntas con tarjetas de respuesta ───────────────────────

function generarPreguntas() {
    const container = document.getElementById('preguntasContainer');
    container.innerHTML = '';

    preguntas.forEach((pregunta, index) => {
        const num = index + 1;
        const div = document.createElement('div');
        div.className = 'bg-white border-l-4 border-green-700 p-5 rounded-xl shadow-sm hover:shadow-md transition';
        div.id = `pregunta-${num}`;

        let html = `
            <p class="text-gray-800 font-semibold mb-3 text-sm sm:text-base">
                <span class="text-green-700 font-bold">${num}.</span> ${pregunta}
            </p>
            <div class="grid grid-cols-5 gap-2">
        `;

        escala.forEach(op => {
            html += `
                <label class="cursor-pointer select-none">
                    <input type="radio" name="resp${num}" value="${op.valor}"
                           class="hidden respuesta-radio" data-pregunta="${num}">
                    <div id="r${num}_${op.valor}"
                         class="${op.bg} ${op.hover} ${op.borde} border-2 rounded-xl p-2 sm:p-3
                                text-center transition transform hover:scale-105">
                        <div class="font-bold text-base sm:text-lg ${op.texto}">${op.valor}</div>
                        <div class="text-xs font-medium ${op.texto} hidden sm:block">${op.etiqueta}</div>
                    </div>
                </label>
            `;
        });

        html += `</div>`;
        div.innerHTML = html;
        container.appendChild(div);

        div.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', function () {
                respuestasSeleccionadas[num] = parseInt(this.value);
                actualizarProgreso();
                marcarSeleccionada(num, parseInt(this.value));
            });
        });
    });
}

function marcarSeleccionada(num, valor) {
    for (let v = 1; v <= 5; v++) {
        const card = document.getElementById(`r${num}_${v}`);
        if (!card) continue;
        card.classList.remove('ring-4', 'ring-green-700', 'ring-offset-2', 'opacity-50');
        if (v !== valor) card.classList.add('opacity-50');
    }
    const selected = document.getElementById(`r${num}_${valor}`);
    if (selected) {
        selected.classList.remove('opacity-50');
        selected.classList.add('ring-4', 'ring-green-700', 'ring-offset-2');
    }
}

function actualizarProgreso() {
    const total       = preguntas.length;
    const respondidas = Object.keys(respuestasSeleccionadas).length;
    const pct         = Math.round((respondidas / total) * 100);
    document.getElementById('progreso').textContent     = respondidas;
    document.getElementById('porcentaje').textContent   = pct + '%';
    document.getElementById('barraProgreso').style.width = pct + '%';
}

// ─── Eventos ─────────────────────────────────────────────────────────────────

function configurarEventos() {
    const modalConf  = document.getElementById('modalConfirmacion');
    const modalExito = document.getElementById('modalExito');
    const modalError = document.getElementById('modalError');

    // Botón Enviar → abre modal confirmación
    document.getElementById('btnEnviar').addEventListener('click', function () {
        if (!validarFormulario()) return;
        modalConf.classList.remove('hidden');
    });

    // Botón Cancelar → cierra modal
    document.getElementById('btnCancelar').addEventListener('click', function () {
        modalConf.classList.add('hidden');
    });

    // ──────────────────────────────────────────────────────────────────────────
    // BOTÓN CONFIRMAR — aquí estaba el bug principal
    // Se separó en su propio listener para evitar conflictos con el overlay
    // ──────────────────────────────────────────────────────────────────────────
    document.getElementById('btnConfirmar').addEventListener('click', function (e) {
        e.stopPropagation(); // evita que el clic suba al overlay
        enviarEncuesta();
    });

    // Botón Nueva encuesta
    document.getElementById('btnNueva').addEventListener('click', function () {
        modalExito.classList.add('hidden');
        document.getElementById('encuestaForm').reset();
        respuestasSeleccionadas = {};
        generarPreguntas();
        actualizarProgreso();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Botón cerrar error
    document.getElementById('btnCerrarError').addEventListener('click', function () {
        modalError.classList.add('hidden');
    });
}

// ─── Validación ───────────────────────────────────────────────────────────────

function validarFormulario() {
    const nombre = document.getElementById('nombreCompleto').value.trim();
    const cedula = document.getElementById('cedula').value.trim();

    if (!nombre) {
        mostrarError('Por favor ingrese su nombre completo.');
        return false;
    }
    if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/.test(nombre)) {
        mostrarError('El nombre solo debe contener letras y espacios.');
        return false;
    }
    if (!cedula) {
        mostrarError('Por favor ingrese su cédula de ciudadanía.');
        return false;
    }
    if (!/^\d+$/.test(cedula)) {
        mostrarError('La cédula solo debe contener números.');
        return false;
    }
    if (cedula.length < 10) {
        mostrarError('La cédula debe tener mínimo 10 dígitos.');
        return false;
    }
    if (Object.keys(respuestasSeleccionadas).length !== preguntas.length) {
        mostrarError(`Por favor responda todas las preguntas. Lleva ${Object.keys(respuestasSeleccionadas).length} de ${preguntas.length}.`);
        return false;
    }
    return true;
}

// ─── Envío al backend ────────────────────────────────────────────────────────

function enviarEncuesta() {
    const btnConfirmar = document.getElementById('btnConfirmar');
    const modalConf    = document.getElementById('modalConfirmacion');

    // Estado de carga
    btnConfirmar.disabled    = true;
    btnConfirmar.textContent = '⏳ Enviando...';

    const respuestas = [];
    for (let i = 1; i <= preguntas.length; i++) {
        respuestas.push(respuestasSeleccionadas[i] || 0);
    }

    const payload = {
        nombreCompleto: document.getElementById('nombreCompleto').value.trim(),
        cedula:         document.getElementById('cedula').value.trim(),
        respuestas:     respuestas
    };

    fetch('/api/enviar-encuesta', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        modalConf.classList.add('hidden');
        btnConfirmar.disabled    = false;
        btnConfirmar.textContent = 'Confirmar';

        if (data.success) {
            // ✅ El usuario NO ve el nivel de riesgo — solo ve confirmación genérica
            document.getElementById('modalExito').classList.remove('hidden');
        } else {
            mostrarError(data.mensaje || 'Error desconocido al guardar la encuesta.');
        }
    })
    .catch(err => {
        modalConf.classList.add('hidden');
        btnConfirmar.disabled    = false;
        btnConfirmar.textContent = 'Confirmar';
        mostrarError('No se pudo conectar con el servidor. Verifique su conexión e intente de nuevo.\n\nDetalle: ' + err.message);
        console.error('Error fetch:', err);
    });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mostrarError(msg) {
    document.getElementById('mensajeError').textContent = msg;
    document.getElementById('modalError').classList.remove('hidden');
}
