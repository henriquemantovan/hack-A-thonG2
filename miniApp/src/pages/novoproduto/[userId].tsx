import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../../components/Button';
import { useStoreContract } from '../../hooks/useStoreContract'; // Supondo que você tenha uma função para adicionar item ao contrato
import { createHash } from 'crypto';
import { useTonConnect } from '../../hooks/useTonConnect';
import { toNano } from '@ton/core';



const CadastrarProduto = () => {
  const router = useRouter();
  const { userId } = router.query;

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quant, setQuant] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagem, setImagem] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const { sender } = useTonConnect();

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

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    if (!nome.trim()) {
      newErrors.nome = 'O nome do produto é obrigatório';
    }

    if (!preco.trim()) {
      newErrors.preco = 'O preço é obrigatório';
    } else if (parseFloat(preco.replace(',', '.')) <= 0) {
      newErrors.preco = 'O preço deve ser maior que zero';
    }

    if (!quant.trim()) {
      newErrors.quant = 'A quantidade é obrigatória';
    } else if (parseInt(quant) < 0) {
      newErrors.quant = 'A quantidade não pode ser negativa';
    }

    if (!categoria.trim()) {
      newErrors.categoria = 'A categoria é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCadastrar = async () => {
    if (!validateFields() || typeof userId !== 'string') return;

    const { itemValue, loading, error, storeContract, getItemMax } = useStoreContract(0n);
    const { sender } = useTonConnect();
    setUploading(true);
    setErrors({});

    try {
      let imageUrl = 'https://res.cloudinary.com/drjnqkj8o/image/upload/v1753067071/produtos/jxrjkvoveztlcnhpggxs.png';

      if (imagem) {
        imageUrl = await uploadImage(imagem);
      }

      const precoNumerico = parseFloat(preco.replace(',', '.')) / 1000000000;
      const quantNumerico = parseInt(quant);

      const itemCount = await getItemMax();
      const nextItemId = itemCount ? itemCount + 1n : 1n;

      alert("passei aqui");
      alert(itemCount);
      if (!storeContract || !sender) {
          setErrors({ general: "Contrato ou wallet não conectados." });
          return;
        }
      await storeContract.send(
      sender,
      { value: toNano(0.2) },
      {
        $$type: "AddItem",
        price: toNano(precoNumerico),
        quantity: BigInt(quantNumerico),
      }
    );
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: nextItemId.toString(),
          name: nome,
          price: parseFloat(preco.replace(',', '.')),
          quant: parseInt(quant),
          category: categoria,
          photo: imageUrl,
          id_vendor: userId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowSuccess(true);
        handleLimpar();
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        setErrors({ general: 'Erro no servidor: ' + (data.error || 'Erro desconhecido') });
        console.error('Erro do servidor:', data);
      }
    } catch (err) {
      setErrors({
        general: 'Erro ao cadastrar produto: ' + (err instanceof Error ? err.message : 'Erro desconhecido'),
      });
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleLimpar = () => {
    setNome('');
    setPreco('');
    setQuant('');
    setCategoria('');
    setImagem(null);
    setErrors({});
    setShowSuccess(false);
  };

  const handleGoBack = () => {
    router.back();
  };

  if (typeof userId !== 'string') {
    return (
      <div className="min-h-screen flex justify-center items-center bg-yellow-100">
        <p>Carregando informações do usuário...</p>
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
        <div className="max-w-2xl mx-auto">
          {showSuccess && (
            <div className="mb-6 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-500 rounded-xl animate-pulse" />
              <div className="relative bg-white rounded-xl p-4 shadow-lg border-2 border-green-400">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h3 className="text-lg font-bold text-green-700">Produto cadastrado com sucesso!</h3>
                    <p className="text-green-600">O produto foi adicionado ao seu estoque.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errors.general && (
            <div className="mb-6 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-red-500 rounded-xl" />
              <div className="relative bg-white rounded-xl p-4 shadow-lg border-2 border-red-400">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <h3 className="text-lg font-bold text-red-700">Erro ao cadastrar produto</h3>
                    <p className="text-red-600">{errors.general}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold mb-2 font-serif" style={{ color: '#5d412c' }}>
              Cadastrar Produto
            </h2>
            <p className="text-amber-700 bg-white bg-opacity-60 rounded-lg p-2 inline-block shadow-inner" style={{ color: '#5d412c' }}>
              Adicione novos produtos ao seu estoque
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl group-hover:rotate-1 transition-transform duration-350" />
            <div className="relative bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-6">
                
                <div className="space-y-2">
                  <label className="block text-sm font-bold" style={{ color: '#5d412c' }}>
                    Nome do produto
                  </label>
                  <input
                    type="text"
                    placeholder="Digite o nome do produto"
                    value={nome}
                    onChange={(e) => {
                      setNome(e.target.value);
                      if (errors.nome) {
                        setErrors(prev => ({...prev, nome: ''}));
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 text-gray-800 transition-colors ${
                      errors.nome 
                        ? 'border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400' 
                        : 'border-amber-200 bg-amber-50 focus:ring-amber-400 focus:border-amber-400'
                    }`}
                    disabled={uploading}
                  />
                  {errors.nome && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <span>{errors.nome}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold" style={{ color: '#5d412c' }}>
                    Preço
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={preco}
                    onChange={(e) => {
                      setPreco(e.target.value);
                      if (errors.preco) {
                        setErrors(prev => ({...prev, preco: ''}));
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 text-gray-800 transition-colors ${
                      errors.preco 
                        ? 'border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400' 
                        : 'border-amber-200 bg-amber-50 focus:ring-amber-400 focus:border-amber-400'
                    }`}
                    disabled={uploading}
                  />
                  {errors.preco && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <span>{errors.preco}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold" style={{ color: '#5d412c' }}>
                    Quantidade em estoque
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Digite a quantidade"
                    value={quant}
                    onChange={(e) => {
                      setQuant(e.target.value);
                      if (errors.quant) {
                        setErrors(prev => ({...prev, quant: ''}));
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 text-gray-800 transition-colors ${
                      errors.quant 
                        ? 'border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400' 
                        : 'border-amber-200 bg-amber-50 focus:ring-amber-400 focus:border-amber-400'
                    }`}
                    disabled={uploading}
                  />
                  {errors.quant && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <span>{errors.quant}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold" style={{ color: '#5d412c' }}>
                    Categoria
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: móveis, papelaria, decoração..."
                    value={categoria}
                    onChange={(e) => {
                      setCategoria(e.target.value);
                      if (errors.categoria) {
                        setErrors(prev => ({...prev, categoria: ''}));
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 text-gray-800 transition-colors ${
                      errors.categoria 
                        ? 'border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400' 
                        : 'border-amber-200 bg-amber-50 focus:ring-amber-400 focus:border-amber-400'
                    }`}
                    disabled={uploading}
                  />
                  {errors.categoria && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <span>{errors.categoria}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold" style={{ color: '#5d412c' }}>
                    Foto do produto
                  </label>
                  <div className="w-full">
                    <label
                      htmlFor="imagem"
                      className={`block w-full text-center py-3 px-4 border-2 border-dashed rounded-xl cursor-pointer transition ${
                        uploading 
                          ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                          : 'border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-500'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <span className="text-2xl">📷</span>
                        <span className="font-semibold">
                          {uploading ? 'Fazendo upload...' : (imagem ? 'Clique para trocar a imagem' : 'Clique para selecionar uma imagem')}
                        </span>
                        {imagem && (
                          <span className="text-sm text-gray-600">
                            {imagem.name}
                          </span>
                        )}
                      </div>
                    </label>
                    <input
                      id="imagem"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImagem(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                </div>

                {imagem && (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold" style={{ color: '#5d412c' }}>
                      Prévia da imagem
                    </label>
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(imagem)}
                        alt="Prévia do produto"
                        className="w-full h-48 object-cover rounded-xl border-4 border-amber-200 shadow-inner"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleCadastrar}
                    disabled={uploading}
                    
                    className={`flex-1 cursor-pointer font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 text-lg ${
                      uploading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white border-amber-600 hover:border-amber-700'
                    }`}
                    style={!uploading ? { background: '#f0ae00', border: '2px solid #f0ae00' } : {}}
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                        <span>Cadastrando...</span>
                      </div>
                    ) : (
                      'Cadastrar Produto'
                    )}
                  </button>

                  <button
                    onClick={handleLimpar}
                    disabled={uploading}
                    className={`flex-1 font-bold cursor-pointer py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 text-lg ${
                      uploading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400'
                        : 'bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white border-red-600 hover:border-red-700'
                    }`}
                  >
                    Limpar Campos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CadastrarProduto;