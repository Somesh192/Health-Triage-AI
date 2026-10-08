import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-2xl mb-6">
            <span className="text-4xl">🏥</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Health Triage AI
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-4">
            Multimodal Healthcare Triage Assistant for Indian PHCs
          </p>
          <p className="text-sm text-blue-200 max-w-xl mx-auto leading-relaxed">
            It will never diagnose you. It will make sure the person who can, has everything they need in ninety seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/login" className="group bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 hover:bg-white/20 hover:scale-105">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-400 transition-colors">
                👤
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Secure Login</h2>
                <p className="text-blue-100">JWT authentication with role-based access control</p>
              </div>
            </div>
          </Link>

          <Link href="/consent" className="group bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 hover:bg-white/20 hover:scale-105">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center text-2xl group-hover:bg-green-400 transition-colors">
                ✅
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Patient Consent</h2>
                <p className="text-blue-100">Interactive consent recording for each data type</p>
              </div>
            </div>
          </Link>

          <Link href="/intake" className="group bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 hover:bg-white/20 hover:scale-105">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center text-2xl group-hover:bg-purple-400 transition-colors">
                📝
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Multimodal Intake</h2>
                <p className="text-blue-100">Text, voice, vitals, and document upload</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard" className="group bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 hover:bg-white/20 hover:scale-105">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center text-2xl group-hover:bg-red-400 transition-colors">
                👨‍⚕️
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Doctor Dashboard</h2>
                <p className="text-blue-100">Color-coded queue with 90-second review</p>
              </div>
            </div>
          </Link>

          <Link href="/ai-chat" className="group bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 hover:bg-white/20 hover:scale-105 md:col-span-2 lg:col-span-2">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-indigo-500 rounded-xl flex items-center justify-center text-2xl group-hover:bg-indigo-400 transition-colors">
                🤖
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">AI Health Assistant</h2>
                <p className="text-blue-100">Chat with AI for general health guidance and information</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-white text-sm font-medium">Safety First</span>
            <span className="text-white/40">•</span>
            <span className="text-white text-sm font-medium">Privacy Always</span>
            <span className="text-white/40">•</span>
            <span className="text-white text-sm font-medium">India-Wide Relevance</span>
          </div>
        </div>
      </div>
    </main>
  );
}
