let emailActual = '';

document.addEventListener('DOMContentLoaded', function () {
    // Si ya hay una sesión válida, saltar directo al dashboard
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
            mostrarError('emailError', data.mensaje || 'No se pudo enviar el código.');
        }
    })
    .catch(() => {
        btn.disabled    = false;
        btn.textContent = 'Enviar código';
        mostrarError('emailError', 'Error de conexión con el servidor.');
    });
}

// ─── Paso 2: verificar código ─────────────────────────────────────────────────

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
            window.location.href = '/dashboard';
        } else {
            mostrarError('codigoError', data.mensaje || 'Código incorrecto.');
        }
    })
    .catch(() => {
        btn.disabled    = false;
        btn.textContent = 'Verificar e ingresar';
        mostrarError('codigoError', 'Error de conexión con el servidor.');
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
    el.classList.remove('hidden');
}

function limpiarError(id) {
    const el = document.getElementById(id);
    el.classList.add('hidden');
    el.textContent = '';
}
