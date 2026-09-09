// Ingreso en dos pasos de login.html: el correo va a POST /api/auth/solicitar-codigo y el
// código de 4 dígitos a POST /api/auth/verificar-codigo. Si el código es correcto guarda el
// token en el navegador (el que después revisa auth-guard.js) y entra a /dashboard.

// El correo del paso 1, que se necesita para verificar el código en el paso 2.
let emailActual = '';

document.addEventListener('DOMContentLoaded', function () {
    // Si ya había un token guardado y el backend lo da por válido, se salta el login.
    const token = localStorage.getItem('authToken');
    if (token) {
        fetch(`/api/auth/verificar-sesion?token=${token}`)
            .then(r => r.json())
            .then(data => {
                if (data.valido) window.location.href = '/dashboard';
            });
    }

    document.getElementById('btnSolicitarCodigo').addEventListener('click', solicitarCodigo);
    document.getElementById('btnVerificarCodigo').addEventListener('click', verificarCodigo);
    document.getElementById('btnCambiarEmail').addEventListener('click', volverAEmail);
    document.getElementById('btnReenviar').addEventListener('click', solicitarCodigo);

    document.getElementById('emailInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') solicitarCodigo();
    });
    document.getElementById('codigoInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') verificarCodigo();
    });
});

// ─── Paso 1: solicitar código ─────────────────────────────────────────────────

// Manda el correo al backend, que es quien envía el código. Si responde bien, se muestra el paso del código.
function solicitarCodigo() {
    const email = document.getElementById('emailInput').value.trim().toLowerCase();
    const btn   = document.getElementById('btnSolicitarCodigo');

    limpiarError('emailError');

    if (!email || !email.includes('@')) {
        mostrarError('emailError', 'Ingrese un correo electrónico válido.');
        return;
    }

    btn.disabled    = true;
    btn.textContent = 'Enviando...';

    fetch('/api/auth/solicitar-codigo', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email })
    })
    .then(r => r.json())
    .then(data => {
        btn.disabled    = false;
        btn.textContent = 'Enviar código';

        if (data.success) {
            emailActual = email;
            document.getElementById('pasoEmail').classList.add('hidden');
            document.getElementById('pasoCodigo').classList.remove('hidden');
            document.getElementById('emailMostrado').textContent = email;
            document.getElementById('codigoInput').value = '';
            document.getElementById('codigoInput').focus();
        } else {
            // 🔎 Muestra el mensaje genérico + el error técnico real (si vino del backend)
            let mensaje = data.mensaje || 'No se pudo enviar el código.';
            if (data.errorTecnico) {
                mensaje += '\n\nDetalle técnico: ' + data.errorTecnico;
            }
            mostrarError('emailError', mensaje);
            console.error('Error técnico del servidor:', data.errorTecnico);
        }
    })
    .catch((err) => {
        btn.disabled    = false;
        btn.textContent = 'Enviar código';
        mostrarError('emailError', 'Error de conexión con el servidor: ' + err.message);
    });
}

// ─── Paso 2: verificar código ─────────────────────────────────────────────────

// Manda correo y código; si el backend los aprueba, deja token, correo y vencimiento en el navegador.
function verificarCodigo() {
    const codigo = document.getElementById('codigoInput').value.trim();
    const btn    = document.getElementById('btnVerificarCodigo');

    limpiarError('codigoError');

    if (codigo.length !== 4) {
        mostrarError('codigoError', 'El código debe tener 4 dígitos.');
        return;
    }

    btn.disabled    = true;
    btn.textContent = 'Verificando...';

    fetch('/api/auth/verificar-codigo', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: emailActual, codigo })
    })
    .then(r => r.json())
    .then(data => {
        btn.disabled    = false;
        btn.textContent = 'Verificar e ingresar';

        if (data.success) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authEmail', data.email);
            localStorage.setItem('authExpira', data.expiraEn);
            window.location.href = '/dashboard';
        } else {
            mostrarError('codigoError', data.mensaje || 'Código incorrecto.');
        }
    })
    .catch((err) => {
        btn.disabled    = false;
        btn.textContent = 'Verificar e ingresar';
        mostrarError('codigoError', 'Error de conexión con el servidor: ' + err.message);
    });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function volverAEmail() {
    document.getElementById('pasoCodigo').classList.add('hidden');
    document.getElementById('pasoEmail').classList.remove('hidden');
    limpiarError('codigoError');
}

function mostrarError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.style.whiteSpace = 'pre-line';
    el.classList.remove('hidden');
}

function limpiarError(id) {
    const el = document.getElementById(id);
    el.classList.add('hidden');
    el.textContent = '';
}
