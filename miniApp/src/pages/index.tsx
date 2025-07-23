// miniApp/src/pages/index.tsx - MODIFICADO COM VERIFICAÇÃO DE LOJA
import React, { useEffect, useState } from 'react';
import Button from '../components/Button';
import { useRouter } from 'next/router';
import { TelegramWebApp } from '../utils/telegram';

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface UserData {
  userId: string;
  firstName: string;
  lastName: string;
  chatId: string;
}

interface Loja {
  id: string;
  first_name: string;
  nome_loja: string;
}

const Home = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({
    userId: '',
    firstName: 'Visitante',
    lastName: '',
    chatId: ''
  });
  const [isConnected, setIsConnected] = useState(false);
  const [hasStore, setHasStore] = useState<boolean | null>(null);
  const [loja, setLoja] = useState<Loja | null>(null);
  const [storeName, setStoreName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  // Carrega os dados do usuário da URL ou do Telegram WebApp
  useEffect(() => {
    // Primeiro, tenta pegar dos parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('user_id');
    const firstNameFromUrl = urlParams.get('first_name');
    const lastNameFromUrl = urlParams.get('last_name');
    const chatIdFromUrl = urlParams.get('chat_id');

    if (userIdFromUrl && firstNameFromUrl) {
      const newUserData = {
        userId: userIdFromUrl,
        firstName: firstNameFromUrl,
        lastName: lastNameFromUrl || '',
        chatId: chatIdFromUrl || ''
      };
      setUserData(newUserData);
      setIsConnected(true);
      checkUserStore(userIdFromUrl);
    } else if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
      // Fallback: tenta pegar do Telegram WebApp
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      const chat = window.Telegram.WebApp.initDataUnsafe.chat;
      
      const newUserData = {
        userId: user.id.toString(),
        firstName: user.first_name || "Visitante",
        lastName: user.last_name || '',
        chatId: chat?.id.toString() || ''
      };
      setUserData(newUserData);
      setIsConnected(true);
      checkUserStore(user.id.toString());
    } else {
      setIsLoading(false);
    }

    // Expande o WebApp se disponível
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
    }
  }, []);

  // Verifica se o usuário já tem uma loja cadastrada
  const checkUserStore = async (userId: string) => {
    try {
      const response = await fetch('/api/lojas');
      const lojas: Loja[] = await response.json();
      
      const userStore = lojas.find(loja => loja.id === userId);
      
      if (userStore) {
        setHasStore(true);
        setLoja(userStore);
      } else {
        setHasStore(false);
      }
    } catch (error) {
      console.error('Erro ao verificar loja do usuário:', error);
      setHasStore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Cadastra uma nova loja
  const createStore = async () => {
    if (!storeName.trim() || !userData.userId) {
      alert('Por favor, digite o nome da loja');
      return;
    }

    setIsCreatingStore(true);

    try {
      const response = await fetch('/api/lojas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userData.userId,
          first_name: userData.firstName,
          nome_loja: storeName.trim()
        })
      });

      if (response.ok) {
        const novaLoja = await response.json();
        setLoja(novaLoja);
        setHasStore(true);
        
        // Envia dados para o bot se conectado
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.sendData(JSON.stringify({
            action: "store_created",
            userData: userData,
            storeName: storeName.trim(),
            timestamp: new Date().toISOString()
          }));
        }
      } else {
        const error = await response.json();
        alert(`Erro ao criar loja: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao criar loja:', error);
      alert('Erro ao criar loja. Tente novamente.');
    } finally {
      setIsCreatingStore(false);
    }
  };

  const handleButtonClick1 = () => {
    router.push('/novoproduto');
  };

  const handleButtonClick2 = () => {
    router.push('/gerenciarloja');
  };

  // Tela de loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 via-blue-100 to-indigo-200 p-4"
        style={{ background: '#0d97ac' }}
      >
        <div className="text-white text-xl font-bold">
          Carregando...
        </div>
      </div>
    );
  }

  // Tela de cadastro de loja
  if (hasStore === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 via-blue-100 to-indigo-200 p-4"
        style={{ background: '#0d97ac' }}
      >
        <div className="relative">
          {/* teto da barraquinha */}
          <div className="relative">
            <div className="bg-gradient-to-b from-red-500 to-red-600 rounded-t-3xl h-20 w-80 relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 flex">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: i % 2 === 0 ? '#f2402e' : '#fff',
                      borderTopLeftRadius: i === 0 ? '1.5rem' : 0,
                      borderTopRightRadius: i === 7 ? '1.5rem' : 0,
                    }}
                    className="flex-1"
                  />
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-red-700 to-red-800 " />
            </div>
          </div>

          {/* corpo da barraquinha - cadastro */}
          <div className="bg-gradient-to-b from-amber-200 to-amber-300 shadow-xl p-8 w-80 min-h-78 relative z-10"
            style={{ background: '#feebb3' }}
          >
            <div className="absolute inset-x-4 top-4 h-1 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full"                    
              style={{ background: '#5d412c' }}
            />
            <div className="absolute inset-x-4 bottom-7 h-1 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full"                     
              style={{ background: '#5d412c' }}
            />
            
            {/* Conteúdo de cadastro */}
            <div className="relative z-10 text-center">
              <h1
                className="text-2xl font-bold mb-2 font-serif"
                style={{ color: '#5d412c' }}
              >              
                Olá, {userData.firstName}!
              </h1>
              <h2
                className="text-lg font-bold mb-6 font-serif"
                style={{ color: '#5d412c' }}
              >
                Vamos cadastrar sua loja?
              </h2>

              {/* Campo para nome da loja */}
              <div className="mb-6">
                <label 
                  className="block text-sm font-bold mb-2" 
                  style={{ color: '#5d412c' }}
                >
                  Nome da sua loja:
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Digite o nome da loja"
                  className="w-full p-3 border-2 rounded-lg shadow-inner focus:outline-none focus:border-yellow-500"
                  style={{ 
                    backgroundColor: '#fff',
                    borderColor: '#5d412c',
                    color: '#5d412c'
                  }}
                  maxLength={50}
                />
              </div>
              
              {/* Botão de criar loja */}
              <button
                onClick={createStore}
                disabled={isCreatingStore || !storeName.trim()}
                className="w-full cursor-pointer bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-green-600 hover:border-green-700 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ 
                  background: isCreatingStore || !storeName.trim() ? '#ccc' : '#f0ae00', 
                  border: `2px solid ${isCreatingStore || !storeName.trim() ? '#999' : '#f0ae00'}` 
                }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>
                    {isCreatingStore ? 'Criando...' : 'Criar Minha Loja'}
                  </span>
                </div>
              </button>
            </div>
            
            <div className="absolute -bottom-2 left-0 right-0 h-6 bg-gradient-to-b from-amber-600 to-amber-800 rounded-b-lg z-10" 
              style={{ background: '#5d412c' }}
            />
          </div>
          
          <div className="absolute -bottom-4 left-4 right-4 h-4 bg-black bg-opacity-20 rounded-full blur-md z-0" />
        </div>
      </div>
    );
  }

  // Tela principal da loja (quando já tem loja cadastrada)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 via-blue-100 to-indigo-200 p-4"
      style={{ background: '#0d97ac' }}
    >
      <div className="relative">
        {/* teto da barraquinha */}
        <div className="relative">
          <div className="bg-gradient-to-b from-red-500 to-red-600 rounded-t-3xl h-20 w-80 relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 flex">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: i % 2 === 0 ? '#f2402e' : '#fff',
                    borderTopLeftRadius: i === 0 ? '1.5rem' : 0,
                    borderTopRightRadius: i === 7 ? '1.5rem' : 0,
                  }}
                  className="flex-1"
                />
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-red-700 to-red-800 " />
          </div>
        </div>

        {/* corpo da barraquinha */}
        <div className="bg-gradient-to-b from-amber-200 to-amber-300 shadow-xl p-8 w-80 min-h-78 relative z-10"
          style={{ background: '#feebb3' }}
        >
          <div className="absolute inset-x-4 top-4 h-1 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full"                    
            style={{ background: '#5d412c' }}
          />
          <div className="absolute inset-x-4 bottom-7 h-1 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full"                     
            style={{ background: '#5d412c' }}
          />
          
          {/* Conteúdo */}
          <div className="relative z-10 text-center">
            <h1
              className="text-xl font-bold mb-1 font-serif"
              style={{ color: '#5d412c' }}
            >              
              Bem-vindo à
            </h1>
            <h2
              className="text-2xl font-bold mb-2 font-serif"
              style={{ color: '#5d412c' }}
            >
              {loja?.nome_loja || 'Sua Loja'}
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={handleButtonClick1}
                className="w-full cursor-pointer bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-green-600 hover:border-green-700 text-lg"
                style={{ background: '#f0ae00', border: '2px solid #f0ae00' }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>📦 Cadastrar Produto</span>
                </div>
              </button>
              
              <button
                onClick={handleButtonClick2}
                className="w-full cursor-pointer bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-blue-600 hover:border-blue-700 text-lg"
                style={{ background: '#f0ae00', border: '2px solid #f0ae00' }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>🏪 Gerenciar Loja</span>
                </div>
              </button>
            </div>
          </div>
          
          <div className="absolute -bottom-2 left-0 right-0 h-6 bg-gradient-to-b from-amber-600 to-amber-800 rounded-b-lg z-10" 
            style={{ background: '#5d412c' }}
          />
        </div>
        
        <div className="absolute -bottom-4 left-4 right-4 h-4 bg-black bg-opacity-20 rounded-full blur-md z-0" />
      </div>
    </div>
  );
};

export default Home;