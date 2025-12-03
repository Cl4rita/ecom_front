const cadastrar = document.getElementById('cadastrar')
let mensagem = document.getElementById('message')

cadastrar.addEventListener('click', (e) =>{
    e.preventDefault()

    let nomeEmpresa = document.getElementById('nomeEmpresa').value
    let email = document.getElementById('email').value
    let cnpj = document.getElementById('cnpj').value
    let telefone = document.getElementById('telefone').value

    if(!nomeEmpresa || !telefone || !cnpj || !email){

        mensagem.innerHTML = `Preencha todos os campos para prosseguir.`
        mensagem.style.color = '#818380'
        mensagem.style.textAlign = 'center'
        return
    }

    const valores = {
        nomeEmpresa,
        email,
        cnpj,
        telefone
    }

    console.log(valores)

    const token = sessionStorage.getItem('token')
    fetch(`https://ecomback-production-666a.up.railway.app/fornecedor`, {
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