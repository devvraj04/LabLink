import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { Download, QrCode as QrIcon } from 'lucide-react';
import { qrAPI } from '../../services/api';

const QRCodeDisplay = ({ type = 'donor', id, data }) => {
  const [qrValue, setQrValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      generateQR();
    } else if (data) {
      setQrValue(JSON.stringify(data));
    }
  }, [id, data]);

  const generateQR = async () => {
    setLoading(true);
    try {
      const response = type === 'donor' 
        ? await qrAPI.generateDonorQR(id)
        : await qrAPI.generateSpecimenQR(id);
      setQrValue(response.data.data.qrData);
    } catch (err) {
      console.error('Error generating QR:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qr-${type}-${id || 'code'}.png`;
      link.href = url;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <QrIcon className="h-5 w-5 text-blue-600" />
          QR Code
        </h3>
        <button
          onClick={downloadQR}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm font-medium"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>

      {qrValue ? (
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg border-2 border-zinc-200">
            <QRCode
              id="qr-code-canvas"
              value={qrValue}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="text-sm text-zinc-600 mt-4 text-center">
            {type === 'donor' ? 'Donor Check-in QR Code' : 'Specimen Tracking QR Code'}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Scan this code for quick access</p>
        </div>
      ) : (
        <div className="text-center py-8 text-zinc-500">
          <QrIcon className="h-16 w-16 text-zinc-300 mx-auto mb-3" />
          <p>No QR code data available</p>
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;
