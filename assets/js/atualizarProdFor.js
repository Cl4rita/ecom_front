const atualizar = document.getElementById('atualizar')
let mensagem = document.getElementById('message')

atualizar.addEventListener('click', (e) =>{
    e.preventDefault()

    let id = Number(document.getElementById('id').value)
    let idProduto = Number(document.getElementById('idProduto').value)
    let idFornecedor = Number(document.getElementById('idFornecedor').value)
    let custoUnitarioAtual = Number(document.getElementById('custoUnitarioAtual').value)
    let codigoReferencia = Number(document.getElementById('codigoReferencia').value)



    const valores = {}

    if (idProduto !== "") valores.idProduto = idProduto
    if (idFornecedor !== "") valores.idFornecedor = idFornecedor
    if (custoUnitarioAtual !== "") valores.custoUnitarioAtual = custoUnitarioAtual
    if (codigoReferencia !== "") valores.codigoReferencia = codigoReferencia

    const token = sessionStorage.getItem('token')
    console.log(valores)

    // --------------------------------------------- ATUALIZAR COMPLETO --------------------------------------------
    if(idProduto && descricao && is_ativo){

        console.log('Realizando PUT')
        fetch(`http://localhost:3000/produtoFornecedor/${id}`, {
            method: 'PUT',
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
    
            console.error('Erro ao atualizar completamente: ', err)
            mensagem.innerHTML = 'Erro ao atualizar completamente: ' + err
            mensagem.style.color = '#818380'
            mensagem.style.textAlign = 'center'
        })
    }else{

        console.log('Realizando PATCH')
        fetch(`http://localhost:3000/produtoFornecedor/${id}`, {
            method: 'PATCH',
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
    
            console.error('Erro ao atualizar parcialmente: ', err)
            mensagem.innerHTML = 'Erro ao atualizar parcialmente: ' + err
            mensagem.style.color = '#818380'
            mensagem.style.textAlign = 'center'
        }) 
    }
})