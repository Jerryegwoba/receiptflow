"use client";

import { useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { uploadReceipt } from "@/lib/actions/receipts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Camera, FileImage, X } from "lucide-react";
import { useRouter } from "next/navigation";

function SubmitButton({ hasFile }: { hasFile: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending || !hasFile}>
      {pending ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
          Uploading...
        </>
      ) : (
        <>
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload Receipt
        </>
      )}
    </Button>
  );
}

export function ReceiptUpload() {
  const [state, formAction] = useActionState(uploadReceipt, null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(file.type)) {
      return;
    }
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // If upload succeeded, redirect to receipts page
  if (state?.success) {
    router.push("/receipts");
    return null;
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <form action={formAction} className="space-y-4">
        {/* Drag & Drop / Click Area */}
        <div
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            name="receipt"
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="hidden"
            onChange={handleChange}
            capture="environment"
          />

          {previewUrl ? (
            <div className="relative w-full">
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="mx-auto max-h-64 rounded-md object-contain"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="absolute right-2 top-2 rounded-full bg-background/80 p-1 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileImage className="h-6 w-6 text-primary" />
              </div>
              <p className="mb-1 text-sm font-medium">
                Drop your receipt here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP, or HEIC up to 10MB
              </p>
              <div className="mt-4 flex gap-2">
                <Button type="button" variant="outline" size="sm">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Browse Files
                </Button>
                <Button type="button" variant="outline" size="sm">
                  <Camera className="mr-2 h-4 w-4" />
                  Camera
                </Button>
              </div>
            </>
          )}
        </div>

        {selectedFile && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileImage className="h-4 w-4" />
            <span className="truncate">{selectedFile.name}</span>
            <span>({(selectedFile.size / 1024).toFixed(0)} KB)</span>
          </div>
        )}

        {state?.error && (
          <p className="text-sm text-destructive text-center">{state.error}</p>
        )}

        <SubmitButton hasFile={!!selectedFile} />
      </form>
    </div>
  );
}
