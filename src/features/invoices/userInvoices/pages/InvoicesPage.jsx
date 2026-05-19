import { useEffect } from "react";
import { useInvoiceStore } from "../store/useInvoiceStore";

export const InvoicesPage = () => {

  const {
    invoices,
    getInvoices,
    payInvoice,
  } = useInvoiceStore();

  useEffect(() => {
    getInvoices();
  }, []);

  const handlePrint = (invoice) => {

    const printWindow =
      window.open("", "_blank");

    printWindow.document.write(`
      <html>

        <head>

          <title>
            Factura ${invoice.invoiceNumber}
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

            .subtitle{
              color:#777;
              margin-bottom:20px;
            }

            .status{
              margin-bottom:20px;
              font-weight:bold;
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
            ${invoice.invoiceNumber}
          </h1>

          <p class="subtitle">
            Factura Restaurante
          </p>

          <p class="status">
            Estado:
            ${invoice.status}
          </p>

          <p>
            Fecha:
            ${new Date(invoice.createdAt)
              .toLocaleDateString()}
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

              ${invoice.items.map(item => `

                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>Q${item.unitPrice}</td>
                  <td>Q${item.subtotal}</td>
                </tr>

              `).join("")}

            </tbody>

          </table>

          <div class="total">
            TOTAL: Q${invoice.total}
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
          Gestión e impresión de facturas
        </p>

      </div>

      {/* RESUMEN */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

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
            Q{
              invoices
                .reduce(
                  (acc, invoice) =>
                    acc + invoice.total,
                  0
                )
                .toFixed(2)
            }
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
            Facturas Pagadas
          </p>

          <h2 className="text-4xl font-bold text-blue-400 mt-2">

            {
              invoices.filter(
                (invoice) =>
                  invoice.status === "PAID"
              ).length
            }

          </h2>

        </div>

      </div>

      {/* LISTA FACTURAS */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-5
        "
      >

        {invoices.map((invoice) => (

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

            {/* HEADER */}

            <div className="flex justify-between items-start mb-5">

              <div>

                <h2 className="text-2xl font-bold text-accent">

                  {invoice.invoiceNumber}

                </h2>

                <p className="text-sm text-text-muted mt-1">

                  {
                    new Date(invoice.createdAt)
                      .toLocaleDateString()
                  }

                </p>

              </div>

              <span
                className={`
                  px-4
                  py-2
                  rounded-full
                  text-xs
                  font-bold
                  ${
                    invoice.status === "PAID"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  }
                `}
              >

                {invoice.status}

              </span>

            </div>

            {/* PRODUCTOS */}

            <div className="space-y-3">

              {invoice.items.map((item, index) => (

                <div
                  key={index}
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

                      {item.name}

                    </p>

                    <p className="text-xs text-text-muted">

                      Cantidad:
                      {" "}
                      {item.quantity}

                    </p>

                  </div>

                  <div className="text-right">

                    <p className="font-bold text-accent">

                      Q{item.subtotal}

                    </p>

                    <p className="text-xs text-text-muted">

                      Q{item.unitPrice} c/u

                    </p>

                  </div>

                </div>

              ))}

            </div>

            {/* FOOTER */}

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

                  Q{invoice.total}

                </h3>

              </div>

              <div className="flex gap-3">

                {
                  invoice.status === "PENDING" && (

                    <button
                      onClick={() =>
                        payInvoice(
                          invoice._id,
                          "CARD"
                        )
                      }
                      className="
                        bg-green-600
                        hover:bg-green-700
                        text-white
                        px-5
                        py-2
                        rounded-xl
                        font-semibold
                        transition-all
                      "
                    >

                      Pagar

                    </button>

                  )
                }

                <button
                  onClick={() =>
                    handlePrint(invoice)
                  }
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

          </div>

        ))}

      </div>

    </main>
  );
};

export default InvoicesPage;