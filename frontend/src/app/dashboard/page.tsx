'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const data = await apiClient.getTriageQueue();
      setQueue(data);
    } catch (err) {
      setError('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'RED':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-400/50',
          text: 'text-red-100',
          icon: '🔴',
          badge: 'bg-red-500'
        };
      case 'AMBER':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-400/50',
          text: 'text-yellow-100',
          icon: '🟡',
          badge: 'bg-yellow-500'
        };
      default:
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-400/50',
          text: 'text-green-100',
          icon: '🟢',
          badge: 'bg-green-500'
        };
    }
  };



  if (selectedPatient) {
    const urgencyConfig = getUrgencyConfig(selectedPatient.urgency);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-600 to-amber-700 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedPatient(null)}
            className="mb-6 text-white hover:text-white/80 font-semibold transition-colors"
          >
            ← Back to Queue
          </button>

          <div className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white">
                Patient Review
              </h1>
              <div className={`px-5 py-2 rounded-xl font-bold text-white ${urgencyConfig.badge}`}>
                {selectedPatient.urgency}
              </div>
            </div>

            {/* Chief Complaint */}
            <div className="mb-6 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <h2 className="font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-xl">📋</span> Chief Complaint
              </h2>
              <p className="text-white/90">
                {selectedPatient.chief_complaint}
              </p>
            </div>

            {/* Vitals */}
            <div className="mb-6 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <h2 className="font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-xl">💓</span> Vitals & Labs
              </h2>
              <p className="text-white/90 whitespace-pre-wrap font-mono text-sm">
                {selectedPatient.vitals_and_labs}
              </p>
            </div>

            {/* Urgency Signals */}
            <div className="mb-6 p-5 bg-red-500/20 backdrop-blur-sm rounded-xl border border-red-400/30">
              <h2 className="font-bold text-red-100 mb-3 flex items-center gap-2">
                <span className="text-xl">⚠️</span> Urgency Signals
              </h2>
              <ul className="list-disc list-inside text-red-100 space-y-1">
                {Array.isArray(selectedPatient.urgency_signals)
                  ? selectedPatient.urgency_signals.map((signal: string, i: number) => (
                      <li key={i}>{signal}</li>
                    ))
                  : <li>{selectedPatient.urgency_signals}</li>
                }
              </ul>
            </div>

            {/* Missing Info */}
            <div className="mb-6 p-5 bg-yellow-500/20 backdrop-blur-sm rounded-xl border border-yellow-400/30">
              <h2 className="font-bold text-yellow-100 mb-3 flex items-center gap-2">
                <span className="text-xl">❓</span> Missing Information
              </h2>
              <ul className="list-disc list-inside text-yellow-100 space-y-1">
                {Array.isArray(selectedPatient.missing_info)
                  ? selectedPatient.missing_info.map((info: string, i: number) => (
                      <li key={i}>{info}</li>
                    ))
                  : <li>{selectedPatient.missing_info}</li>
                }
              </ul>
            </div>

            {/* Suggested Questions */}
            <div className="mb-6 p-5 bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-400/30">
              <h2 className="font-bold text-blue-100 mb-3 flex items-center gap-2">
                <span className="text-xl">💭</span> Suggested Questions for Doctor
              </h2>
              <ul className="list-disc list-inside text-blue-100 space-y-1">
                {Array.isArray(selectedPatient.suggested_questions)
                  ? selectedPatient.suggested_questions.map((q: string, i: number) => (
                      <li key={i}>{q}</li>
                    ))
                  : <li>{selectedPatient.suggested_questions}</li>
                }
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button className="flex-1 py-4 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">
                Admit
              </button>
              <button className="flex-1 py-4 rounded-xl font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors">
                Refer
              </button>
              <button className="flex-1 py-4 rounded-xl font-semibold text-white border-2 border-white/30 hover:bg-white/10 transition-colors">
                Discharge
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-600 to-amber-700 p-8 flex items-center justify-center">
        <div className="text-xl text-white">Loading queue...</div>
      </div>
    );
  }

  const redCount = queue.filter(p => p.urgency === 'RED').length;
  const amberCount = queue.filter(p => p.urgency === 'AMBER').length;
  const greenCount = queue.filter(p => p.urgency === 'GREEN').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-orange-600 to-amber-700 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Doctor Queue
          </h1>
          <p className="text-orange-100">
            Review patients by urgency level
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-100 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
            <div className="text-3xl font-bold text-white">{queue.length}</div>
            <div className="text-sm text-orange-100 mt-1">Total</div>
          </div>
          <div className="bg-red-500/20 backdrop-blur-sm p-6 rounded-2xl border border-red-400/30">
            <div className="text-3xl font-bold text-red-100">{redCount}</div>
            <div className="text-sm text-red-200 mt-1">RED</div>
          </div>
          <div className="bg-yellow-500/20 backdrop-blur-sm p-6 rounded-2xl border border-yellow-400/30">
            <div className="text-3xl font-bold text-yellow-100">{amberCount}</div>
            <div className="text-sm text-yellow-200 mt-1">AMBER</div>
          </div>
          <div className="bg-green-500/20 backdrop-blur-sm p-6 rounded-2xl border border-green-400/30">
            <div className="text-3xl font-bold text-green-100">{greenCount}</div>
            <div className="text-sm text-green-200 mt-1">GREEN</div>
          </div>
        </div>

        {/* Queue */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20">
          {queue.length === 0 ? (
            <div className="text-center py-12 text-orange-100">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-lg">No patients in queue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map((patient) => {
                const urgencyConfig = getUrgencyConfig(patient.urgency);
                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-5 rounded-xl border-2 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.01] ${urgencyConfig.bg} ${urgencyConfig.border}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{urgencyConfig.icon}</span>
                        <div>
                          <div className="font-bold text-white">{patient.id}</div>
                          <div className="text-sm text-white/70">
                            Wait: {Math.round(patient.wait_time)} min
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="max-w-md truncate text-white/90">
                          {patient.chief_complaint}
                        </div>
                        <button className="px-5 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-colors">
                          Review →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={() => router.push('/')}
          className="mt-8 w-full py-3 rounded-xl font-semibold text-white border-2 border-white/20 hover:bg-white/10 transition-all"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
