'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, QrCode } from 'lucide-react';

interface CentralQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  qrValue: string;
  badge?: string;
}

export default function CentralQRModal({
  isOpen,
  onClose,
  title,
  subtitle,
  qrValue,
  badge = 'ESCANEAR EN MOSTRADOR',
}: CentralQRModalProps) {
  if (!isOpen) return null;

  const handleDownloadQR = () => {
    const canvas = document.getElementById('central-tactical-qr') as HTMLCanvasElement;
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${title.replace(/\s+/g, '_')}_QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02050B]/85 backdrop-blur-md">
      <div className="tactical-card w-full max-w-sm p-6 text-center space-y-5 border border-[#00F5D4]/40 relative glow-cyan">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#8AA4C4] hover:text-[#FFFFFF] bg-[#03080F] hover:bg-[#0E1B2E] border border-[#0E1B2E] rounded-xl transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 pt-2">
          <span className="tactical-badge-cyan px-3 py-1 rounded-full text-[10px] font-title font-bold tracking-wider inline-block">
            {badge}
          </span>
          <h3 className="font-display text-lg text-[#FFFFFF] tracking-wide mt-2">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-[#8AA4C4] max-w-xs mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* QR Inmersivo */}
        <div className="p-4 bg-white rounded-2xl border-2 border-[#00F5D4]/50 shadow-2xl inline-block mx-auto">
          <QRCodeCanvas
            id="central-tactical-qr"
            value={qrValue}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <p className="text-[11px] text-[#8AA4C4] font-mono">
          Apunta la cámara de tu celular para completar la acción instantánea.
        </p>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleDownloadQR}
            className="flex-1 py-2.5 btn-tactical-outline text-xs font-title font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Descargar
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 btn-tactical-cyan text-xs font-title font-bold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

