import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { PortalHeader } from '../layout/PortalHeader';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { lookupPet, type PetLookupResult } from '../../services/linking';
import { ScanResult } from './ScanResult';
import { ManualLookup } from './ManualLookup';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Camera, Keyboard, AlertCircle } from 'lucide-react';

type Tab = 'camera' | 'manual';

export function QRScanPage() {
  const { business } = usePortalAuth();
  const [activeTab, setActiveTab] = useState<Tab>('camera');
  const [pet, setPet] = useState<PetLookupResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [lookingUp, setLookingUp] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        // State 2 = SCANNING
        if (state === 2) {
          await scannerRef.current.stop();
        }
      } catch {
        // Ignore stop errors
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      if (!business || !mountedRef.current) return;

      // Stop scanner immediately on successful scan
      await stopScanner();

      setLookingUp(true);
      try {
        const result = await lookupPet(decodedText, business.id);
        if (mountedRef.current) {
          if (result) {
            setPet(result);
          } else {
            setCameraError('QR code scanned but no matching pet found. Try a different code or use manual lookup.');
          }
        }
      } catch {
        if (mountedRef.current) {
          setCameraError('Failed to look up pet from QR code.');
        }
      } finally {
        if (mountedRef.current) {
          setLookingUp(false);
        }
      }
    },
    [business, stopScanner],
  );

  const startScanner = useCallback(async () => {
    if (!containerRef.current || scannerRef.current) return;

    setCameraError('');
    const scannerId = 'qr-reader';

    // Ensure the element exists
    const el = document.getElementById(scannerId);
    if (!el) return;

    try {
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // QR code parse error — ignore, keep scanning
        },
      );

      if (mountedRef.current) {
        setScanning(true);
      }
    } catch (err) {
      if (mountedRef.current) {
        if (err instanceof Error && err.message.includes('Permission')) {
          setCameraError('Camera permission denied. Please allow camera access or use manual lookup.');
        } else {
          setCameraError('Could not start camera. Please use manual lookup instead.');
        }
      }
    }
  }, [handleScanSuccess]);

  // Start/stop scanner when tab changes
  useEffect(() => {
    mountedRef.current = true;

    if (activeTab === 'camera' && !pet) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          startScanner();
        }
      }, 100);
      return () => {
        clearTimeout(timer);
        mountedRef.current = false;
        stopScanner();
      };
    }

    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, [activeTab, pet, startScanner, stopScanner]);

  const handleReset = () => {
    setPet(null);
    setCameraError('');
    setLookingUp(false);
  };

  const handleManualResult = (result: PetLookupResult) => {
    setPet(result);
  };

  // If we have a pet result, show it
  if (pet) {
    return (
      <>
        <PortalHeader title="QR Scanner" />
        <div className="p-6 max-w-lg mx-auto">
          <ScanResult pet={pet} onReset={handleReset} />
        </div>
      </>
    );
  }

  return (
    <>
      <PortalHeader title="QR Scanner" />
      <div className="p-6 max-w-lg mx-auto">
        {/* Tab switcher */}
        <div className="flex bg-neutral-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'camera'
                ? 'bg-white text-portal-primary-600 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Camera size={16} />
            Scan QR Code
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'manual'
                ? 'bg-white text-portal-primary-600 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Keyboard size={16} />
            Manual Lookup
          </button>
        </div>

        {/* Camera tab */}
        {activeTab === 'camera' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-neutral-800 mb-1">
                Scan Pet QR Tag
              </h3>
              <p className="text-sm text-neutral-500">
                Point the camera at the QR code on the pet&apos;s tag or collar.
              </p>
            </div>

            {lookingUp ? (
              <div className="flex flex-col items-center py-12">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-neutral-500 mt-3">Looking up pet...</p>
              </div>
            ) : (
              <>
                {/* QR reader container */}
                <div ref={containerRef} className="relative rounded-xl overflow-hidden bg-neutral-900 mb-4">
                  <div id="qr-reader" className="w-full" />
                  {!scanning && !cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <LoadingSpinner size="lg" className="text-white" />
                    </div>
                  )}
                </div>

                {scanning && (
                  <p className="text-xs text-center text-neutral-400">
                    Camera active &mdash; scanning for QR codes...
                  </p>
                )}

                {cameraError && (
                  <div className="bg-danger/10 text-danger text-sm rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <p>{cameraError}</p>
                      <button
                        onClick={() => setActiveTab('manual')}
                        className="text-portal-primary-600 hover:underline font-semibold mt-1 text-xs"
                      >
                        Switch to manual lookup
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Manual tab */}
        {activeTab === 'manual' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <ManualLookup onResult={handleManualResult} />
          </div>
        )}
      </div>
    </>
  );
}
