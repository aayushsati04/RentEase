import React from 'react';

export default function VirtualTour({ virtualTourUrl }) {
  if (!virtualTourUrl) return null;

  let embedUrl = virtualTourUrl.trim();

  // Basic URL sanity check/validation to avoid broken iframe attempts
  try {
    const parsed = new URL(embedUrl);
    // Secure URL protocol
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
  } catch (err) {
    // Return null if it is not a valid URL structure
    return null;
  }

  // Optimize Matterport URLs for embedding
  if (embedUrl.includes('matterport.com') && !embedUrl.includes('&play=1') && !embedUrl.includes('iframe')) {
    if (embedUrl.includes('?')) {
      if (!embedUrl.includes('play=1')) embedUrl += '&play=1';
      if (!embedUrl.includes('qs=1')) embedUrl += '&qs=1';
    } else {
      embedUrl += '?play=1&qs=1';
    }
  }

  return (
    <div className="glass-card rounded-3xl p-6 border border-white/8 space-y-4 shadow-glass">
      <div className="flex items-center justify-between border-b border-white/8 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🥽</span>
          <h3 className="text-white font-bold text-lg">360° Immersive Virtual Tour</h3>
        </div>
        <span className="badge bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 animate-pulse">
          Live 3D Tour
        </span>
      </div>

      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/5 bg-slate-950 shadow-inner">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          title="360° Property Tour"
          frameBorder="0"
          allowFullScreen
          allow="xr-spatial-tracking; clipboard-write; gyroscope; accelerometer"
          className="absolute inset-0 w-full h-full rounded-2xl"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 bg-white/2 p-3 rounded-xl border border-white/4">
        <span>💡 Use your cursor to look around and click circles to navigate.</span>
        <a 
          href={virtualTourUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary-400 hover:text-primary-300 font-semibold shrink-0"
        >
          View Fullscreen ↗
        </a>
      </div>
    </div>
  );
}
