import React from "react";
import { PlusCircle, FileText, IndianRupee, Percent, ArrowRight, TrendingUp } from "lucide-react";

export default function Dashboard({ invoices, setActiveTab, setEditingInvoice, onDownloadPDF, onPrintPDF }) {
  // Compute analytics
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const totalTax = invoices.reduce((sum, inv) => sum + (inv.igstAmount || 0), 0);
  const totalTaxable = invoices.reduce((sum, inv) => sum + (inv.taxableValue || 0), 0);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate))
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            GST Invoice Hub <TrendingUp className="text-teal-400 h-5 w-5" />
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generate, manage, and print compliant GST Invoices instantly.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingInvoice(null);
            setActiveTab("create");
          }}
          className="mt-4 md:mt-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-semibold rounded-xl hover:from-teal-400 hover:to-cyan-400 focus:ring-2 focus:ring-teal-500/20 active:scale-95 transition-all shadow-lg shadow-teal-500/10 cursor-pointer"
        >
          <PlusCircle size={18} />
          Create Invoice
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-24 w-24 bg-teal-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="p-3 bg-teal-500/10 rounded-xl w-fit text-teal-400 mb-4">
            <IndianRupee size={22} />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
          <h3 className="text-2xl font-bold text-white mt-1 text-glow-primary">{formatCurrency(totalRevenue)}</h3>
        </div>

        {/* Total Taxable Value */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-24 w-24 bg-blue-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="p-3 bg-blue-500/10 rounded-xl w-fit text-blue-400 mb-4">
            <FileText size={22} />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taxable Value</p>
          <h3 className="text-2xl font-bold text-white mt-1">{formatCurrency(totalTaxable)}</h3>
        </div>

        {/* Total Tax (IGST) */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-24 w-24 bg-indigo-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="p-3 bg-indigo-500/10 rounded-xl w-fit text-indigo-400 mb-4">
            <Percent size={22} />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">IGST Tax Collected</p>
          <h3 className="text-2xl font-bold text-white mt-1">{formatCurrency(totalTax)}</h3>
        </div>

        {/* Total Invoices */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-24 w-24 bg-purple-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="p-3 bg-purple-500/10 rounded-xl w-fit text-purple-400 mb-4">
            <PlusCircle size={22} />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Invoices</p>
          <h3 className="text-2xl font-bold text-white mt-1">{totalInvoices}</h3>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Recent Invoices</h2>
          <button
            onClick={() => setActiveTab("history")}
            className="text-teal-400 hover:text-teal-300 font-semibold text-sm flex items-center gap-1 group transition-colors cursor-pointer"
          >
            View All History <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="overflow-x-auto">
          {recentInvoices.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <FileText size={48} className="mx-auto text-slate-700 mb-3" />
              <p>No invoices created yet.</p>
              <button
                onClick={() => {
                  setEditingInvoice(null);
                  setActiveTab("create");
                }}
                className="mt-3 text-teal-400 hover:text-teal-300 font-semibold text-sm cursor-pointer"
              >
                Create your first invoice
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 text-xs font-semibold uppercase border-b border-slate-800">
                  <th className="p-4">Invoice No.</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Grand Total</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-900/30 transition-colors text-sm text-slate-300">
                    <td className="p-4 font-semibold text-teal-400">{inv.invoiceNumber}</td>
                    <td className="p-4 font-medium text-white">{inv.customerName}</td>
                    <td className="p-4">{new Date(inv.invoiceDate).toLocaleDateString("en-GB")}</td>
                    <td className="p-4 text-right font-semibold text-white">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingInvoice(inv);
                            setActiveTab("create");
                          }}
                          className="px-3 py-1.5 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg transition-colors text-xs font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onPrintPDF(inv)}
                          className="px-3 py-1.5 bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-slate-950 rounded-lg transition-all text-xs font-semibold cursor-pointer"
                          title="Open PDF to Print / Preview"
                        >
                          Print / View
                        </button>
                        <button
                          onClick={() => onDownloadPDF(inv)}
                          className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white rounded-lg transition-colors text-xs font-medium cursor-pointer"
                          title="Download PDF File"
                        >
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
