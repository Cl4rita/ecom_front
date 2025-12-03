let tabelaProdutos = document.getElementById('tabelaProdutos')

window.addEventListener('DOMContentLoaded', () =>{

    const token = sessionStorage.getItem('token')
    fetch(`http://localhost:3000/produto`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(resp => resp.json())
    .then(dados =>{

        tabelaProdutos.innerHTML = ''
        tabelaProdutos.innerHTML = `<table> ${gerarTabela(dados)} </table>`
    })
})

function gerarTabela(dados){
    let tab = `
    <thead>
        <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Preço</th>
            <th>Marca</th>
            <th>Imagem</th>
            <th>Ativo</th>
        </tr>
    </thead>
    <tbody>
    `

    dados.forEach(dad => {
        // Formatar preço como moeda
        const precoFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(dad.preco);

        // Status com cor
        const status = dad.ativo === 'true' || dad.ativo === true ? 
            '<span style="color: #4CAF50;">✔ Ativo</span>' : 
            '<span style="color: #f44336;">✘ Inativo</span>';

        tab += `
        <tr>
            <td title="${dad.nome}">${dad.nome}</td>
            <td title="${dad.descricao}">${dad.descricao}</td>
            <td>${precoFormatado}</td>
            <td>${dad.modelo}</td>
            <td><img src="${dad.imagem_url}"></td>
            <td>${status}</td>
        </tr>
        `
    })
    
    tab += `</tbody>`
    return tab
}