"use client";

import React, { useRef, useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploaderProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  value = [],
  onChange,
  maxImages = 6,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemove = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const cloudName = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "").trim();
    const uploadPreset = (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "").trim();

    if (!cloudName || !uploadPreset) {
      toast.error("Upload failed: Cloudinary cloud name or upload preset is not configured.", { id: "uploader" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const remainingSlots = maxImages - value.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum limit of ${maxImages} images reached.`, { id: "uploader" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const selectedFiles = Array.from(files).slice(0, remainingSlots);

    try {
      setUploading(true);

      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        if (!res.ok || !data.secure_url) {
          throw new Error(data?.error?.message || `Failed to upload ${file.name}`);
        }

        return data.secure_url as string;
      });

      const newUrls = await Promise.all(uploadPromises);
      onChange([...value, ...newUrls]);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error("Upload failed: " + message, { id: "uploader" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Existing uploaded images */}
      {value.map((url, index) => (
        <div
          key={`${url}-${index}`}
          className="aspect-[3/4] rounded-md overflow-hidden relative bg-sand"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`Product image ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {/* Remove button top-right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(index);
            }}
            className="bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center absolute top-1 right-1 hover:bg-black/80 transition-colors"
            title="Remove image"
            aria-label="Remove image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {/* Index badge bottom-left */}
          <span className="bg-black/60 text-white px-2 py-0.5 rounded-full absolute bottom-1 left-1 text-xs select-none">
            {index + 1}
          </span>
        </div>
      ))}

      {/* Add tile (only if value.length < maxImages) */}
      {value.length < maxImages && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!uploading) {
              fileInputRef.current?.click();
            }
          }}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !uploading) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`aspect-[3/4] rounded-md border-2 border-dashed border-sand flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-gold transition relative select-none ${
            uploading ? "cursor-not-allowed opacity-75 pointer-events-none" : ""
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
              <span className="text-xs text-taupe/60">Uploading...</span>
            </div>
          ) : (
            <>
              <Plus className="w-8 h-8 text-taupe/60" />
              <span className="text-xs text-taupe/60">Add Photo</span>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
      )}
    </div>
  );
}
