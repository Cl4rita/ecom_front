// auth.js - helper para frontend
// Guarda token e usuário no sessionStorage e fornece helpers

function saveUserSession(userData) {
  sessionStorage.setItem('user', JSON.stringify(userData));
}

// Função para verificar se o usuário está autenticado
function isAuthenticated() {
  return sessionStorage.getItem('user') !== null;
}

// Função para redirecionar usuários não autenticados
function enforceAuthentication() {
  // Use minimal page-name checks so different hosting paths still match
  const publicPages = [
      'index.html',
      'public/login.html',
      'public/Usuario/cadastrar.html'
  ];

  const currentPath = window.location.pathname;

  if (!isAuthenticated() && !publicPages.some(page => currentPath.endsWith(page))) {
      // Redirect relatively where possible
      try { window.location.href = 'login.html' } catch (e) { window.location.href = './login.html' }
  }
}

// Chamar a função de verificação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  enforceAuthentication();
});

const Auth = {

  setAuth(authResult) {
    // espera { token, usuario } ou { token, user }
    if (!authResult) return
    const token = authResult.token || authResult.accessToken || null
    const user = authResult.usuario || authResult.user || null

    if (token) sessionStorage.setItem('token', token)
    if (user) sessionStorage.setItem('user', JSON.stringify(user))
    if (user && user.nome) sessionStorage.setItem('nome', user.nome)
    if (user && user.tipo) sessionStorage.setItem('role', user.tipo)
  },

  clearAuth() {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('nome')
    sessionStorage.removeItem('role')
  },

  getToken() {
    return sessionStorage.getItem('token')
  },

  getUser() {
    const u = sessionStorage.getItem('user')
    return u ? JSON.parse(u) : null
  },

  getRole() {
    // Prefer normalized 'role', but fall back to older keys or user object
    return sessionStorage.getItem('role') || sessionStorage.getItem('tipo_usuario') || (function(){
      const u = sessionStorage.getItem('user')
      if (!u) return null
      try { const obj = JSON.parse(u); return obj.tipo || obj.tipo_usuario || null } catch(e) { return null }
    })()
  },

  isLoggedIn() {
    return !!this.getToken()
  },

  // allowedRoles: array of roles allowed (e.g. ['ADMIN'])
  requireAuth(allowedRoles = null, redirectTo = '/frontend/public/login.html') {
    // If not logged, redirect to login
    if (!this.isLoggedIn()) {
      // use a relative redirect where possible
      const dest = redirectTo || 'frontend/login.html'
      window.location.href = dest
      return false
    }

    if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
      const role = this.getRole()
      if (!role || !allowedRoles.includes(role)) {
        // redirect to store / unauthorized page (try relative path first)
        try { window.location.href = 'frontend/loja.html' } catch(e) { window.location.href = 'frontend/public/loja.html' }
        return false
      }
    }

    return true
  }
}

// expor global para uso em páginas
window.Auth = Auth

// Attach logout behavior globally when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtns = document.querySelectorAll('#logoutBtn')
  if (logoutBtns && logoutBtns.length) {
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        Auth.clearAuth()
          // try sensible redirects depending on current path
          const tryPaths = ['login.html', './login.html', '../frontend/login.html', '/frontend/public/login.html']
          for (const p of tryPaths) {
            try { window.location.href = p; return } catch (err) {}
          }
          // fallback: reload
          setTimeout(() => location.reload(), 200)
      })
    })
  }
})