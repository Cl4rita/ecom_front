const cadastrar = document.getElementById('cadastrar')
let mensagem = document.getElementById('message')

cadastrar.addEventListener('click', (e) =>{
    e.preventDefault()

    let nome = document.getElementById('nome').value
    let descricao = document.getElementById('descricao').value
    let is_ativo = document.getElementById('is_ativo').value

    if(!nome || !descricao ||!is_ativo){

        mensagem.innerHTML = `Preencha todos os campos para prosseguir.`
        mensagem.style.color = '#818380'
        mensagem.style.textAlign = 'center'
        return
    }

    const valores = {
        nome,
        descricao,
        is_ativo,
    }

    console.log(valores)

    const token = sessionStorage.getItem('token')
    fetch(`http://localhost:3000/categoria  `, {
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