import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useStoreContract } from '../hooks/useStoreContract';
import { useTonConnect } from '../hooks/useTonConnect';
import { toNano } from '@ton/core';

const DebugCadastrarProduto = () => {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quant, setQuant] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagem, setImagem] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const { sender } = useTonConnect();
  const { storeContract, getItemMax } = useStoreContract(0n);

  const handleCadastrar = async () => {
    setUploading(true);
    setErrors({});

    try {
      const precoNumerico = parseFloat(preco.replace(',', '.'));
      const quantNumerico = parseInt(quant);

      if (!storeContract || !sender) {
        setErrors({ general: 'Contrato ou Wallet não conectados.' });
        return;
      }

      const itemCount = await getItemMax();
      const nextItemId = itemCount ? itemCount + 1n : 1n;

      await storeContract.send(
        sender,
        { value: toNano(0.2) },
        {
          $$type: 'AddItem',
          price: toNano(precoNumerico),
          quantity: BigInt(quantNumerico),
        }
      );

      alert(`Produto cadastrado! ID: ${nextItemId.toString()}`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setErrors({ general: 'Erro ao cadastrar: ' + (err instanceof Error ? err.message : 'Erro desconhecido') });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Debug - Cadastrar Produto</h2>
      {showSuccess && <p style={{ color: 'green' }}>✅ Produto cadastrado com sucesso!</p>}
      {errors.general && <p style={{ color: 'red' }}>❌ {errors.general}</p>}

      <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} /><br />
      <input placeholder="Preço em TON" value={preco} onChange={(e) => setPreco(e.target.value)} /><br />
      <input placeholder="Quantidade" value={quant} onChange={(e) => setQuant(e.target.value)} /><br />
      <input placeholder="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} /><br />

      <button onClick={handleCadastrar} disabled={uploading}>
        {uploading ? 'Enviando...' : 'Cadastrar Produto'}
      </button>
    </div>
  );
};

export default DebugCadastrarProduto;