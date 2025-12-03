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

    console.log('DEBUG: produtosLoja.js loaded, calling carregarProdutos')
    carregarProdutos();
});

// cache dos produtos carregados para evitar chamadas desnecessárias
let produtosCache = []

async function carregarProdutos() {
    try {
        // Verificar se o usuário está autenticado
        if (!window.Auth || !Auth.isLoggedIn()) {
            window.location.href = './login.html'
            setTimeout(() => {}, 50);
            return
        }

        const token = Auth.getToken()
        
        const response = await fetch('https://ecomback-production-666a.up.railway.app/produto', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            if (response.status === 401) {
                console.error('Token inválido ou expirado')
                Auth.clearAuth()
                window.location.href = 'login.html'
                return
            }
            throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }

        const produtos = await response.json()
        console.log('DEBUG: Produtos recebidos da API:', produtos)
        produtosCache = produtos || []
        exibirProdutos(produtosCache)
    } catch (err) {
        console.error('Erro ao carregar produtos:', err)
        document.getElementById('grade-produtos').innerHTML = '<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>'
    }
}

function exibirProdutos(produtos) {
    const container = document.getElementById('grade-produtos');

    if (!produtos || produtos.length === 0) {
        container.innerHTML = '<p>Nenhum produto disponível no momento.</p>'
        return
    }

    console.log('DEBUG: Total de produtos:', produtos.length)
    const ativos = produtos.filter(p => p.ativo)
    console.log('DEBUG: Produtos ativos:', ativos.length)

    container.innerHTML = '';

    produtos.forEach(produto => {
        // Temporariamente mostrar todos os produtos, independente de ativo
        const produtoElement = criarProdutoElement(produto);
        container.appendChild(produtoElement);
    });
}

function criarProdutoElement(produto) {
    const article = document.createElement('article');
    article.className = 'produto';

    const figure = document.createElement('figure')
    const img = document.createElement('img')
    const placeholder = '../assets/img/placeholder.jpg'
    // Use imagem válida ou placeholder
    img.src = (produto.imagem_url && produto.imagem_url.toString().trim()) ? produto.imagem_url : placeholder
    img.alt = produto.nome || 'Produto'
    // evitar loop de onerror: remover handler após primeira falha
    img.onerror = function() { this.onerror = null; this.src = placeholder }

    const figcaption = document.createElement('figcaption')
    figcaption.textContent = produto.nome || ''
    figure.appendChild(img)
    figure.appendChild(figcaption)

    const desc = document.createElement('div')
    desc.className = 'produto-descricao'
    const pDesc = document.createElement('p')
    pDesc.textContent = produto.descricao || 'Descrição não disponível'
    desc.appendChild(pDesc)

    const benefits = document.createElement('div')
    benefits.className = 'produto-beneficios'
    const h4 = document.createElement('h4')
    h4.textContent = 'Características'
    const ul = document.createElement('ul')
    const liModelo = document.createElement('li')
    liModelo.textContent = `Modelo: ${produto.modelo || ''}`
    const liCategoria = document.createElement('li')
    liCategoria.textContent = `Categoria: ${produto.categoriaProduto && produto.categoriaProduto.nome ? produto.categoriaProduto.nome : 'Geral'}`
    ul.appendChild(liModelo)
    ul.appendChild(liCategoria)
    benefits.appendChild(h4)
    benefits.appendChild(ul)

    const controle = document.createElement('div')
    controle.className = 'controle-produto'
    const spanPreco = document.createElement('span')
    spanPreco.className = 'preco'
    spanPreco.textContent = `R$ ${parseFloat(produto.preco).toFixed(2)}`

    const inputQtde = document.createElement('input')
    inputQtde.type = 'number'
    inputQtde.min = '1'
    inputQtde.value = '1'
    inputQtde.className = 'input-qtde'
    inputQtde.id = `qtde-${produto.id}`

    const btn = document.createElement('button')
    btn.className = 'btn btn-primary'
    btn.textContent = 'Adicionar ao Carrinho'
    btn.addEventListener('click', () => adicionarAoCarrinho(produto.id))

    controle.appendChild(spanPreco)
    controle.appendChild(inputQtde)
    controle.appendChild(btn)

    article.appendChild(figure)
    article.appendChild(desc)
    article.appendChild(benefits)
    article.appendChild(controle)

    return article
}

async function adicionarAoCarrinho(idProduto) {
    const inputQtde = document.getElementById(`qtde-${idProduto}`)
    const quantidade = parseInt(inputQtde.value) || 1

    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || []
    const itemExistente = carrinho.find(item => item.id === idProduto)

    if (itemExistente) {
        itemExistente.quantidade += quantidade
        localStorage.setItem('carrinho', JSON.stringify(carrinho))
        mostrarFeedback('Produto adicionado ao carrinho!')
        return
    }

    try {
        // Usar cache local em vez de chamar endpoint /produto/:id (não existe)
        const produto = produtosCache.find(p => p.id === idProduto) || produtosCache.find(p => p.id === Number(idProduto))
        if (!produto) throw new Error('Produto não encontrado no cache')

        carrinho.push({ 
            id: produto.id, 
            nome: produto.nome, 
            preco: produto.preco, 
            imagem: produto.imagem_url, 
            quantidade 
        })
        localStorage.setItem('carrinho', JSON.stringify(carrinho))
        mostrarFeedback('Produto adicionado ao carrinho!')
    } catch (err) {
        console.error('Erro ao adicionar produto:', err)
        mostrarFeedback('Erro ao adicionar produto', 'error')
    }
}

function mostrarFeedback(mensagem, tipo = 'success') {
    // Criar elemento de feedback
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${tipo === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        z-index: 1000;
        font-weight: 500;
    `;
    feedback.textContent = mensagem;
    
    document.body.appendChild(feedback);
    
    // Remover após 3 segundos
    setTimeout(() => {
        feedback.remove();
    }, 2000);
}