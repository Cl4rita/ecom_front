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

    mostrarCarrinho();
    mostrarInfoPagamento();
    atualizarResumo();
});

const areaCarrinho = document.getElementById('area-carrinho')
const totalTexto = document.getElementById('total')
const btnLimpar = document.getElementById('btn-limpar')
const btnFinalizar = document.getElementById('btn-finalizar')
const btnVoltar = document.getElementById('btn-voltar')

// Recupera os produtos do localStorage - AGORA USA 'carrinho' EM VEZ DE 'produtos'
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || []

// Função para renderizar toda a tabela
function mostrarCarrinho() {
    if (carrinho.length === 0) {
        areaCarrinho.innerHTML = '<div class="carrinho-vazio"><p>Seu carrinho está vazio.</p></div>'
        totalTexto.textContent = 'Total: R$ 0,00'
        return
    }

    let total = 0;
    let tabelaHTML = `
        <table class="tabela-carrinho">
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Preço (R$)</th>
                    <th>Qtde</th>
                    <th>Subtotal (R$)</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `

    carrinho.forEach((produto, index) => {
        const subtotal = produto.preco * produto.quantidade
        total += subtotal

        tabelaHTML += `
            <tr>
                <td>
                    <div class="produto-info">
                        ${produto.imagem ? `<img src="${produto.imagem}" class="produto-img-carrinho">` : ''}
                        <span>${produto.nome}</span>
                    </div>
                </td>
                <td>R$ ${produto.preco}</td>
                <td>
                    <div class="quantidade-controle">
                        <button class="btn-qtd" onclick="alterarQuantidade(${index}, -1)">-</button>
                        <span>${produto.quantidade}</span>
                        <button class="btn-qtd" onclick="alterarQuantidade(${index}, 1)">+</button>
                    </div>
                </td>
                <td>R$ ${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn-remover" onclick="removerProduto(${index})">🗑️</button>
                </td>
            </tr>
        `
    })

    tabelaHTML += `
            </tbody>
        </table>
    `

    areaCarrinho.innerHTML = tabelaHTML
    totalTexto.textContent = `Total: R$ ${total.toFixed(2)}`
}

// Função para alterar quantidade
function alterarQuantidade(index, mudanca) {
    if (carrinho[index]) {
        carrinho[index].quantidade += mudanca
        
        // Remove o produto se a quantidade for 0 ou menos
        if (carrinho[index].quantidade <= 0) {
            carrinho.splice(index, 1)
        }
        
        localStorage.setItem('carrinho', JSON.stringify(carrinho))
        mostrarCarrinho()
    }
}

// Função para remover produto
function removerProduto(index) {
    if (confirm('Tem certeza que deseja remover este produto do carrinho?')) {
        carrinho.splice(index, 1)
        localStorage.setItem('carrinho', JSON.stringify(carrinho))
        mostrarCarrinho()
    }
}

// Mostrar modal de pagamento ao clicar em finalizar
btnFinalizar.addEventListener('click', () => {
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!')
        return
    }

    // Verificar se o usuário está autenticado
    if (!window.Auth || !Auth.isLoggedIn()) {
        alert('Faça login para finalizar a compra!')
        window.location.href = 'login.html'
        return
    }

    // Atualizar resumo no modal
    atualizarResumo()

    // Mostrar modal
    const modal = document.getElementById('pagamentoModal')
    modal.classList.add('active')

    // Mostrar info do pagamento selecionado
    mostrarInfoPagamento()
})

// Fechar modal
document.getElementById('closePagamentoModal').addEventListener('click', () => {
    document.getElementById('pagamentoModal').classList.remove('active')
})

document.getElementById('cancelPagamentoModal').addEventListener('click', () => {
    document.getElementById('pagamentoModal').classList.remove('active')
})

