import React, { useState, useEffect, useRef } from 'react';
import { Scan, AlertCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isScanning: boolean;
}

export function BarcodeScanner({ onScan, isScanning }: BarcodeScannerProps) {
  const [scannedCode, setScannedCode] = useState('');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isScanning) return;

      // Ignore if user is typing in another input
      if (document.activeElement !== inputRef.current && 
          document.activeElement?.tagName === 'INPUT') {
        return;
      }

      if (e.key === 'Enter') {
        if (scannedCode.length > 0) {
          onScan(scannedCode);
          setScannedCode('');
          setIsListening(false);
        }
      } else if (e.key.length === 1) {
        setIsListening(true);
        setScannedCode(prev => prev + e.key);
        
        // Clear timeout if it exists
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Set timeout to reset if no more characters come
        timeoutRef.current = setTimeout(() => {
          setScannedCode('');
          setIsListening(false);
        }, 100);
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isScanning, scannedCode, onScan]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scannedCode.length > 0) {
      onScan(scannedCode);
      setScannedCode('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <Scan className={`h-6 w-6 ${isScanning ? 'text-green-600' : 'text-gray-400'}`} />
        <h2 className="text-xl font-semibold text-gray-800">Scanner de Code-barres</h2>
        {isListening && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Scan en cours...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleManualSubmit} className="space-y-4">
        <div>
          <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-2">
            Code-barres scanné ou manuel
          </label>
          <input
            ref={inputRef}
            type="text"
            id="barcode"
            value={scannedCode}
            onChange={(e) => setScannedCode(e.target.value)}
            placeholder={isScanning ? "Pointez le scanner ici..." : "Saisissez le code-barres"}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
            autoFocus={isScanning}
          />
        </div>
        
        <button
          type="submit"
          disabled={!scannedCode}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Ajouter au panier
        </button>
      </form>

      {!isScanning && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Le scanner n'est pas activé. Utilisez la saisie manuelle ou activez le mode scanner.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}