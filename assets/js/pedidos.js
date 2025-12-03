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
                window.location.href = './login.html'
            })
        }
    }
    
    // Carregar pedidos ao iniciar
    carregarPedidos();
    configurarFiltros();
    configurarModalDetalhes();
});

async function carregarPedidos(filtros = {}) {
    const container = document.getElementById('pedidosLista');
    const emptyState = document.getElementById('emptyState');
    const loading = container.querySelector('.loading-pedidos');

    if (!window.Auth || !Auth.isLoggedIn()) {
        container.innerHTML = '<p>Faça login para ver seus pedidos</p>';
        return;
    }

    const token = Auth.getToken();

    try {
        // Mostrar loading
        if (loading) loading.style.display = 'block';
        
        const response = await fetch('https://ecomback-production-666a.up.railway.app/pedido', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar pedidos');
        }

        const pedidos = await response.json();
        
        // Esconder loading
        if (loading) loading.style.display = 'none';
        
        // Verificar se veio array
        if (!Array.isArray(pedidos)) {
            console.error('Resposta não é um array:', pedidos);
            container.innerHTML = '<p>Erro: Formato de dados inválido</p>';
            return;
        }
        
        let pedidosFiltrados = filtrarPedidos(pedidos, filtros);

        if (pedidosFiltrados.length === 0) {
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        container.classList.remove('hidden');
        emptyState.classList.add('hidden');

        container.innerHTML = pedidosFiltrados.map(pedido => criarCardPedido(pedido)).join('');
        
        // Adicionar eventos aos botões
        adicionarEventosAosBotoes();
        
    } catch (err) {
        console.error('Erro ao carregar pedidos:', err);
        if (loading) loading.style.display = 'none';
        container.innerHTML = '<p>Erro ao carregar pedidos. Tente novamente.</p>';
    }
}

function filtrarPedidos(pedidos, filtros) {
    return pedidos.filter(pedido => {
        // Converter status para minúsculo para comparar
        const pedidoStatus = pedido.status ? pedido.status.toLowerCase() : '';
        const filtroStatus = filtros.status ? filtros.status.toLowerCase() : '';
        
        // Filtro por status
        if (filtros.status && filtros.status !== 'todos' && !pedidoStatus.includes(filtroStatus)) {
            return false;
        }
        
        // Filtro por período (simplificado)
        if (filtros.periodo && filtros.periodo !== 'todos') {
            const dias = parseInt(filtros.periodo);
            const dataPedido = new Date(pedido.dataPedido || pedido.createdAt);
            const hoje = new Date();
            const diffDias = Math.floor((hoje - dataPedido) / (1000 * 60 * 60 * 24));
            
            if (diffDias > dias) {
                return false;
            }
        }
        
        return true;
    });
}

function criarCardPedido(pedido) {
    const statusInfo = obterInfoStatus(pedido.status);
    const dataFormatada = formatarData(pedido.dataPedido || pedido.createdAt);
    const numeroPedido = pedido.id || pedido.codPedido || 'N/A';
    
    // Calcular total se não vier do backend
    let total = pedido.valorTotal || 0;
    if (total === 0 && pedido.itensPedido) {
        total = pedido.itensPedido.reduce((sum, item) => {
            return sum + (item.precoUnitario * item.quantidade);
        }, 0);
    }

    return `
        <div class="pedido-card" data-pedido-id="${numeroPedido}">
            <div class="pedido-header">
                <div class="pedido-info">
                    <h3>Pedido #${numeroPedido}</h3>
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
                    ${pedido.itensPedido && pedido.itensPedido.length > 0 ? 
                        pedido.itensPedido.map(item => `
                            <div class="pedido-item">
                                <img src="${item.produtoItem?.imagem_url || '../assets/img/placeholder.jpg'}" 
                                     alt="${item.produtoItem?.nome || 'Produto'}" 
                                     class="item-imagem">
                                <div class="item-info">
                                    <span class="item-nome">${item.produtoItem?.nome || 'Produto'}</span>
                                    <span class="item-quantidade">Qtd: ${item.quantidade || 1}</span>
                                </div>
                                <span class="item-preco">R$ ${(item.precoUnitario)}</span>
                            </div>
                        `).join('') : 
                        '<p>Nenhum item encontrado</p>'
                    }
                </div>

                <div class="pedido-total">
                    <strong>Total: R$ ${total}</strong>
                </div>
            </div>

            <div class="pedido-actions">
                <button class="btn btn-outline btn-sm btn-detalhes" data-pedido-id="${numeroPedido}">
                    Ver Detalhes
                </button>
                
                <!-- Botão de Alterar Status (Atualizar) -->
                <button class="btn btn-primary btn-sm btn-alterar-status" data-pedido-id="${numeroPedido}">
                    Alterar Status
                </button>
                
                <!-- Botão de Cancelar Pedido (Apagar) -->
                ${pedido.status !== 'CANCELADO' && pedido.status !== 'ENTREGUE' ? `
                    <button class="btn btn-danger btn-sm btn-cancelar" data-pedido-id="${numeroPedido}">
                        Cancelar Pedido
                    </button>
                ` : ''}
                
                ${pedido.status === 'ENTREGUE' ? `
                    <button class="btn btn-success btn-sm">
                        Comprar Novamente
                    </button>
                ` : ''}
                ${pedido.status === 'ENVIADO' ? `
                    <button class="btn btn-info btn-sm">
                        Rastrear Pedido
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function adicionarEventosAosBotoes() {
    // Botão de detalhes
    document.querySelectorAll('.btn-detalhes').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pedidoId = e.target.getAttribute('data-pedido-id');
            abrirModalDetalhes(pedidoId);
        });
    });

    // Botão de alterar status
    document.querySelectorAll('.btn-alterar-status').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pedidoId = e.target.getAttribute('data-pedido-id');
            alterarStatusPedido(pedidoId);
        });
    });

    // Botão de cancelar
    document.querySelectorAll('.btn-cancelar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pedidoId = e.target.getAttribute('data-pedido-id');
            cancelarPedido(pedidoId);
        });
    });
}