// Confirmar compra — envia os dados para o backend
document.getElementById('confirmarCompra').addEventListener('click', async () => {
    const token = (window.Auth && window.Auth.getToken && window.Auth.getToken()) || sessionStorage.getItem('token')

    // Buscar endereço principal
    const enderecoResponse = await fetch('https://ecomback-production-666a.up.railway.app/endereco', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!enderecoResponse.ok) {
        alert('Erro ao buscar endereços. Selecione um endereço.')
        return
    }

    const enderecos = await enderecoResponse.json()
    const enderecoPrincipal = enderecos.find(end => end.is_principal)

    if (!enderecoPrincipal) {
        alert('Você precisa ter um endereço principal cadastrado.')
        return
    }

    // Obter método de pagamento selecionado
    const metodoPagamento = document.querySelector('input[name="metodoPagamento"]:checked').value

    // Transforma os dados do carrinho para o formato do pedido
    const pedidoData = {
        idEndereco: enderecoPrincipal.codEndereco || enderecoPrincipal.id,
        itens: carrinho.map(produto => ({
            produtoId: produto.id,
            quantidade: produto.quantidade,
            precoUnitario: produto.preco
        })),
        metodoPagamento: metodoPagamento
    }

    console.log('Enviando pedido:', pedidoData)

    fetch('https://ecomback-production-666a.up.railway.app/pedido', { // Ajuste a rota conforme seu backend
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pedidoData)
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Erro ao finalizar pedido')
        }
        return res.json()
    })
    .then(dados => {
        console.log('Resposta do servidor:', dados)
        alert('Compra finalizada com sucesso!')

        // Fechar modal
        document.getElementById('pagamentoModal').classList.remove('active')

        // Limpa o carrinho após compra finalizada
        localStorage.removeItem('carrinho')
        carrinho = []
        mostrarCarrinho()
    })
    .catch(err => {
        console.error('Erro ao enviar dados:', err)
        alert('Erro ao finalizar compra. Tente novamente.')
    })
})

// Botão de limpar carrinho
btnLimpar.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja esvaziar o carrinho?')) {
        localStorage.removeItem('carrinho')
        carrinho = []
        mostrarCarrinho()
    }
})
        const pagamentoOptions = document.querySelectorAll('input[name="metodoPagamento"]');
        const infoSections = document.querySelectorAll('.info-pagamento');
        
        // Mostra a seção correspondente ao método selecionado
        function mostrarInfoPagamento() {
            const selecionado = document.querySelector('input[name="metodoPagamento"]:checked');

            // Esconde todas as seções
            infoSections.forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });

            // Mostra a seção correspondente
            let sectionId;
            if (selecionado && selecionado.value === 'DEBITO_ONLINE') {
                sectionId = 'info-debito_online';
            } else if (selecionado) {
                sectionId = `info-${selecionado.value.toLowerCase()}`;
            }

            const sectionToShow = document.getElementById(sectionId);
            if (sectionToShow) {
                sectionToShow.classList.add('active');
                sectionToShow.style.display = 'block';
            }
        }

        // Atualiza o resumo quando o carrinho muda
        function atualizarResumo() {
            const totalElement = document.getElementById('total');
            const totalText = totalElement.textContent;
            const total = parseFloat(totalText.replace('Total: R$ ', '').replace(',', '.'));
            
            if (!isNaN(total)) {

                document.getElementById('resumo-subtotal').textContent = 
                    `R$ ${total.toFixed(2).replace('.', ',')}`;
                document.getElementById('total').textContent = 
                    `R$ ${total.toFixed(2).replace('.', ',')}`;
            }
        }
        
        // Adiciona eventos
        pagamentoOptions.forEach(option => {
            option.addEventListener('change', mostrarInfoPagamento);
        });

        // Monitora mudanças no carrinho (será chamado pelo progCarrinho.js)
        window.atualizarResumoCarrinho = atualizarResumo;
        
        
        // Formatação do número do cartão
        const numeroCartao = document.getElementById('numeroCartao');
        if (numeroCartao) {
            numeroCartao.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})/g, '$1 ').trim();
                e.target.value = value.substring(0, 19);
            });
        }
        
        // Formatação da validade
        const validade = document.getElementById('validade');
        if (validade) {
            validade.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value.substring(0, 5);
            });
        }
        
        // Formatação do CVV
        const cvv = document.getElementById('cvv');
        if (cvv) {
            cvv.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
            });
        }

// Botão de voltar à loja
btnVoltar.addEventListener('click', () => {
    location.href = './loja.html'
})

// Exibe os produtos ao carregar a página
mostrarCarrinho()