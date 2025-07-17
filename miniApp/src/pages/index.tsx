import React from 'react';
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

const Home = () => {
  const router = useRouter();

  const handleButtonClick1 = () => {
    router.push('/novoproduto');
  };

  const handleButtonClick2 = () => {
    router.push('/gerenciarloja');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-md flex flex-col items-center">
        <h1 className="text-3xl font-extrabold font-mono text-gray-800 text-center mb-6">
          Welcome to MiniApp from [nome da loja]
        </h1>
        <Button label="Cadastrar novo produto" onClick={handleButtonClick1} />
        <div className="h-4" />
        <Button label="Gerenciar loja" onClick={handleButtonClick2} />
      </div>
    </div>
  );
};

export default Home;