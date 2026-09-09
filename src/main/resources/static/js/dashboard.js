// Panel de dashboard.html: trae las encuestas de GET /api/encuestas y de ahí salen las tarjetas,
// la gráfica de dona y la tabla con buscador y filtro. Desde la tabla también se edita el
// rescatista (PUT /api/rescatistas/{id}) y se borra la encuesta (DELETE /api/encuestas/{id}).

// Todas las encuestas que llegaron del backend. Lo demás se pinta a partir de esta lista.
let encuestasGlobales = [];
let chartInstance = null;

// ─── Configuración de niveles de riesgo ──────────────────────────────────────

// Color y etiqueta de cada nivel (1 a 5). El nivel lo calcula el backend y viene en cada encuesta.
const RIESGO = {
    1: { etiqueta: 'MÍNIMO',  color: '#16a34a', bg: 'bg-emerald-100', texto: 'text-emerald-800', semaforo: 'bg-green-500'  },
    2: { etiqueta: 'BAJO',    color: '#2563eb', bg: 'bg-blue-100',    texto: 'text-blue-800',    semaforo: 'bg-blue-500'   },
    3: { etiqueta: 'MEDIO',   color: '#ca8a04', bg: 'bg-yellow-100',  texto: 'text-yellow-800',  semaforo: 'bg-yellow-500' },
    4: { etiqueta: 'ALTO',    color: '#ea580c', bg: 'bg-orange-100',  texto: 'text-orange-800',  semaforo: 'bg-orange-500' },
    5: { etiqueta: 'CRÍTICO', color: '#dc2626', bg: 'bg-red-100',     texto: 'text-red-800',     semaforo: 'bg-red-600'    }
};

// ─── Inicio ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    cargarEncuestas();

    document.getElementById('btnRefrescar').addEventListener('click', cargarEncuestas);
    document.getElementById('busqueda').addEventListener('input', filtrarYRenderizar);
    document.getElementById('filtroRiesgo').addEventListener('change', filtrarYRenderizar);

    // Modal editar
    document.getElementById('btnCancelarEditar').addEventListener('click', () =>
        document.getElementById('modalEditar').classList.add('hidden'));
    document.getElementById('btnGuardarEditar').addEventListener('click', guardarEdicion);

    // Modal eliminar
    document.getElementById('btnCancelarEliminar').addEventListener('click', () =>
        document.getElementById('modalEliminar').classList.add('hidden'));
    document.getElementById('btnConfirmarEliminar').addEventListener('click', confirmarEliminar);
});

// ─── Carga de datos ───────────────────────────────────────────────────────────

// Trae las encuestas y vuelve a pintar tarjetas, gráfica y tabla. Se repite al refrescar y después de editar o eliminar.
function cargarEncuestas() {
    fetch('/api/encuestas')
        .then(r => r.json())
        .then(data => {
            encuestasGlobales = data;
            actualizarEstadisticas();
            actualizarGrafica();
            filtrarYRenderizar();
        })
        .catch(err => {
            document.getElementById('tablaEncuestas').innerHTML =
                `<tr><td colspan="6" class="px-4 py-10 text-center text-red-500">
                    Error al cargar los datos. Verifique la conexión con el servidor.
                 </td></tr>`;
            console.error('Error:', err);
        });
}

// ─── Estadísticas ────────────────────────────────────────────────────────────

// Cuenta cuántas encuestas hay de cada nivel y las pone en las tarjetas de arriba.
function actualizarEstadisticas() {
    document.getElementById('totalEncuestas').textContent = encuestasGlobales.length;
    [1, 2, 3, 4, 5].forEach(n => {
        const ids = { 1: 'minimos', 2: 'bajos', 3: 'medios', 4: 'altos', 5: 'criticos' };
        document.getElementById(ids[n]).textContent =
            encuestasGlobales.filter(e => e.nivelRiesgo === n).length;
    });
}

// ─── Gráfica de dona ─────────────────────────────────────────────────────────

// La dona con el conteo por nivel. La leyenda se arma aparte porque muestra el número y el porcentaje.
function actualizarGrafica() {
    const counts = [1, 2, 3, 4, 5].map(n =>
        encuestasGlobales.filter(e => e.nivelRiesgo === n).length);

    const labels  = ['Mínimo', 'Bajo', 'Medio', 'Alto', 'Crítico'];
    const colors  = ['#16a34a', '#2563eb', '#ca8a04', '#ea580c', '#dc2626'];

    const ctx = document.getElementById('riesgoChart').getContext('2d');

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{ data: counts, backgroundColor: colors, borderWidth: 2 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } }
        }
    });

    // Leyenda personalizada
    const leyenda = document.getElementById('leyendaChart');
    leyenda.innerHTML = labels.map((label, i) => `
        <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full flex-shrink-0" style="background:${colors[i]}"></span>
            <span class="text-gray-700 font-medium">${label}</span>
            <span class="ml-auto font-bold text-gray-800">${counts[i]}</span>
            <span class="text-gray-400 text-xs">(${encuestasGlobales.length > 0
                ? Math.round(counts[i] / encuestasGlobales.length * 100) : 0}%)</span>
        </div>
    `).join('');
}

// ─── Filtrado y renderizado ───────────────────────────────────────────────────

// Aplica el buscador (nombre o cédula) y el filtro de nivel sobre encuestasGlobales y manda el resultado a la tabla.
function filtrarYRenderizar() {
    const busqueda = document.getElementById('busqueda').value.toLowerCase();
    const filtroN  = document.getElementById('filtroRiesgo').value;

    let filtradas = encuestasGlobales.filter(e => {
        const nombre = (e.rescatista?.nombreCompleto || '').toLowerCase();
        const cedula = (e.rescatista?.cedula || '').toLowerCase();
        const coinBusqueda = nombre.includes(busqueda) || cedula.includes(busqueda);
        const coinRiesgo   = filtroN === '' || String(e.nivelRiesgo) === filtroN;
        return coinBusqueda && coinRiesgo;
    });

    document.getElementById('contadorTabla').textContent =
        `${filtradas.length} registro(s)`;

    renderizarTabla(filtradas);
}

