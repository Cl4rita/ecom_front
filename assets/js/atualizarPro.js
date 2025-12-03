const atualizar = document.getElementById('atualizar')
let mensagem = document.getElementById('message')

atualizar.addEventListener('click', (e) =>{
    e.preventDefault()

    let id = Number(document.getElementById('id').value)
    let nome = document.getElementById('nome').value
    let descricao = document.getElementById('descricao').value
    let modelo = document.getElementById('modelo').value
    let preco = document.getElementById('preco').value
    let imagem_url = document.getElementById('imagem_url').value
    let ativo = document.getElementById('ativo').value



    const valores = {}

    if (nome !== "") valores.nome = nome
    if (descricao !== "") valores.descricao = descricao
    if (modelo !== "") valores.modelo = modelo
    if (preco !== "") valores.preco = preco
    if (imagem_url !== "") valores.imagem_url = imagem_url
    
    // Se ATIVO for nulo no HTMl, converte pra TRUE
    // Necessário porque como é booleano, não aceita valores != true ou false
    if(ativo === "null") ativo = true

    if (ativo !== "") valores.ativo = ativo

    const token = sessionStorage.getItem('token')
    console.log(valores)

    // --------------------------------------------- ATUALIZAR COMPLETO --------------------------------------------
    if(nome && descricao && modelo && preco && imagem_url && ativo){

        console.log('Realizando PUT')
        fetch(`http://localhost:3000/produto/${id}`, {
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
        fetch(`http://localhost:3000/produto/${id}`, {
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