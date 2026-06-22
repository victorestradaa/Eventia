'use client';

import { useCallback, useEffect, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Check, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';

interface Props {
  file: File;
  aspect?: number;
  outputSize?: number;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

export default function ImageCropperModal({
  file,
  aspect = 1,
  outputSize = 1024,
  onCancel,
  onConfirm,
}: Props) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => setImageUrl((e.target?.result as string) || '');
    reader.readAsDataURL(file);
  }, [file]);

  const onCropComplete = useCallback((_: Area, areaPx: Area) => {
    setCroppedArea(areaPx);
  }, []);

  const aplicarCrop = async () => {
    if (!croppedArea || !imageUrl) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(imageUrl, croppedArea, rotation, outputSize, file.type || 'image/jpeg');
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const baseName = file.name.replace(/\.[^.]+$/, '');
      const out = new File([blob], `${baseName}-crop.${ext}`, { type: blob.type });
      onConfirm(out);
    } catch (err) {
      console.error('Error al recortar imagen:', err);
      alert('No se pudo recortar la imagen. Intenta con otra foto.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-fondo-card)] border border-[var(--color-borde-suave)] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--color-borde-suave)]">
          <h3 className="text-base font-black">Ajustar foto</h3>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-[var(--color-fondo-hover)]"
            disabled={processing}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative w-full bg-[#f4f4f4]" style={{ height: 'min(70vh, 520px)' }}>
          {imageUrl && (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              minZoom={0.3}
              maxZoom={6}
              restrictPosition={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              objectFit="contain"
              showGrid
            />
          )}
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <ZoomOut size={14} className="text-[var(--color-texto-muted)]" />
            <input
              type="range"
              min={0.3}
              max={6}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-[var(--color-fondo-hover)] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
              aria-label="Zoom"
            />
            <ZoomIn size={14} className="text-[var(--color-texto-muted)]" />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-fondo-input)] border border-[var(--color-borde-suave)] text-xs font-bold hover:border-[#d4af37]/50"
              type="button"
              disabled={processing}
            >
              <RotateCcw size={13} /> Girar 90°
            </button>
            <p className="text-[11px] text-[var(--color-texto-muted)]">
              Arrastra y haz zoom para encuadrar.
            </p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[var(--color-borde-suave)] flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={processing}
            className="px-4 py-2 rounded-xl text-sm font-bold text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo-hover)]"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={aplicarCrop}
            disabled={processing || !croppedArea}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-black font-black uppercase text-xs tracking-widest hover:brightness-110 disabled:opacity-50"
            type="button"
          >
            <Check size={14} /> {processing ? 'Procesando...' : 'Usar esta foto'}
          </button>
        </div>
      </div>
    </div>
  );
}

async function getCroppedBlob(
  imageSrc: string,
  area: Area,
  rotation: number,
  outputSize: number,
  mime: string,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const rad = (rotation * Math.PI) / 180;

  // Lienzo con rotación: dibujamos la imagen rotada en un canvas auxiliar
  // y de ahí recortamos el área que el usuario seleccionó.
  const safeArea = Math.max(image.width, image.height) * 2;
  const work = document.createElement('canvas');
  work.width = safeArea;
  work.height = safeArea;
  const wctx = work.getContext('2d');
  if (!wctx) throw new Error('Sin canvas context');
  wctx.translate(safeArea / 2, safeArea / 2);
  wctx.rotate(rad);
  wctx.translate(-image.width / 2, -image.height / 2);
  wctx.drawImage(image, 0, 0);

  const data = wctx.getImageData(0, 0, safeArea, safeArea);

  const out = document.createElement('canvas');
  out.width = outputSize;
  out.height = outputSize;
  const octx = out.getContext('2d');
  if (!octx) throw new Error('Sin canvas context');

  // Fondo blanco para que las zonas vacías (cuando el recorte excede a la
  // imagen porque el usuario movió la foto con libertad) no salgan negras
  // al exportar a JPEG.
  octx.fillStyle = '#ffffff';
  octx.fillRect(0, 0, outputSize, outputSize);

  // Reposicionamos el lienzo al recorte que pidió el usuario.
  const tmp = document.createElement('canvas');
  tmp.width = safeArea;
  tmp.height = safeArea;
  const tctx = tmp.getContext('2d');
  if (!tctx) throw new Error('Sin canvas context');
  tctx.putImageData(data, 0, 0);

  const sx = safeArea / 2 - image.width / 2 + area.x;
  const sy = safeArea / 2 - image.height / 2 + area.y;

  octx.drawImage(tmp, sx, sy, area.width, area.height, 0, 0, outputSize, outputSize);

  const blobMime = mime === 'image/png' ? 'image/png' : 'image/jpeg';
  return new Promise<Blob>((resolve, reject) => {
    out.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob falló'))),
      blobMime,
      0.92,
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}
