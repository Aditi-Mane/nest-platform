import { useState, useRef } from "react";
import { X, ShieldAlert, Upload, ChevronRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import api from "../api/axios.js";

const COMPLAINT_CATEGORIES = [
  { id: "fraud",                 label: "Fraud / Scam",              description: "Seller took payment but didn't deliver or sent counterfeit items"  },
  { id: "item_not_received",     label: "Item Not Received",          description: "Order was placed and paid but product was never delivered"          },
  { id: "item_not_as_described", label: "Item Not as Described",      description: "Product received is significantly different from the listing"       },
  { id: "damaged_item",          label: "Damaged / Defective Item",   description: "Item arrived broken, damaged, or in unusable condition"             },
  { id: "harassment",            label: "Harassment / Threats",       description: "Seller behaved in an abusive, threatening, or inappropriate manner" },
  { id: "counterfeit",           label: "Counterfeit / Fake Product", description: "Seller is selling fake or unauthorized replicas as genuine"         },
  { id: "other",                 label: "Other",                      description: "Something else not covered by the above categories"                 },
];

const STEPS = ["Category", "Details", "Evidence", "Review"];

export default function ComplaintModal({ productId, sellerId, sellerName, onClose }) {
  const [step, setStep]                         = useState(0);
  const [category, setCategory]                 = useState(null);
  const [description, setDescription]           = useState("");
  const [evidenceFiles, setEvidenceFiles]       = useState([]);
  const [evidencePreviews, setEvidencePreviews] = useState([]);
  const [submitting, setSubmitting]             = useState(false);
  const [submitted, setSubmitted]               = useState(false);
  const [error, setError]                       = useState("");
  const fileInputRef = useRef();

  const selectedCategory = COMPLAINT_CATEGORIES.find((c) => c.id === category);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setEvidenceFiles(files);
    setEvidencePreviews(files.map((f) => ({ name: f.name, url: URL.createObjectURL(f), type: f.type })));
  };

  const removeFile = (idx) => {
    setEvidenceFiles((p) => p.filter((_, i) => i !== idx));
    setEvidencePreviews((p) => p.filter((_, i) => i !== idx));
  };

  const canProceed = () => {
    if (step === 0) return !!category;
    if (step === 1) return description.trim().length >= 20;
    return true;
  };

  const handleSubmit = async () => {
  setSubmitting(true);
  setError("");
  try {
    const formData = new FormData();
    formData.append("sellerId",    sellerId);
    formData.append("productId",   productId);
    formData.append("category",    category);
    formData.append("description", description);
    evidenceFiles.forEach((f) => formData.append("evidence", f));

    
    await api.post("/complaints/", formData);
    setSubmitted(true);
  } catch (err) {
    setError(err?.response?.data?.message || "Failed to submit complaint. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  /* ── SUCCESS STATE ── */
  if (submitted) {
    return (
      <Overlay>
        <ModalBox>
          <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-secondary/15 flex items-center justify-center">
              <CheckCircle2 size={30} className="text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-text">Complaint Filed</h3>
            <p className="text-sm text-muted max-w-xs leading-relaxed">
              Your complaint has been submitted. Our team will review it within{" "}
              <span className="font-semibold text-text">2–3 business days</span> and take appropriate action.
            </p>
            
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
            >
              Done
            </button>
          </div>
        </ModalBox>
      </Overlay>
    );
  }

  return (
    <Overlay>
      <ModalBox>

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldAlert size={17} className="text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text">Report a Seller</h3>
              {sellerName && (
                <p className="text-xs text-muted mt-0.5">
                  Against: <span className="font-medium text-text">{sellerName}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-border/40 text-muted hover:text-text transition"
          >
            <X size={17} />
          </button>
        </div>

        {/* ── STEP PROGRESS ── */}
        <div className="flex gap-2 mb-7">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center flex-1 gap-1">
              <div className="w-full h-1 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: i <= step ? "100%" : "0%" }}
                />
              </div>
              <span
                className={`text-[10px] font-semibold tracking-wide uppercase ${
                  i === step ? "text-primary" : i < step ? "text-muted" : "text-border"
                }`}
              >
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* ── STEP 0 — CATEGORY ── */}
        {step === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted mb-3">What best describes the issue with this seller?</p>
            {COMPLAINT_CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all ${
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40 hover:bg-background"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${active ? "text-primary" : "text-text"}`}>{cat.label}</p>
                    <p className="text-xs text-muted truncate mt-0.5">{cat.description}</p>
                  </div>
                  {/* Radio indicator */}
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      active ? "border-primary bg-primary" : "border-border bg-background"
                    }`}
                  >
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── STEP 1 — DESCRIPTION ── */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Selected issue chip */}
            <div className="px-4 py-3 rounded-xl bg-background border border-border flex items-center gap-3">
              <div className="w-1.5 h-5 rounded-full bg-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted">Selected Issue</p>
                <p className="text-sm font-medium text-text">{selectedCategory?.label}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Describe what happened <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={1000}
                placeholder="Please provide as much detail as possible — dates, amounts, what was promised vs what happened..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-text placeholder:text-muted/50 focus:ring-2 focus:ring-primary focus:outline-none resize-none transition"
              />
              <div className="flex justify-between mt-1.5">
                <p className={`text-xs font-medium ${description.trim().length < 20 ? "text-red-500" : "text-secondary"}`}>
                  {description.trim().length < 20
                    ? `${20 - description.trim().length} more characters needed`
                    : "Looks good"}
                </p>
                <p className="text-xs text-muted">{description.length}/1000</p>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2 — EVIDENCE ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-text mb-0.5">
                Upload Evidence{" "}
                <span className="font-normal text-muted">(optional)</span>
              </p>
              <p className="text-xs text-muted mb-4">
                Screenshots, photos, or documents that support your complaint. Max 3 files, 5 MB each.
              </p>

              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full border-2 border-dashed border-border rounded-xl py-9 flex flex-col items-center gap-2 bg-background hover:border-primary/60 hover:bg-primary/5 transition group"
              >
                <div className="w-9 h-9 rounded-full bg-border/40 flex items-center justify-center group-hover:bg-primary/10 transition">
                  <Upload size={16} className="text-muted group-hover:text-primary transition" />
                </div>
                <p className="text-sm font-medium text-muted group-hover:text-primary transition">Click to upload files</p>
                <p className="text-xs text-muted/60">PNG, JPG, PDF — up to 3 files</p>
              </button>
              <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
            </div>

            {evidencePreviews.length > 0 && (
              <div className="space-y-2">
                {evidencePreviews.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background">
                    {f.type.startsWith("image/") ? (
                      <img src={f.url} className="w-10 h-10 rounded-lg object-cover border border-border" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-border flex items-center justify-center text-[10px] font-bold text-primary">
                        PDF
                      </div>
                    )}
                    <p className="flex-1 text-xs text-text truncate">{f.name}</p>
                    <button
                      onClick={() => removeFile(i)}
                      className="p-1 rounded-full hover:bg-border/50 text-muted hover:text-text transition"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3 — REVIEW ── */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted">Please review your complaint before submitting.</p>

            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
              <ReviewRow label="Issue Type"  value={selectedCategory?.label} />
              <ReviewRow label="Description" value={description} multiline />
              <ReviewRow label="Evidence"    value={evidenceFiles.length > 0 ? `${evidenceFiles.length} file(s) attached` : "None"} />
            </div>

            {/* Warning notice */}
            <div className="flex gap-3 p-4 rounded-xl bg-background border border-border">
              <AlertCircle size={15} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted leading-relaxed">
                Filing false or misleading complaints is a violation of our terms of service and may result in account
                suspension. Only submit if you genuinely experienced this issue.
              </p>
            </div>

            {error && (
              <div className="flex gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* ── NAVIGATION ── */}
        <div className="flex justify-between mt-8 pt-4 border-t border-border">
          <button
            onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
            className="px-4 py-2 text-sm rounded-full border border-border text-muted hover:text-text hover:bg-background transition"
          >
            {step === 0 ? "Cancel" : "Back"}
          </button>

          {step < 3 ? (
            <button
              disabled={!canProceed()}
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2 text-sm rounded-full bg-primary text-white font-medium flex items-center gap-1.5 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Continue <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 text-sm rounded-full bg-primary text-white font-medium flex items-center gap-2 hover:bg-primary/90 disabled:opacity-60 transition"
            >
              {submitting ? (
                <><Loader2 size={13} className="animate-spin" /> Submitting…</>
              ) : (
                "Submit Complaint"
              )}
            </button>
          )}
        </div>
      </ModalBox>
    </Overlay>
  );
}

/* ── LAYOUT HELPERS ── */
const Overlay = ({ children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    {children}
  </div>
);

const ModalBox = ({ children }) => (
  <div className="relative w-full max-w-lg bg-white border border-border rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
    {children}
  </div>
);

const ReviewRow = ({ label, value, multiline }) => (
  <div className="flex gap-4 px-4 py-3 bg-card">
    <p className="text-xs font-medium text-muted w-28 flex-shrink-0 pt-0.5">{label}</p>
    <p className={`text-sm text-text flex-1 ${multiline ? "whitespace-pre-wrap break-words" : ""}`}>{value}</p>
  </div>
);