function obterInfoStatus(status) {
    const statusMap = {
        'PENDENTE_PAGAMENTO': { texto: 'Pendente Pagamento', cor: '#f59e0b' },
        'PROCESSANDO_PAGAMENTO': { texto: 'Processando Pagamento', cor: '#f59e0b' },
        'PAGO': { texto: 'Pago', cor: '#10b981' },
        'SEPARACAO_ESTOQUE': { texto: 'Separando Estoque', cor: '#3b82f6' },
        'ENVIADO': { texto: 'Enviado', cor: '#3b82f6' },
        'ENTREGUE': { texto: 'Entregue', cor: '#8b5cf6' },
        'CANCELADO': { texto: 'Cancelado', cor: '#ef4444' },
        
        // Para compatibilidade com nomes antigos
        'pendente': { texto: 'Pendente', cor: '#f59e0b' },
        'pago': { texto: 'Pago', cor: '#10b981' },
        'enviado': { texto: 'Enviado', cor: '#3b82f6' },
        'entregue': { texto: 'Entregue', cor: '#8b5cf6' },
        'cancelado': { texto: 'Cancelado', cor: '#ef4444' }
    };
    return statusMap[status] || { texto: 'Desconhecido', cor: '#6b7280' };
}

function formatarData(dataString) {
    try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Data inválida';
    }
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
}

