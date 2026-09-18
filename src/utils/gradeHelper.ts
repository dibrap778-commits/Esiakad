import { GradeWeights } from '../types';

export function calculateFinalScore(
  tugas: number,
  kuis: number,
  uts: number,
  uas: number,
  weights: GradeWeights = { tugas: 20, kuis: 15, uts: 30, uas: 35 }
): number {
  const totalWeight = (weights.tugas || 0) + (weights.kuis || 0) + (weights.uts || 0) + (weights.uas || 0);
  if (totalWeight === 0) return 0;

  const rawScore =
    (tugas * (weights.tugas || 0) +
      kuis * (weights.kuis || 0) +
      uts * (weights.uts || 0) +
      uas * (weights.uas || 0)) /
    totalWeight;

  return Math.round(rawScore * 100) / 100;
}

export interface LetterGradeInfo {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  gpa: number;
  point: number;
  status: 'Lulus' | 'Lulus Bersyarat' | 'Tidak Lulus';
  color: string;
  bg: string;
}

export function getLetterGrade(score: number): LetterGradeInfo {
  if (score >= 85) {
    return { letter: 'A', gpa: 4.0, point: 4.0, status: 'Lulus', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
  }
  if (score >= 75) {
    return { letter: 'B', gpa: 3.0, point: 3.0, status: 'Lulus', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' };
  }
  if (score >= 60) {
    return { letter: 'C', gpa: 2.0, point: 2.0, status: 'Lulus', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
  }
  if (score >= 50) {
    return { letter: 'D', gpa: 1.0, point: 1.0, status: 'Lulus Bersyarat', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' };
  }
  return { letter: 'E', gpa: 0.0, point: 0.0, status: 'Tidak Lulus', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' };
}

export function parseVideoUrl(url: string): { embedUrl: string; platform: 'youtube' | 'drive' | 'custom' | 'none' } {
  if (!url || typeof url !== 'string') {
    return { embedUrl: '', platform: 'none' };
  }

  const trimmed = url.trim();

  // YouTube formats
  // 1. https://www.youtube.com/watch?v=xyz or https://youtube.com/watch?v=xyz
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0`,
      platform: 'youtube',
    };
  }

  // Google Drive format
  // https://drive.google.com/file/d/FILE_ID/view...
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return {
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      platform: 'drive',
    };
  }

  // Already embed or standard http link
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      embedUrl: trimmed,
      platform: 'custom',
    };
  }

  return { embedUrl: '', platform: 'none' };
}

export function formatDateId(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTimeId(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}
