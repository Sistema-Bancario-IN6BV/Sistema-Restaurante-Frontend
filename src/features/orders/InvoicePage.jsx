import { useEffect, useState } from "react";
import { getInvoiceByOrder } from "./orderService";

export default function InvoicePage({ orderId }) {
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    getInvoiceByOrder(orderId)
      .then(res => setInvoice(res.data.data))
      .catch(() => setInvoice(null));
  }, [orderId]);

  if (!invoice) return <p>No hay factura aún</p>;

  return (
    <div>
      <h2>Factura</h2>
      <p>Total: {invoice.total}</p>
      <p>Impuesto: {invoice.taxAmount}</p>
      <p>Estado: {invoice.status}</p>
    </div>
  );
}