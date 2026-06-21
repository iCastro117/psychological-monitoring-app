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

// Escala de respuesta: ya no usa colores semáforo (verde/amarillo/naranja/rojo).
// Todas las tarjetas tienen el mismo estilo neutro con borde verde y sombra;
// el color cambia solo según el ESTADO (normal / hover / seleccionada),
// nunca según el valor de la respuesta. Ver marcarSeleccionada() y las
// clases CSS .tarjeta-respuesta en index.html.
const escala = [
    { valor: 1, etiqueta: "Nunca" },
    { valor: 2, etiqueta: "Rara vez" },
    { valor: 3, etiqueta: "A veces" },
    { valor: 4, etiqueta: "Frecuentemente" },
    { valor: 5, etiqueta: "Siempre" }
];

let respuestasSeleccionadas = {};
let cedulaDuplicada = false;    // true si el backend dice que la cédula ya existe
let cedulaTimer     = null;     // timeout para la validación de min-10 dígitos

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
        div.className = 'bg-white border-l-4 border-green-700 p-5 rounded-xl shadow-sm hover:shadow-md transition';
        div.id = `pregunta-${num}`;

        let html = `
            <p class="text-gray-800 font-semibold mb-3 text-sm sm:text-base">
                <span class="text-green-700 font-bold">${num}.</span> ${pregunta}
            </p>
            <div class="grid grid-cols-5 gap-2">`;

        escala.forEach(op => {
            html += `
                <label class="cursor-pointer select-none">
                    <input type="radio" name="resp${num}" value="${op.valor}"
                           class="hidden respuesta-radio" data-pregunta="${num}">
                    <div id="r${num}_${op.valor}"
                         class="tarjeta-respuesta border-2 border-green-300 rounded-xl p-2 sm:p-3
                                text-center transition transform hover:scale-105 shadow-sm hover:shadow-lg
                                hover:bg-green-50 hover:border-green-400">
                        <div class="font-bold text-base sm:text-lg text-gray-700 valor-num">${op.valor}</div>
                        <div class="text-xs font-medium text-gray-500 hidden sm:block etiqueta-txt">${op.etiqueta}</div>
                    </div>
                </label>`;
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
        // Quita el estado "seleccionada" de todas las tarjetas de esta pregunta
        card.classList.remove('bg-green-800', 'border-green-800', 'opacity-50');
        card.querySelector('.valor-num')?.classList.remove('text-white');
        card.querySelector('.etiqueta-txt')?.classList.remove('text-green-100');
        card.querySelector('.valor-num')?.classList.add('text-gray-700');
        card.querySelector('.etiqueta-txt')?.classList.add('text-gray-500');
        if (v !== valor) card.classList.add('opacity-50');
    }

    // Pinta la tarjeta elegida de verde oscuro (única respuesta seleccionada)
    const selected = document.getElementById(`r${num}_${valor}`);
    if (selected) {
        selected.classList.remove('opacity-50');
        selected.classList.add('bg-green-800', 'border-green-800');
        selected.querySelector('.valor-num')?.classList.remove('text-gray-700');
        selected.querySelector('.etiqueta-txt')?.classList.remove('text-gray-500');
        selected.querySelector('.valor-num')?.classList.add('text-white');
        selected.querySelector('.etiqueta-txt')?.classList.add('text-green-100');
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
// Solicitud: error aparece EN EL MISMO CAMPO (borde rojo + texto chiquito debajo)
// SIN popup. El popup solo se usa para otras validaciones.

function configurarValidacionCedula() {
    const inputCedula = document.getElementById('cedula');

    // Mientras escribe: timer de 2 segundos para validar longitud mínima
    inputCedula.addEventListener('input', function () {
        clearTimeout(cedulaTimer);
        limpiarErrorCedulaInline();

        const val = this.value.trim();

        if (val.length === 0) return;

        // Arranca un timer: si después de 2 s aún hay menos de 10 dígitos → error inline
        cedulaTimer = setTimeout(() => {
            if (val.length > 0 && val.length < 10) {
                mostrarErrorCedulaInline('Mínimo 10 números requeridos');
            }
        }, 2000);
    });

    // Al salir del campo: verifica si la cédula ya está registrada
    inputCedula.addEventListener('blur', function () {
        clearTimeout(cedulaTimer);
        const val = this.value.trim();

        if (val.length === 0) return;

        // Primero valida longitud
        if (val.length < 10) {
            mostrarErrorCedulaInline('Mínimo 10 números requeridos');
            return;
        }

        // Luego consulta el backend si ya existe
        verificarCedulaDuplicada(val);
    });

    // Si el usuario vuelve a editar, limpia el estado
    inputCedula.addEventListener('focus', function () {
        // Solo limpia el error de duplicado, no el de longitud
        if (cedulaDuplicada) {
            limpiarErrorCedulaInline();
        }
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
                indicador.className   = 'text-xs text-green-600 mt-1 font-medium min-h-[1rem]';
            }
        })
        .catch(() => {
            // Si falla la red, no bloquea (se validará en el servidor de todas formas)
            cedulaDuplicada = false;
            indicador.textContent = '';
        });
}

function mostrarErrorCedulaInline(msg) {
    const input   = document.getElementById('cedula');
    const errorEl = document.getElementById('cedulaError');
    const ind     = document.getElementById('cedulaIndicador');

    input.classList.remove('border-gray-300');
    input.classList.add('border-red-500');
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
    ind.textContent = '';
}

function limpiarErrorCedulaInline() {
    const input   = document.getElementById('cedula');
    const errorEl = document.getElementById('cedulaError');
    const ind     = document.getElementById('cedulaIndicador');

    input.classList.remove('border-red-500');
    input.classList.add('border-gray-300');
    errorEl.classList.add('hidden');
    errorEl.textContent = '';
    cedulaDuplicada = false;
    ind.textContent = '';
}

// ─── Eventos de los modales ───────────────────────────────────────────────────

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

// ─── Validación antes de mostrar modal de confirmación ───────────────────────

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
    if (cedula.length < 10) {
        // Error de longitud: se muestra inline (no popup)
        mostrarErrorCedulaInline('Mínimo 10 números requeridos');
        document.getElementById('cedula').focus();
        return false;
    }
    if (cedulaDuplicada) {
        // Error de duplicado: se muestra inline (no popup)
        mostrarErrorCedulaInline('Esta cédula ya fue registrada en el sistema');
        document.getElementById('cedula').focus();
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

// ─── Helper popup de error general ───────────────────────────────────────────

function mostrarError(msg) {
    document.getElementById('mensajeError').textContent = msg;
    document.getElementById('modalError').classList.remove('hidden');
}
