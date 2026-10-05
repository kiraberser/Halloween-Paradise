"use client";

import { useEffect, useState } from "react";
import { Camera } from "lucide-react";

const MAX_MB = 5;

export function PhotoPicker({
  current,
  onChange,
}: {
  current?: string | null;
  onChange: (file: File | null, error?: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(current ?? null);

  useEffect(() => setPreview(current ?? null), [current]);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      onChange(null, "La foto debe ser JPG, PNG o WEBP.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      onChange(null, `La foto no puede pesar más de ${MAX_MB} MB.`);
      return;
    }
    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  return (
    <label className="group flex cursor-pointer items-center gap-4">
      <span className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-dashed border-pumpkin/60 bg-night transition group-hover:border-pumpkin">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vista previa" className="h-full w-full object-cover" />
        ) : (
          <Camera className="text-pumpkin" />
        )}
      </span>
      <span className="text-sm text-white/70">
        <b className="block text-bone">{preview ? "Cambiar foto" : "Sube tu foto"}</b>
        Se imprimirá para la ofrenda de Día de Muertos. Que se vea bien tu cara. JPG/PNG, máx. {MAX_MB} MB.
      </span>
      <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handle} />
    </label>
  );
}