async function abrirModalDetalhes(pedidoId) {
    const token = Auth.getToken();

    try {
        const response = await fetch(`https://ecomback-production-666a.up.railway.app/pedido`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar detalhes');

        const pedidos = await response.json();
        const pedido = pedidos.find(p => (p.id || p.codPedido) == pedidoId);
        
        if (!pedido) {
            alert('Pedido não encontrado!');
            return;
        }

        const modal = document.getElementById('detalhesPedidoModal');
        const statusInfo = obterInfoStatus(pedido.status);

        document.getElementById('modalNumeroPedido').textContent = `#${pedidoId}`;

        const detalhesHTML = `
            <div class="detalhes-section">
                <h4>Status do Pedido</h4>
                <div class="status-info">
                    <span class="status-badge large ${pedido.status}" style="background: ${statusInfo.cor}">
                        ${statusInfo.texto}
                    </span>
                    <br>
                    <br>
                    <p>Pedido realizado em ${formatarData(pedido.dataPedido || pedido.createdAt)}</p>
                </div>
            </div>

            <div class="detalhes-section">
                <h4>Itens do Pedido</h4>
                <div class="itens-detalhes">
                    ${pedido.itensPedido && pedido.itensPedido.length > 0 ? 
                        pedido.itensPedido.map(item => `
                            <div class="item-detalhe">
                                <img src="${item.produtoItem?.imagem_url || '../assets/img/placeholder.jpg'}" 
                                     alt="${item.produtoItem?.nome || 'Produto'}" 
                                     class="item-imagem">
                                <div class="item-info-detalhe">
                                    <strong>${item.produtoItem?.nome || 'Produto'}</strong>
                                    <span>Quantidade: ${item.quantidade || 1}</span>
                                    <span>Preço unitário: R$ ${(item.precoUnitario)}</span>
                                </div>
                                <div class="item-subtotal">
                                    R$ ${(item.valorTotalItem || (item.precoUnitario * item.quantidade) || 0)}
                                </div>
                            </div>
                        `).join('') : 
                        '<p>Nenhum item encontrado</p>'
                    }
                </div>
            </div>

            ${pedido.enderecoEntrega ? `
                <div class="detalhes-section">
                    <h4>Endereço de Entrega</h4>
                    <div class="endereco-info">
                        <p>${pedido.enderecoEntrega.logradouro || ''}${pedido.enderecoEntrega.complemento ? ', ' + pedido.enderecoEntrega.complemento : ''}</p>
                        <p>${pedido.enderecoEntrega.bairro || ''} - ${pedido.enderecoEntrega.localidade || pedido.enderecoEntrega.cidade || ''}/${pedido.enderecoEntrega.uf || pedido.enderecoEntrega.estado || ''}</p>
                        <p>CEP: ${pedido.enderecoEntrega.cep || ''}</p>
                    </div>
                </div>
            ` : ''}

            <div class="detalhes-section">
                <h4>Pagamento</h4>
                <div class="pagamento-info">
                    <p>Método: ${pedido.metodoPagamento || 'PIX'}</p>
                    <p>Total: R$ ${(pedido.valorTotal || 0)}</p>
                </div>
            </div>
        `;

        document.querySelector('.detalhes-pedido').innerHTML = detalhesHTML;
        modal.classList.add('active');
    } catch (err) {
        console.error('Erro ao abrir detalhes:', err);
        alert('Erro ao carregar detalhes do pedido.');
    }
}

async function alterarStatusPedido(pedidoId) {
    const token = Auth.getToken();
    
    // Criar modal para selecionar novo status
    const novoStatus = prompt('Digite o novo status do pedido:\n(PENDENTE_PAGAMENTO, PAGO, ENVIADO, ENTREGUE, CANCELADO)');
    
    if (!novoStatus) return;
    
    const statusValidos = ['PENDENTE_PAGAMENTO', 'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'];
    if (!statusValidos.includes(novoStatus.toUpperCase())) {
        alert('Status inválido!');
        return;
    }

    try {
        const response = await fetch(`https://ecomback-production-666a.up.railway.app/pedido/${pedidoId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: novoStatus.toUpperCase() })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao atualizar status');
        }

        alert('Status do pedido atualizado com sucesso!');
        carregarPedidos(); // Recarregar lista
    } catch (err) {
        console.error('Erro ao atualizar status:', err);
        alert('Erro ao atualizar status: ' + err.message);
    }
}

async function cancelarPedido(pedidoId) {
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) return;

    const token = Auth.getToken();

    try {
        const response = await fetch(`https://ecomback-production-666a.up.railway.app/pedido/${pedidoId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'CANCELADO' })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao cancelar pedido');
        }

        alert('Pedido cancelado com sucesso!');
        carregarPedidos(); // Recarregar lista
    } catch (err) {
        console.error('Erro ao cancelar pedido:', err);
        alert('Erro ao cancelar pedido: ' + err.message);
    }
}

function fecharModalDetalhes() {
    const modal = document.getElementById('detalhesPedidoModal');
    modal.classList.remove('active');
}

// Função auxiliar para mostrar mensagens
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}