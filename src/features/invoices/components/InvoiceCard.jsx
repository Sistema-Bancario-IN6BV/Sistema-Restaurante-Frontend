import { useState } from "react";
import { useInvoiceStore } from "../store/useInvoiceStore";
export const InvoiceCard = ({ invoice }) => {

  const { payInvoice } = useInvoiceStore();
  const [paymentMethod, setPaymentMethod] = useState("CARD");

  const handlePrint = () => {

    const printWindow = window.open("", "_blank");

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
              color:#111827;
              background:#f9fafb;
            }

            .invoice-container{
              max-width:700px;
              margin:auto;
              background:white;
              border-radius:16px;
              padding:40px;
              box-shadow:0 10px 30px rgba(0,0,0,0.08);
            }

            .brand{
              font-size:42px;
              font-weight:bold;
              color:#b8860b;
              margin-bottom:30px;
            }

            .header{
              display:flex;
              justify-content:space-between;
              align-items:center;
              margin-bottom:30px;
            }

            .invoice-title{
              font-size:32px;
              font-weight:bold;
              margin:0;
            }

            .badge{
              background:#22c55e;
              color:white;
              padding:10px 18px;
              border-radius:999px;
              font-size:14px;
              font-weight:bold;
            }

            .info{
              margin-bottom:30px;
              line-height:1.8;
              font-size:16px;
            }

            .section-title{
              font-size:22px;
              font-weight:bold;
              margin-bottom:15px;
              color:#1f2937;
            }

            table{
              width:100%;
              border-collapse:collapse;
              margin-top:10px;
              overflow:hidden;
              border-radius:10px;
            }

            thead{
              background:#1f2937;
              color:white;
            }

            th{
              padding:14px;
              text-align:left;
              font-size:14px;
            }

            td{
              padding:14px;
              border-bottom:1px solid #e5e7eb;
              font-size:15px;
            }

            tbody tr:nth-child(even){
              background:#f3f4f6;
            }

            .total-box{
              margin-top:35px;
              display:flex;
              justify-content:flex-end;
            }

            .total{
              background:#111827;
              color:white;
              padding:18px 28px;
              border-radius:12px;
              font-size:26px;
              font-weight:bold;
            }

            .footer{
              margin-top:50px;
              text-align:center;
              color:#6b7280;
              font-size:14px;
            }

          </style>

        </head>

        <body>

          <div class="invoice-container">

            <div class="brand">
              KinalEats
            </div>

            <div class="header">

              <div>

                <h1 class="invoice-title">
                  ${invoice.invoiceNumber}
                </h1>

              </div>

              <div class="badge">
                ${invoice.status}
              </div>

            </div>

            <div class="info">

              <div>
                <strong>Fecha:</strong>
                ${new Date(invoice.createdAt).toLocaleDateString()}
              </div>

              <div>
                <strong>Método:</strong>
                ${invoice.paymentMethod || paymentMethod}
              </div>

            </div>

            <div class="section-title">
              Productos
            </div>

            <table>

              <thead>

                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Subtotal</th>
                </tr>

              </thead>

              <tbody>

                ${invoice.items.map(item => `

                  <tr>
                    <td>${item.name}</td>
                    <td>x${item.quantity}</td>
                    <td>Q${Number(item.subtotal).toFixed(2)}</td>
                  </tr>

                `).join("")}

              </tbody>

            </table>

            <div class="total-box">

              <div class="total">
                TOTAL Q${Number(invoice.total).toFixed(2)}
              </div>

            </div>

            <div class="footer">
              Gracias por su compra • KinalEats
            </div>

          </div>

        </body>

      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (

    <div className="bg-bg-card border border-accent/10 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-2xl font-bold text-accent">
            {invoice.invoiceNumber}
          </h2>

          <p className="text-sm text-text-muted mt-1">
            Estado:
            <span className="ml-2 font-semibold text-green-500">
              {invoice.status}
            </span>
          </p>

          <div className="mt-3">

            <p className="text-sm text-text-muted mb-1">
              Método de pago
            </p>

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value)
              }
              className="
                bg-bg-page
                border
                border-accent/20
                rounded-xl
                px-4
                py-2
                text-sm
                text-text-body
                outline-none
              "
            >

              <option value="CARD">
                Tarjeta
              </option>

              <option value="CASH">
                Efectivo
              </option>

              <option value="TRANSFER">
                Transferencia
              </option>

            </select>

          </div>

        </div>

        <div className="text-right">

          <p className="text-sm text-text-muted">
            Total
          </p>

          <h3 className="text-2xl font-bold text-accent">
            Q{Number(invoice.total).toFixed(2)}
          </h3>

        </div>

      </div>

      <div className="mt-5 space-y-2">

        {invoice.items.map((item, i) => (

          <div
            key={i}
            className="flex justify-between bg-bg-page/40 rounded-lg px-4 py-3"
          >

            <div>

              <span className="font-medium">
                {item.name}
              </span>

            </div>

            <div className="text-right">

              <p className="font-semibold">
                x{item.quantity}
              </p>

              <p className="text-sm text-text-muted">
                Q{Number(item.subtotal).toFixed(2)}
              </p>

            </div>

          </div>

        ))}

      </div>

      <div className="flex gap-3 mt-6">

        {invoice.status === "PENDING" && (

          <button
            onClick={() =>
              payInvoice(invoice._id, paymentMethod)
            }
            className="bg-green-600 hover:bg-green-700 transition text-white px-5 py-2 rounded-xl font-semibold"
          >

            Pagar

          </button>

        )}

        <button
          onClick={handlePrint}
          className="bg-accent hover:bg-gold-light transition text-bg-dark px-5 py-2 rounded-xl font-semibold"
        >

          Imprimir

        </button>

      </div>

    </div>
  );
};