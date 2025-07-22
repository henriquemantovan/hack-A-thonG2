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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    style={{ background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)', transition: 'background 0.3s ease'
     }}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-screen overflow-y-auto relative">
        {/* Header com design temático */}
        <div className="relative">
          <div className="bg-gradient-to-b from-red-500 to-red-600 h-16 relative overflow-hidden shadow-lg rounded-t-3xl">
            <div className="absolute inset-0 flex">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-red-500' : 'bg-white'}`} />
              ))}
            </div>

          </div>
          <div className="h-2 bg-gradient-to-b from-red-700 to-red-800" />
        </div>

        {/* conteudo*/}
        <div className="p-8" style={{ background: 'linear-gradient(135deg, #feebb3 0%, #fef3c7 100%)' }}>
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold mb-2 font-serif" style={{ color: '#5d412c' }}>
              Editar Produto
            </h2>
          </div>
          <div className="space-y-6">
            {/* nome */}
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
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl group-hover:rotate-1 transition-transform duration-300" />
              <div className="relative bg-white rounded-2xl p-4 shadow-lg">
                <label className="block text-sm font-bold mb-2" style={{ color: '#5d412c' }}>Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editandoProduto.price}
                  onChange={(e) => setEditandoProduto({...editandoProduto, price: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent text-gray-800 font-semibold"
                  disabled={salvando}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Quantidade e Categoria */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl group-hover:rotate-1 transition-transform duration-300" />
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

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl group-hover:rotate-1 transition-transform duration-300" />
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

            {/* imagens */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl group-hover:rotate-1 transition-transform duration-300" />
              <div className="relative bg-white rounded-2xl p-4 shadow-lg">
                <label className="block text-sm font-bold mb-3" style={{ color: '#5d412c' }}>Imagem do Produto</label>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Imagem atual:</p>
                  <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-4 border-amber-200">
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
                
                <label
                  htmlFor="nova-imagem"
                  className={`block w-full text-center py-3 px-4 rounded-xl cursor-pointer transition font-bold shadow-inner ${
                    salvando 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-amber-300 to-amber-300 text-amber-900 hover:from-amber-200 hover:to-amber-300 border-2 border-amber-300'
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
                
                {novaImagem && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200">
                    <p className="text-sm font-bold text-amber-700 mb-2">✓ Preview da nova imagem:</p>
                    <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-amber-300">
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

            <div className="flex gap-4 pt-4">
              <div className="flex-1 relative group">
                <button
                  onClick={handleSalvar}
                  disabled={salvando}
                    className={`flex-1 cursor-pointer font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 text-lg ${
                    salvando
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white border-amber-600 hover:border-amber-700'
                  }`}
                >
                  {salvando ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>

              <div className="flex-1 relative group">
                <button
                  onClick={onClose}
                  disabled={salvando}
                  className={`relative w-full font-bold cursor-pointer py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 text-lg ${
                    salvando
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400'
                        : 'bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white border-red-600 hover:border-red-700'
                  }`}
                >
                  Cancelar
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