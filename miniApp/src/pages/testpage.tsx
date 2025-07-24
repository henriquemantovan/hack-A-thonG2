import React, { useState } from "react";
import { toNano } from "@ton/core";
import { useStoreContract } from "../hooks/useStoreContract";
import { useTonConnect } from "../hooks/useTonConnect";

export default function StoreViewer() {
  const [inputId, setInputId] = useState("");
  const [itemId, setItemId] = useState<bigint>(0n);

  const [priceInput, setPriceInput] = useState("");
  const [quantityInput, setQuantityInput] = useState("");
  const [txStatus, setTxStatus] = useState("");

  const { itemValue, loading, error, storeContract } = useStoreContract(itemId);
  const { sender, connected } = useTonConnect();

  const handleFetchItem = () => {
    if (!inputId.trim()) {
      alert("Digite um ID válido.");
      return;
    }

    try {
      const parsedId = BigInt(inputId.trim());
      setItemId(parsedId);
    } catch {
      alert("ID inválido. Deve ser um número.");
    }
  };

  const handleAddItem = async () => {
    if (!connected || !sender) {
      alert("❌ Conecte sua wallet primeiro.");
      return;
    }

    if (!storeContract) {
      alert("❌ Contrato não carregado.");
      return;
    }

    const price = parseFloat(priceInput);
    const quantity = parseInt(quantityInput);

    if (isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) {
      alert("❌ Preencha preço e quantidade válidos.");
      return;
    }

    try {
      setTxStatus("⏳ Enviando transação...");

      await storeContract.send(
        sender,
        { value: toNano(0.2) },
        {
          $$type: "AddItem",
          price: toNano(price),
          quantity: BigInt(quantity),
        }
      );

      setTxStatus("✅ Item adicionado com sucesso!");
    } catch (err) {
      console.error(err);
      setTxStatus("❌ Falha ao adicionar item.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "500px" }}>
      <h2>Consultar Item da Store</h2>

      <input
        type="text"
        value={inputId}
        onChange={(e) => setInputId(e.target.value)}
        placeholder="Digite o ID do item (ex: 1)"
        style={inputStyle}
      />

      <button onClick={handleFetchItem} style={buttonStyle}>Buscar Item</button>

      {loading && <p>🔄 Carregando item...</p>}
      {error && <p style={{ color: "red" }}>❌ Erro: {error}</p>}

      {itemValue && (
        <div style={boxStyle}>
          <h3>📦 Detalhes do Item</h3>
          <p><strong>Preço:</strong> {itemValue.price.toString()}</p>
          <p><strong>Quantidade:</strong> {itemValue.quantity.toString()}</p>
          <p><strong>Dono:</strong> {itemValue.owner.toString()}</p>
        </div>
      )}

      <hr style={{ margin: "30px 0" }} />

      <h2>Adicionar Novo Item</h2>

      <input
        type="text"
        value={priceInput}
        onChange={(e) => setPriceInput(e.target.value)}
        placeholder="Preço (TON)"
        style={inputStyle}
      />

      <input
        type="text"
        value={quantityInput}
        onChange={(e) => setQuantityInput(e.target.value)}
        placeholder="Quantidade"
        style={inputStyle}
      />

      <button onClick={handleAddItem} style={greenButton}>➕ Adicionar Item</button>

      {txStatus && <p>{txStatus}</p>}
    </div>
  );
}

// 🎨 Estilos
const inputStyle = {
  padding: "10px",
  fontSize: "16px",
  width: "100%",
  marginBottom: "10px",
  boxSizing: "border-box" as const,
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "4px",
  marginBottom: "20px",
};

const greenButton = {
  ...buttonStyle,
  backgroundColor: "#28a745",
};

const boxStyle = {
  border: "1px solid #ccc",
  padding: "15px",
  borderRadius: "5px",
};
