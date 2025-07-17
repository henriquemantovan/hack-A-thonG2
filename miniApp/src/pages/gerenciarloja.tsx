import React from 'react';
import { useRouter } from 'next/router';

const produtos = [
  {
    id: 1,
    nome: 'Cadeira Gamer',
    preco: 899.99,
    quant: 5,
    categoria: 'Móveis',
    imagem: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    nome: 'Caneta Azul',
    preco: 2.5,
    quant: 120,
    categoria: 'Papelaria',
    imagem: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    nome: 'Notebook Dell',
    preco: 3500,
    quant: 2,
    categoria: 'Eletrônicos',
    imagem: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
  },
    {
    id: 4,
    nome: 'Notebook Dell',
    preco: 3500,
    quant: 2,
    categoria: 'Eletrônicos',
    imagem: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
  },
];

const GerenciarLoja = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-purple-200 flex flex-col">
      <header className="bg-blue-500 text-white px-4 py-3 shadow-md flex items-center">
        <button onClick={() => router.back()} className="hover:underline mr-4">
          ← Voltar
        </button>
        <h1 className="text-xl font-bold font-mono">Produtos da Loja</h1>
      </header>

      <main className="flex flex-col items-center flex-1 px-4 py-8">
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {produtos.map((produto) => (
            <div key={produto.id} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center">
              <img
                src={produto.imagem}
                alt={produto.nome}
                className="w-full h-40 object-cover rounded-lg mb-4 border"
              />
              <h2 className="text-lg font-bold text-gray-800 mb-2">{produto.nome}</h2>
              <p className="text-gray-600 mb-1">Categoria: <span className="font-semibold">{produto.categoria}</span></p>
              <p className="text-gray-600 mb-1">Preço: <span className="font-semibold">R$ {produto.preco.toFixed(2)}</span></p>
              <p className="text-gray-600 mb-3">Quantidade: <span className="font-semibold">{produto.quant}</span></p>
              <div className="flex gap-2">
                <button className="bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition">Editar</button>
                <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GerenciarLoja;