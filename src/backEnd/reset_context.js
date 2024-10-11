const axios = require('axios');
const contract_id = "telek"
const token_router = "Key dGVsZWtyb3V0ZXI6alBxTDBocjNOc3kwZVdwYVFINVU="
const identity = 553432937143
// Função para fazer a requisição para obter as variaveis
async function fazerRequisicaoInicial() {
  try {
    const response = await axios.post(`https://${contract_id}.http.msging.net/commands`, {
      id: '{{$guid}}',
      to: 'postmaster@builder.msging.net',
      method: 'get',
      uri: `/contexts/${identity}@wa.gw.msging.net`
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token_router
      }
    });

    // Retorno da requisição inicial
    return response.data;
  } catch (error) {
    console.error('Erro ao fazer a requisição inicial:', error);
    throw error;
  }
}

// Função para deletar variáveis retornadas na resposta da requisição inicial
async function deletarVariaveis(items) {
  try {
    for (const variable of items) {
      await axios.post(`https://${contract_id}.http.msging.net/commands`, {
        id: '{{$guid}}',
        to: 'postmaster@builder.msging.net',
        method: 'delete',
        uri: `/contexts/${identity}@wa.gw.msging.net/${variable}`
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token_router
        }
      });
      console.log(`Variável ${variable} deletada com sucesso.`);
    }
  } catch (error) {
    console.error('Erro ao deletar variáveis:', error);
    throw error;
  }
}

// Função principal
async function main() {
  try {
    // Faz a requisição inicial para obter as variáveis
    const response = await fazerRequisicaoInicial();
    
    // Extrai as variáveis da resposta
    const variaveis = response.resource.items;

    // Deleta cada variável
    await deletarVariaveis(variaveis);
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Executa a função principal
main();
