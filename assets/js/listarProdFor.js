let tabelaProdutoFornecedor = document.getElementById('tabelaProdutoFornecedor')

window.addEventListener('DOMContentLoaded', () =>{

    const token = sessionStorage.getItem('token')
    fetch(`https://ecomback-production-666a.up.railway.app/produtoFornecedor`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(resp => resp.json())
    .then(dados =>{

        tabelaProdutoFornecedor.innerHTML = ''
        tabelaProdutoFornecedor.innerHTML = `<table> ${gerarTabela(dados)} </table>`
    })
})

function gerarTabela(dados){
    let tab = `
    <thead>
        <tr>
            <th>Código do Produto</th>
            <th>Código do Fornecedor</th>
            <th>Custo Atual</th>
            <th>Código Referencia</th>
        </tr>
    </thead>
    <tbody>
    `

    dados.forEach(dad => {
        tab += `
        <tr>
            <td title="${dad.idProduto}">${dad.idProduto}</td>
            <td title="${dad.idFornecedor}">${dad.idFornecedor}</td>
            <td title="${dad.custoUnitarioAtual}">${dad.custoUnitarioAtual}</td>
            <td title="${dad.codigoReferencia}">${dad.codigoReferencia}</td>
        </tr>
        `
    })
    
    tab += `</tbody>`
    return tab
}