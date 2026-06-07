import React, { useState } from "react";
import { Save, Upload, Trash2, Building, Landmark, Percent, Image, Lock, Database, Download } from "lucide-react";

function cleanSignatureImage(dataUrl, callback) {
  const img = new Image();
  img.src = dataUrl;
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Scale dimensions down if very high-res to keep localStorage light
    const maxDim = 600;
    let width = img.width;
    let height = img.height;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    
    // Convert off-white paper backgrounds to fully transparent pixels
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const brightness = (r + g + b) / 3;
      
      // If pixel is paper background (high brightness), make it transparent
      if (brightness > 135) {
        data[i + 3] = 0;
      } else {
        // Boost ink visibility - convert dark pixels to a clean navy blue ballpoint shade
        const factor = brightness / 135; // 0 to 1
        data[i] = Math.round(15 * (1 - factor) + r * factor);
        data[i + 1] = Math.round(30 * (1 - factor) + g * factor);
        data[i + 2] = Math.round(95 * (1 - factor) + b * factor);
      }
    }
    
    ctx.putImageData(imgData, 0, 0);
    callback(canvas.toDataURL("image/png"));
  };
  img.onerror = () => {
    callback(dataUrl);
  };
}

export default function Settings({ settings, onSaveSettings, adminPassword, onChangePassword, onExportBackup, onImportBackup }) {
  const [formData, setFormData] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password Update states
  const [currentPassInput, setCurrentPassInput] = useState("");
  const [newPassInput, setNewPassInput] = useState("");
  const [confirmNewPassInput, setConfirmNewPassInput] = useState("");
  const [passMessage, setPassMessage] = useState("");
  const [passMessageType, setPassMessageType] = useState("");

  const handlePasswordUpdate = () => {
    // If password is already set, require correct current password
    if (adminPassword && currentPassInput !== adminPassword) {
      setPassMessageType("error");
      setPassMessage("Incorrect current password.");
      return;
    }

    if (!newPassInput) {
      setPassMessageType("error");
      setPassMessage("New password cannot be empty.");
      return;
    }

    if (newPassInput !== confirmNewPassInput) {
      setPassMessageType("error");
      setPassMessage("New passwords do not match.");
      return;
    }

    // Save password
    onChangePassword(newPassInput);
    setPassMessageType("success");
    setPassMessage("Password updated successfully!");
    
    // Clear inputs
    setCurrentPassInput("");
    setNewPassInput("");
    setConfirmNewPassInput("");
    
    setTimeout(() => {
      setPassMessage("");
    }, 4000);
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleCleanSignature = () => {
    if (!formData.signatureImage) return;
    cleanSignatureImage(formData.signatureImage, (cleaned) => {
      setFormData((prev) => ({ ...prev, signatureImage: cleaned }));
      alert("Signature background cleared! It will now blend natively with the invoice background.");
    });
  };

  // Convert uploaded image to base64 Data URL
  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (localStorage has ~5MB limit, keep images small)
    if (file.size > 800000) {
      alert("File is too large. Please select an image under 800KB to ensure smooth local storage saving.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      if (fieldName === "signatureImage") {
        cleanSignatureImage(base64Data, (cleaned) => {
          setFormData((prev) => ({ ...prev, [fieldName]: cleaned }));
        });
      } else {
        setFormData((prev) => ({ ...prev, [fieldName]: base64Data }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure supplier metadata, bank accounts, and digital signatures.
          </p>
        </div>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-semibold rounded-xl hover:from-teal-400 hover:to-cyan-400 focus:ring-2 focus:ring-teal-500/20 active:scale-95 transition-all shadow-lg shadow-teal-500/10 cursor-pointer"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-xl text-sm font-semibold animate-pulse">
          Settings saved successfully! Any new invoice generated will use these updated details.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SUPPLIER DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building className="text-teal-400 h-5 w-5" />
              Company Details (Supplier)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Supplier Name</label>
                <input
                  type="text"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleTextChange}
                  required
                  className="bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/30 text-sm transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">GSTIN</label>
                <input
                  type="text"
                  name="supplierGstin"
                  value={formData.supplierGstin}
                  onChange={handleTextChange}
                  required
                  placeholder="e.g. 07AUQPJ4127M1Z6"
                  className="bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/30 text-sm transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Company Tagline / Description</label>
              <input
                type="text"
                name="supplierDescription"
                value={formData.supplierDescription}
                onChange={handleTextChange}
                placeholder="e.g. Manufacturing & Supply of Precision Press Tool & Press Components"
                className="bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/30 text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Address</label>
              <textarea
                name="supplierAddress"
                value={formData.supplierAddress}
                onChange={handleTextChange}
                required
                rows={3}
                className="bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/30 text-sm transition-all resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Phone</label>
                <input
                  type="text"
                  name="supplierPhone"
                  value={formData.supplierPhone}
                  onChange={handleTextChange}
                  className="bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/30 text-sm transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Email</label>
                <input
                  type="email"
                  name="supplierEmail"
                  value={formData.supplierEmail}
                  onChange={handleTextChange}
                  className="bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/30 text-sm transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Website</label>
                <input
                  type="text"
                  name="supplierWebsite"
                  value={formData.supplierWebsite}
                  onChange={handleTextChange}
                  className="bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/30 text-sm transition-all"
                />
              </div>
            </div>
          </div>


        </div>

        {/* IMAGE UPLOADS & TAX */}
        <div className="space-y-6">
          {/* TAX SETTINGS */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Percent className="text-teal-400 h-5 w-5" />
              Tax Defaults
            </h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Default IGST (%)</label>
              <input
                type="number"
                name="defaultIgstRate"
                value={formData.defaultIgstRate}
                onChange={handleNumberChange}
                min={0}
                max={100}
                required
                className="bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500/30 text-sm transition-all"
              />
            </div>
          </div>

          {/* IMAGE PREVIEWS & INPUTS */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Image className="text-teal-400 h-5 w-5" />
              Upload Assets
            </h2>

            {/* Logo upload */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-300 block">Company Logo</label>
              {formData.companyLogo ? (
                <div className="relative border border-slate-800 rounded-xl p-3 bg-slate-950 flex items-center justify-between gap-4">
                  <img src={formData.companyLogo} alt="Logo Preview" className="h-12 w-auto object-contain bg-white rounded p-1" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage("companyLogo")}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 rounded-xl p-6 cursor-pointer group transition-all">
                  <Upload className="text-slate-500 group-hover:text-teal-400 transition-colors h-6 w-6 mb-2" />
                  <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">Upload Logo</span>
                  <span className="text-[10px] text-slate-600 mt-1">PNG/JPG under 800KB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "companyLogo")}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Signature Upload */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-300 block">Digital Signature</label>
              <p className="text-[10px] text-slate-500 italic mt-0.5">💡 Tip: Use a transparent background PNG for a realistic hand-written look.</p>
              {formData.signatureImage ? (
                <div className="relative border border-slate-800 rounded-xl p-3 bg-slate-950 flex items-center justify-between gap-4">
                  <img src={formData.signatureImage} alt="Signature Preview" className="h-12 w-auto object-contain bg-white rounded p-1" />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCleanSignature}
                      className="px-2.5 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      title="Automatically remove the background paper to make the signature transparent"
                    >
                      Clean Background
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage("signatureImage")}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 rounded-xl p-6 cursor-pointer group transition-all">
                  <Upload className="text-slate-500 group-hover:text-teal-400 transition-colors h-6 w-6 mb-2" />
                  <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">Upload Signature</span>
                  <span className="text-[10px] text-slate-600 mt-1">PNG/JPG under 800KB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "signatureImage")}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* QR Code Upload */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-300 block">UPI QR Code</label>
              {formData.qrCodeImage ? (
                <div className="relative border border-slate-800 rounded-xl p-3 bg-slate-950 flex items-center justify-between gap-4">
                  <img src={formData.qrCodeImage} alt="QR Preview" className="h-12 w-auto object-contain bg-white rounded p-1" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage("qrCodeImage")}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 rounded-xl p-6 cursor-pointer group transition-all">
                  <Upload className="text-slate-500 group-hover:text-teal-400 transition-colors h-6 w-6 mb-2" />
                  <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">Upload QR Code</span>
                  <span className="text-[10px] text-slate-600 mt-1">PNG/JPG under 800KB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "qrCodeImage")}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* SECURITY SETTINGS */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Lock className="text-teal-400 h-4.5 w-4.5" />
                Security (Access Lock)
              </h2>
              
              <div className="space-y-3">
                {adminPassword && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">Current Password</label>
                    <input
                      type="password"
                      value={currentPassInput}
                      onChange={(e) => setCurrentPassInput(e.target.value)}
                      placeholder="Enter current password"
                      className="bg-slate-950 border border-slate-850 focus:border-teal-500 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                    />
                  </div>
                )}
                
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-medium">
                    {adminPassword ? "New Password" : "Set Access Password"}
                  </label>
                  <input
                    type="password"
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    placeholder="Enter new password"
                    className="bg-slate-950 border border-slate-850 focus:border-teal-500 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-medium">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmNewPassInput}
                    onChange={(e) => setConfirmNewPassInput(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-slate-950 border border-slate-850 focus:border-teal-500 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                  />
                </div>

                {passMessage && (
                  <p className={`text-xs font-semibold ${passMessageType === "success" ? "text-teal-400" : "text-rose-400"}`}>
                    {passMessage}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handlePasswordUpdate}
                  className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {adminPassword ? "Change Password" : "Enable Access Lock"}
                </button>
              </div>
            </div>

            {/* DATA BACKUP & RESTORE */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Database className="text-teal-400 h-4.5 w-4.5" />
                Backup & Restore
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Save your invoice history, logo, signature, and settings into a backup file. You can upload this file on any other system to access your data instantly.
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center justify-center gap-2 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer text-center">
                  <Upload size={14} className="text-teal-400" />
                  <span>Import Data</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImportBackup}
                    className="hidden"
                  />
                </label>
                
                <button
                  type="button"
                  onClick={onExportBackup}
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  <Download size={14} className="text-teal-400" />
                  <span>Export Backup</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </form>
  );
}
