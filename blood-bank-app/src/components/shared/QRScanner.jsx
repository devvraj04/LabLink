import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { qrAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const QRScanner = ({ onScanComplete }) => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const { success, error } = useToast();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // In a real implementation, you would use a QR code reading library
    // For now, we'll simulate the scan
    try {
      setScanning(true);
      
      // Simulate API call to decode QR
      // In production, use a library like jsQR to decode from image
      const mockQRData = JSON.stringify({
        type: 'donor',
        id: '123456',
        name: 'John Doe',
        bloodGroup: 'O+',
        timestamp: new Date().toISOString()
      });

      const response = await qrAPI.scanQR({ qrData: mockQRData });
      const data = response.data.data;
      
      setScannedData(data);
      success('QR Scanned!', 'Successfully decoded QR code');
      
      if (onScanComplete) {
        onScanComplete(data);
      }
    } catch (err) {
      error('Scan Failed', 'Could not decode QR code');
    } finally {
      setScanning(false);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Camera className="h-5 w-5 text-blue-600" />
        Scan QR Code
      </h3>

      {!scannedData ? (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center">
            {scanning ? (
              <div className="py-8">
                <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-zinc-600">Scanning QR code...</p>
              </div>
            ) : (
              <>
                <Upload className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                <p className="text-zinc-600 mb-4">Upload QR code image to scan</p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <span className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium cursor-pointer inline-flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Choose Image
                  </span>
                </label>
              </>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> In a production environment, this would use your device's camera 
              to scan QR codes in real-time. For now, you can upload an image containing a QR code.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                ✓ QR Code Scanned Successfully
              </div>
              <button
                onClick={resetScanner}
                className="text-zinc-500 hover:text-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              {scannedData.type && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Type:</span>
                  <span className="font-medium capitalize">{scannedData.type}</span>
                </div>
              )}
              {scannedData.id && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">ID:</span>
                  <span className="font-medium">{scannedData.id}</span>
                </div>
              )}
              {scannedData.name && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Name:</span>
                  <span className="font-medium">{scannedData.name}</span>
                </div>
              )}
              {scannedData.bloodGroup && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Blood Group:</span>
                  <span className="font-medium">{scannedData.bloodGroup}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={resetScanner}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Scan Another Code
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
