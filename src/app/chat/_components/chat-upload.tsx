"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ChatUploadProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

export function ChatUpload({ onUpload, disabled = false }: ChatUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (disabled || acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      setPreview(URL.createObjectURL(file));
      onUpload(file);
    },
    [onUpload, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled,
  });

  if (preview) {
    return (
      <div style={{ textAlign: "center" }}>
        <img
          src={preview}
          alt="Preview"
          style={{
            maxWidth: "100%",
            maxHeight: 200,
            borderRadius: 12,
            objectFit: "cover",
          }}
        />
        <p style={{ fontSize: 12, color: "var(--earth-light)", marginTop: 8 }}>
          Enviando...
        </p>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`upload-zone ${isDragActive ? "drag-active" : ""}`}
    >
      <input {...getInputProps()} />
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--sage)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ margin: "0 auto 12px" }}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--earth)" }}>
        {isDragActive ? "Solte a foto aqui!" : "Arraste a foto ou clique para escolher"}
      </p>
      <p style={{ fontSize: 12, color: "var(--earth-light)", marginTop: 4 }}>
        JPG, PNG ou WebP (max 10MB)
      </p>
    </div>
  );
}
