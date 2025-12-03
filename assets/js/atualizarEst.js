const atualizar = document.getElementById('atualizar')
let mensagem = document.getElementById('message')

atualizar.addEventListener('click', (e) =>{
    e.preventDefault()

    let idProduto = document.getElementById('idProduto').value
    let movimentacao = document.getElementById('movimentacao').value
    let tipo = document.getElementById('tipo').value

    if(!idProduto || !movimentacao || !tipo){

        mensagem.innerHTML = `Preencha todos os campos para prosseguir.`
        mensagem.style.color = 'red'
        mensagem.style.textAlign = 'center'
        return
    }

    const valores = {
        movimentacao: parseInt(movimentacao),
        tipo: tipo
    }

    console.log(valores)

    const token = sessionStorage.getItem('token')
    fetch(`http://localhost:3000/estoque/${idProduto}`, {
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
        if(dados.status === 200){

            mensagem.style.textAlign = 'center'
            mensagem.style.color = 'black'
        }else{

            mensagem.style.color = 'black'
            mensagem.style.textAlign = 'center'
        }
    })
    .catch((err) =>{

        console.error('Erro ao atualizar estoque: ', err)
        mensagem.innerHTML = 'Erro ao atualizar estoque: ' + err.message
        mensagem.style.color = '#818380'
        mensagem.style.textAlign = 'center'
    })
})