import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { TelegramWebApp } from '../utils/telegram';

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

const Home = () => {
  const [idTelegram, setIdTelegram] = useState<number | null | undefined>(null);
  const [nomeLoja, setNomeLoja] = useState('');
  const [loja, setLoja] = useState<{ loja: string } | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      const id = user?.id;
      setIdTelegram(id);

      fetch(`/api/loja/${id}`)
        .then(res => {
          if (res.status === 404) {
            setLoja(null);
          } else {
            return res.json().then(data => setLoja(data));
          }
        })
        .catch(() => setLoja(null));
    }
  }, []);

  const handleButtonClick1 = () => {
    router.push('/novoproduto');
  };

  const handleButtonClick2 = () => {
    router.push('/gerenciarloja');
  };

  const cadastrarLoja = async () => {
    if (!idTelegram || !nomeLoja) return;

    const res = await fetch('/api/loja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_telegram: idTelegram, loja: nomeLoja }),
    });

    const dados = await res.json();
    setLoja(dados);
  };

  if (loja === null) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl mb-4">Bem-vindo! Cadastre o nome da sua loja:</h2>
        <input
          className="border px-4 py-2 rounded mb-4"
          value={nomeLoja}
          onChange={(e) => setNomeLoja(e.target.value)}
          placeholder="Nome da loja"
        />
        <br />
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded"
          onClick={cadastrarLoja}
        >
          Cadastrar
        </button>
      </div>
    );
  }

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
            Bem-vindo à
            </h1>
            <h2
              className="text-3xl font-bold mb-3 font-serif"
              style={{ color: '#5d412c' }}
            >
              [Nome da Loja]
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={handleButtonClick1}
                className="w-full cursor-pointer bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-green-600 hover:border-green-700 text-lg"
  style={{ background: '#f0ae00', border: '2px solid #f0ae00' }}
>
                <div className="flex items-center justify-center space-x-2">
                  <span>Cadastrar Produto</span>
                </div>
              </button>
              
              <button
                onClick={handleButtonClick2}
                className="w-full cursor-pointer bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-blue-600 hover:border-blue-700 text-lg"
  style={{ background: '#f0ae00', border: '2px solid #f0ae00' }}
>
                <div className="flex items-center justify-center space-x-2">
                  <span>Gerenciar Loja</span>
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