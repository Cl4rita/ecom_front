let mensagem = document.getElementById('message')

let cadastrar = document.getElementById('cadastrar')

cadastrar.addEventListener('click', (e) =>{
    e.preventDefault()

    let nome = document.getElementById('nome').value
    let email = document.getElementById('email').value
    let telefone = document.getElementById('telefone').value
    let cpf = document.getElementById('cpf').value
    let senha = document.getElementById('senha').value

    if(!nome || !email || !telefone || !cpf || !senha){

        mensagem.innerHTML = `Preencha todos os campos para prosseguir.`
        mensagem.style.color = 'pink'
        mensagem.style.textAlign = 'center'
        return
    }

    const valores = {
        nome: nome,
        email:email,
        telefone: telefone,
        cpf: cpf,
        senha: senha,
    }

    console.log(valores)

    fetch(`http://localhost:3000/usuario`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
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
        mensagem.style.color = 'pink'
        mensagem.style.textAlign = 'center'
    })
})