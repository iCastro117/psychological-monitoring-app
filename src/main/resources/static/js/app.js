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
    { valor: 1, etiqueta: "Nunca" },
    { valor: 2, etiqueta: "Rara vez" },
    { valor: 3, etiqueta: "A veces" },
    { valor: 4, etiqueta: "Frecuentemente" },
    { valor: 5, etiqueta: "Siempre" }
];

let respuestasSeleccionadas = {};
let cedulaDuplicada = false;
let cedulaTimer     = null;

// ─── Inicialización ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    generarPreguntas();
    configurarEventos();
    configurarValidacionCedula();
});

// ─── Genera las 23 preguntas ─────────────────────────────────────────────────

function generarPreguntas() {
    const container = document.getElementById('preguntasContainer');
    container.innerHTML = '';

    preguntas.forEach((pregunta, index) => {
        const num = index + 1;
        const div = document.createElement('div');
        div.className = 'bloque-pregunta';
        div.id = `pregunta-${num}`;

        // Header de la pregunta (fondo azul claro, borde izquierdo azul)
        let html = `
            <div class="bloque-pregunta-header">
                <p class="text-gray-800 font-semibold text-sm sm:text-base m-0">
                    <span class="text-red-500 font-bold mr-1">*</span>
                    <span style="color:#084E86; font-weight:700;">${num}.</span>
                    ${pregunta}
                </p>
            </div>
            <div class="bloque-pregunta-body">
                <div class="grid grid-cols-5 gap-2">`;

        escala.forEach(op => {
            html += `
                <label class="cursor-pointer select-none">
                    <input type="radio" name="resp${num}" value="${op.valor}"
                           class="hidden" data-pregunta="${num}">
                    <div id="r${num}_${op.valor}" class="tarjeta-resp">
                        <div class="val-num font-bold text-base sm:text-lg" style="color:#084E86;">${op.valor}</div>
                        <div class="val-txt text-xs font-medium text-gray-500 hidden sm:block">${op.etiqueta}</div>
                    </div>
                </label>`;
        });

        html += `</div></div>`;
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
        card.classList.remove('seleccionada', 'opacidad');
        // Restaurar colores normales
        const vn = card.querySelector('.val-num');
        const vt = card.querySelector('.val-txt');
        if (vn) vn.style.color = '#084E86';
        if (vt) { vt.style.color = ''; vt.className = 'val-txt text-xs font-medium text-gray-500 hidden sm:block'; }
        if (v !== valor) card.classList.add('opacidad');
    }

    const selected = document.getElementById(`r${num}_${valor}`);
    if (selected) {
        selected.classList.remove('opacidad');
        selected.classList.add('seleccionada');
    }
}

function actualizarProgreso() {
    const total       = preguntas.length;
    const respondidas = Object.keys(respuestasSeleccionadas).length;
    const pct         = Math.round((respondidas / total) * 100);
    document.getElementById('progreso').textContent      = respondidas;
    document.getElementById('porcentaje').textContent    = pct + '%';
    document.getElementById('barraProgreso').style.width = pct + '%';
}

// ─── Validación inline de cédula ─────────────────────────────────────────────

function configurarValidacionCedula() {
    const inputCedula = document.getElementById('cedula');

    inputCedula.addEventListener('input', function () {
        clearTimeout(cedulaTimer);
        limpiarErrorCedulaInline();
        const val = this.value.trim();
        if (val.length === 0) return;
        cedulaTimer = setTimeout(() => {
            if (val.length > 0 && val.length < 10) {
                mostrarErrorCedulaInline('Mínimo 10 números requeridos');
            }
        }, 2000);
    });

    inputCedula.addEventListener('blur', function () {
        clearTimeout(cedulaTimer);
        const val = this.value.trim();
        if (val.length === 0) return;
        if (val.length < 10) { mostrarErrorCedulaInline('Mínimo 10 números requeridos'); return; }
        verificarCedulaDuplicada(val);
    });

    inputCedula.addEventListener('focus', function () {
        if (cedulaDuplicada) limpiarErrorCedulaInline();
    });
}

function verificarCedulaDuplicada(cedula) {
    const indicador = document.getElementById('cedulaIndicador');
    indicador.textContent = '🔍 Verificando...';
    indicador.className   = 'text-xs text-gray-400 mt-1 min-h-[1rem]';

    fetch(`/api/cedula-existe/${cedula}`)
        .then(r => r.json())
        .then(data => {
            if (data.existe) {
                cedulaDuplicada = true;
                mostrarErrorCedulaInline('Esta cédula ya fue registrada en el sistema');
            } else {
                cedulaDuplicada = false;
                indicador.textContent = '✓ Cédula disponible';
                indicador.className   = 'text-xs font-medium mt-1 min-h-[1rem]';
                indicador.style.color = '#084E86';
            }
        })
        .catch(() => { cedulaDuplicada = false; indicador.textContent = ''; });
}

function mostrarErrorCedulaInline(msg) {
    const input   = document.getElementById('cedula');
    const errorEl = document.getElementById('cedulaError');
    const ind     = document.getElementById('cedulaIndicador');
    input.style.borderColor = '#ef4444';
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
    ind.textContent = '';
}

function limpiarErrorCedulaInline() {
    const input   = document.getElementById('cedula');
    const errorEl = document.getElementById('cedulaError');
    const ind     = document.getElementById('cedulaIndicador');
    input.style.borderColor = '';
    errorEl.classList.add('hidden');
    errorEl.textContent = '';
    cedulaDuplicada = false;
    ind.textContent = '';
    ind.style.color = '';
}

// ─── Eventos ─────────────────────────────────────────────────────────────────

function configurarEventos() {
    const modalConf  = document.getElementById('modalConfirmacion');
    const modalExito = document.getElementById('modalExito');
    const modalError = document.getElementById('modalError');

    document.getElementById('btnEnviar').addEventListener('click', function () {
        if (!validarFormulario()) return;
        modalConf.classList.remove('hidden');
    });

    document.getElementById('btnCancelar').addEventListener('click', function () {
        modalConf.classList.add('hidden');
    });

    document.getElementById('btnConfirmar').addEventListener('click', function (e) {
        e.stopPropagation();
        enviarEncuesta();
    });

    document.getElementById('btnNueva').addEventListener('click', function () {
        modalExito.classList.add('hidden');
        document.getElementById('encuestaForm').reset();
        respuestasSeleccionadas = {};
        limpiarErrorCedulaInline();
        generarPreguntas();
        actualizarProgreso();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('btnCerrarError').addEventListener('click', function () {
        modalError.classList.add('hidden');
    });
}

// ─── Validación ───────────────────────────────────────────────────────────────

function validarFormulario() {
    const nombre = document.getElementById('nombreCompleto').value.trim();
    const cedula = document.getElementById('cedula').value.trim();

    if (!nombre) { mostrarError('Por favor ingrese su nombre completo.'); return false; }
    if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/.test(nombre)) { mostrarError('El nombre solo debe contener letras y espacios.'); return false; }
    if (!cedula) { mostrarError('Por favor ingrese su cédula de ciudadanía.'); return false; }
    if (cedula.length < 10) { mostrarErrorCedulaInline('Mínimo 10 números requeridos'); document.getElementById('cedula').focus(); return false; }
    if (cedulaDuplicada) { mostrarErrorCedulaInline('Esta cédula ya fue registrada en el sistema'); document.getElementById('cedula').focus(); return false; }
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

    btnConfirmar.disabled    = true;
    btnConfirmar.textContent = '⏳ Enviando...';

    const respuestas = [];
    for (let i = 1; i <= preguntas.length; i++) {
        respuestas.push(respuestasSeleccionadas[i] || 0);
    }

    const payload = {
        nombreCompleto: document.getElementById('nombreCompleto').value.trim(),
        cedula:         document.getElementById('cedula').value.trim(),
        respuestas
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
            document.getElementById('modalExito').classList.remove('hidden');
        } else {
            mostrarError(data.mensaje || 'Error desconocido al guardar la encuesta.');
        }
    })
    .catch(err => {
        modalConf.classList.add('hidden');
        btnConfirmar.disabled    = false;
        btnConfirmar.textContent = 'Confirmar';
        mostrarError('No se pudo conectar con el servidor. Verifique su conexión e intente de nuevo.');
        console.error('Error fetch:', err);
    });
}

function mostrarError(msg) {
    document.getElementById('mensajeError').textContent = msg;
    document.getElementById('modalError').classList.remove('hidden');
}
