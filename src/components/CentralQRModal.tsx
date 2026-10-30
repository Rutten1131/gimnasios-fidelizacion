'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, QrCode, Loader2, RefreshCw } from 'lucide-react';

interface CentralQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  qrValue: string;
  badge?: string;
  isImage?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function CentralQRModal({
  isOpen,
  onClose,
  title,
  subtitle,
  qrValue,
  badge = 'ESCANEAR EN MOSTRADOR',
  isImage = false,
  onRefresh,
  isRefreshing = false,
}: CentralQRModalProps) {
  if (!isOpen) return null;

  const handleDownloadQR = () => {
    if (isImage) {
      const downloadLink = document.createElement('a');
      downloadLink.href = qrValue;
      downloadLink.download = `${title.replace(/\s+/g, '_')}_QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      return;
    }

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

  const isLoading = !qrValue || qrValue === 'esperando_qr' || isRefreshing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02050B]/85 backdrop-blur-md">
      <div className="tactical-card w-full max-w-sm p-6 text-center space-y-4 border border-[#00F5D4]/40 relative glow-cyan">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#8AA4C4] hover:text-[#FFFFFF] bg-[#03080F] hover:bg-[#0E1B2E] border border-[#0E1B2E] rounded-xl transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 pt-1">
          <span className="tactical-badge-cyan px-3 py-1 rounded-full text-[10px] font-title font-bold tracking-wider inline-block">
            {badge}
          </span>
          <h3 className="font-display text-lg text-[#FFFFFF] tracking-wide mt-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-[#8AA4C4] max-w-xs mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* QR Display Container */}
        <div className="p-4 bg-white rounded-2xl border-2 border-[#00F5D4]/50 shadow-2xl inline-flex items-center justify-center min-w-[230px] min-h-[230px] mx-auto relative group">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-6 space-y-2 text-[#02050B]">
              <Loader2 className="w-8 h-8 animate-spin text-[#00B4D8]" />
              <span className="text-xs font-mono font-bold">Generando nuevo QR...</span>
            </div>
          ) : isImage ? (
            <img
              src={qrValue}
              alt="WhatsApp QR Code"
              className="w-52 h-52 object-contain"
            />
          ) : (
            <QRCodeCanvas
              id="central-tactical-qr"
              value={qrValue}
              size={200}
              level="H"
              includeMargin={true}
            />
          )}
        </div>

        {/* Info & Auto-refresh reminder */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8AA4C4] font-mono">
          <span>Los códigos de WhatsApp expiran cada 40-60s.</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="w-full py-2.5 btn-tactical-cyan text-xs font-title font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'RENOVANDO CÓDIGO...' : 'REINICIAR / ACTUALIZAR QR'}
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleDownloadQR}
              disabled={isLoading}
              className="flex-1 py-2 btn-tactical-outline text-xs font-title font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> Descargar
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-[#05101C] hover:bg-[#07192C] border border-[#0E1B2E] text-[#8AA4C4] hover:text-[#FFFFFF] text-xs font-title font-bold rounded-xl transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
