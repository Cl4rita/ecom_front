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

function carregarPedidos(filtros = {}) {
    const container = document.getElementById('pedidosLista');
    const emptyState = document.getElementById('emptyState');
    
    // Simular carregamento
    container.innerHTML = '<div class="loading-pedidos"><p>Carregando seus pedidos...</p></div>';
    
    setTimeout(() => {
        let pedidosFiltrados = filtrarPedidos(pedidosExemplo, filtros);
        
        if (pedidosFiltrados.length === 0) {
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }
        
        container.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        container.innerHTML = pedidosFiltrados.map(pedido => criarCardPedido(pedido)).join('');
    }, 1000);
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
    const dataFormatada = formatarData(pedido.data);
    
    return `
        <div class="pedido-card" data-pedido-id="${pedido.id}">
            <div class="pedido-header">
                <div class="pedido-info">
                    <h3>Pedido ${pedido.numero}</h3>
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
                    ${pedido.itens.map(item => `
                        <div class="pedido-item">
                            <img src="${item.imagem}" alt="${item.nome}" class="item-imagem">
                            <div class="item-info">
                                <span class="item-nome">${item.nome}</span>
                                <span class="item-quantidade">Qtd: ${item.quantidade}</span>
                            </div>
                            <span class="item-preco">R$ ${item.preco.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="pedido-total">
                    <strong>Total: R$ ${pedido.total.toFixed(2)}</strong>
                </div>
            </div>
            
            <div class="pedido-actions">
                <button class="btn btn-outline btn-sm btn-detalhes" data-pedido-id="${pedido.id}">
                    Ver Detalhes
                </button>
                ${pedido.status === 'entregue' ? `
                    <button class="btn btn-primary btn-sm">
                        Comprar Novamente
                    </button>
                ` : ''}
                ${pedido.status === 'enviado' ? `
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
        'pendente': { texto: 'Pendente', cor: '#f59e0b' },
        'pago': { texto: 'Pago', cor: '#10b981' },
        'enviado': { texto: 'Enviado', cor: '#3b82f6' },
        'entregue': { texto: 'Entregue', cor: '#8b5cf6' },
        'cancelado': { texto: 'Cancelado', cor: '#ef4444' }
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
    });
}

function abrirModalDetalhes(pedidoId) {
    const pedido = pedidosExemplo.find(p => p.id == pedidoId);
    if (!pedido) return;

    const modal = document.getElementById('detalhesPedidoModal');
    const statusInfo = obterInfoStatus(pedido.status);

    document.getElementById('modalNumeroPedido').textContent = pedido.numero;
    
    const detalhesHTML = `
        <div class="detalhes-section">
            <h4>Status do Pedido</h4>
            <div class="status-info">
                <span class="status-badge large ${pedido.status}" style="background: ${statusInfo.cor}">
                    ${statusInfo.texto}
                </span>
                <p>Pedido realizado em ${formatarData(pedido.data)}</p>
            </div>
        </div>

        <div class="detalhes-section">
            <h4>Itens do Pedido</h4>
            <div class="itens-detalhes">
                ${pedido.itens.map(item => `
                    <div class="item-detalhe">
                        <img src="${item.imagem}" alt="${item.nome}" class="item-imagem">
                        <div class="item-info-detalhe">
                            <strong>${item.nome}</strong>
                            <span>Quantidade: ${item.quantidade}</span>
                            <span>Preço unitário: R$ ${item.preco.toFixed(2)}</span>
                        </div>
                        <div class="item-subtotal">
                            R$ ${(item.preco * item.quantidade).toFixed(2)}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="detalhes-section">
            <h4>Endereço de Entrega</h4>
            <div class="endereco-info">
                <p>${pedido.endereco.logradouro}${pedido.endereco.complemento ? ', ' + pedido.endereco.complemento : ''}</p>
                <p>${pedido.endereco.bairro} - ${pedido.endereco.cidade}/${pedido.endereco.estado}</p>
                <p>CEP: ${pedido.endereco.cep}</p>
            </div>
        </div>

        <div class="detalhes-section">
            <h4>Pagamento</h4>
            <div class="pagamento-info">
                <p>${pedido.pagamento}</p>
            </div>
        </div>

        <div class="detalhes-total">
            <h3>Total: R$ ${pedido.total.toFixed(2)}</h3>
        </div>
    `;

    document.querySelector('.detalhes-pedido').innerHTML = detalhesHTML;
    modal.classList.add('active');
}

function fecharModalDetalhes() {
    const modal = document.getElementById('detalhesPedidoModal');
    modal.classList.remove('active');
}