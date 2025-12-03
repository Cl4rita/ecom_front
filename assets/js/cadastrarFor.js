const cadastrar = document.getElementById('cadastrar')
let mensagem = document.getElementById('message')

cadastrar.addEventListener('click', (e) =>{
    e.preventDefault()

    let nomeEmpresa = document.getElementById('nomeEmpresa').value
    let idCategoria = Number(document.getElementById('idCategoria').value)
    let cnpj = document.getElementById('cnpj').value
    let modelo = document.getElementById('modelo').value
    let preco = document.getElementById('preco').value
    let imagem_url = document.getElementById('imagem_url').value
    let ativo = document.getElementById('ativo').value

    if(!nomeEmpresa || !modelo || !preco || !ativo || !idCategoria){

        mensagem.innerHTML = `Preencha todos os campos para prosseguir.`
        mensagem.style.color = 'pink'
        mensagem.style.textAlign = 'center'
        return
    }

    const valores = {
        nomeEmpresa,
        idCategoria,
        cnpj,
        modelo,
        preco,
        imagem_url,
        ativo,
    }

    console.log(valores)

    const token = sessionStorage.getItem('token')
    fetch(`http://localhost:3000/produto`, {
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
        mensagem.style.color = 'pink'
        mensagem.style.textAlign = 'center'
    })
})