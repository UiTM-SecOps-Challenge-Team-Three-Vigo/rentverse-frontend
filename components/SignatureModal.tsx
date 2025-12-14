'use client';
import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File) => Promise<void>;
  title: string;
}

export default function SignatureModal({ isOpen, onClose, onConfirm, title }: SignatureModalProps) {
  const sigPad = useRef<SignatureCanvas>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const clear = () => sigPad.current?.clear();

  const handleSave = async () => {
    if (sigPad.current?.isEmpty()) {
      alert('Please provide a signature first.');
      return;
    }

    setLoading(true);
    
    try {
      const dataURL = sigPad.current?.getTrimmedCanvas().toDataURL('image/png');
      
      if (dataURL) {
        const res = await fetch(dataURL);
        const blob = await res.blob();
        const file = new File([blob], "signature.png", { type: "image/png" });

        await onConfirm(file);
        onClose();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to process signature');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-xl mb-4 bg-gray-50 overflow-hidden">
          <SignatureCanvas 
            ref={sigPad}
            penColor="black"
            canvasProps={{
              className: 'signature-canvas w-full h-48',
              style: { width: '100%', height: '200px' } 
            }} 
          />
        </div>

        <div className="flex justify-between items-center">
          <button 
            onClick={clear} 
            className="text-red-500 text-sm font-medium hover:underline px-2"
            type="button"
          >
            Clear Signature
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              disabled={loading}
              className="px-4 py-2 text-slate-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="px-6 py-2 text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}