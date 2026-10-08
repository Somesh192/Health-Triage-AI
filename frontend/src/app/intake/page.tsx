'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function IntakePage() {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState('');
  const [vitals, setVitals] = useState({
    spo2: '',
    temperature: '',
    systolic_bp: '',
    diastolic_bp: '',
  });
  const [urgency, setUrgency] = useState('GREEN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleVitalChange = (key: string, value: string) => {
    setVitals(prev => ({ ...prev, [key]: value }));

    // Calculate urgency based on vitals
    const spo2 = parseFloat(key === 'spo2' ? value : vitals.spo2);
    const systolic = parseFloat(key === 'systolic_bp' ? value : vitals.systolic_bp);

    if (spo2 < 90 || systolic > 180) {
      setUrgency('RED');
    } else if (spo2 < 94 || systolic > 140) {
      setUrgency('AMBER');
    } else {
      setUrgency('GREEN');
    }
  };

  const handleSubmit = async () => {
    const finalSymptoms = transcript || symptoms;
    
    if (!finalSymptoms.trim()) {
      setError('Please enter patient symptoms or use voice input');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Create patient
      const patient = await apiClient.createPatient({
        anonymous_id: `P-${Date.now()}`,
        age: undefined,
        gender: undefined,
        symptoms_text: finalSymptoms,
        vitals: {
          spo2: parseFloat(vitals.spo2) || undefined,
          temperature: parseFloat(vitals.temperature) || undefined,
          systolic_bp: parseFloat(vitals.systolic_bp) || undefined,
          diastolic_bp: parseFloat(vitals.diastolic_bp) || undefined,
        },
      });

      // Assess triage
      await apiClient.assessTriage({
        patient_id: patient.id,
        symptoms: finalSymptoms,
        vitals: {
          spo2: parseFloat(vitals.spo2) || undefined,
          temperature: parseFloat(vitals.temperature) || undefined,
          systolic_bp: parseFloat(vitals.systolic_bp) || undefined,
          diastolic_bp: parseFloat(vitals.diastolic_bp) || undefined,
        },
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      setError('Failed to submit patient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // Simulate voice recording (in production, would use Web Speech API or Bhashini)
    setTimeout(() => {
      setTranscript('Patient is experiencing difficulty breathing and has chest pain for the past 2 hours');
      setIsRecording(false);
    }, 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const getUrgencyConfig = (level: string) => {
    switch (level) {
      case 'RED':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-400/50',
          text: 'text-red-100',
          icon: '🔴'
        };
      case 'AMBER':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-400/50',
          text: 'text-yellow-100',
          icon: '🟡'
        };
      default:
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-400/50',
          text: 'text-green-100',
          icon: '🟢'
        };
    }
  };

  const urgencyConfig = getUrgencyConfig(urgency);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-rose-700 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-xl mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              New Patient Triage
            </h1>
            <p className="text-purple-100">
              Collect patient symptoms and vital signs
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-100 rounded-xl text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-100 rounded-xl text-sm">
              Patient data submitted successfully! Redirecting to dashboard...
            </div>
          )}

          {/* Urgency Indicator */}
          <div className={`p-5 rounded-xl mb-8 border-2 ${urgencyConfig.bg} ${urgencyConfig.border}`}>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">{urgencyConfig.icon}</span>
              <div className={`text-xl font-bold ${urgencyConfig.text}`}>
                Urgency: {urgency}
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-white mb-3">
              Symptoms
            </label>
            <textarea
              value={transcript || symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe patient symptoms or use voice input..."
              className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-purple-200 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none"
              rows={4}
            />
          </div>

          {/* Vitals */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                SpO2 (%)
              </label>
              <input
                type="number"
                value={vitals.spo2}
                onChange={(e) => handleVitalChange('spo2', e.target.value)}
                placeholder="98"
                min={0}
                max={100}
                className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-purple-200 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Temperature (°C)
              </label>
              <input
                type="number"
                value={vitals.temperature}
                onChange={(e) => handleVitalChange('temperature', e.target.value)}
                placeholder="37.0"
                step={0.1}
                className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-purple-200 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Systolic BP (mmHg)
              </label>
              <input
                type="number"
                value={vitals.systolic_bp}
                onChange={(e) => handleVitalChange('systolic_bp', e.target.value)}
                placeholder="120"
                className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-purple-200 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Diastolic BP (mmHg)
              </label>
              <input
                type="number"
                value={vitals.diastolic_bp}
                onChange={(e) => handleVitalChange('diastolic_bp', e.target.value)}
                placeholder="80"
                className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-purple-200 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>
          </div>

          {/* Voice Input */}
          <div className="mb-6 p-6 bg-white/5 border-2 border-dashed border-white/20 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎤</span>
                <div>
                  <h3 className="font-semibold text-white">Voice Input</h3>
                  <p className="text-sm text-purple-200">Record symptoms in Hindi/Odia</p>
                </div>
              </div>
              <button
                onClick={startRecording}
                disabled={isRecording}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isRecording
                    ? 'bg-red-500/30 text-red-100'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {isRecording ? 'Recording...' : 'Start Recording'}
              </button>
            </div>
            {transcript && (
              <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                <p className="text-sm text-purple-200 mb-1">Transcript:</p>
                <p className="text-white">{transcript}</p>
              </div>
            )}
          </div>

          {/* Document Upload */}
          <div className="mb-8 p-6 bg-white/5 border-2 border-dashed border-white/20 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📄</span>
                <div>
                  <h3 className="font-semibold text-white">Upload Lab Reports</h3>
                  <p className="text-sm text-purple-200">PDF, JPG, PNG files</p>
                </div>
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="px-4 py-2 rounded-lg font-medium bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer"
              >
                Choose File
              </label>
            </div>
            {uploadedFile && (
              <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                <p className="text-sm text-purple-200 mb-1">Selected:</p>
                <p className="text-white">{uploadedFile.name}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? 'Submitting...' : success ? 'Redirecting...' : 'Generate Triage Note'}
          </button>
        </div>
      </div>
    </div>
  );
}
