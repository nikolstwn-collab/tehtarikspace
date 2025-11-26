// components/TransactionForm.js
'use client';

import { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Wallet, Banknote, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import ReceiptModal from './ReceiptModal';

export default function TransactionForm({ selectedProducts, setSelectedProducts, onComplete }) {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  const updateQuantity = (productId, change) => {
    setSelectedProducts(selectedProducts.map(p => {
      if (p.id === productId) {
        const newQty = p.quantity + change;
        if (newQty <= 0) return null;
        if (newQty > p.stock) {
          toast.error('Stok tidak mencukupi');
          return p;
        }
        return { ...p, quantity: newQty };
      }
      return p;
    }).filter(Boolean));
  };

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, p) => sum + (Number(p.price) * p.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      toast.error('Pilih produk terlebih dahulu');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          items: selectedProducts.map(p => ({
            productId: p.id,
            productName: p.name,
            quantity: p.quantity,
            price: p.price,
          })),
        }),
      });

      if (!response.ok) throw new Error('Gagal menyimpan transaksi');

      const data = await response.json();
      setLastTransaction(data);
      toast.success('Transaksi berhasil!');
      setShowReceipt(true);
      onComplete();
    } catch (error) {
      toast.error(error.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (selectedProducts.length === 0) return;
    if (confirm('Batalkan transaksi ini?')) {
      setSelectedProducts([]);
      toast.success('Transaksi dibatalkan');
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-tea rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Transaksi Penjualan</h2>
            <p className="text-sm text-gray-500">Tambah produk dari daftar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product List */}
          <div className="border border-gray-200 rounded-lg p-4 max-h-[400px] overflow-y-auto">
            {selectedProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada produk dipilih</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        Rp {Number(product.price).toLocaleString('id-ID')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, -1)}
                        className="w-7 h-7 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-medium">{product.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, 1)}
                        className="w-7 h-7 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'CASH', label: 'Cash', icon: Banknote },
                { value: 'EWALLET', label: 'E-Wallet', icon: Wallet },
                { value: 'DEBIT', label: 'Debit', icon: CreditCard },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentMethod(value)}
                  className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition ${
                    paymentMethod === value
                      ? 'border-tea bg-tea/5 text-tea'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-tea/5 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-tea">
                Rp {calculateTotal().toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || selectedProducts.length === 0}
              className="py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || selectedProducts.length === 0}
              className="py-3 bg-tea text-white font-semibold rounded-lg hover:bg-tea-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastTransaction && (
        <ReceiptModal
          transaction={lastTransaction}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
}