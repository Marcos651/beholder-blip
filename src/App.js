import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Importando o arquivo de estilos CSS

const contract_id = "telek";
const token_router = process.env.ROUTER

const App = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [apiResponse1, setApiResponse1] = useState(null);
  const [apiResponse2, setApiResponse2] = useState(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [contextCleared, setContextCleared] = useState(false);
  const [variablesVisible, setVariablesVisible] = useState(true);
  const [consoleVisible, setConsoleVisible] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(null); // Adicionando o estado selectedBlock

  useEffect(() => {
    let intervalId;

    if (phoneNumber) {
      intervalId = setInterval(() => {
        handleFilter();
      }, 500);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [phoneNumber]);

  const handleResetVariables = async () => {
    setLoading1(true);
    try {
      const identity = phoneNumber;

      // Primeira requisição para obter as variáveis de contexto
      const response = await axios.post(
        `https://${contract_id}.http.msging.net/commands`,
        {
          id: '{{$guid}}',
          to: 'postmaster@builder.msging.net',
          method: 'get',
          uri: `/contexts/${identity}@wa.gw.msging.net`
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token_router
          }
        }
      );

      const variaveis = response.data.resource.items;

      // Deleta cada variável de contexto
      for (const variable of variaveis) {
        await axios.post(
          `https://${contract_id}.http.msging.net/commands`,
          {
            id: '{{$guid}}',
            to: 'postmaster@builder.msging.net',
            method: 'delete',
            uri: `/contexts/${identity}@wa.gw.msging.net/${variable}`
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token_router
            }
          }
        );
        console.log(`Variável ${variable.name}: ${variable.value}`);
      }

      setApiResponse1(variaveis);
      setContextCleared(true);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading1(false);
    }
  };

  const handleFilter = async () => {
    setLoading2(true);
    try {
      const identity = phoneNumber;

      // Primeira requisição para obter variáveis de contexto
      const response1 = await axios.post(
        `https://${contract_id}.http.msging.net/commands`,
        {
          id: '{{$guid}}',
          method: 'get',
          uri: `/contexts/${identity}@wa.gw.msging.net?withContextValues=true`
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token_router
          }
        }
      );

      setApiResponse1(response1.data.resource.items);

      // Segunda requisição para obter histórico de mensagens
      const response2 = await axios.post(
        `https://${contract_id}.http.msging.net/commands`,
        {
          id: '{{$guid}}',
          method: 'get',
          uri: `/threads/${identity}@wa.gw.msging.net?$take=100`
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token_router
          }
        }
      );

      setApiResponse2(response2.data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading2(false);
    }
  };

  const handleBlockClick = (block) => {
    setSelectedBlock(block);
  };

  const handleCloseModal = () => {
    setSelectedBlock(null);
  };

  const handleToggleVariables = () => {
    setVariablesVisible(!variablesVisible);
  };

  const handleToggleConsole = () => {
    setConsoleVisible(!consoleVisible);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <input
          type="text"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <button onClick={handleFilter} disabled={loading2}>Filtrar</button>
        <button onClick={handleResetVariables} disabled={loading1}>
          {loading1 ? 'Aguarde...' : 'Zerar'}
        </button>
        <button onClick={handleToggleVariables}>
          {variablesVisible ? 'Esconder Variáveis' : 'Mostrar Variáveis'}
        </button>
        <button onClick={handleToggleConsole}>
          {consoleVisible ? 'Esconder Console' : 'Mostrar Console'}
        </button>
      </header>

      <div className="debug-console">
        {contextCleared && (
          <div className="debug-message">
            <p>Contexto zerado com sucesso!</p>
          </div>
        )}

        {variablesVisible && apiResponse1 && (
          <div className="debug-response1">
            <h2>VARIÁVEIS:</h2>
            {apiResponse1.map(variable => (
              <p key={variable.name}><strong>{variable.name}:</strong> {variable.value}</p>
            ))}
          </div>
        )}

        {consoleVisible && apiResponse2 && (
          <div className="debug-response2">
            <h2>CONSOLE:</h2>
            <div className="blocks-container">
              {apiResponse2.resource.items
                .filter(item => item.metadata && item.metadata["#stateName"])
                .reverse() // Inverte a ordem dos itens
                .map((item, index, array) => (
                  <React.Fragment key={index}>
                    <div className="block" onClick={() => handleBlockClick(item)}>
                      {item.metadata["#stateName"]}
                    </div>
                    {index < array.length - 1 && (
                      <div className="arrow">&#8594;</div>
                    )}
                  </React.Fragment>
                ))}
            </div>
          </div>
        )}

        {selectedBlock && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={handleCloseModal}>&times;</span>
              <h2>Detalhes do Bloco</h2>
              <pre>{JSON.stringify(selectedBlock, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
