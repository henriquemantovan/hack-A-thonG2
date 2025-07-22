'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ModalEdicaoProduto from '../components/edicao';

interface Product {
  id: string;
  name: string;
  price: number;
  photo: string;
  quant: number;
  category: string;
}

const GerenciarLoja = () => {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoProduto, setEditandoProduto] = useState<Product | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProdutos(data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        alert('Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer upload da imagem');
    }

    const data = await response.json();
    return data.url;
  };

  const handleEditar = (produto: Product) => {
    setEditandoProduto(produto);
  };

  const handleSalvarEdicao = async (produtoEditado: Product, novaImagem?: File) => {
    setSalvando(true);

    try {
      let photoUrl = produtoEditado.photo;
      
      // Se uma nova imagem foi selecionada, faz o upload
      if (novaImagem) {
        photoUrl = await uploadImage(novaImagem);
      }

      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: produtoEditado.id,
          name: produtoEditado.name,
          price: produtoEditado.price,
          photo: photoUrl,
          quant: produtoEditado.quant,
          category: produtoEditado.category
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Produto atualizado com sucesso!');
        setProdutos(produtos.map(p => p.id === produtoEditado.id ? data : p));
        setEditandoProduto(null);
      } else {
        alert('Erro ao atualizar produto: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao atualizar produto');
    } finally {
      setSalvando(false);
    }
  };

  const handleFecharModal = () => {
    if (!salvando) {
      setEditandoProduto(null);
    }
  };

  const handleExcluir = async (produto: Product) => {
    const confirmacao = window.confirm(`Tem certeza que deseja excluir o produto "${produto.name}"?`);
    if (!confirmacao) return;

    try {
      const res = await fetch(`/api/products?id=${produto.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        alert('Produto excluído com sucesso!');
        setProdutos(produtos.filter(p => p.id !== produto.id));
      } else {
        alert('Erro ao excluir produto: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto');
    }
  };

  const getImageUrl = (photo: string) => {
    return photo.startsWith('http') ? photo : `/uploads/${photo}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="text-lg text-gray-700 mt-4">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#feebb3' }}>
      <header className="relative">
        <div className="bg-gradient-to-b from-red-500 to-red-600 h-16 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 flex">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`flex-1 ${i % 2 === 0 ? '#f2402e' : 'bg-white'}`} />
            ))}
          </div>
          <div className="relative z-10 flex items-center h-full px-6">
            <button
              onClick={handleGoBack}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 text-red-600 font-bold py-2 px-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Voltar</span>
            </button>
          </div>
        </div>
        <div className="h-3 bg-gradient-to-b from-red-700 to-red-800" />
      </header>

      <main className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold mb-2 font-serif" style={{ color: '#5d412c' }}>
              Estoque da loja
            </h2>
            <p className="text-amber-700 bg-white bg-opacity-60 rounded-lg p-2 inline-block shadow-inner" style={{ color: '#5d412c' }}>
              Edite e exclua os produtos disponíveis na sua loja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtos.map((produto) => {
              const precoNumero = Number(produto.price);
              const imagem = getImageUrl(produto.photo);

              return (
                <div key={produto.id} className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl group-hover:rotate-1 transition-transform duration-350" />
                  <div className="relative bg-white rounded-2xl shadow-xl p-6 transform group-hover:scale-104 transition-all duration-350">
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg" style={{ background: '#0d97ac' }}>
                      {produto.category}
                    </div>
                    <div className="relative mb-4">
                      <img
                        src={imagem}
                        alt={produto.name}
                        className="w-full h-40 object-cover rounded-xl border-4 border-amber-200 shadow-inner"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/200x200.png?text=Sem+Imagem';
                        }}
                      />
                    </div>
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{produto.name}</h3>
                      <div className="bg-amber-100 rounded-lg p-3 mb-3">
                        <p className="text-2xl font-bold text-green-600 mb-1">
                          R$ {isNaN(precoNumero) ? '0.00' : precoNumero.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Estoque: <span className="font-semibold">{produto.quant} unidades</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditar(produto)}
                        className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-yellow-600 hover:border-yellow-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluir(produto)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-red-700 hover:border-red-800"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Modal de Edição */}
      {editandoProduto && (
        <ModalEdicaoProduto
          produto={editandoProduto}
          onClose={handleFecharModal}
          onSave={handleSalvarEdicao}
          salvando={salvando}
        />
      )}
    </div>
  );
};

export default GerenciarLoja;