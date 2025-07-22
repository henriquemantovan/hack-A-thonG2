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

interface Loja {
  id: string;
  id_telegram: string;
  nome_loja: string;
}

const Home = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | undefined>();
  const [loja, setLoja] = useState<Loja | null>(null);
  const [loading, setLoading] = useState(true);
  const [nomeLoja, setNomeLoja] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Verifica se está rodando no Telegram
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.expand();
      
      // Verifica se veio do bot (initData)
      if (webApp.initData) {
        const user = webApp.initDataUnsafe?.user;
        if (user?.id) {
          setUserId(user.id.toString());
          verificarLoja(user.id.toString());
          return;
        }
      }
      
      // Se não tem initData, tenta pegar do query string (quando aberto pelo bot)
      const queryParams = new URLSearchParams(window.location.search);
      const tgWebAppData = queryParams.get('tgWebAppData');
      
      if (tgWebAppData) {
        try {
          const data = JSON.parse(decodeURIComponent(tgWebAppData));
          if (data.user?.id) {
            setUserId(data.user.id.toString());
            verificarLoja(data.user.id.toString());
            return;
          }
        } catch (e) {
          console.error('Error parsing tgWebAppData:', e);
        }
      }
    }
    
    setLoading(false);
  }, []);

  const verificarLoja = async (telegramId: string) => {
    try {
      const res = await fetch(`/api/loja/${telegramId}`);
      if (res.ok) {
        const data = await res.json();
        setLoja(data);
      } else if (res.status === 404) {
        setLoja(null);
      } else {
        throw new Error('Erro ao verificar loja');
      }
    } catch (err) {
      console.error('Erro:', err);
      setError('Erro ao carregar informações da loja');
    } finally {
      setLoading(false);
    }
  };

  const handleCadastrarLoja = async () => {
    if (!nomeLoja.trim()) {
      setError('O nome da loja é obrigatório');
      return;
    }

    if (!userId) {
      setError('ID do usuário não encontrado');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/loja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_telegram: userId,
          nome_loja: nomeLoja,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLoja(data);
        setError('');
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao cadastrar loja');
      }
    } catch (err) {
      console.error('Erro:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick1 = () => {
    router.push('/novoproduto');
  };

  const handleButtonClick2 = () => {
    router.push('/gerenciarloja');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d97ac' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-lg text-white mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver no Telegram ou não tiver user.id
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d97ac' }}>
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: '#5d412c' }}>
            Acesso não autorizado
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Este aplicativo deve ser acessado através do Telegram.
          </p>
        </div>
      </div>
    );
  }

  // Se não tiver loja cadastrada
  if (!loja) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d97ac' }}>
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
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-red-700 to-red-800" />
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
            
            <div className="relative z-10 text-center">
              <h1 className="text-2xl font-bold mb-6 font-serif" style={{ color: '#5d412c' }}>
                Cadastre sua loja
              </h1>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-bold mb-2 text-left" style={{ color: '#5d412c' }}>
                  Nome da sua loja
                </label>
                <input
                  type="text"
                  value={nomeLoja}
                  onChange={(e) => {
                    setNomeLoja(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-800"
                  placeholder="Ex: Minha Loja Incrível"
                />
              </div>

              <button
                onClick={handleCadastrarLoja}
                disabled={loading}
                className="w-full cursor-pointer bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-amber-600 hover:border-amber-700 text-lg"
                style={{ background: '#f0ae00', border: '2px solid #f0ae00' }}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Loja'}
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

  // Se tiver loja cadastrada - tela principal
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0d97ac' }}>
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
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-red-700 to-red-800" />
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
            <h1 className="text-2xl font-bold mb-2 font-serif" style={{ color: '#5d412c' }}>
              Bem-vindo à
            </h1>
            <h2 className="text-3xl font-bold mb-6 font-serif" style={{ color: '#5d412c' }}>
              {loja.nome_loja}
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