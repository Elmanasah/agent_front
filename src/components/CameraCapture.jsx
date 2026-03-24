import { useEffect, useRef, useState } from "react";

/**
 * CameraCapture modal
 * Props:
 *   isOpen   {boolean}
 *   onClose  () => void
 *   onCapture (base64: string, mimeType: string, previewUrl: string) => void
 */
export default function CameraCapture({ isOpen, onClose, onCapture }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [facingMode, setFacingMode]   = useState("environment");
  const [deviceCount, setDeviceCount] = useState(0);
  const [snapshot, setSnapshot]       = useState(null); // data-URL preview
  const [camError, setCamError]       = useState(null);

  // Start/stop stream whenever modal opens or facing mode flips
  useEffect(() => {
    if (!isOpen) { stopStream(); setSnapshot(null); setCamError(null); return; }
    startStream();
    navigator.mediaDevices.enumerateDevices().then((list) =>
      setDeviceCount(list.filter((d) => d.kind === "videoinput").length)
    ).catch(() => {});
    return stopStream;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, facingMode]);

  async function startStream() {
    stopStream();
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCamError("Camera permission denied — please allow access and try again.");
    }
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function takeSnapshot() {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width  = v.videoWidth  || 640;
    c.height = v.videoHeight || 480;
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    setSnapshot(c.toDataURL("image/jpeg", 0.92));
    stopStream();
  }

  function retake() { setSnapshot(null); startStream(); }

  function confirm() {
    if (!snapshot) return;
    const base64 = snapshot.split(",")[1];
    onCapture(base64, "image/jpeg", snapshot);
    onClose();
  }

  function flipCamera() {
    setFacingMode((m) => (m === "environment" ? "user" : "environment"));
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] overflow-hidden shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-white">Take a Photo</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Viewfinder */}
        <div className="relative w-full bg-black" style={{ aspectRatio: "4/3" }}>
          {camError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm text-rose-300">{camError}</p>
            </div>
          ) : snapshot ? (
            <img src={snapshot} alt="snapshot" className="w-full h-full object-contain" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Flip button — only when live + multiple cameras */}
          {!snapshot && !camError && deviceCount > 1 && (
            <button
              onClick={flipCamera}
              className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              title="Flip camera"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 px-5 py-6 bg-slate-50 dark:bg-slate-900">
          {snapshot ? (
            <>
              <button
                onClick={retake}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-slate-200 dark:bg-white/8 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/12 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.14"/>
                </svg>
                Retake
              </button>
              <button
                onClick={confirm}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/25"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Use Photo
              </button>
            </>
          ) : (
            /* Shutter button */
            <button
              onClick={takeSnapshot}
              disabled={!!camError}
              title="Capture"
              className="relative w-16 h-16 rounded-full border-4 border-white dark:border-slate-300 shadow-lg disabled:opacity-40 active:scale-95 transition-transform focus:outline-none"
            >
              <span className="absolute inset-1.5 rounded-full bg-white dark:bg-slate-200 hover:bg-slate-100 transition-colors block" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
