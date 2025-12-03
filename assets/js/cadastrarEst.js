let res = document.getElementById('res')
let resLis = document.getElementById('resLis')

let cadastrar = document.getElementById('cadastrar')
let listar = document.getElementById('listar')

const statusLog = localStorage.getItem('statusLog')

if(statusLog === "true"){
    listar.addEventListener('click', ()=> {
        if(resLis.style.display === 'block') {
            resLis.style.display = 'none'
        }else{
        fetch(`http://localhost:3000/terno?statusLog=${statusLog}`)
        .then(resp => resp.json())
        .then(dados => {
            dados.sort((a,b)=> a.marca.localeCompare(b.marca))
            resLis.innerHTML = ''
            resLis.innerHTML = `<table> ${gerarTabela(dados)} </table>`
            resLis.style.display = 'block'
        })
        .catch((err)=> {
            console.error('Erro ao listar', err)
        })
    }
    })

    cadastrar.addEventListener('click', (e)=> {
        e.preventDefault()
    
        let idVendedor = Number(document.getElementById('idVendedor').value)
        let idTerno = Number(document.getElementById('idTerno').value)
        let movimentacao = Number(document.getElementById('movimentacao').value)
        let tipo = document.getElementById('tipo').value
    
        const valores = {
            idTerno, idVendedor, movimentacao, tipo
        }
    
        fetch(`http://localhost:3000/estoque?statusLog=${statusLog}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(valores)
        })
        .then(resp => resp.json())
        .then(dados => {
    
            res.innerHTML = ''
            res.innerHTML = dados.message
        })
        .catch((err)=> {
            console.error('Erro no cadastrar', err)
        })
    })

}else{
    location.href = './vendedor.html'
}

function gerarTabela(dados){
    let tab = `
    <thead>
        <th>Nome</th>
        <th>Quantidade</th>
        <th>Preço</th>
        <th>Marca</th>
        <th>Imagem</th>
    </thead>
    `

    dados.forEach(dad => {
        tab += `
        <tr>
        <td>${dad.nome}</td>
        <td>${dad.quantidade}</td>
        <td>${dad.preco}</td>
        <td>${dad.marca}</td>
        <td><img src="${dad.imagem}"></td>
        </tr>
        `
    })
    tab += `<tbody>`
    return tab
}