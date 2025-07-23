// miniApp/src/pages/index.tsx - MODIFICADO
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

const Home = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({
    userId: '',
    firstName: 'Visitante',
    lastName: '',
    chatId: ''
  });
  const [isConnected, setIsConnected] = useState(false);

  // Carrega os dados do usuário da URL ou do Telegram WebApp
  useEffect(() => {
    // Primeiro, tenta pegar dos parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('user_id');
    const firstNameFromUrl = urlParams.get('first_name');
    const lastNameFromUrl = urlParams.get('last_name');
    const chatIdFromUrl = urlParams.get('chat_id');

    if (userIdFromUrl && firstNameFromUrl) {
      setUserData({
        userId: userIdFromUrl,
        firstName: firstNameFromUrl,
        lastName: lastNameFromUrl || '',
        chatId: chatIdFromUrl || ''
      });
      setIsConnected(true);
    } else if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
      // Fallback: tenta pegar do Telegram WebApp
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      const chat = window.Telegram.WebApp.initDataUnsafe.chat;
      
      setUserData({
        userId: user.id.toString(),
        firstName: user.first_name || "Visitante",
        lastName: user.last_name || '',
        chatId: chat?.id.toString() || ''
      });
      setIsConnected(true);
    }

    // Expande o WebApp se disponível
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
    }
  }, []);

  const handleButtonClick1 = () => {
    router.push('/novoproduto');
  };

  const handleButtonClick2 = () => {
    router.push('/gerenciarloja');
  };

  const requestUserData = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify({
        action: "request_user",
        userData: userData
      }));
    }
  };

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
              className="text-2xl font-bold mb-2 font-serif"
              style={{ color: '#5d412c' }}
            >              
              Bem-vindo à sua loja
            </h1>
            <h2
              className="text-3xl font-bold mb-3 font-serif"
              style={{ color: '#5d412c' }}
            >
              {userData.firstName}!
            </h2>

            {/* Informações do usuário */}
            {isConnected && (
              <div className="mb-4 p-3 bg-white bg-opacity-50 rounded-lg">
                <p className="text-sm font-medium" style={{ color: '#5d412c' }}>
                  👤 ID: {userData.userId}
                </p>
                <p className="text-sm" style={{ color: '#5d412c' }}>
                  💬 Chat: {userData.chatId}
                </p>
                {userData.lastName && (
                  <p className="text-sm" style={{ color: '#5d412c' }}>
                    📝 Nome completo: {userData.firstName} {userData.lastName}
                  </p>
                )}
              </div>
            )}

            {!isConnected && (
              <button
                onClick={requestUserData}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg shadow-md transition-colors mb-4"
              >
                Conectar minha conta do Telegram
              </button>
            )}
            
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

            {/* Botão para testar envio de dados de volta */}
            {isConnected && (
              <button
                onClick={() => {
                  if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.sendData(JSON.stringify({
                      action: "user_info_test",
                      userData: userData,
                      timestamp: new Date().toISOString()
                    }));
                  }
                }}
                className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md transition-colors text-sm"
              >
                🔄 Enviar dados para o bot
              </button>
            )}
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