import React, { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  photo: string;
  quant: number;
  category: string;
}

interface ModalEdicaoProdutoProps {
  produto: Product;
  onClose: () => void;
  onSave: (produto: Product, novaImagem?: File) => void;
  salvando: boolean;
}

const ModalEdicaoProduto: React.FC<ModalEdicaoProdutoProps> = ({ 
  produto, 
  onClose, 
  onSave, 
  salvando 
}) => {
  const [editandoProduto, setEditandoProduto] = useState<Product>({ ...produto });
  const [novaImagem, setNovaImagem] = useState<File | null>(null);

  const handleSalvar = () => {
    if (!editandoProduto.name || !editandoProduto.price || !editandoProduto.quant || !editandoProduto.category) {
      alert('Todos os campos são obrigatórios');
      return;
    }
    onSave(editandoProduto, novaImagem || undefined);
  };

  const getImageUrl = (photo: string) => {
    return photo.startsWith('http') ? photo : `/uploads/${photo}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-screen overflow-y-auto relative">
        {/* Header com design temático */}
        <div className="relative">
          <div className="bg-gradient-to-b from-red-500 to-red-600 h-16 relative overflow-hidden shadow-lg rounded-t-3xl">
            <div className="absolute inset-0 flex">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-red-500' : 'bg-white'}`} />
              ))}
            </div>
            <div className="relative z-10 flex items-center justify-center h-full px-6">
              <h3 className="text-2xl font-bold text-white font-serif">Editar Produto</h3>
            </div>
          </div>
          <div className="h-2 bg-gradient-to-b from-red-700 to-red-800" />
        </div>

        {/* Conteúdo do modal com design temático */}
        <div className="p-8" style={{ background: 'linear-gradient(135deg, #feebb3 0%, #fef3c7 100%)' }}>
          <div className="space-y-6">
            {/* Nome do Produto */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl group-hover:rotate-1 transition-transform duration-300" />
              <div className="relative bg-white rounded-2xl p-4 shadow-lg">
                <label className="block text-sm font-bold mb-2" style={{ color: '#5d412c' }}>Nome do Produto</label>
                <input
                  type="text"
                  value={editandoProduto.name}
                  onChange={(e) => setEditandoProduto({...editandoProduto, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent text-gray-800 font-semibold"
                  disabled={salvando}
                  placeholder="Nome do produto..."
                />
              </div>
            </div>

            {/* Preço */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-500 rounded-2xl group-hover:rotate-1 transition-transform duration-300" />
              <div className="relative bg-white rounded-2xl p-4 shadow-lg">
                <label className="block text-sm font-bold mb-2" style={{ color: '#5d412c' }}>Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editandoProduto.price}
                  onChange={(e) => setEditandoProduto({...editandoProduto, price: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-800 font-semibold"
                  disabled={salvando}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Quantidade e Categoria na mesma linha */}
            <div className="grid grid-cols-2 gap-4">
              {/* Quantidade */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl group-hover:rotate-1 transition-transform duration-300" />
                <div className="relative bg-white rounded-2xl p-4 shadow-lg">
                  <label className="block text-sm font-bold mb-2" style={{ color: '#5d412c' }}>Quantidade</label>
                  <input
                    type="number"
                    min="0"
                    value={editandoProduto.quant}
                    onChange={(e) => setEditandoProduto({...editandoProduto, quant: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 font-semibold"
                    disabled={salvando}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Categoria */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-purple-500 rounded-2xl group-hover:rotate-1 transition-transform duration-300" />
                <div className="relative bg-white rounded-2xl p-4 shadow-lg">
                  <label className="block text-sm font-bold mb-2" style={{ color: '#5d412c' }}>Categoria</label>
                  <input
                    type="text"
                    value={editandoProduto.category}
                    onChange={(e) => setEditandoProduto({...editandoProduto, category: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-800 font-semibold"
                    disabled={salvando}
                    placeholder="Categoria..."
                  />
                </div>
              </div>
            </div>

            {/* Seção de Imagem */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-pink-500 rounded-2xl group-hover:rotate-1 transition-transform duration-300" />
              <div className="relative bg-white rounded-2xl p-4 shadow-lg">
                <label className="block text-sm font-bold mb-3" style={{ color: '#5d412c' }}>Imagem do Produto</label>
                
                {/* Imagem atual */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Imagem atual:</p>
                  <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-4 border-pink-200">
                    <img
                      src={getImageUrl(editandoProduto.photo)}
                      alt={editandoProduto.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/200x200.png?text=Sem+Imagem';
                      }}
                    />
                  </div>
                </div>
                
                {/* Upload nova imagem */}
                <label
                  htmlFor="nova-imagem"
                  className={`block w-full text-center py-3 px-4 rounded-xl cursor-pointer transition font-bold shadow-inner ${
                    salvando 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700 hover:from-pink-200 hover:to-pink-300 border-2 border-pink-300'
                  }`}
                >
                  {salvando ? 'Processando...' : (novaImagem ? '✓ Nova imagem selecionada' : '📷 Alterar imagem')}
                </label>
                <input
                  id="nova-imagem"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={salvando}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNovaImagem(e.target.files[0]);
                    }
                  }}
                />
                
                {/* Preview da nova imagem */}
                {novaImagem && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                    <p className="text-sm font-bold text-green-700 mb-2">✓ Preview da nova imagem:</p>
                    <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-green-300">
                      <img
                        src={URL.createObjectURL(novaImagem)}
                        alt="Prévia"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-4 pt-4">
              {/* Botão Salvar */}
              <div className="flex-1 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-500 rounded-2xl group-hover:rotate-1 transition-transform duration-300" />
                <button
                  onClick={handleSalvar}
                  disabled={salvando}
                  className={`relative w-full py-4 px-6 rounded-2xl font-bold text-lg shadow-lg transform transition-all duration-200 ${
                    salvando
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-white text-green-600 hover:scale-105 hover:shadow-xl border-2 border-green-300'
                  }`}
                >
                  {salvando ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    '✓ Salvar Alterações'
                  )}
                </button>
              </div>

              {/* Botão Cancelar */}
              <div className="flex-1 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl group-hover:rotate-1 transition-transform duration-300" />
                <button
                  onClick={onClose}
                  disabled={salvando}
                  className={`relative w-full py-4 px-6 rounded-2xl font-bold text-lg shadow-lg transform transition-all duration-200 ${
                    salvando
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-gray-600 hover:scale-105 hover:shadow-xl border-2 border-gray-400'
                  }`}
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEdicaoProduto;