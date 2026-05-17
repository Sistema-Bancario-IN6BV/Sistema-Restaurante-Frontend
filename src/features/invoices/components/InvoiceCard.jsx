import { useInvoiceStore } from "../store/useInvoiceStore";

export const InvoiceCard = ({ invoice }) => {

  const { payInvoice } = useInvoiceStore();

  return (
    <div className="bg-white shadow rounded-xl p-5">

      <h2 className="text-2xl font-bold">
        {invoice.invoiceNumber}
      </h2>

      <p>
        Estado: {invoice.status}
      </p>

      <p>
        Total: Q{invoice.total}
      </p>

      <div className="mt-4">

        {invoice.items.map((item, i) => (
          <div key={i}>
            {item.name} x {item.quantity}
          </div>
        ))}

      </div>

      {invoice.status === "PENDING" && (
        <button
          onClick={() =>
            payInvoice(invoice._id, "CARD")
          }
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        >
          Pagar
        </button>
      )}
    </div>
  );
};