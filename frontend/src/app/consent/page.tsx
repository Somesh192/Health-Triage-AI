'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function ConsentPage() {
  const router = useRouter();
  const [consents, setConsents] = useState({
    voiceRecording: false,
    documentUpload: false,
    aiProcessing: false,
    dataStorage: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleConsent = (type: string, granted: boolean) => {
    setConsents(prev => ({ ...prev, [type]: granted }));
  };

  const allGranted = Object.values(consents).every(v => v);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Record each consent type
      const consentMappings: Array<{ frontendKey: keyof typeof consents; backendType: string }> = [
        { frontendKey: 'voiceRecording', backendType: 'voice_recording' },
        { frontendKey: 'documentUpload', backendType: 'document_upload' },
        { frontendKey: 'aiProcessing', backendType: 'ai_processing' },
        { frontendKey: 'dataStorage', backendType: 'data_storage' },
      ];

      for (const mapping of consentMappings) {
        if (consents[mapping.frontendKey]) {
          await apiClient.recordConsent({
            patient_id: 'temp-patient-id',
            consent_type: mapping.backendType,
            granted: true,
            consent_method: 'touch',
            metadata: { timestamp: new Date().toISOString() }
          });
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/intake');
      }, 1500);
    } catch (err) {
      setError('Failed to record consent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-teal-600 to-cyan-700 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-xl mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Consent to Collect Data
            </h1>
            <p className="text-green-100">
              We need your permission to collect and process your health information
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-100 rounded-xl text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-100 rounded-xl text-sm">
              Consent recorded successfully! Redirecting to intake...
            </div>
          )}

          <div className="space-y-4">
            <div className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all cursor-pointer ${
              consents.voiceRecording
                ? 'bg-white/20 border-white/40'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}>
              <input
                type="checkbox"
                id="voice"
                checked={consents.voiceRecording}
                onChange={(e) => handleConsent('voiceRecording', e.target.checked)}
                className="mt-1 w-6 h-6 rounded border-white/30 bg-white/10 text-green-400 focus:ring-green-400 focus:ring-offset-0"
              />
              <div>
                <label htmlFor="voice" className="font-semibold text-white block mb-1">
                  Voice Recording
                </label>
                <p className="text-sm text-green-100">
                  For symptom input in your language
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all cursor-pointer ${
              consents.documentUpload
                ? 'bg-white/20 border-white/40'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}>
              <input
                type="checkbox"
                id="document"
                checked={consents.documentUpload}
                onChange={(e) => handleConsent('documentUpload', e.target.checked)}
                className="mt-1 w-6 h-6 rounded border-white/30 bg-white/10 text-green-400 focus:ring-green-400 focus:ring-offset-0"
              />
              <div>
                <label htmlFor="document" className="font-semibold text-white block mb-1">
                  Document Upload
                </label>
                <p className="text-sm text-green-100">
                  Lab reports, medical records
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all cursor-pointer ${
              consents.aiProcessing
                ? 'bg-white/20 border-white/40'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}>
              <input
                type="checkbox"
                id="ai"
                checked={consents.aiProcessing}
                onChange={(e) => handleConsent('aiProcessing', e.target.checked)}
                className="mt-1 w-6 h-6 rounded border-white/30 bg-white/10 text-green-400 focus:ring-green-400 focus:ring-offset-0"
              />
              <div>
                <label htmlFor="ai" className="font-semibold text-white block mb-1">
                  AI Processing
                </label>
                <p className="text-sm text-green-100">
                  Extract and summarize information
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all cursor-pointer ${
              consents.dataStorage
                ? 'bg-white/20 border-white/40'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}>
              <input
                type="checkbox"
                id="storage"
                checked={consents.dataStorage}
                onChange={(e) => handleConsent('dataStorage', e.target.checked)}
                className="mt-1 w-6 h-6 rounded border-white/30 bg-white/10 text-green-400 focus:ring-green-400 focus:ring-offset-0"
              />
              <div>
                <label htmlFor="storage" className="font-semibold text-white block mb-1">
                  Data Storage
                </label>
                <p className="text-sm text-green-100">
                  Store data for 30 days for quality improvement
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
            <p className="text-sm text-green-100 leading-relaxed">
              <strong className="text-white">Privacy Policy:</strong> Your data will be anonymized before processing.
              You can withdraw consent at any time.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!allGranted || loading}
            className={`mt-8 w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
              allGranted
                ? 'bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-white/5 border border-white/10 cursor-not-allowed opacity-50'
            }`}
          >
            {loading ? 'Recording...' : success ? 'Redirecting...' : 'I Agree'}
          </button>


        </div>
      </div>
    </div>
  );
}
