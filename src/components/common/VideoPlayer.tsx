import React from 'react';
import { Play, ExternalLink, Video } from 'lucide-react';
import { parseVideoUrl } from '../../utils/gradeHelper';

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
  if (!url) {
    return (
      <div className="w-full aspect-video bg-slate-100 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
        <Video className="w-10 h-10 mb-2 opacity-50" />
        <p className="text-sm font-medium">Belum ada video materi yang ditautkan untuk pertemuan ini.</p>
      </div>
    );
  }

  const { embedUrl, platform } = parseVideoUrl(url);

  if (!embedUrl) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center justify-between gap-3">
        <span>Format URL video tidak dikenali: <code className="font-mono text-xs break-all">{url}</code></span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 shrink-0"
        >
          Buka Tautan <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-black">
        <iframe
          src={embedUrl}
          title={title || 'Materi Video Perkuliahan'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="flex items-center gap-1.5">
          <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
          {platform === 'youtube' && 'Pemutar YouTube Terintegrasi'}
          {platform === 'drive' && 'Pratinjau Google Drive Terintegrasi'}
          {platform === 'custom' && 'Pemutar Media Web'}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline font-medium"
        >
          Buka di Tab Baru <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
