// components/ReceiptModal.js
'use client';

import { X, Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function ReceiptModal({ transaction, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      CASH: 'Tunai',
      EWALLET: 'E-Wallet',
      DEBIT: 'Debit Card',
    };
    return labels[method] || method;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between print:hidden">
          <h3 className="text-xl font-bold text-gray-800">Struk Pembayaran</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 print:p-8" id="receipt">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-tea-dark mb-1">Teh Tarik Space</h1>
            <p className="text-sm text-gray-600">Jl. Malioboro No. 123, Yogyakarta</p>
            <p className="text-sm text-gray-600">Telp: 0274-123456</p>
          </div>

          <div className="border-t border-b border-dashed border-gray-300 py-3 mb-4 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">No. Transaksi:</span>
              <span className="font-mono font-semibold">{transaction.id}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Tanggal:</span>
              <span>{format(new Date(transaction.transactionDate), 'dd MMM yyyy HH:mm', { locale: id })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kasir:</span>
              <span className="capitalize">{transaction.user?.employee?.name || 'Kasir'}</span>
            </div>
          </div>

          {/* Items */}
          <div className="mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2">Item</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Harga</th>
                  <th className="text-right py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items?.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2">{item.productName}</td>
                    <td className="text-center py-2">{item.quantity}</td>
                    <td className="text-right py-2">
                      {Number(item.price).toLocaleString('id-ID')}
                    </td>
                    <td className="text-right py-2 font-semibold">
                      {Number(item.subtotal).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="border-t-2 border-gray-300 pt-3 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold">TOTAL</span>
              <span className="text-2xl font-bold text-tea-dark">
                Rp {Number(transaction.totalAmount).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Metode Bayar:</span>
              <span className="font-semibold">{getPaymentMethodLabel(transaction.paymentMethod)}</span>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 border-t border-dashed border-gray-300 pt-4">
            <p className="mb-1">Terima kasih atas kunjungan Anda!</p>
            <p>Selamat menikmati ☕</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-tea text-white font-semibold rounded-lg hover:bg-tea-dark transition"
          >
            <Printer className="w-5 h-5" />
            <span>Print</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt,
          #receipt * {
            visibility: visible;
          }
          #receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}