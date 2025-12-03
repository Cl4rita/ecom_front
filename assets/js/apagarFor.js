const apagar = document.getElementById('apagar')
let mensagem = document.getElementById('message')

apagar.addEventListener('click', (e) =>{
    e.preventDefault()

    let id = document.getElementById('id').value

    if(!id){

        mensagem.style.textAlign = 'center'
        mensagem.style.color = '#818380'
        return mensagem.innerHTML = 'Preencha o campo necessário para prosseguir.'
    }

    const token = sessionStorage.getItem('token')
    fetch(`http://localhost:3000/fornecedor/${id}`, {
        method: 'DELETE',
        headers: {

            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },  
    })
    .then(resp =>{
    
        if(resp.status === 204){

            mensagem.innerHTML = ''
            mensagem.innerHTML += 'Dados apagados com sucesso.'
            mensagem.style.textAlign = 'center'
        }else if(resp.status === 404){

            mensagem.innerHTML = ''
            mensagem.innerHTML += 'Fornecedor não encontrado.'
            mensagem.style.textAlign = 'center'
        }
    })
    .catch((err) =>{
    
        console.error('Erro ao apagar: ', err)
        mensagem.innerHTML = 'Erro ao apagar: ' + err
        mensagem.style.color = '#818380'
        mensagem.style.textAlign = 'center'
    }) 
})