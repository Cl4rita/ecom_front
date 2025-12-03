document.addEventListener('DOMContentLoaded', function() {
    // Mostrar nome do usuário se estiver logado e ativar logout
    if (window.Auth) {
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
    }

    carregarProdutos();
    configurarFiltros();
    configurarModalDetalhes();
});

async function carregarPedidos(filtros = {}) {
    const container = document.getElementById('pedidosLista');
    const emptyState = document.getElementById('emptyState');

    if (!window.Auth || !Auth.isLoggedIn()) {
        container.innerHTML = '<p>Faça login para ver seus pedidos</p>';
        return;
    }

    const token = Auth.getToken();

    try {
        const response = await fetch('http://localhost:3000/pedido', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar pedidos');
        }

        const pedidos = await response.json();
        let pedidosFiltrados = filtrarPedidos(pedidos, filtros);

        if (pedidosFiltrados.length === 0) {
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        container.classList.remove('hidden');
        emptyState.classList.add('hidden');

        container.innerHTML = pedidosFiltrados.map(pedido => criarCardPedido(pedido)).join('');
    } catch (err) {
        console.error('Erro ao carregar pedidos:', err);
        container.innerHTML = '<p>Erro ao carregar pedidos. Tente novamente.</p>';
    }
}

function filtrarPedidos(pedidos, filtros) {
    return pedidos.filter(pedido => {
        // Filtro por status
        if (filtros.status && filtros.status !== 'todos' && pedido.status !== filtros.status) {
            return false;
        }
        
        // Filtro por período (em uma aplicação real, você teria datas reais)
        if (filtros.periodo && filtros.periodo !== 'todos') {
            // Simulação simples - em uma aplicação real, você compararia as datas
            const dias = parseInt(filtros.periodo);
            // Aqui você implementaria a lógica real de filtro por data
        }
        
        return true;
    });
}

function criarCardPedido(pedido) {
    const statusInfo = obterInfoStatus(pedido.status);
    const dataFormatada = formatarData(pedido.dataPedido);

    return `
        <div class="pedido-card" data-pedido-id="${pedido.id}">
            <div class="pedido-header">
                <div class="pedido-info">
                    <h3>Pedido ${pedido.id}</h3>
                    <span class="pedido-data">${dataFormatada}</span>
                </div>
                <div class="pedido-status">
                    <span class="status-badge ${pedido.status}" style="background: ${statusInfo.cor}">
                        ${statusInfo.texto}
                    </span>
                </div>
            </div>

            <div class="pedido-body">
                <div class="pedido-itens">
                    ${pedido.itensPedido.map(item => `
                        <div class="pedido-item">
                            <img src="${item.produtoItem.imagem_url || '../assets/img/placeholder.jpg'}" alt="${item.produtoItem.nome}" class="item-imagem">
                            <div class="item-info">
                                <span class="item-nome">${item.produtoItem.nome}</span>
                                <span class="item-quantidade">Qtd: ${item.quantidade}</span>
                            </div>
                            <span class="item-preco">R$ ${item.precoUnitario.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="pedido-total">
                    <strong>Total: R$ ${pedido.valorTotal.toFixed(2)}</strong>
                </div>
            </div>

            <div class="pedido-actions">
                <button class="btn btn-outline btn-sm btn-detalhes" data-pedido-id="${pedido.id}">
                    Ver Detalhes
                </button>
                <select class="status-select" data-pedido-id="${pedido.id}">
                    <option value="PENDENTE_PAGAMENTO" ${pedido.status === 'PENDENTE_PAGAMENTO' ? 'selected' : ''}>Pendente</option>
                    <option value="PROCESSANDO_PAGAMENTO" ${pedido.status === 'PROCESSANDO_PAGAMENTO' ? 'selected' : ''}>Processando</option>
                    <option value="PAGO" ${pedido.status === 'PAGO' ? 'selected' : ''}>Pago</option>
                    <option value="SEPARACAO_ESTOQUE" ${pedido.status === 'SEPARACAO_ESTOQUE' ? 'selected' : ''}>Separando</option>
                    <option value="ENVIADO" ${pedido.status === 'ENVIADO' ? 'selected' : ''}>Enviado</option>
                    <option value="ENTREGUE" ${pedido.status === 'ENTREGUE' ? 'selected' : ''}>Entregue</option>
                    <option value="CANCELADO" ${pedido.status === 'CANCELADO' ? 'selected' : ''}>Cancelado</option>
                </select>
                ${pedido.status === 'CANCELADO' ? `
                    <button class="btn btn-danger btn-sm btn-deletar" data-pedido-id="${pedido.id}">
                        Deletar Pedido
                    </button>
                ` : ''}
                ${pedido.status === 'ENTREGUE' ? `
                    <button class="btn btn-primary btn-sm">
                        Comprar Novamente
                    </button>
                ` : ''}
                ${pedido.status === 'ENVIADO' ? `
                    <button class="btn btn-primary btn-sm">
                        Rastrear Pedido
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function obterInfoStatus(status) {
    const statusMap = {
        'PENDENTE_PAGAMENTO': { texto: 'Pendente', cor: '#f59e0b' },
        'PROCESSANDO_PAGAMENTO': { texto: 'Processando', cor: '#f59e0b' },
        'PAGO': { texto: 'Pago', cor: '#10b981' },
        'SEPARACAO_ESTOQUE': { texto: 'Separando', cor: '#3b82f6' },
        'ENVIADO': { texto: 'Enviado', cor: '#3b82f6' },
        'ENTREGUE': { texto: 'Entregue', cor: '#8b5cf6' },
        'CANCELADO': { texto: 'Cancelado', cor: '#ef4444' }
    };
    return statusMap[status] || { texto: 'Desconhecido', cor: '#6b7280' };
}

function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function configurarFiltros() {
    const filtroStatus = document.getElementById('filtroStatus');
    const filtroPeriodo = document.getElementById('filtroPeriodo');
    const btnLimparFiltros = document.getElementById('btnLimparFiltros');

    if (filtroStatus) {
        filtroStatus.addEventListener('change', aplicarFiltros);
    }
    if (filtroPeriodo) {
        filtroPeriodo.addEventListener('change', aplicarFiltros);
    }
    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener('click', limparFiltros);
    }
}

function aplicarFiltros() {
    const filtros = {
        status: document.getElementById('filtroStatus').value,
        periodo: document.getElementById('filtroPeriodo').value
    };
    carregarPedidos(filtros);
}

function limparFiltros() {
    document.getElementById('filtroStatus').value = 'todos';
    document.getElementById('filtroPeriodo').value = 'todos';
    carregarPedidos();
}

function configurarModalDetalhes() {
    const modal = document.getElementById('detalhesPedidoModal');
    const btnFechar = document.getElementById('closeDetalhesModal');
    const btnFechar2 = document.getElementById('fecharDetalhesModal');

    // Fechar modal
    if (btnFechar) btnFechar.addEventListener('click', fecharModalDetalhes);
    if (btnFechar2) btnFechar2.addEventListener('click', fecharModalDetalhes);
    
    // Fechar clicando fora
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModalDetalhes();
            }
        });
    }

    // Configurar botões de detalhes nos cards
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-detalhes')) {
            const pedidoId = e.target.getAttribute('data-pedido-id');
            abrirModalDetalhes(pedidoId);
        }
        if (e.target.classList.contains('btn-cancelar')) {
            const pedidoId = e.target.getAttribute('data-pedido-id');
            cancelarPedido(pedidoId);
        }
        if (e.target.classList.contains('btn-deletar')) {
            const pedidoId = e.target.getAttribute('data-pedido-id');
            deletarPedido(pedidoId);
        }
        if (e.target.classList.contains('status-select')) {
            const pedidoId = e.target.getAttribute('data-pedido-id');
            const newStatus = e.target.value;
            atualizarStatusPedido(pedidoId, newStatus);
        }
    });
}

async function abrirModalDetalhes(pedidoId) {
    const token = Auth.getToken();

    try {
        const response = await fetch(`http://localhost:3000/pedido/${pedidoId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar detalhes');

        const pedido = await response.json();

        const modal = document.getElementById('detalhesPedidoModal');
        const statusInfo = obterInfoStatus(pedido.status);

        document.getElementById('modalNumeroPedido').textContent = pedido.codPedido;

        const detalhesHTML = `
            <div class="detalhes-section">
                <h4>Status do Pedido</h4>
                <div class="status-info">
                    <span class="status-badge large ${pedido.status}" style="background: ${statusInfo.cor}">
                        ${statusInfo.texto}
                    </span>
                    <p>Pedido realizado em ${formatarData(pedido.dataPedido)}</p>
                </div>
            </div>

            <div class="detalhes-section">
                <h4>Itens do Pedido</h4>
                <div class="itens-detalhes">
                    ${pedido.itensPedido.map(item => `
                        <div class="item-detalhe">
                            <img src="${item.produtoItem.imagem_url || '../assets/img/placeholder.jpg'}" alt="${item.produtoItem.nome}" class="item-imagem">
                            <div class="item-info-detalhe">
                                <strong>${item.produtoItem.nome}</strong>
                                <span>Quantidade: ${item.quantidade}</span>
                                <span>Preço unitário: R$ ${item.precoUnitario.toFixed(2)}</span>
                            </div>
                            <div class="item-subtotal">
                                R$ ${item.valorTotalItem.toFixed(2)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="detalhes-section">
                <h4>Endereço de Entrega</h4>
                <div class="endereco-info">
                    <p>${pedido.enderecoEntrega.logradouro}${pedido.enderecoEntrega.complemento ? ', ' + pedido.enderecoEntrega.complemento : ''}</p>
                    <p>${pedido.enderecoEntrega.bairro} - ${pedido.enderecoEntrega.localidade}/${pedido.enderecoEntrega.uf}</p>
                    <p>CEP: ${pedido.enderecoEntrega.cep}</p>
                </div>
            </div>

            <div class="detalhes-section">
                <h4>Pagamento</h4>
                <div class="pagamento-info">
                    <p>Método: ${pedido.metodoPagamento || 'PIX'}</p>
                </div>
            </div>

            <div class="detalhes-total">
                <h3>Total: R$ ${pedido.valorTotal.toFixed(2)}</h3>
            </div>
        `;

        document.querySelector('.detalhes-pedido').innerHTML = detalhesHTML;
        modal.classList.add('active');
    } catch (err) {
        console.error('Erro ao abrir detalhes:', err);
        alert('Erro ao carregar detalhes do pedido.');
    }
}

function cancelarPedido(pedidoId) {
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) return;

    const token = Auth.getToken();

    fetch(`http://localhost:3000/pedido/${pedidoId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'CANCELADO' })
    })
    .then(res => {
        if (!res.ok) throw new Error('Erro ao cancelar pedido');
        return res.json();
    })
    .then(() => {
        showMessage('Pedido cancelado com sucesso!', 'success');
        carregarPedidos(); // Recarregar lista
    })
    .catch(err => {
        console.error('Erro ao cancelar pedido:', err);
        showMessage('Erro ao cancelar pedido. Tente novamente.', 'error');
    });
}

function atualizarStatusPedido(pedidoId, status) {
    const token = Auth.getToken();

    fetch(`http://localhost:3000/pedido/${pedidoId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    })
    .then(res => {
        if (!res.ok) throw new Error('Erro ao atualizar status');
        return res.json();
    })
    .then(() => {
        showMessage('Status atualizado com sucesso!', 'success');
        carregarPedidos(); // Recarregar lista
    })
    .catch(err => {
        console.error('Erro ao atualizar status:', err);
        showMessage('Erro ao atualizar status. Tente novamente.', 'error');
    });
}

function deletarPedido(pedidoId) {
    if (!confirm('Tem certeza que deseja deletar este pedido? Esta ação não pode ser desfeita.')) return;

    const token = Auth.getToken();

    fetch(`http://localhost:3000/pedido/${pedidoId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) throw new Error('Erro ao deletar pedido');
        return res.json();
    })
    .then(() => {
        showMessage('Pedido deletado com sucesso!', 'success');
        carregarPedidos(); // Recarregar lista
    })
    .catch(err => {
        console.error('Erro ao deletar pedido:', err);
        showMessage('Erro ao deletar pedido. Tente novamente.', 'error');
    });
}

function fecharModalDetalhes() {
    const modal = document.getElementById('detalhesPedidoModal');
    modal.classList.remove('active');
}