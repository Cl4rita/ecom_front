const atualizar = document.getElementById('atualizar')
let mensagem = document.getElementById('message')

atualizar.addEventListener('click', (e) =>{
    e.preventDefault()

    let id = Number(document.getElementById('id').value)
    let nomeEmpresa = document.getElementById('nomeEmpresa').value
    let email = document.getElementById('email').value
    let cnpj = document.getElementById('cnpj').value
    let telefone = document.getElementById('telefone').value

    const valores = {}

    if (nomeEmpresa !== "") valores.nomeEmpresa = nomeEmpresa
    if (email !== "") valores.email = email
    if (cnpj !== "") valores.cnpj = cnpj
    if (telefone !== "") valores.telefone = telefone

    const token = sessionStorage.getItem('token')
    console.log(valores)

    // --------------------------------------------- ATUALIZAR COMPLETO --------------------------------------------
    if(nomeEmpresa && email && cnpj && telefone){

        console.log('Realizando PUT')
        fetch(`https://ecomback-production-666a.up.railway.app/fornecedor/${id}`, {
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
        fetch(`https://ecomback-production-666a.up.railway.app/fornecedor/${id}`, {
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