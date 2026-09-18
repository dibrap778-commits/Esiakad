import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Play,
  Award,
  Layers,
  Sparkles,
  ClipboardCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Course, Meeting } from '../../types';
import { formatDateId, formatDateTimeId, calculateFinalScore, getLetterGrade } from '../../utils/gradeHelper';
import { VideoPlayer } from '../common/VideoPlayer';

interface StudentCourseDetailProps {
  courseId: string;
  onBack: () => void;
}

export const StudentCourseDetail: React.FC<StudentCourseDetailProps> = ({
  courseId,
  onBack,
}) => {
  const {
    currentUser,
    courses,
    meetings,
    attendance,
    grades,
    submitSelfAttendance,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'materi' | 'presensi' | 'nilai'>('materi');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

  const course = courses.find((c) => c.id === courseId);
  const courseMeetings = meetings
    .filter((m) => m.courseId === courseId)
    .sort((a, b) => a.pertemuanKe - b.pertemuanKe);

  if (!course || !currentUser || !currentUser.nim) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500">Mata kuliah tidak ditemukan.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  // Student's grade in this course
  const studentGrade = grades.find(
    (g) => g.courseId === courseId && g.studentNim === currentUser.nim
  );

  // Student's attendance records in this course
  const studentAttendance = attendance.filter(
    (a) => a.courseId === courseId && a.studentNim === currentUser.nim
  );

  const hadirCount = studentAttendance.filter((a) => a.status === 'Hadir').length;
  const totalMeetingsHeld = courseMeetings.length || 1;
  const attendancePercentage = Math.round((hadirCount / totalMeetingsHeld) * 100);

  const handleSelfAttendance = async (meetingId: string) => {
    setIsSubmittingAttendance(true);
    await submitSelfAttendance(meetingId, 'Hadir');
    setIsSubmittingAttendance(false);
  };

  const weights = course.gradeWeights || { tugas: 20, kuis: 15, uts: 30, uas: 35 };
  const finalScore = studentGrade
    ? calculateFinalScore(
        studentGrade.tugas,
        studentGrade.kuis,
        studentGrade.uts,
        studentGrade.uas,
        weights
      )
    : 0;
  const letterGradeInfo = getLetterGrade(finalScore);

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>
        <span className="text-xs text-slate-400">/</span>
        <span className="text-xs font-bold text-slate-800">{course.nama}</span>
      </div>

      {/* Course Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {course.kode}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {course.kelas} • {course.sks} SKS
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">{course.nama}</h1>
            <p className="text-xs text-slate-300">
              Dosen Pengampu: <span className="font-bold text-white">{course.dosenNama}</span> • Jadwal: {course.jadwal} ({course.ruang})
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">
                Kehadiran Saya
              </span>
              <span className="text-lg font-black text-white">{attendancePercentage}%</span>
            </div>

            {studentGrade && studentGrade.status === 'published' ? (
              <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                  Nilai Akhir
                </span>
                <span className="text-lg font-black text-emerald-300">
                  {letterGradeInfo.letter} ({finalScore.toFixed(1)})
                </span>
              </div>
            ) : (
              <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-300 block">
                  Status Nilai
                </span>
                <span className="text-xs font-bold text-amber-300">Belum Rilis</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveTab('materi')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'materi'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Materi & Video ({courseMeetings.length} Pertemuan)
          </button>
          <button
            onClick={() => setActiveTab('presensi')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'presensi'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Riwayat Presensi Saya
          </button>
          <button
            onClick={() => setActiveTab('nilai')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'nilai'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Rincian Nilai Saya
          </button>
        </div>
      </div>

      {/* TAB 1: MATERI & VIDEO PER PERTEMUAN */}
      {activeTab === 'materi' && (
        <div className="space-y-6">
          {courseMeetings.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-bold text-slate-700">Belum ada materi perkuliahan</p>
              <p className="text-xs text-slate-500 mt-1">
                Dosen pengampu belum mengunggah materi atau tautan video untuk mata kuliah ini.
              </p>
            </div>
          ) : (
            courseMeetings.map((m) => {
              const myAtt = studentAttendance.find((a) => a.meetingId === m.id);
              const isAlreadyPresent = myAtt && myAtt.status === 'Hadir';

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  {/* Meeting Header Bar */}
                  <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold uppercase">P-Ke</span>
                        <span className="text-base font-black leading-tight">{m.pertemuanKe}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDateId(m.tanggal)}
                          </span>
                        </div>
                        <h2 className="text-base font-bold text-slate-900">{m.topik}</h2>
                      </div>
                    </div>

                    {/* Presensi Mandiri Widget Box */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shrink-0">
                      {isAlreadyPresent ? (
                        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Sudah Presensi ({myAtt.method === 'mandiri' ? 'Mandiri' : 'Dosen'})</span>
                          {myAtt.timestamp && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              • {formatDateTimeId(myAtt.timestamp)}
                            </span>
                          )}
                        </div>
                      ) : m.isAttendanceOpen ? (
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-[11px] font-bold text-emerald-700 block">
                              Sesi Presensi Mandiri Aktif!
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Klik tombol untuk konfirmasi kehadiran.
                            </span>
                          </div>
                          <button
                            id={`btn-presensi-mandiri-${m.pertemuanKe}`}
                            onClick={() => handleSelfAttendance(m.id)}
                            disabled={isSubmittingAttendance}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            {isSubmittingAttendance ? 'Memproses...' : 'Hadir Sekarang'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-[11px]">Presensi belum/sudah ditutup oleh dosen</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Meeting Content: Video & Materials */}
                  <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Embedded Video */}
                    <div className="lg:col-span-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5 text-blue-600" />
                          Video Pembelajaran
                        </span>
                      </div>
                      <VideoPlayer
                        url={m.videoUrl}
                        title={`Pertemuan ${m.pertemuanKe}: ${m.topik}`}
                      />
                    </div>

                    {/* Deskripsi & Berkas */}
                    <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                          Rangkuman & Silabus
                        </span>
                        <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                          {m.deskripsi || 'Tidak ada catatan tertulis untuk pertemuan ini.'}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                          Materi & Bahan Bacaan ({m.materials?.length || 0})
                        </span>
                        {(!m.materials || m.materials.length === 0) ? (
                          <p className="text-xs text-slate-400 italic">Belum ada lampiran berkas.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {m.materials.map((mat) => (
                              <div
                                key={mat.id}
                                className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                  <span className="text-xs font-semibold text-slate-800 truncate">
                                    {mat.title}
                                  </span>
                                </div>
                                <a
                                  href={mat.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline shrink-0 ml-2"
                                >
                                  Buka Berkas <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: RIWAYAT PRESENSI SAYA */}
      {activeTab === 'presensi' && (
        <div className="space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Total Pertemuan</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {courseMeetings.length}
              </span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-xs">
              <span className="text-xs text-emerald-700 font-bold block">Kehadiran (H)</span>
              <span className="text-2xl font-black text-emerald-800 mt-1 block">
                {hadirCount}
              </span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Persentase</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {attendancePercentage}%
              </span>
            </div>
            <div
              className={`p-4 rounded-2xl border shadow-xs ${
                attendancePercentage >= 75
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <span className="text-xs font-bold block">Status Syarat UAS</span>
              <span className="text-sm font-black mt-2 block">
                {attendancePercentage >= 75 ? 'Memenuhi Syarat (>=75%)' : 'Kurang dari 75%'}
              </span>
            </div>
          </div>

          {/* Table of per-meeting attendance */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/75">
              <h2 className="text-sm font-bold text-slate-900">
                Log Riwayat Kehadiran per Pertemuan
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Pertemuan</th>
                    <th className="py-3 px-4">Topik</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Status Kehadiran</th>
                    <th className="py-3 px-4">Metode & Waktu Catat</th>
                    <th className="py-3 px-4">Catatan Dosen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {courseMeetings.map((m) => {
                    const myAtt = studentAttendance.find((a) => a.meetingId === m.id);
                    const status = myAtt ? myAtt.status : 'Belum Terdata';

                    const statusBadgeColors = {
                      Hadir: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      Izin: 'bg-blue-50 text-blue-700 border-blue-200',
                      Sakit: 'bg-amber-50 text-amber-700 border-amber-200',
                      Alpa: 'bg-rose-50 text-rose-700 border-rose-200',
                      'Belum Terdata': 'bg-slate-100 text-slate-500 border-slate-200',
                    };

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          Pertemuan {m.pertemuanKe}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">{m.topik}</td>
                        <td className="py-3.5 px-4 text-slate-500">{formatDateId(m.tanggal)}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                              statusBadgeColors[status as keyof typeof statusBadgeColors]
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-slate-500">
                          {myAtt ? (
                            <span>
                              {myAtt.method === 'mandiri' ? 'Presensi Mandiri' : 'Diabsen Dosen'}
                              {myAtt.timestamp && ` • ${formatDateTimeId(myAtt.timestamp)}`}
                            </span>
                          ) : (
                            <span className="italic text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {myAtt?.note || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RINCIAN NILAI SAYA */}
      {activeTab === 'nilai' && (
        <div className="space-y-6">
          {!studentGrade || studentGrade.status !== 'published' ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-amber-200 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Nilai belum dipublikasikan oleh dosen pengampu
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Dosen pengampu sedang dalam proses penyusunan atau rekapitulasi penilaian kelas. Nilai akan otomatis tampil di sini begitu dosen mempublikasikannya.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Scorecard Hero */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-200 block mb-1">
                    Capaian Prestasi Akademik
                  </span>
                  <h2 className="text-2xl font-black">{course.nama}</h2>
                  <p className="text-xs text-blue-100 mt-1">
                    Semester {course.semester} • Bobot {course.sks} SKS
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-xs">
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-blue-200 block uppercase">
                      Nilai Akhir
                    </span>
                    <span className="text-3xl font-black text-white">{finalScore.toFixed(1)}</span>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-white text-blue-700 flex flex-col items-center justify-center font-black shadow-xs">
                    <span className="text-2xl leading-none">{letterGradeInfo.letter}</span>
                    <span className="text-[9px] font-bold text-slate-500">
                      IP {letterGradeInfo.point.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Component breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-500 uppercase tracking-wider">
                      Tugas ({weights.tugas}%)
                    </span>
                    <span className="text-[10px] text-slate-400">0 - 100</span>
                  </div>
                  <span className="text-3xl font-black text-slate-900 block">{studentGrade.tugas}</span>
                  <span className="text-xs text-slate-500 mt-2 block">
                    Kontribusi: {((studentGrade.tugas * weights.tugas) / 100).toFixed(1)} poin
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-500 uppercase tracking-wider">
                      Kuis ({weights.kuis}%)
                    </span>
                    <span className="text-[10px] text-slate-400">0 - 100</span>
                  </div>
                  <span className="text-3xl font-black text-slate-900 block">{studentGrade.kuis}</span>
                  <span className="text-xs text-slate-500 mt-2 block">
                    Kontribusi: {((studentGrade.kuis * weights.kuis) / 100).toFixed(1)} poin
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-500 uppercase tracking-wider">
                      UTS ({weights.uts}%)
                    </span>
                    <span className="text-[10px] text-slate-400">0 - 100</span>
                  </div>
                  <span className="text-3xl font-black text-slate-900 block">{studentGrade.uts}</span>
                  <span className="text-xs text-slate-500 mt-2 block">
                    Kontribusi: {((studentGrade.uts * weights.uts) / 100).toFixed(1)} poin
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-500 uppercase tracking-wider">
                      UAS ({weights.uas}%)
                    </span>
                    <span className="text-[10px] text-slate-400">0 - 100</span>
                  </div>
                  <span className="text-3xl font-black text-slate-900 block">{studentGrade.uas}</span>
                  <span className="text-xs text-slate-500 mt-2 block">
                    Kontribusi: {((studentGrade.uas * weights.uas) / 100).toFixed(1)} poin
                  </span>
                </div>
              </div>

              {/* Status Kelulusan and feedback */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Status Akhir Kelulusan
                  </span>
                  <span
                    className={`inline-block mt-1 text-sm font-black px-3 py-1 rounded-full ${
                      letterGradeInfo.status === 'Lulus'
                        ? 'bg-emerald-100 text-emerald-800'
                        : letterGradeInfo.status === 'Lulus Bersyarat'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {letterGradeInfo.status} (Predikat: {letterGradeInfo.letter})
                  </span>
                </div>

                {studentGrade.feedback && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 max-w-md">
                    <span className="font-bold text-slate-700 block mb-0.5">Catatan Dosen:</span>
                    {studentGrade.feedback}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
