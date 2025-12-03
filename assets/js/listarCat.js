let tabelaCategoria = document.getElementById('tabelaCategoria')

window.addEventListener('DOMContentLoaded', () =>{

    const token = sessionStorage.getItem('token')
    fetch(`https://ecomback-production-666a.up.railway.app/categoria`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(resp => resp.json())
    .then(dados =>{

        tabelaCategoria.innerHTML = ''
        tabelaCategoria.innerHTML = `<table> ${gerarTabela(dados)} </table>`
    })
})

function gerarTabela(dados){
    let tab = `
    <thead>
        <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Ativo</th>
        </tr>
    </thead>
    <tbody>
    `

    dados.forEach(dad => {

        // Status com cor
        const status = dad.is_ativo === 'true' || dad.is_ativo === true ? 
            '<span style="color: #4CAF50;">✔ Ativo</span>' : 
            '<span style="color: #f44336;">✘ Inativo</span>';

        tab += `
        <tr>
            <td title="${dad.nome}">${dad.nome}</td>
            <td title="${dad.descricao}">${dad.descricao}</td>
            <td>${status}</td>
        </tr>
        `
    })
    
    tab += `</tbody>`
    return tab
}