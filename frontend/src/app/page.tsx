'use client';

import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voice, setVoice] = useState('en-US-ChristopherNeural');

  // Advanced settings (can be hidden or shown)
  const [rate, setRate] = useState('+0%');
  const [pitch, setPitch] = useState('-2Hz');

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, rate, pitch }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      // Handle binary response
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased overflow-hidden relative selection:bg-red-500 selection:text-white">
      {/* Background Gradients - Bullseye Inspired (Red & Cyan) */}
      <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-red-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Floating Bullseye Emoji */}
      <div className="absolute top-10 right-10 md:top-20 md:right-20 text-9xl md:text-[15rem] opacity-10 pointer-events-none animate-float select-none z-0">
        🎯
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4 animate-fade-in-down drop-shadow-2xl">
            Essay to <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">MP3</span>
          </h1>
          <h2 className="text-xl text-stone-400 font-light tracking-wide animate-fade-in-up">
            Convert your essays into narrated audio to read with eyes closed.
          </h2>
        </div>

        {/* Main Card */}
        <div className="w-full bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 transition-all duration-300 hover:border-red-500/30 hover:shadow-red-900/10 group">

          {/* Input Area */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-red-500 mb-2 uppercase tracking-widest">Essay Text</label>
            <textarea
              className="w-full h-48 md:h-64 bg-black border border-zinc-800 rounded-xl p-5 text-stone-200 placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all resize-none leading-relaxed custom-scrollbar"
              placeholder="Paste your text here. Hit the target."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-xs font-bold text-cyan-500 mb-2 uppercase tracking-widest">Voice Selection</label>
              <div className="relative">
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-stone-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all appearance-none cursor-pointer hover:bg-zinc-950"
                >
                  <option value="en-US-ChristopherNeural">English</option>
                  <option value="pt-BR-AntonioNeural">Portuguese</option>
                </select>
                {/* Custom arrow if needed, but standard is fine for mvp */}
              </div>
            </div>
            {/* Submit */}
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={loading || !text.trim()}
                className={`w-full py-3 px-6 rounded-lg font-bold text-lg shadow-lg flex items-center justify-center transition-all duration-300 transform active:scale-[0.98]
                            ${loading || !text.trim()
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-red-900/20 hover:shadow-red-600/30'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"></span>
                    Generating...
                  </span>
                ) : (
                  "Generate Audio"
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-950/30 border border-red-500/20 rounded-lg text-red-400 text-center animate-pulse text-sm font-medium">
              {error}
            </div>
          )}

          {/* Audio Player and Download */}
          {audioUrl && (
            <div className="bg-gradient-to-b from-zinc-900 to-black rounded-xl p-6 border border-cyan-500/30 animate-fade-in shadow-2xl shadow-cyan-900/10">
              <h3 className="text-cyan-400 text-xs font-bold mb-4 uppercase tracking-widest text-center">Target Hit: Audio Ready</h3>
              <audio controls className="w-full mb-4 custom-audio-dark accent-red-500" src={audioUrl}>
                Your browser does not support the audio element.
              </audio>
              <div className="flex justify-center">
                <a
                  href={audioUrl}
                  download="essay-audio.mp3"
                  className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-white transition-colors group/link"
                >
                  <span className="text-cyan-500 group-hover/link:text-cyan-400">Download MP3</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-12 text-zinc-600 text-sm font-medium">
          Bullseye Mode Active
        </div>

      </div>
    </div>
  );
}
