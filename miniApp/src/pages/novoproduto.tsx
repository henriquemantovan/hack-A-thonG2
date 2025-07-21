import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../components/Button';

const CadastrarProduto = () => {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quant, setQuant] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagem, setImagem] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleCadastrar = async () => {
    if (!nome || !preco || !quant || !categoria) {
      alert('Preencha todos os campos');
      return;
    }

    setUploading(true);
    
    try {
      
      let imageUrl = 'https://res.cloudinary.com/drjnqkj8o/image/upload/v1753067071/produtos/jxrjkvoveztlcnhpggxs.png'; 
      
      if (imagem) {
        imageUrl = await uploadImage(imagem);
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: nome,
          price: parseFloat(preco.replace(',', '.')),
          quant: parseInt(quant),
          category: categoria,
          photo: imageUrl
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert("Produto cadastrado com sucesso!");
        handleLimpar();
      } else {
        alert("Erro no servidor: " + (data.error || "Erro desconhecido"));
        console.error("Erro do servidor:", data);
      }
    } catch (err) {
      alert("Erro ao cadastrar produto: " + (err instanceof Error ? err.message : 'Erro desconhecido'));
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-purple-200 flex flex-col">
      {/* Botão Voltar no topo */}
      <header className="bg-blue-500 text-white px-4 py-3 shadow-md">
        <button onClick={() => router.back()} className="hover:underline">
          ← Voltar
        </button>
      </header>

      {/* Conteúdo central */}
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-5">
          <h1 className="text-2xl font-bold font-mono text-gray-800 text-center">Cadastrar Novo Produto</h1>

          <input
            type="text"
            placeholder="Nome do produto"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={uploading}
          />

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Preço"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={uploading}
          />

          <input
            type="number"
            min="0"
            placeholder="Quantidade"
            value={quant}
            onChange={(e) => setQuant(e.target.value)}
            className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={uploading}
          />

          <input
            type="text"
            placeholder="Categoria (ex: móveis, papelaria...)"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={uploading}
          />

          <div className="w-full">
            <label
              htmlFor="imagem"
              className={`block w-full text-center py-2 px-4 rounded-lg cursor-pointer transition ${
                uploading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-slate-200 text-slate-400 hover:bg-slate-500'
              }`}
            >
              {uploading ? 'Fazendo upload...' : (imagem ? 'Selecionar outra imagem' : 'Escolher imagem')}
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

          {imagem && (
            <img
              src={URL.createObjectURL(imagem)}
              alt="Prévia do produto"
              className="w-full h-48 object-cover rounded-lg border"
            />
          )}

          <div className="flex justify-between gap-4">
            <Button 
              label={uploading ? "Cadastrando..." : "Cadastrar"} 
              onClick={handleCadastrar} 
              disabled={uploading}
            />
            <Button 
              label="Limpar" 
              onClick={handleLimpar} 
              disabled={uploading}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CadastrarProduto;