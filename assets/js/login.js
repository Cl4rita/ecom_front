const login = document.getElementById('login')
let mensagem = document.getElementById('message')

login.addEventListener('click', (e) => {
    e.preventDefault()

    let email = document.getElementById('email').value
    let senha = document.getElementById('senha').value

    if (!email || !senha) {
        mensagem.innerHTML = `Preencha todos os campos para prosseguir.`
        mensagem.style.color = '#818380'
        mensagem.style.textAlign = 'center'
        return
    }

    const valores = { email, senha }

    // usar a rota correta do backend
    fetch(`http://localhost:3000/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(valores)
    })
    .then(resp => resp.json())
    .then(dados => {

        console.log(dados)
        console.log('Nome:', dados.usuario.nome)
        // backend returns { token, usuario: { nome, tipo } }
        if (!dados || !dados.token) {
            mensagem.innerHTML = dados.error || dados.message || 'Erro ao realizar login!'
            mensagem.style.color = '#818380'
            mensagem.style.textAlign = 'center'
            return
        }

        // Use central Auth helper when available (normalizes storage)
        if (window.Auth && typeof window.Auth.setAuth === 'function') {
            // Auth.setAuth expects { token, usuario } or { token, user }
            window.Auth.setAuth({ token: dados.token, usuario: dados.usuario || dados.user })
        } else {
            sessionStorage.setItem('token', dados.token)
            if (dados.usuario && dados.usuario.nome) sessionStorage.setItem('nome', dados.usuario.nome)
            const tipo = (dados.usuario && (dados.usuario.tipo || dados.usuario.tipo_usuario)) || ''
            sessionStorage.setItem('tipo_usuario', tipo)
        }

        mensagem.innerHTML = 'Login realizado com sucesso!'
        mensagem.style.textAlign = 'center'

        setTimeout(() => {
            // resolve role from Auth helper if available, otherwise from session
            const role = (window.Auth && typeof window.Auth.getRole === 'function') ? window.Auth.getRole() : sessionStorage.getItem('tipo_usuario')
            if (role === 'ADMIN') {
                // Admin page is in same folder as login.html: use relative path
                location.href = 'Admin.html'
            } else {
                // store page
                location.href = 'loja.html'
            }
        }, 500)
    })
    .catch((err) => {

        console.error('Erro ao realizar login:', err)
        mensagem.innerHTML = `Erro ao realizar login.`
        mensagem.style.color = '#818380'
        mensagem.style.textAlign = 'center'
    })
})