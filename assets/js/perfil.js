document.addEventListener('DOMContentLoaded', function() {
    // Mostrar nome do usuário se estiver logado e ativar logout
    if (window.Auth) {
        // exigir autenticação para acessar o perfil
        if (!Auth.requireAuth()) return

        const user = Auth.getUser()
        const userNameEl = document.getElementById('userName')
        if (user && userNameEl) userNameEl.textContent = user.nome || 'Usuário'

        // attach logout button if present
        const logoutBtn = document.getElementById('logoutBtn')
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                Auth.clearAuth()
                window.location.href = '../login.html'
            })
        }

        // preencher os dados do usuário no formulário
        if (user) carregarDadosUsuario(user)
        // carregar endereços do usuário
        listarEnderecos()
    }

    // inicializar UI da página (abas, modal, formulários)
    configurarNavegacao()
    configurarModal()
    configurarFormularios()
});

// small helper to display messages in-page (replaces alert())
function showMessage(text, type = 'success', timeout = 4000) {
    let container = document.getElementById('pageMessage')
    if (!container) {
        const pageHeader = document.querySelector('.page-header') || document.querySelector('.container')
        container = document.createElement('div')
        container.id = 'pageMessage'
        container.style.margin = '10px 0'
        pageHeader.parentNode.insertBefore(container, pageHeader.nextSibling)
    }
    container.textContent = text
    container.style.padding = '10px'
    container.style.borderRadius = '4px'
    container.style.color = type === 'error' ? '#7a1f1f' : '#0b6623'
    container.style.background = type === 'error' ? '#ffdede' : '#e6ffe6'
    // auto-hide
    if (timeout > 0) {
        clearTimeout(container._hideTimeout)
        container._hideTimeout = setTimeout(() => { container.textContent = ''; container.style.padding = '0' }, timeout)
    }
}

function carregarDadosUsuario(usuario) {
    // Preencher dados do usuário
    document.getElementById('userName').textContent = usuario.nome || 'Usuário';
    document.getElementById('nome').value = usuario.nome || '';
    document.getElementById('email').value = usuario.email || '';
    // não preencher senha por segurança; deixar campo em branco
    const senhaEl = document.getElementById('senha')
    if (senhaEl) senhaEl.value = ''
    document.getElementById('telefone').value = usuario.telefone || '';
}

function configurarNavegacao() {
    const botoesNavegacao = document.querySelectorAll('.nav-btn');
    const conteudosAba = document.querySelectorAll('.tab-content');

    botoesNavegacao.forEach(botao => {
        botao.addEventListener('click', function() {
            const abaAlvo = this.getAttribute('data-tab');
            console.log('Clicou na aba:', abaAlvo); // Debug
            
            // Remover classe active de todos
            botoesNavegacao.forEach(btn => btn.classList.remove('active'));
            conteudosAba.forEach(conteudo => conteudo.classList.remove('active'));
            
            // Adicionar classe active no botão e conteúdo selecionados
            this.classList.add('active');
            document.getElementById(abaAlvo).classList.add('active');
        });
    });
}

function configurarModal() {
    const modal = document.getElementById('addressModal');
    const btnAbrirModal = document.getElementById('addAddressBtn');
    const btnFecharModal = document.getElementById('closeModalBtn');
    const btnCancelarModal = document.getElementById('cancelModalBtn');

    if (btnAbrirModal) {
        btnAbrirModal.addEventListener('click', () => abrirModal());
    }
    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', () => fecharModal());
    }
    if (btnCancelarModal) {
        btnCancelarModal.addEventListener('click', () => fecharModal());
    }

    // Fechar modal clicando fora
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModal();
            }
        });
    }

    // Buscar CEP automaticamente
    const inputCEP = document.getElementById('cep');
    if (inputCEP) {
        inputCEP.addEventListener('blur', buscarCEP);
    }
}

function abrirModal(addr = null) {
    const modal = document.getElementById('addressModal');
    const formulario = document.getElementById('addressForm');

    if (modal && formulario) {
        if (addr) {
            document.getElementById('modalTitle').textContent = 'Editar Endereço';
            // Preencher formulário com dados do endereço
            document.getElementById('cep').value = addr.cep || '';
            document.getElementById('apelido').value = addr.apelido || '';
            document.getElementById('logradouro').value = addr.logradouro || '';
            document.getElementById('numero').value = addr.numero || '';
            document.getElementById('complemento').value = addr.complemento || '';
            document.getElementById('bairro').value = addr.bairro || '';
            document.getElementById('localidade').value = addr.localidade || '';
            document.getElementById('uf').value = addr.uf || '';
            document.getElementById('is_principal').checked = addr.is_principal || false;
            // Armazenar ID para edição
            formulario.setAttribute('data-editing-id', addr.codEndereco || addr.id);
        } else {
            document.getElementById('modalTitle').textContent = 'Adicionar Endereço';
            formulario.reset();
            formulario.removeAttribute('data-editing-id');
        }
        modal.classList.add('active');
    }
}

