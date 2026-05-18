import { useEffect } from "react";

import { useInvoiceStore } from "../store/useInvoiceStore";
import { InvoiceCard } from "./InvoiceCard";

export const Invoices = () => {

  const { invoices, getInvoices } = useInvoiceStore();

  useEffect(() => {
    getInvoices();
  }, []);

  return (
    <div className="p-5">

      <h1 className="text-3xl font-bold mb-5">
        Facturas
      </h1>

      <div className="grid md:grid-cols-2 gap-5">

        {invoices.map((invoice) => (
          <InvoiceCard
            key={invoice._id}
            invoice={invoice}
          />
        ))}

      </div>
    </div>
  );
};