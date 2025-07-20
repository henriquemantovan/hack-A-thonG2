import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const GerenciarLoja = () => {
  const router = useRouter();
  const [produtos, setProdutos] = useState<any[]>([]);

  useEffect(() => {
    const fetchProdutos = async () => {
      const res = await fetch("/api/products");
      const data = await res.json();
      console.log(data); // para garantir o formato
      setProdutos(data);
    };

    fetchProdutos();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-purple-200 flex flex-col">
      <header className="bg-blue-500 text-white px-4 py-3 shadow-md flex items-center">
        <button onClick={() => router.back()} className="hover:underline mr-4">
          ← Voltar
        </button>
      </header>

      <main className="flex flex-col items-center flex-1 px-4 py-8">
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {produtos.map((produto) => {
            // converte o preço para número
            const precoNumero = Number(produto.price);

            return (
              <div key={produto.id} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center">
                <img
                  src={produto.photo.startsWith('http') ? produto.photo : `/uploads/${produto.photo}`}
                  alt={produto.name}
                  className="w-full h-40 object-cover rounded-lg mb-4 border"
                />
                <h2 className="text-lg font-bold text-gray-800 mb-2">{produto.name}</h2>
                <p className="text-gray-600 mb-1">
                  Categoria: <span className="font-semibold">{produto.category}</span>
                </p>
                <p className="text-gray-600 mb-1">
                  Preço:{' '}
                  <span className="font-semibold">
                    {isNaN(precoNumero) ? '0.00' : precoNumero.toFixed(2)}
                  </span>
                </p>
                <p className="text-gray-600 mb-3">
                  Quantidade: <span className="font-semibold">{produto.quant}</span>
                </p>
                <div className="flex gap-2">
                  <button className="bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition">
                    Editar
                  </button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default GerenciarLoja;