function fecharModal() {
    const modal = document.getElementById('addressModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function buscarCEP() {
    const cepInput = document.getElementById('cep');
    if (!cepInput) return;
    
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dados = await response.json();
        
        if (!dados.erro) {
            document.getElementById('logradouro').value = dados.logradouro;
            document.getElementById('bairro').value = dados.bairro;
            document.getElementById('localidade').value = dados.localidade;
            document.getElementById('uf').value = dados.uf;
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
    }
}

function configurarFormularios() {
    // Formulário de perfil
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            salvarPerfil();
        });
    }

    // Formulário de senha
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alterarSenha();
        });
    }

    // Formulário de endereço
    const addressForm = document.getElementById('addressForm');
    if (addressForm) {
        addressForm.addEventListener('submit', function(e) {
            e.preventDefault();
            salvarEndereco();
        });
    }
}

function salvarPerfil() {
    const nome = document.getElementById('nome').value.trim()
    const email = document.getElementById('email').value.trim()
    const telefone = document.getElementById('telefone').value.trim()
    const API_BASE = 'http://localhost:3000'
    const token = (window.Auth && window.Auth.getToken && window.Auth.getToken()) || sessionStorage.getItem('token') || localStorage.getItem('token')

    fetch(API_BASE + '/usuario', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? ('Bearer ' + token) : ''
        },
        body: JSON.stringify({ nome, email, telefone })
    }).then(r => r.json()).then(resp => {
        // handle non-OK responses if API returned an error message
        if (resp && resp.message && !resp.id && !resp.nome) {
            showMessage(resp.message, 'error')
            return
        }
        if (resp && (resp.id || resp.nome)) {
            const stored = (window.Auth && window.Auth.getUser && window.Auth.getUser()) || {}
            const novo = Object.assign({}, stored, { nome: resp.nome || nome, email: resp.email || email, telefone: resp.telefone || telefone, id: resp.id || stored.id })
            if (window.Auth && window.Auth.setAuth) {
                window.Auth.setAuth({ token: token, usuario: novo })
            } else {
                sessionStorage.setItem('user', JSON.stringify(novo))
                if (novo.nome) sessionStorage.setItem('nome', novo.nome)
            }
            // update UI immediately
            carregarDadosUsuario(novo)
            showMessage('Perfil atualizado com sucesso!', 'success')
        } else {
            showMessage('Perfil atualizado com sucesso!', 'success')
        }
    }).catch(err => {
        console.error('Erro ao atualizar perfil', err)
        showMessage('Erro ao atualizar perfil: ' + (err.message || err), 'error')
    })
}

function alterarSenha() {
    const senhaAtual = document.getElementById('senhaAtual').value
    const novaSenha = document.getElementById('novaSenha').value
    const confirmar = document.getElementById('confirmarSenha').value

    if (!senhaAtual || !novaSenha || !confirmar) {
        return alert('Preencha todos os campos de senha')
    }
    if (novaSenha !== confirmar) return alert('A nova senha e a confirmação não coincidem')
    if (novaSenha.length < 6) return alert('A senha deve ter pelo menos 6 caracteres')

    const API_BASE = 'http://localhost:3000'
    const token = (window.Auth && window.Auth.getToken && window.Auth.getToken()) || sessionStorage.getItem('token') || localStorage.getItem('token')

    fetch(API_BASE + '/usuario/senha', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? ('Bearer ' + token) : ''
        },
        body: JSON.stringify({ senhaAtual, novaSenha })
    }).then(r => r.json()).then(resp => {
        if (resp && resp.message && (!resp.success && !resp.ok)) {
            showMessage(resp.message, 'error')
        } else if (resp && resp.message) {
            // some APIs return message even on success
            showMessage(resp.message, 'success')
        } else {
            showMessage('Senha alterada com sucesso!', 'success')
        }
        document.getElementById('senhaAtual').value = ''
        document.getElementById('novaSenha').value = ''
        document.getElementById('confirmarSenha').value = ''
    }).catch(err => {
        console.error('Erro ao alterar senha', err)
        showMessage('Erro ao alterar senha: ' + (err.message || err), 'error')
    })
}

