import React from 'react';
import {
  BookOpen,
  Users,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight,
  Video,
  ClipboardList,
  Award,
  Bell,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateId } from '../../utils/gradeHelper';

interface DosenDashboardProps {
  onNavigate: (tab: string, extra?: any) => void;
}

export const DosenDashboard: React.FC<DosenDashboardProps> = ({ onNavigate }) => {
  const { courses, users, meetings, attendance, grades, announcements, enrollments } = useApp();

  const students = users.filter((u) => u.role === 'mahasiswa');
  const totalCourses = courses.length;
  const totalStudents = students.length;

  // Calculate average attendance across all recorded attendance
  const totalAttendanceRecords = attendance.length;
  const hadirRecords = attendance.filter((a) => a.status === 'Hadir').length;
  const avgAttendance = totalAttendanceRecords > 0 ? Math.round((hadirRecords / totalAttendanceRecords) * 100) : 0;

  // Count unpublished (draft) grades
  const unpublishedGrades = grades.filter((g) => g.status === 'draft').length;

  // Open self-attendance sessions
  const activeAttendanceSessions = meetings.filter((m) => m.isAttendanceOpen);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30 mb-3">
            Dashboard Dosen Pengampu
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang di Portal Kelas
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Kelola kegiatan perkuliahan, publikasikan materi video embed, kendalikan presensi mandiri mahasiswa, serta hitung nilai akhir secara terstruktur dan transparan.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              id="dash-add-course-btn"
              onClick={() => onNavigate('courses')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Tambah Mata Kuliah
            </button>
            <button
              id="dash-open-attendance-btn"
              onClick={() => onNavigate('attendance')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-xs border border-white/20 transition-all"
            >
              <ClipboardList className="w-4 h-4" /> Kelola Presensi
            </button>
            <button
              id="dash-open-grades-btn"
              onClick={() => onNavigate('grades')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-xs border border-white/20 transition-all"
            >
              <Award className="w-4 h-4" /> Input & Publikasi Nilai
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Courses */}
        <div
          onClick={() => onNavigate('courses')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mata Kuliah</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalCourses}</div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Kelas aktif semester ini</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-blue-600" />
          </p>
        </div>

        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Mahasiswa</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalStudents}</div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Terdaftar di sistem</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-emerald-600" />
          </p>
        </div>

        {/* Average Attendance */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rata-rata Kehadiran</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{avgAttendance}%</div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Dari {totalAttendanceRecords} log kehadiran</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-indigo-600" />
          </p>
        </div>

        {/* Unpublished Grades */}
        <div
          onClick={() => onNavigate('grades')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Nilai Belum Publikasi</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{unpublishedGrades}</div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Status Draf (perlu dipublikasikan)</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-amber-600" />
          </p>
        </div>
      </div>

      {/* Active Self Attendance Notification */}
      {activeAttendanceSessions.length > 0 && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Sesi Presensi Mandiri Sedang Aktif
              </span>
              <p className="text-xs text-emerald-700">
                {activeAttendanceSessions.length} pertemuan sedang membuka presensi mandiri bagi mahasiswa.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('attendance')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
          >
            Pantau Presensi
          </button>
        </div>
      )}

      {/* Course Cards Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Mata Kuliah Diampu</h2>
            <p className="text-xs text-slate-500">Daftar kelas aktif beserta progres pertemuan & mahasiswa terdaftar</p>
          </div>
          <button
            onClick={() => onNavigate('courses')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Kelola Semua Mata Kuliah <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((c) => {
            const courseEnrollments = enrollments.filter((e) => e.courseId === c.id);
            const courseMeetings = meetings.filter((m) => m.courseId === c.id);
            const courseGrades = grades.filter((g) => g.courseId === c.id);
            const draftCount = courseGrades.filter((g) => g.status === 'draft').length;

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {c.kode}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{c.kelas}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{c.nama}</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                      {c.sks} SKS
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {c.deskripsi}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Jadwal & Ruang</span>
                      <span className="font-medium text-slate-800">{c.jadwal}</span>
                      <span className="text-slate-500 block text-[11px]">{c.ruang}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Progres Kelas</span>
                      <span className="font-medium text-slate-800">
                        {courseMeetings.length} / {c.jumlahPertemuan} Pertemuan
                      </span>
                      <span className="text-slate-500 block text-[11px]">
                        {courseEnrollments.length} Mahasiswa
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('meetings', { courseId: c.id })}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" /> Materi & Video
                    </button>
                    <button
                      onClick={() => onNavigate('attendance', { courseId: c.id })}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <ClipboardList className="w-3.5 h-3.5" /> Presensi
                    </button>
                  </div>

                  <button
                    onClick={() => onNavigate('grades', { courseId: c.id })}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" /> Nilai
                    {draftCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" title={`${draftCount} nilai draf`} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Announcements Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Pengumuman Terbaru</h2>
          </div>
          <button
            onClick={() => onNavigate('announcements')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Kelola Pengumuman
          </button>
        </div>

        <div className="space-y-3">
          {announcements.slice(0, 3).map((ann) => (
            <div key={ann.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-slate-900">{ann.title}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    ann.category === 'Penting'
                      ? 'bg-rose-100 text-rose-700'
                      : ann.category === 'Tugas'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {ann.category}
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{ann.content}</p>
              <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Sasaran: {ann.courseName}</span>
                <span>{formatDateId(ann.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
