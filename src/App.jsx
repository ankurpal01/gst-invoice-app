import React, { useState, useEffect } from "react";
import { LayoutDashboard, FileSpreadsheet, PlusCircle, Settings as SettingsIcon, ShieldCheck, Lock } from "lucide-react";
import Dashboard from "./components/Dashboard";
import InvoiceForm from "./components/InvoiceForm";
import InvoiceHistory from "./components/InvoiceHistory";
import Settings from "./components/Settings";
import LoginGate from "./components/LoginGate";
import { generateInvoicePDF } from "./utils/pdfGenerator";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [duplicatingInvoice, setDuplicatingInvoice] = useState(null);

  // Default initial configuration
  const defaultSettings = {
    supplierName: "JOSHI ENTERPRISES",
    supplierGstin: "07AUQPJ4127M1Z6",
    supplierAddress: "E-159, Pratap Vihar,\nSuleman Nagar,\nKirari, Delhi - 110086",
    supplierPhone: "9212312312",
    supplierEmail: "info@joshienterprises.in",
    supplierWebsite: "www.joshienterprises.in",
    supplierDescription: "Manufacturing & Supply of Precision Press Tool & Press Components",
    bankName: "HDFC BANK",
    accountNumber: "50100234567890",
    ifscCode: "HDFC0001234",
    accountType: "Current",
    upiId: "joshi@hdfcbank",
    defaultIgstRate: 0, // 0% as per reference image, user can change in settings
    companyLogo: "",
    signatureImage: "",
    qrCodeImage: "",
  };

  const defaultInvoices = [
    {
      id: "sample-invoice-1",
      invoiceNumber: "INV-0001",
      invoiceDate: "2025-06-07T00:00:00.000Z",
      customerName: "Bectars Food Specialities Ltd.",
      customerGstin: "08AABCM9495K2ZQ",
      customerAddress: "SP-238, RIICO Industrial Area,\nKaharani, Bhiwadi, Alwar,\nRajasthan",
      items: [
        { particular: "Loading Charges", hsnSac: "9987", amount: 15000 },
        { particular: "Labour Charges", hsnSac: "9987", amount: 10000 },
        { particular: "Transport Charges", hsnSac: "9987", amount: 5000 },
      ],
      taxableValue: 30000,
      igstRate: 0,
      igstAmount: 0,
      grandTotal: 30000,
      amountInWords: "Rupees Thirty Thousand Only",
    },
  ];

  // Load state from localStorage
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("gst_invoice_settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem("gst_invoices");
    return saved ? JSON.parse(saved) : defaultInvoices;
  });

  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem("admin_password") || "Joshi@123";
  });

  const [isAuthorized, setIsAuthorized] = useState(() => {
    return localStorage.getItem("portfolio_authorized") === "true";
  });

  const handlePasswordChange = (newPassword) => {
    localStorage.setItem("admin_password", newPassword);
    setAdminPassword(newPassword);
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("gst_invoice_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("gst_invoices", JSON.stringify(invoices));
  }, [invoices]);

  // Next Invoice Number generator logic
  const getNextNumber = () => {
    if (!invoices || invoices.length === 0) return "INV-0001";
    const numbers = invoices
      .map((inv) => {
        const match = inv.invoiceNumber.match(/INV-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);
    if (numbers.length === 0) return `INV-${String(invoices.length + 1).padStart(4, "0")}`;
    const max = Math.max(...numbers);
    return `INV-${String(max + 1).padStart(4, "0")}`;
  };

  // Actions
  const handleSaveInvoice = (savedInvoice) => {
    // If we're saving, we check if it is edit mode or create mode
    const exists = invoices.some((inv) => inv.id === savedInvoice.id);

    if (exists) {
      // Edit mode
      setInvoices(invoices.map((inv) => (inv.id === savedInvoice.id ? savedInvoice : inv)));
    } else {
      // Create mode
      setInvoices([...invoices, savedInvoice]);
    }

    // Reset editing/duplicating flags
    setEditingInvoice(null);
    setDuplicatingInvoice(null);
    // Redirect to history tab
    setActiveTab("history");
  };

  const handleDeleteInvoice = (id) => {
    setInvoices(invoices.filter((inv) => inv.id !== id));
  };

  const handleSaveSettings = (updatedSettings) => {
    setSettings(updatedSettings);
  };

  const handleDownloadPDF = (invoice) => {
    try {
      const pdf = generateInvoicePDF(invoice, settings);
      pdf.download();
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Failed to export PDF: " + e.message);
    }
  };

  const handlePrintPDF = (invoice) => {
    try {
      const pdf = generateInvoicePDF(invoice, settings);
      // Open the Blob URL in a new tab for native preview and direct print
      window.open(pdf.url, "_blank");
    } catch (e) {
      console.error("PDF preview failed:", e);
      alert("Failed to print/preview PDF: " + e.message);
    }
  };

  const handleCancelForm = () => {
    setEditingInvoice(null);
    setDuplicatingInvoice(null);
    setActiveTab("history");
  };

  // Duplicate helper prefill
  const getPrefilledInvoice = () => {
    if (duplicatingInvoice) {
      return {
        ...duplicatingInvoice,
        id: "",
        invoiceNumber: getNextNumber(),
        invoiceDate: new Date().toISOString(),
      };
    }
    return editingInvoice;
  };

  if (!isAuthorized) {
    return (
      <LoginGate
        onAuthorize={() => setIsAuthorized(true)}
        adminPassword={adminPassword}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="h-9 w-9 bg-teal-500/10 rounded-xl border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg shadow-inner">
              JE
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">JOSHI ENTERPRISES</span>
              <span className="text-[10px] font-semibold text-slate-500 block">GST INVOICE HUB</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setEditingInvoice(null);
                setDuplicatingInvoice(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-teal-500/15 to-cyan-500/5 text-teal-400 border-l-2 border-teal-500"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>
            
            <button
              onClick={() => {
                setActiveTab("history");
                setEditingInvoice(null);
                setDuplicatingInvoice(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-teal-500/15 to-cyan-500/5 text-teal-400 border-l-2 border-teal-500"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <FileSpreadsheet size={18} />
              Invoice History
            </button>

            <button
              onClick={() => {
                setEditingInvoice(null);
                setDuplicatingInvoice(null);
                setActiveTab("create");
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "create"
                  ? "bg-gradient-to-r from-teal-500/15 to-cyan-500/5 text-teal-400 border-l-2 border-teal-500"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <PlusCircle size={18} />
              Create Invoice
            </button>

            <button
              onClick={() => {
                setActiveTab("settings");
                setEditingInvoice(null);
                setDuplicatingInvoice(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-gradient-to-r from-teal-500/15 to-cyan-500/5 text-teal-400 border-l-2 border-teal-500"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <SettingsIcon size={18} />
              Settings
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("portfolio_authorized");
                setIsAuthorized(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-rose-400 hover:text-rose-200 hover:bg-rose-950/20 border border-dashed border-rose-900/30 mt-6"
            >
              <Lock size={18} />
              Lock Application
            </button>
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="hidden md:flex p-6 border-t border-slate-800 flex-col gap-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
            <ShieldCheck size={14} className="text-teal-400" /> Compliance Check
          </div>
          <span>Fully conforms to GST invoice requirements.</span>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 bg-slate-950 p-6 md:p-10 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto">
          {activeTab === "dashboard" && (
            <Dashboard
              invoices={invoices}
              setActiveTab={setActiveTab}
              setEditingInvoice={setEditingInvoice}
              onDownloadPDF={handleDownloadPDF}
              onPrintPDF={handlePrintPDF}
            />
          )}

          {activeTab === "history" && (
            <InvoiceHistory
              invoices={invoices}
              setActiveTab={setActiveTab}
              setEditingInvoice={setEditingInvoice}
              setDuplicatingInvoice={setDuplicatingInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              onDownloadPDF={handleDownloadPDF}
              onPrintPDF={handlePrintPDF}
            />
          )}

          {activeTab === "create" && (
            <InvoiceForm
              initialInvoice={getPrefilledInvoice()}
              nextInvoiceNumber={getNextNumber()}
              settings={settings}
              onSaveInvoice={handleSaveInvoice}
              onCancel={handleCancelForm}
            />
          )}

          {activeTab === "settings" && (
            <Settings 
              settings={settings} 
              onSaveSettings={handleSaveSettings} 
              adminPassword={adminPassword}
              onChangePassword={handlePasswordChange}
            />
          )}
        </div>
      </main>
      
    </div>
  );
}
