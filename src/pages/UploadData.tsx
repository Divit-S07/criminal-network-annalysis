import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle2, Loader2, X, Shield, FileQuestion } from "lucide-react";
import { useData } from "@/context/DataContext";
import type { UploadedFile } from "@/types";

const categories = [
  { value: "FIR / Case Records", label: "FIR / Case Records", accepts: ["pdf", "docx", "csv", "jpg", "jpeg", "png"], description: "Case and FIR documents" },
  { value: "Communication / CDR", label: "Communication / CDR", accepts: ["pdf", "docx", "csv", "jpg", "jpeg", "png"], description: "Call detail records and communication logs" },
  { value: "Vehicle Records", label: "Vehicle Records", accepts: ["pdf", "docx", "csv", "jpg", "jpeg", "png"], description: "Vehicle registration and tracking" },
  { value: "Transaction Records", label: "Transaction Records", accepts: ["pdf", "docx", "csv", "jpg", "jpeg", "png"], description: "Bank and financial transactions" },
  { value: "Location Records", label: "Location Records", accepts: ["pdf", "docx", "csv", "jpg", "jpeg", "png"], description: "GPS and location data" },
  { value: "Person Records", label: "Person Records", accepts: ["pdf", "docx", "csv", "jpg", "jpeg", "png"], description: "Person identity and profile data" },
];

const acceptedExtensions = ["pdf", "docx", "csv", "jpg", "jpeg", "png"];
const maxSizeMB = 10;

const stageLabels = [
  "Files uploaded & validated",
  "Local text & OCR content extracted",
  "Data cleaned & whitespace sanitized",
  "Fields normalized & deduplicated",
  "Structured JSON generated locally",
  "ONLY JSON sent to Gemini AI",
  "AI analysis results received",
  "Existing website dashboard updated",
];

export default function UploadData() {
  const [category, setCategory] = useState("FIR / Case Records");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { processUpload } = useData();

  const categoryConfig = categories.find((c) => c.value === category) || categories[0];

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const fileArr = Array.from(fileList);
      if (fileArr.length === 0) return;

      setError("");
      const validFiles: File[] = [];

      for (const file of fileArr) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (!ext || !acceptedExtensions.includes(ext)) {
          setError(`"${file.name}" is not supported. Allowed formats: ${acceptedExtensions.join(", ")}`);
          continue;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`"${file.name}" exceeds the ${maxSizeMB}MB limit.`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      setProcessingStatus(`Processing ${validFiles.length} file(s) together as one investigation...`);
      
      // Animate stages smoothly
      setCurrentStage(1);
      await new Promise((r) => setTimeout(r, 400));
      setCurrentStage(2);
      await new Promise((r) => setTimeout(r, 400));
      setCurrentStage(3);
      await new Promise((r) => setTimeout(r, 400));
      setCurrentStage(4);
      await new Promise((r) => setTimeout(r, 400));
      setCurrentStage(5);

      try {
        await processUpload(validFiles, categoryConfig.value);
        
        setCurrentStage(6);
        await new Promise((r) => setTimeout(r, 300));
        setCurrentStage(7);

        const newUploadedList: UploadedFile[] = validFiles.map((file) => ({
          id: `UPD${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: file.name,
          type: file.type || `application/${file.name.split(".").pop()}`,
          size: file.size,
          category: categoryConfig.value,
          records: 0,
          status: "complete",
        }));

        setFiles((prev) => [...newUploadedList, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to process uploaded files.`);
      } finally {
        setTimeout(() => {
          setProcessingStatus(null);
          setCurrentStage(0);
        }, 1200);
      }
    },
    [categoryConfig, processUpload]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white/90">Upload Investigation Data</h1>
          <p className="mt-0.5 text-xs text-white/30">Upload multiple files (PDF, DOCX, CSV, JPG, JPEG, PNG). Local extraction creates structured JSON which is sent to Gemini AI.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-white/30">Data Category</label>
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex-1 bg-transparent text-[11px] text-white/60 outline-none">
              {categories.map((c) => (
                <option key={c.value} value={c.value} className="bg-[#14151c]">{c.label}</option>
              ))}
            </select>
          </div>
          {categoryConfig && (
            <p className="mt-1.5 text-[10px] text-white/20">{categoryConfig.description}</p>
          )}
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
            dragging ? "border-cyan-500/40 bg-cyan-500/5" : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]"
          }`}
        >
          <div className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-white/[0.04] p-2.5">
            <FileQuestion className="size-4 text-white/25" />
            <span className="text-[10px] uppercase font-semibold text-cyan-400/70">
              Supported: {acceptedExtensions.join(", ")}
            </span>
          </div>
          <Upload className="mb-3 size-6 text-white/20" />
          <p className="text-xs text-white/50">Drag & drop multiple files here</p>
          <p className="mt-1 text-[10px] text-white/25">or click to browse multiple files · max 10MB per file</p>
          <div className="mt-3 flex items-center gap-1.5 rounded-md bg-cyan-500/5 border border-cyan-500/10 px-2.5 py-1.5 text-[10px] text-cyan-400/60">
            <Shield className="size-2.5" />
            <span>Local Extraction → Structured JSON → Gemini AI Pipeline</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.csv,.jpg,.jpeg,.png"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {error && <p className="text-xs text-red-400/80">{error}</p>}

        {processingStatus && (
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-cyan-400" />
              <span className="text-xs font-medium text-cyan-400">{processingStatus}</span>
            </div>
            <div className="space-y-1.5">
              {stageLabels.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i < currentStage ? (
                    <CheckCircle2 className="size-3 text-green-400" />
                  ) : i === currentStage ? (
                    <Loader2 className="size-3 animate-spin text-cyan-400" />
                  ) : (
                    <div className="size-3 rounded-full border border-white/[0.1]" />
                  )}
                  <span className={`text-[11px] ${i < currentStage ? "text-green-400/70" : i === currentStage ? "text-white/60" : "text-white/20"}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-medium uppercase tracking-wider text-white/30">Analyzed Investigation Files</h3>
            {files.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-cyan-400/50" />
                  <div>
                    <div className="text-[11px] font-medium text-white/70">{f.name}</div>
                    <div className="text-[10px] text-white/25">{f.category} · {(f.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-green-400/80 bg-green-500/10 px-2 py-0.5 rounded-md">Processed</span>
                  <button onClick={() => setFiles((prev) => prev.filter((p) => p.id !== f.id))} className="text-white/20 hover:text-white/40">
                    <X className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
