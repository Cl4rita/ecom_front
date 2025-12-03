const atualizar = document.getElementById('atualizar')
let mensagem = document.getElementById('message')

atualizar.addEventListener('click', (e) =>{
    e.preventDefault()

    let id = Number(document.getElementById('id').value)
    let nome = document.getElementById('nome').value
    let descricao = document.getElementById('descricao').value
    let is_ativo = document.getElementById('is_ativo').value



    const valores = {}

    if (nome !== "") valores.nome = nome
    if (descricao !== "") valores.descricao = descricao
    
    // Se is_ativo for nulo no HTMl, converte pra TRUE
    // Necessário porque como é booleano, não aceita valores != true ou false
    if(is_ativo === "null") is_ativo = true

    if (is_ativo !== "") valores.is_ativo = is_ativo

    const token = sessionStorage.getItem('token')
    console.log(valores)

    // --------------------------------------------- ATUALIZAR COMPLETO --------------------------------------------
    if(nome && descricao && is_ativo){

        console.log('Realizando PUT')
        fetch(`http://localhost:3000/categoria/${id}`, {
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
            mensagem.style.color = 'pink'
            mensagem.style.textAlign = 'center'
        })
    // -------------------------------------------- ATUALIZAR PARCIAL --------------------------------------------
    }else{

        console.log('Realizando PATCH')
        fetch(`http://localhost:3000/categoria/${id}`, {
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
            mensagem.style.color = 'pink'
            mensagem.style.textAlign = 'center'
        }) 
    }
})