import React from "react";

export const InvoicesPage = () => {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Mis Facturas</h1>
      <p className="text-sm text-text-muted mt-2">Aquí verás tus facturas recientes. Próximamente se añadirán más detalles.</p>
      <div className="mt-6 bg-bg-card p-4 rounded-md border">No hay facturas para mostrar.</div>
    </main>
  );
};

export default InvoicesPage;
