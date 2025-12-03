// Recupera os botões e inputs pelos seus IDs
const b1 = document.getElementById('btn1')
const b2 = document.getElementById('btn2')
const b3 = document.getElementById('btn3')
const b4 = document.getElementById('btn4')

const q1 = document.getElementById('qtde1')
const q2 = document.getElementById('qtde2')
const q3 = document.getElementById('qtde3')
const q4 = document.getElementById('qtde4')

// Carrega o carrinho existente ou inicia um novo array
let produtos = JSON.parse(localStorage.getItem('produtos')) || []
const userToken = sessionStorage.getItem('token')
console.log(userToken)

if(userToken !== null){

    // Função genérica para adicionar produto
    function adicionarProduto(b, q) {
        const originalText = b.textContent;
        const originalColor = b.style.backgroundColor;
        
        // Efeito visual de confirmação
        b.style.backgroundColor = '#10b981' // Verde
        b.style.color = 'white'
        b.textContent = '✓ Adicionado!'

        setTimeout(() => {
            b.style.backgroundColor = originalColor;
            b.style.color = '';
            b.textContent = originalText;
        }, 1000);

        const nome = b.dataset.nome
        const preco = Number(b.dataset.preco)
        const codProd = b.dataset.codprod
        const qtde = Number(q.value)

        const produto = { nome, preco, codProd, qtde }

        // Verifica se o produto já existe no carrinho
        const produtoExistente = produtos.find(p => p.codProd === codProd)
        if (produtoExistente) {
            produtoExistente.qtde += qtde
        } else {
            produtos.push(produto)
        }
        
        localStorage.setItem('produtos', JSON.stringify(produtos))
    }

    // Eventos individuais
    b1.addEventListener('click', () => adicionarProduto(b1, q1))
    b2.addEventListener('click', () => adicionarProduto(b2, q2))
    b3.addEventListener('click', () => adicionarProduto(b3, q3))
    b4.addEventListener('click', () => adicionarProduto(b4, q4))
}else{

    window.location = '../index.html'
}

