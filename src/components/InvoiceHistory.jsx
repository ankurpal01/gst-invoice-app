import React, { useState } from "react";
import { Search, FileText, Download, Edit, Copy, Trash2, Calendar, User, Printer } from "lucide-react";

export default function InvoiceHistory({
  invoices,
  setActiveTab,
  setEditingInvoice,
  setDuplicatingInvoice,
  onDeleteInvoice,
  onDownloadPDF,
  onPrintPDF,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);
  };

  const handleDuplicate = (inv) => {
    setDuplicatingInvoice(inv);
    setActiveTab("create");
  };

  const handleEdit = (inv) => {
    setEditingInvoice(inv);
    setActiveTab("create");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Invoice History</h1>
          <p className="text-slate-400 text-sm mt-1">
            Search, duplicate, delete, and download generated tax invoices.
          </p>
        </div>
      </div>

      {/* Search Filter Row */}
      <div className="relative max-w-md w-full">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Search by invoice no. or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 text-sm transition-all"
        />
      </div>

      {/* Invoices List / Grid */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <FileText size={56} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-base font-bold text-white mb-1">No Invoices Found</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              {searchTerm
                ? "Try searching for a different invoice number or client name."
                : "Create a new invoice to populate your transaction history."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-450 text-xs font-semibold uppercase border-b border-slate-800">
                    <th className="p-4">Invoice No.</th>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Taxable Amt</th>
                    <th className="p-4 text-right">Grand Total</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-900/30 transition-colors text-sm text-slate-300"
                    >
                      <td className="p-4 font-semibold text-teal-400">{inv.invoiceNumber}</td>
                      <td className="p-4 font-medium text-white">{inv.customerName}</td>
                      <td className="p-4">
                        {new Date(inv.invoiceDate).toLocaleDateString("en-GB")}
                      </td>
                      <td className="p-4 text-right">{formatCurrency(inv.taxableValue)}</td>
                      <td className="p-4 text-right font-bold text-white">
                        {formatCurrency(inv.grandTotal)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(inv)}
                            className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Edit Invoice"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(inv)}
                            className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Duplicate Invoice"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            onClick={() => onPrintPDF(inv)}
                            className="p-2 bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-slate-950 rounded-lg transition-colors cursor-pointer"
                            title="Print / Preview PDF"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={() => onDownloadPDF(inv)}
                            className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Download PDF File"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to delete invoice ${inv.invoiceNumber}?`
                                )
                              ) {
                                onDeleteInvoice(inv.id);
                              }
                            }}
                            className="p-2 bg-rose-500/10 text-rose-450 hover:bg-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout View */}
            <div className="grid grid-cols-1 divide-y divide-slate-800 md:hidden">
              {filteredInvoices.map((inv) => (
                <div key={inv.id} className="p-5 space-y-4 text-sm text-slate-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-teal-400 font-bold">{inv.invoiceNumber}</span>
                      <h4 className="text-white font-semibold mt-1">{inv.customerName}</h4>
                    </div>
                    <span className="font-bold text-white">{formatCurrency(inv.grandTotal)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {new Date(inv.invoiceDate).toLocaleDateString("en-GB")}
                    </span>
                    <span>Taxable: {formatCurrency(inv.taxableValue)}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-950/20">
                    <button
                      onClick={() => handleEdit(inv)}
                      className="flex items-center justify-center gap-1.5 py-2 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(inv)}
                      className="flex items-center justify-center gap-1.5 py-2 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <Copy size={14} /> Copy
                    </button>
                    <button
                      onClick={() => onPrintPDF(inv)}
                      className="flex items-center justify-center gap-1.5 py-2 bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      title="Print / View PDF"
                    >
                      <Printer size={14} /> Print
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete invoice ${inv.invoiceNumber}?`
                          )
                        ) {
                          onDeleteInvoice(inv.id);
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 bg-rose-500/10 text-rose-450 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
