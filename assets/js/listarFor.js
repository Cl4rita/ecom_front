let tabelaFornecedor = document.getElementById('tabelaFornecedor')

window.addEventListener('DOMContentLoaded', () =>{

    const token = sessionStorage.getItem('token')
    fetch(`https://ecomback-production-666a.up.railway.app/fornecedor`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(resp => resp.json())
    .then(dados =>{

        tabelaFornecedor.innerHTML = ''
        tabelaFornecedor.innerHTML = `<table> ${gerarTabela(dados)} </table>`
    })
})

function gerarTabela(dados){
    let tab = `
    <thead>
        <tr>
            <th>Nome da Empresa</th>
            <th>CNPJ</th>
            <th>Telefone</th>
            <th>Email</th>
        </tr>
    </thead>
    <tbody>
    `

    dados.forEach(dad => {
        tab += `
        <tr>
            <td title="${dad.nomeEmpresa}">${dad.nomeEmpresa}</td>
            <td title="${dad.cnpj}">${dad.cnpj}</td>
            <td title="${dad.telefone}">${dad.telefone}</td>
            <td title="${dad.email}">${dad.email}</td>
        </tr>
        `
    })
    
    tab += `</tbody>`
    return tab
}