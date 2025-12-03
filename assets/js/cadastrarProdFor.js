const cadastrar = document.getElementById('cadastrar')
let mensagem = document.getElementById('message')

cadastrar.addEventListener('click', (e) =>{
    e.preventDefault()

    let idProduto = Number(document.getElementById('idProduto').value)
    let idFornecedor = Number(document.getElementById('idFornecedor').value)
    let custoUnitarioAtual = Number(document.getElementById('custoUnitarioAtual').value)
    let codigoReferencia = Number(document.getElementById('codigoReferencia').value)

    if(!idProduto || !codigoReferencia || !custoUnitarioAtual || !idFornecedor){

        mensagem.innerHTML = `Preencha todos os campos para prosseguir.`
        mensagem.style.color = '#818380'
        mensagem.style.textAlign = 'center'
        return
    }

    const valores = {
        idProduto,
        idFornecedor,
        custoUnitarioAtual,
        codigoReferencia
    }

    console.log(valores)

    const token = sessionStorage.getItem('token')
    fetch(`https://ecomback-production-666a.up.railway.app/produtoFornecedor`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },  
        body: JSON.stringify(valores)
    })
    .then(resp => resp.json())
    .then(dados =>{

        console.log(dados)
        mensagem.innerHTML = ''
        mensagem.innerHTML += dados.message
        mensagem.style.textAlign = 'center'
    })
    .catch((err) =>{

        console.error('Erro ao realizar o cadastro: ', err)
        mensagem.innerHTML = 'Erro ao realizar o cadastro: ' + err
        mensagem.style.color = '#818380'
        mensagem.style.textAlign = 'center'
    })
})