// Pinta las filas. Los botones VER, EDITAR y ELIMINAR llaman a las funciones de abajo con el id de la encuesta.
function renderizarTabla(encuestas) {
    const tbody = document.getElementById('tablaEncuestas');

    if (encuestas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-10 text-center text-gray-400">
            No hay registros que coincidan con los filtros.</td></tr>`;
        return;
    }

    tbody.innerHTML = encuestas.map(e => {
        const nivel  = e.nivelRiesgo || 1;
        const r      = RIESGO[nivel] || RIESGO[1];
        const fecha  = e.fechaHora
            ? new Date(e.fechaHora).toLocaleString('es-CO')
            : '—';
        const nombre = e.rescatista?.nombreCompleto || '—';
        const cedula = e.rescatista?.cedula || '—';
        const rid    = e.rescatista?.id || '';

        return `
        <tr class="hover:bg-gray-50 transition border-b border-gray-100">
            <td class="px-4 py-3">
                <span class="w-5 h-5 inline-block rounded-full ${r.semaforo}"
                      title="${r.etiqueta}"></span>
            </td>
            <td class="px-4 py-3 font-semibold text-gray-800">${nombre}</td>
            <td class="px-4 py-3 text-gray-600">${cedula}</td>
            <td class="px-4 py-3 text-gray-500 text-xs">${fecha}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 rounded-full text-xs font-bold ${r.bg} ${r.texto}">
                    ${r.etiqueta}
                </span>
            </td>
            <td class="px-4 py-3">
                <div class="flex gap-1 justify-center">
                    <button onclick="verPerfil(${e.idEncuesta})"
                        class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition">
                        VER
                    </button>
                    <button onclick="abrirEditar(${rid}, '${nombre.replace(/'/g,"\\'")}', '${cedula}')"
                        class="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs font-semibold transition">
                        EDITAR
                    </button>
                    <button onclick="abrirEliminar(${e.idEncuesta})"
                        class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition">
                        ELIMINAR
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

// ─── Acciones ────────────────────────────────────────────────────────────────

/** VER → abre el Panel 3 (perfil individual) */
function verPerfil(idEncuesta) {
    window.location.href = `/perfil?id=${idEncuesta}`;
}

/** EDITAR → abre modal con datos prellenados */
function abrirEditar(rescatistaId, nombre, cedula) {
    document.getElementById('editRescatistaId').value = rescatistaId;
    document.getElementById('editNombre').value       = nombre;
    document.getElementById('editCedula').value       = cedula;
    document.getElementById('modalEditar').classList.remove('hidden');
}

// Manda el nombre y la cédula del modal a PUT /api/rescatistas/{id} y recarga la tabla.
function guardarEdicion() {
    const id     = document.getElementById('editRescatistaId').value;
    const nombre = document.getElementById('editNombre').value.trim();
    const cedula = document.getElementById('editCedula').value.trim();

    if (!nombre || !cedula) { mostrarToast('Complete todos los campos.', 'red'); return; }
    if (cedula.length < 10)  { mostrarToast('La cédula debe tener mínimo 10 dígitos.', 'red'); return; }

    document.getElementById('btnGuardarEditar').textContent = 'Guardando...';

    fetch(`/api/rescatistas/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nombreCompleto: nombre, cedula })
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById('btnGuardarEditar').textContent = 'Guardar cambios';
        document.getElementById('modalEditar').classList.add('hidden');
        if (data.success) {
            mostrarToast('Datos actualizados correctamente ✓', 'green');
            cargarEncuestas();
        } else {
            mostrarToast(data.mensaje || 'Error al actualizar.', 'red');
        }
    })
    .catch(() => {
        document.getElementById('btnGuardarEditar').textContent = 'Guardar cambios';
        mostrarToast('Error de conexión.', 'red');
    });
}

/** ELIMINAR → abre modal de confirmación */
function abrirEliminar(idEncuesta) {
    document.getElementById('eliminarId').value = idEncuesta;
    document.getElementById('modalEliminar').classList.remove('hidden');
}

// Borra la encuesta con DELETE /api/encuestas/{id} y recarga la tabla.
function confirmarEliminar() {
    const id = document.getElementById('eliminarId').value;
    document.getElementById('btnConfirmarEliminar').textContent = 'Eliminando...';

    fetch(`/api/encuestas/${id}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(data => {
            document.getElementById('btnConfirmarEliminar').textContent = 'Sí, eliminar';
            document.getElementById('modalEliminar').classList.add('hidden');
            if (data.success) {
                mostrarToast('Registro eliminado ✓', 'green');
                cargarEncuestas();
            } else {
                mostrarToast(data.mensaje || 'Error al eliminar.', 'red');
            }
        })
        .catch(() => {
            document.getElementById('btnConfirmarEliminar').textContent = 'Sí, eliminar';
            mostrarToast('Error de conexión.', 'red');
        });
}

// ─── Toast de notificación ───────────────────────────────────────────────────

function mostrarToast(mensaje, color = 'green') {
    const toast = document.getElementById('toast');
    toast.textContent = mensaje;
    toast.className = `fixed bottom-6 right-6 px-5 py-3 rounded-xl text-white font-semibold
                       shadow-lg z-50 text-sm transition
                       ${color === 'green' ? 'bg-green-700' : 'bg-red-700'}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}
