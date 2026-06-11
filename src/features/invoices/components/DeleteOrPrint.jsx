import React from 'react';
import { useInvoiceStore } from '../store/useInvoiceStore';

export const DeleteOrPrint = ({ invoice }) => {
  const { deleteInvoice } = useInvoiceStore();

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar factura? Esto la marcará como CANCELLED.')) return;
    try {
      await deleteInvoice(invoice._id);
      window.location.reload();
    } catch (e) {
      console.error('Error deleting invoice', e?.response || e);
      alert(e?.response?.data?.message || 'Error al eliminar factura');
    }
  };

  const handlePrint = () => {
    
    window.open('/customer/invoices', '_blank');
  };

  return (
    <div className="flex gap-3 mt-6">
      {invoice.status !== 'PAID' && (
        <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 transition text-white px-5 py-2 rounded-xl font-semibold">Eliminar</button>
      )}

      <button onClick={handlePrint} className="bg-accent hover:bg-gold-light transition text-bg-dark px-5 py-2 rounded-xl font-semibold">Imprimir</button>
    </div>
  );
};

export default DeleteOrPrint;