function salvarEndereco() {
    const form = document.getElementById('addressForm')
    const editingId = form.getAttribute('data-editing-id')
    const data = {
        cep: document.getElementById('cep').value.trim(),
        apelido: document.getElementById('apelido').value.trim(),
        logradouro: document.getElementById('logradouro').value.trim(),
        numero: document.getElementById('numero').value.trim(),
        complemento: document.getElementById('complemento').value.trim(),
        bairro: document.getElementById('bairro').value.trim(),
        localidade: document.getElementById('localidade').value.trim(),
        uf: document.getElementById('uf').value.trim(),
        is_principal: document.getElementById('is_principal').checked
    }

    const API_BASE = 'http://localhost:3000'
    const token = (window.Auth && window.Auth.getToken && window.Auth.getToken()) || sessionStorage.getItem('token') || localStorage.getItem('token')

    const method = editingId ? 'PUT' : 'POST'
    const url = editingId ? API_BASE + '/endereco/' + editingId : API_BASE + '/endereco'

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? ('Bearer ' + token) : ''
        },
        body: JSON.stringify(data)
    }).then(r => r.json()).then(resp => {
        showMessage(editingId ? 'Endereço atualizado com sucesso!' : 'Endereço salvo com sucesso!', 'success')
        fecharModal()
        listarEnderecos()
        form.reset()
        form.removeAttribute('data-editing-id')
    }).catch(err => {
        console.error('Erro ao salvar endereço', err)
        showMessage('Erro ao salvar endereço: ' + (err.message || err), 'error')
    })
}
 
async function listarEnderecos() {
    try {
        const API_BASE = 'http://localhost:3000'
        const token = (window.Auth && window.Auth.getToken && window.Auth.getToken()) || sessionStorage.getItem('token') || localStorage.getItem('token')
        const r = await fetch(API_BASE + '/endereco', { method: 'GET', headers: { 'Authorization': token ? ('Bearer ' + token) : '' } })
        const dados = await r.json()
        const container = document.getElementById('addressesList')
        if (!container) return

        if (!dados || dados.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>Nenhum endereço cadastrado</p><small>Clique em "Adicionar Endereço" para cadastrar seu primeiro endereço</small></div>`
            return
        }

        container.innerHTML = ''
        dados.forEach(addr => {
            const card = document.createElement('div')
            card.className = 'address-card'
            const addrId = addr.codEndereco || addr.id
            card.innerHTML = `
                <h4>${addr.apelido || 'Endereço' } ${addr.is_principal ? '(Principal)' : ''}</h4>
                <p>${addr.logradouro}, ${addr.numero} ${addr.complemento || ''}</p>
                <p>${addr.bairro} - ${addr.localidade}/${addr.uf}</p>
                <div class="address-actions">
                    ${addr.is_principal ? '' : `<button class="btn btn-outline set-principal" data-id="${addrId}">Definir como principal</button>`}
                    <button class="btn btn-secondary edit-addr" data-id="${addrId}">Editar</button>
                    <button class="btn btn-danger delete-addr" data-id="${addrId}">Remover</button>
                </div>
            `
            container.appendChild(card)
        })

        // attach actions
        document.querySelectorAll('.set-principal').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id')
                try {
                    const API_BASE = 'http://localhost:3000'
                    const token = (window.Auth && window.Auth.getToken && window.Auth.getToken()) || sessionStorage.getItem('token') || localStorage.getItem('token')
                    await fetch(API_BASE + `/endereco/${id}/principal`, { method: 'PATCH', headers: { 'Authorization': token ? ('Bearer ' + token) : '' } })
                    listarEnderecos()
                } catch (err) { console.error('Erro ao definir principal', err) }
            })
        })

        document.querySelectorAll('.edit-addr').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id')
                const addr = dados.find(a => (a.codEndereco || a.id) == id)
                if (addr) abrirModal(addr)
            })
        })

        document.querySelectorAll('.delete-addr').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id')
                if (!confirm('Remover este endereço?')) return
                try {
                    const API_BASE = 'http://localhost:3000'
                    const token = (window.Auth && window.Auth.getToken && window.Auth.getToken()) || sessionStorage.getItem('token') || localStorage.getItem('token')
                    const resp = await fetch(API_BASE + `/endereco/${id}`, { method: 'DELETE', headers: { 'Authorization': token ? ('Bearer ' + token) : '' } })
                    if (!resp.ok) {
                        let body = null
                        try { body = await resp.json() } catch(e) {}
                        const msg = (body && (body.message || body.error)) || `Erro ao remover (status ${resp.status})`
                        showMessage(msg, 'error')
                        return
                    }
                    showMessage('Endereço removido', 'success')
                    listarEnderecos()
                } catch (err) { console.error('Erro ao remover endereço', err); showMessage('Erro ao remover endereço: ' + (err.message || err), 'error') }
            })
        })

    } catch (err) {
        console.error('Erro ao listar endereços', err)
    }
}