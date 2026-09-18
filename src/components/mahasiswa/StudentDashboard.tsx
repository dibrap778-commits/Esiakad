import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Award,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  FileText,
  Play,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Course } from '../../types';
import { StudentCourseDetail } from './StudentCourseDetail';
import { calculateFinalScore, getLetterGrade } from '../../utils/gradeHelper';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    courses,
    enrollments,
    meetings,
    attendance,
    grades,
    submitSelfAttendance,
  } = useApp();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  if (!currentUser || currentUser.role !== 'mahasiswa' || !currentUser.nim) {
    return null;
  }

  // If a course is selected, show detail view
  if (selectedCourseId) {
    return (
      <StudentCourseDetail
        courseId={selectedCourseId}
        onBack={() => setSelectedCourseId(null)}
      />
    );
  }

  // Enrolled courses for this student
  const studentEnrollments = enrollments.filter((e) => e.studentNim === currentUser.nim);
  const enrolledCourses = courses.filter((c) =>
    studentEnrollments.some((e) => e.courseId === c.id)
  );

  const totalSks = enrolledCourses.reduce((acc, c) => acc + (c.sks || 0), 0);

  // Check if any enrolled course has an active self-attendance session where student hasn't signed yet
  const activeAttendanceOpportunities: { course: Course; meeting: any }[] = [];
  enrolledCourses.forEach((c) => {
    const cMeetings = meetings.filter((m) => m.courseId === c.id && m.isAttendanceOpen);
    cMeetings.forEach((m) => {
      const alreadyAttended = attendance.some(
        (a) => a.meetingId === m.id && a.studentNim === currentUser.nim && a.status === 'Hadir'
      );
      if (!alreadyAttended) {
        activeAttendanceOpportunities.push({ course: c, meeting: m });
      }
    });
  });

  // Calculate overall attendance rate
  const myAttendance = attendance.filter((a) => a.studentNim === currentUser.nim);
  const totalRelevantMeetings = meetings.filter((m) =>
    enrolledCourses.some((c) => c.id === m.courseId)
  ).length;
  const myHadirCount = myAttendance.filter((a) => a.status === 'Hadir').length;
  const overallAttendanceRate = totalRelevantMeetings
    ? Math.round((myHadirCount / totalRelevantMeetings) * 100)
    : 100;

  // Published grades for this student
  const publishedGrades = grades.filter(
    (g) => g.studentNim === currentUser.nim && g.status === 'published'
  );

  return (
    <div className="space-y-6">
      {/* Student Profile Card */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-md shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/20 text-white">
                  NIM: {currentUser.nim}
                </span>
                <span className="text-xs text-blue-100 font-medium">Mahasiswa Aktif</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1">{currentUser.name}</h1>
              <p className="text-xs text-blue-100">
                {currentUser.prodi} • Semester {currentUser.semester} • {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/20 text-center min-w-20">
              <span className="text-[10px] uppercase font-bold text-blue-100 block">
                Total SKS
              </span>
              <span className="text-xl font-black">{totalSks} SKS</span>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/20 text-center min-w-20">
              <span className="text-[10px] uppercase font-bold text-blue-100 block">
                Kehadiran
              </span>
              <span className="text-xl font-black">{overallAttendanceRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Attendance Notification Banner if any */}
      {activeAttendanceOpportunities.length > 0 && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-900 block">
                Sesi Presensi Mandiri Sedang Dibuka!
              </span>
              <p className="text-[11px] text-emerald-700">
                Dosen membuka presensi untuk {activeAttendanceOpportunities[0].course.nama} (Pertemuan {activeAttendanceOpportunities[0].meeting.pertemuanKe}: {activeAttendanceOpportunities[0].meeting.topik}).
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              submitSelfAttendance(activeAttendanceOpportunities[0].meeting.id, 'Hadir');
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            Hadir Sekarang
          </button>
        </div>
      )}

      {/* Section: Courses Taken */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Mata Kuliah Diambil ({enrolledCourses.length})
            </h2>
            <p className="text-xs text-slate-500">
              Klik mata kuliah untuk mengakses materi, player video pembelajaran, presensi mandiri, dan nilai.
            </p>
          </div>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-slate-700">Belum ada mata kuliah yang terdaftar</p>
            <p className="text-xs text-slate-500 mt-1">
              Hubungi dosen pengampu untuk didaftarkan ke dalam kelas perkuliahan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrolledCourses.map((c) => {
              const cMeetings = meetings.filter((m) => m.courseId === c.id);
              const cAttendance = attendance.filter(
                (a) => a.courseId === c.id && a.studentNim === currentUser.nim
              );
              const hadirCount = cAttendance.filter((a) => a.status === 'Hadir').length;
              const meetingHeld = cMeetings.length || 1;
              const rate = Math.round((hadirCount / meetingHeld) * 100);

              const myGrade = grades.find(
                (g) => g.courseId === c.id && g.studentNim === currentUser.nim
              );
              const isGradeReleased = myGrade && myGrade.status === 'published';
              const weights = c.gradeWeights || { tugas: 20, kuis: 15, uts: 30, uas: 35 };
              const finalScore = isGradeReleased
                ? calculateFinalScore(myGrade.tugas, myGrade.kuis, myGrade.uts, myGrade.uas, weights)
                : 0;
              const letterGrade = getLetterGrade(finalScore);

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCourseId(c.id)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {c.kode}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {c.sks} SKS
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {c.nama}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {c.deskripsi || 'Tidak ada deskripsi kursus.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.dosenNama}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.jadwal} ({c.ruang})</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer status bar */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Kehadiran
                      </span>
                      <span className="text-xs font-black text-slate-800">{rate}% ({hadirCount}/{cMeetings.length} P)</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Nilai
                      </span>
                      {isGradeReleased ? (
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {letterGrade.letter} ({finalScore.toFixed(0)})
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Belum rilis
                        </span>
                      )}
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rincian Transkrip Nilai Akademik Terpublikasi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Transkrip Capaian Nilai Akademik Anda
            </h2>
            <p className="text-xs text-slate-500">
              Nilai yang sudah resmi dipublikasikan oleh dosen pengampu mata kuliah.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
            {publishedGrades.length} Mata Kuliah Rilis
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Mata Kuliah</th>
                <th className="py-3 px-4 text-center">SKS</th>
                <th className="py-3 px-4 text-center">Tugas</th>
                <th className="py-3 px-4 text-center">Kuis</th>
                <th className="py-3 px-4 text-center">UTS</th>
                <th className="py-3 px-4 text-center">UAS</th>
                <th className="py-3 px-4 text-center">Nilai Akhir</th>
                <th className="py-3 px-4 text-center">Nilai Huruf</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {enrolledCourses.map((c) => {
                const grade = grades.find(
                  (g) => g.courseId === c.id && g.studentNim === currentUser.nim
                );
                const isPublished = grade && grade.status === 'published';
                const weights = c.gradeWeights || { tugas: 20, kuis: 15, uts: 30, uas: 35 };

                if (!isPublished) {
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{c.nama}</span>
                        <span className="text-[11px] text-slate-400">{c.kode} • {c.kelas}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold">{c.sks}</td>
                      <td colSpan={6} className="py-3 px-4 text-center text-slate-400 italic">
                        Nilai belum dipublikasikan oleh dosen pengampu
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Draf Dosen
                        </span>
                      </td>
                    </tr>
                  );
                }

                const finalScore = calculateFinalScore(
                  grade.tugas,
                  grade.kuis,
                  grade.uts,
                  grade.uas,
                  weights
                );
                const letter = getLetterGrade(finalScore);

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{c.nama}</span>
                      <span className="text-[11px] text-slate-500">{c.kode} • {c.kelas}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">{c.sks}</td>
                    <td className="py-3 px-4 text-center font-mono font-medium">{grade.tugas}</td>
                    <td className="py-3 px-4 text-center font-mono font-medium">{grade.kuis}</td>
                    <td className="py-3 px-4 text-center font-mono font-medium">{grade.uts}</td>
                    <td className="py-3 px-4 text-center font-mono font-medium">{grade.uas}</td>
                    <td className="py-3 px-4 text-center font-black text-slate-900">
                      {finalScore.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block font-black px-2.5 py-0.5 rounded-lg border text-xs ${letter.color} ${letter.bg}`}
                      >
                        {letter.letter}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          letter.status === 'Lulus'
                            ? 'bg-emerald-50 text-emerald-700'
                            : letter.status === 'Lulus Bersyarat'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {letter.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
