/**
 * auth-guard.js
 * Incluir como el PRIMER <script> en <head>, antes de Tailwind/Chart.js,
 * en cualquier página que requiera sesión iniciada (dashboard.html, perfil.html).
 *
 * Oculta el contenido de inmediato y solo lo muestra si el token es válido.
 * Si no hay token o es inválido/expirado → redirige a /login.
 */
(function () {
    // Oculta el body mientras se verifica (evita parpadeo de datos sensibles)
    document.documentElement.style.visibility = 'hidden';

    const token = localStorage.getItem('authToken');
    const expira = Number(localStorage.getItem('authExpira')) || 0;

    if (!token || Date.now() > expira) {
        cerrarSesionLocal();
        window.location.replace('/login');
        return;
    }

    fetch(`/api/auth/verificar-sesion?token=${encodeURIComponent(token)}`)
        .then(r => r.json())
        .then(data => {
            if (data.valido) {
                document.documentElement.style.visibility = 'visible';
                window.__authEmail = data.email;
                if (data.expiraEn) localStorage.setItem('authExpira', data.expiraEn);
            } else {
                cerrarSesionLocal();
                window.location.replace('/login');
            }
        })
        .catch(() => {
            // El servidor no respondió (arranque en frío de Render, red intermitente).
            // El token aún no vence, así que se mantiene la sesión en lugar de expulsar.
            document.documentElement.style.visibility = 'visible';
        });
})();

function cerrarSesionLocal() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authEmail');
    localStorage.removeItem('authExpira');
}

/** Función global de cierre de sesión — usable desde cualquier botón "Salir" */
function cerrarSesion() {
    const token = localStorage.getItem('authToken');
    fetch('/api/auth/cerrar-sesion', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token })
    }).finally(() => {
        cerrarSesionLocal();
        window.location.href = '/login';
    });
}
