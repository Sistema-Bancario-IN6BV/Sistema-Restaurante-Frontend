import {
  useEffect,
  useState,
  useMemo,
} from "react";

import { useInvoiceStore } from "../store/useInvoiceStore";
import { useAuthStore } from "../../../auth/store/authStore";

export const InvoicesPage = () => {
  const {
    invoices = [],
    getInvoices,
    deleteInvoice,
  } = useInvoiceStore();

  const [search, setSearch] =
    useState("");

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    getInvoices();
  }, []);

  const visibleInvoices =
    useMemo(() => {
      const value =
        search.toLowerCase();

      return invoices.filter(
        (invoice) =>
          (
            invoice.items || []
          ).some((item) =>
            (
              item.name || ""
            )
              .toLowerCase()
              .includes(value)
          )
      );
    }, [invoices, search]);

  const handlePrint = (
    invoice
  ) => {
    const printWindow =
      window.open(
        "",
        "_blank"
      );

    if (!printWindow) return;

    printWindow.document.write(`
      <html>

        <head>

          <title>
            Factura
          </title>

          <style>

            body{
              font-family: Arial, sans-serif;
              padding:40px;
              color:#222;
            }

            h1{
              color:#b48a57;
              margin-bottom:5px;
            }

            table{
              width:100%;
              border-collapse: collapse;
              margin-top:20px;
            }

            th{
              background:#f5f5f5;
            }

            th,td{
              border:1px solid #ddd;
              padding:12px;
              text-align:left;
            }

            .total{
              margin-top:30px;
              text-align:right;
              font-size:24px;
              font-weight:bold;
            }

          </style>

        </head>

        <body>

          <h1>
            Factura
          </h1>

          <p>
            Fecha:
            ${new Date(
              invoice.createdAt
            ).toLocaleDateString()}
          </p>

          <table>

            <thead>

              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>

            </thead>

            <tbody>

              ${(
                invoice.items || []
              )
                .map((item) => {
                  const unit =
                    Number(
                      item.unitPrice ??
                        item.price ??
                        item.unit_price ??
                        0
                    );

                  const subtotal =
                    (
                      Number(
                        item.quantity
                      ) || 1
                    ) * unit;

                  return `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.quantity}</td>
                      <td>Q${unit.toFixed(
                        2
                      )}</td>
                      <td>Q${subtotal.toFixed(
                        2
                      )}</td>
                    </tr>
                  `;
                })
                .join("")}

            </tbody>

          </table>

          <div class="total">
            TOTAL:
            Q${(
              invoice.items || []
            )
              .reduce(
                (s, it) =>
                  s +
                  Number(
                    it.unitPrice ??
                      it.price ??
                      it.unit_price ??
                      0
                  ) *
                    (
                      Number(
                        it.quantity
                      ) || 1
                    ),
                0
              )
              .toFixed(2)}
          </div>

        </body>

      </html>
    `);

    printWindow.document.close();

    printWindow.print();
  };

  return (
    <main className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-accent">
          Facturas
        </h1>

        <p className="text-text-muted mt-2">
          Gestión e impresión
          de facturas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div
          className="
            bg-bg-card
            border border-accent/10
            rounded-2xl
            p-5
            shadow-md
          "
        >
          <p className="text-sm text-text-muted">
            Facturas Totales
          </p>

          <h2 className="text-4xl font-bold text-accent mt-2">
            {invoices.length}
          </h2>
        </div>

        <div
          className="
            bg-bg-card
            border border-accent/10
            rounded-2xl
            p-5
            shadow-md
          "
        >
          <p className="text-sm text-text-muted">
            Total Generado
          </p>

          <h2 className="text-4xl font-bold text-green-400 mt-2">
            Q
            {invoices
              .reduce(
                (
                  acc,
                  invoice
                ) =>
                  acc +
                  Number(
                    invoice.total ||
                      0
                  ),
                0
              )
              .toFixed(2)}
          </h2>
        </div>
      </div>

      <div className="mb-6">
        <input
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="Buscar por plato..."
          className="w-full md:w-1/2 px-4 py-3 border rounded-lg bg-bg-page focus:outline-none focus:border-accent"
        />
      </div>

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-5
        "
      >
        {visibleInvoices.map(
          (invoice) => (
            <div
              key={invoice._id}
              className="
                bg-bg-card
                border border-accent/10
                rounded-2xl
                p-5
                shadow-md
                hover:shadow-xl
                transition-all
              "
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="text-2xl font-bold text-accent">
                    Factura
                  </h2>

                  <p className="text-sm text-text-muted mt-1">
                    {new Date(
                      invoice.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(
                  invoice.items ||
                  []
                ).map(
                  (
                    item,
                    index
                  ) => {
                    const unit =
                      Number(
                        item.unitPrice ??
                          item.price ??
                          item.unit_price ??
                          0
                      );

                    const subtotal =
                      unit *
                      (
                        Number(
                          item.quantity
                        ) || 1
                      );

                    return (
                      <div
                        key={
                          index
                        }
                        className="
                          flex
                          justify-between
                          items-center
                          border-b
                          border-accent/10
                          pb-2
                        "
                      >
                        <div>
                          <p className="font-semibold text-text-body">
                            {
                              item.name
                            }
                          </p>

                          <p className="text-xs text-text-muted">
                            Cantidad:{" "}
                            {
                              item.quantity
                            }
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-accent">
                            Q
                            {subtotal.toFixed(
                              2
                            )}
                          </p>

                          <p className="text-xs text-text-muted">
                            Q
                            {unit.toFixed(
                              2
                            )}{" "}
                            c/u
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div
                className="
                  mt-6
                  pt-5
                  border-t border-accent/10
                  flex
                  justify-between
                  items-center
                "
              >
                <div>
                  <p className="text-sm text-text-muted">
                    Total
                  </p>

                  <h3 className="text-3xl font-bold text-accent">
                    Q
                    {Number(
                      invoice.total ||
                        0
                    ).toFixed(2)}
                  </h3>
                </div>

                {/* Delete button removed per request */}

                <button
                  onClick={() => handlePrint(invoice)}
                  className="
                    bg-accent
                    text-bg-dark
                    px-5
                    py-2
                    rounded-xl
                    font-bold
                    hover:scale-105
                    transition-transform
                  "
                >
                  Imprimir
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
};

export default InvoicesPage;