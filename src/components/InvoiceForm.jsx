import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, ArrowLeft, FileText, User, MapPin, Hash, Percent, DollarSign } from "lucide-react";
import { numberToWords } from "../utils/numberToWords";

const PRESET_CUSTOMERS = [
  {
    id: "bectars",
    name: "Bectars Food Specialities Ltd.",
    gstin: "08AABCM9495K2ZQ",
    address: "SP-238, RIICO Industrial Area,\nKaharani, Bhiwadi, Alwar,\nRajasthan"
  }
];

export default function InvoiceForm({
  initialInvoice,
  nextInvoiceNumber,
  settings,
  onSaveInvoice,
  onCancel,
}) {
  const isEditMode = !!initialInvoice;

  // Form states
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("bectars");
  const [igstRate, setIgstRate] = useState(18);
  
  // Table rows
  const [items, setItems] = useState([
    { particular: "", hsnSac: "", amount: "" }
  ]);

  // Calculations states
  const [taxableValue, setTaxableValue] = useState(0);
  const [igstAmount, setIgstAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [amountInWords, setAmountInWords] = useState("");

  // Initialize form
  useEffect(() => {
    if (isEditMode) {
      setInvoiceNumber(initialInvoice.invoiceNumber);
      // Format date to YYYY-MM-DD for input field
      const dateObj = new Date(initialInvoice.invoiceDate);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      setInvoiceDate(`${yyyy}-${mm}-${dd}`);
      
      setCustomerName(initialInvoice.customerName);
      setCustomerGstin(initialInvoice.customerGstin);
      setCustomerAddress(initialInvoice.customerAddress);
      setIgstRate(initialInvoice.igstRate);

      const match = PRESET_CUSTOMERS.find(
        (c) =>
          c.name === initialInvoice.customerName &&
          c.gstin === initialInvoice.customerGstin &&
          c.address === initialInvoice.customerAddress
      );
      setSelectedCustomerId(match ? match.id : "custom");

      setItems(
        initialInvoice.items.map((item) => ({
          particular: item.particular,
          hsnSac: item.hsnSac,
          amount: String(item.amount),
        }))
      );
    } else {
      // Create mode
      setInvoiceNumber(nextInvoiceNumber);
      // Default date to today
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setInvoiceDate(`${yyyy}-${mm}-${dd}`);
      
      // Default to fixed customer from prompt
      const defaultCust = PRESET_CUSTOMERS[0];
      setCustomerName(defaultCust.name);
      setCustomerGstin(defaultCust.gstin);
      setCustomerAddress(defaultCust.address);
      setSelectedCustomerId(defaultCust.id);
      
      setIgstRate(settings.defaultIgstRate !== undefined ? settings.defaultIgstRate : 0);
      setItems([{ particular: "", hsnSac: "", amount: "" }]);
    }
  }, [initialInvoice, nextInvoiceNumber, settings, isEditMode]);

  // Handlers for customer selection and inputs
  const handleCustomerSelect = (e) => {
    const cid = e.target.value;
    setSelectedCustomerId(cid);
    if (cid === "custom") {
      setCustomerName("");
      setCustomerGstin("");
      setCustomerAddress("");
    } else {
      const selected = PRESET_CUSTOMERS.find((c) => c.id === cid);
      if (selected) {
        setCustomerName(selected.name);
        setCustomerGstin(selected.gstin);
        setCustomerAddress(selected.address);
      }
    }
  };

  const checkIfCustom = (name, gstin, addr) => {
    const match = PRESET_CUSTOMERS.find(
      (c) => c.name === name && c.gstin === gstin && c.address === addr
    );
    setSelectedCustomerId(match ? match.id : "custom");
  };

  const handleCustomerNameChange = (e) => {
    const val = e.target.value;
    setCustomerName(val);
    checkIfCustom(val, customerGstin, customerAddress);
  };

  const handleCustomerGstinChange = (e) => {
    const val = e.target.value;
    setCustomerGstin(val);
    checkIfCustom(customerName, val, customerAddress);
  };

  const handleCustomerAddressChange = (e) => {
    const val = e.target.value;
    setCustomerAddress(val);
    checkIfCustom(customerName, customerGstin, val);
  };

  // Recalculate sums on item changes or rate changes
  useEffect(() => {
    const sum = items.reduce((acc, item) => {
      const amt = parseFloat(item.amount) || 0;
      return acc + amt;
    }, 0);

    const calculatedTax = (sum * igstRate) / 100;
    const finalTotal = sum + calculatedTax;

    setTaxableValue(sum);
    setIgstAmount(calculatedTax);
    setGrandTotal(finalTotal);
    setAmountInWords(numberToWords(finalTotal));
  }, [items, igstRate]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { particular: "", hsnSac: "", amount: "" }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      // Reset the single item instead of removing
      setItems([{ particular: "", hsnSac: "", amount: "" }]);
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (items.some((item) => !item.particular || !item.amount)) {
      alert("Please fill in the particulars and amount for all items.");
      return;
    }

    const savedInvoice = {
      id: isEditMode ? initialInvoice.id : crypto.randomUUID(),
      invoiceNumber,
      invoiceDate: new Date(invoiceDate).toISOString(),
      customerName,
      customerGstin,
      customerAddress,
      items: items.map((item) => ({
        particular: item.particular,
        hsnSac: item.hsnSac,
        amount: parseFloat(item.amount) || 0,
      })),
      taxableValue,
      igstRate,
      igstAmount,
      grandTotal,
      amountInWords,
    };

    onSaveInvoice(savedInvoice);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in pb-24 relative">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {isEditMode ? `Edit Invoice ${invoiceNumber}` : "Create New Invoice"}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill in customer metadata and add billing line items.
            </p>
          </div>
        </div>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-semibold rounded-xl hover:from-teal-400 hover:to-cyan-400 focus:ring-2 focus:ring-teal-500/20 active:scale-95 transition-all shadow-lg shadow-teal-500/10 cursor-pointer"
        >
          <Save size={18} />
          Save Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata & Customer */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Invoice Info */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-semibold text-teal-400 flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Hash size={16} /> Invoice Information
            </h3>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-medium">Invoice Number</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
                className="bg-slate-950 border border-slate-850 focus:border-teal-500 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-medium">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
                className="bg-slate-950 border border-slate-850 focus:border-teal-500 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30"
              />
            </div>
          </div>

          {/* Customer Info */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-semibold text-teal-400 flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <User size={16} /> Customer (Bill To)
            </h3>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-medium">Select Customer (Preset)</label>
              <select
                value={selectedCustomerId}
                onChange={handleCustomerSelect}
                className="bg-slate-950 border border-slate-850 focus:border-teal-500 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30 font-medium"
              >
                <option value="custom">-- Custom / Manual Entry --</option>
                {PRESET_CUSTOMERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-medium">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={handleCustomerNameChange}
                required
                placeholder="e.g. Bectars Food Specialities Ltd."
                className="bg-slate-950 border border-slate-850 focus:border-teal-500 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-medium">Customer GSTIN</label>
              <input
                type="text"
                value={customerGstin}
                onChange={handleCustomerGstinChange}
                required
                placeholder="e.g. 08AABCM9495K2ZQ"
                className="bg-slate-950 border border-slate-850 focus:border-teal-500 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-medium">Customer Address</label>
              <textarea
                value={customerAddress}
                onChange={handleCustomerAddressChange}
                required
                rows={3}
                placeholder="SP-238, RIICO Industrial Area..."
                className="bg-slate-950 border border-slate-850 focus:border-teal-500 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30 resize-y"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Items list & Live Calculations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Items */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-semibold text-teal-400 flex items-center gap-2">
                <FileText size={16} /> Billing Line Items
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={14} /> Add Row
              </button>
            </div>

            {/* Responsive Table / Form Cards */}
            <div className="space-y-4">
              {/* Desktop Header labels */}
              <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-semibold text-slate-400 px-2 uppercase">
                <div className="col-span-6">Particular Description</div>
                <div className="col-span-3">HSN / SAC</div>
                <div className="col-span-2 text-right">Amount (₹)</div>
                <div className="col-span-1"></div>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/30 md:bg-transparent p-4 md:p-0 rounded-xl border border-slate-850 md:border-none relative"
                  >
                    {/* Particular */}
                    <div className="col-span-6 flex flex-col md:block gap-1">
                      <label className="text-[10px] md:hidden font-semibold text-slate-500 uppercase">Particular Description</label>
                      <input
                        type="text"
                        value={item.particular}
                        onChange={(e) => handleItemChange(index, "particular", e.target.value)}
                        placeholder="e.g. Loading Charges"
                        required
                        className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                      />
                    </div>

                    {/* HSN/SAC */}
                    <div className="col-span-3 flex flex-col md:block gap-1">
                      <label className="text-[10px] md:hidden font-semibold text-slate-500 uppercase">HSN / SAC</label>
                      <input
                        type="text"
                        value={item.hsnSac}
                        onChange={(e) => handleItemChange(index, "hsnSac", e.target.value)}
                        placeholder="e.g. 9987"
                        required
                        className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                      />
                    </div>

                    {/* Amount */}
                    <div className="col-span-2 flex flex-col md:block gap-1">
                      <label className="text-[10px] md:hidden font-semibold text-slate-500 uppercase text-right">Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                        placeholder="0.00"
                        required
                        className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30 text-right font-medium"
                      />
                    </div>

                    {/* Delete Action */}
                    <div className="col-span-1 flex items-end md:items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-rose-500/40 hover:text-rose-450 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                        title="Remove Row"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Add Bottom Row */}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-dashed border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Plus size={14} /> Add Another Row
            </button>
          </div>

          {/* Tax Setting & Live Outputs */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-semibold text-teal-400 flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Percent size={16} /> Tax Rate & Calculation Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left: Interactive IGST Rate */}
              <div className="flex flex-col justify-center gap-1.5">
                <label className="text-xs text-slate-400 font-medium">IGST Rate (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={igstRate}
                    onChange={(e) => setIgstRate(parseFloat(e.target.value) || 0)}
                    min={0}
                    max={100}
                    className="w-32 bg-slate-950 border border-slate-850 focus:border-teal-500 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30 font-medium"
                  />
                  <span className="text-xs text-slate-500">% IGST (for interstate transactions)</span>
                </div>
              </div>

              {/* Right: Calculations Breakdown */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-2 text-sm">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Taxable Value:</span>
                  <span className="font-semibold text-white">{formatCurrency(taxableValue)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>IGST Amount ({igstRate}%):</span>
                  <span className="font-semibold text-white">{formatCurrency(igstAmount)}</span>
                </div>
                <div className="h-px bg-slate-850 my-1" />
                <div className="flex items-center justify-between text-white font-bold text-base">
                  <span>Grand Total:</span>
                  <span className="text-teal-400">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Word Representation */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850 text-xs text-slate-400 leading-relaxed italic">
              <span className="font-semibold text-slate-300 not-italic block mb-1">Amount In Words:</span>
              {amountInWords || "Rupees Zero Only"}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-4 flex items-center justify-between z-30 md:hidden">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Grand Total</span>
          <span className="text-lg font-bold text-teal-400">{formatCurrency(grandTotal)}</span>
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold rounded-xl hover:from-teal-400 hover:to-cyan-400 transition-all text-sm shadow-md"
        >
          Save Invoice
        </button>
      </div>
    </form>
  );
}
