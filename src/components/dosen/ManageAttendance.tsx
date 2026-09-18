import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  Users,
  Calendar,
  Save,
  Check,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Award,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus, AttendanceRecord } from '../../types';
import { formatDateId, formatDateTimeId } from '../../utils/gradeHelper';

interface ManageAttendanceProps {
  initialCourseId?: string;
  initialMeetingId?: string;
}

export const ManageAttendance: React.FC<ManageAttendanceProps> = ({
  initialCourseId,
  initialMeetingId,
}) => {
  const {
    courses,
    meetings,
    users,
    enrollments,
    attendance,
    saveAttendanceBulk,
    toggleMeetingAttendance,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'input' | 'rekap'>('input');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseId || (courses[0]?.id ?? '')
  );

  const courseMeetings = meetings
    .filter((m) => m.courseId === selectedCourseId)
    .sort((a, b) => a.pertemuanKe - b.pertemuanKe);

  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(
    initialMeetingId || (courseMeetings[0]?.id ?? '')
  );

  // Local draft state for attendance edits
  const [attendanceDraft, setAttendanceDraft] = useState<
    Record<string, { status: AttendanceStatus; note: string; method?: 'dosen' | 'mandiri'; timestamp?: string }>
  >({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentCourse = courses.find((c) => c.id === selectedCourseId);
  const currentMeeting = courseMeetings.find((m) => m.id === selectedMeetingId) || courseMeetings[0];

  // Enrolled students in this course
  const enrolledStudents = users.filter((u) =>
    u.role === 'mahasiswa' &&
    enrollments.some((e) => e.courseId === selectedCourseId && e.studentNim === u.nim)
  );

  // Sync draft when meeting or course changes
  useEffect(() => {
    if (!currentMeeting) return;

    const draftMap: Record<string, { status: AttendanceStatus; note: string; method?: 'dosen' | 'mandiri'; timestamp?: string }> = {};

    enrolledStudents.forEach((st) => {
      if (!st.nim) return;
      const rec = attendance.find(
        (a) => a.meetingId === currentMeeting.id && a.studentNim === st.nim
      );

      if (rec) {
        draftMap[st.nim] = {
          status: rec.status,
          note: rec.note || '',
          method: rec.method,
          timestamp: rec.timestamp,
        };
      } else {
        draftMap[st.nim] = {
          status: 'Hadir',
          note: '',
          method: 'dosen',
        };
      }
    });

    setAttendanceDraft(draftMap);
    setIsDirty(false);
  }, [currentMeeting?.id, selectedCourseId, attendance.length]);

  const handleStatusChange = (nim: string, status: AttendanceStatus) => {
    setAttendanceDraft((prev) => ({
      ...prev,
      [nim]: {
        ...(prev[nim] || { note: '', method: 'dosen' }),
        status,
        method: 'dosen',
      },
    }));
    setIsDirty(true);
  };

  const handleNoteChange = (nim: string, note: string) => {
    setAttendanceDraft((prev) => ({
      ...prev,
      [nim]: {
        ...(prev[nim] || { status: 'Hadir', method: 'dosen' }),
        note,
      },
    }));
    setIsDirty(true);
  };

  const handleMarkAllHadir = () => {
    const updated: typeof attendanceDraft = { ...attendanceDraft };
    enrolledStudents.forEach((st) => {
      if (!st.nim) return;
      updated[st.nim] = {
        ...(updated[st.nim] || { note: '' }),
        status: 'Hadir',
        method: 'dosen',
      };
    });
    setAttendanceDraft(updated);
    setIsDirty(true);
    showToast('Seluruh mahasiswa ditandai Hadir.', 'info');
  };

  const handleSaveAttendance = async () => {
    if (!currentMeeting || !selectedCourseId) return;
    setIsSaving(true);

    const records = Object.entries(attendanceDraft).map(([nim, data]) => ({
      courseId: selectedCourseId,
      meetingId: currentMeeting.id,
      studentNim: nim,
      status: data.status,
      note: data.note,
      method: data.method || 'dosen',
    }));

    const ok = await saveAttendanceBulk(records);
    setIsSaving(false);
    if (ok) {
      setIsDirty(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Presensi & Kehadiran Mahasiswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Catat presensi harian per pertemuan atau lihat rekapitulasi persentase kehadiran kumulatif.
          </p>
        </div>

        {/* Tab switcher: Input Presensi vs Rekap Kehadiran */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'input'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Input Per Pertemuan
          </button>
          <button
            onClick={() => setActiveTab('rekap')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'rekap'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rekapitulasi Kehadiran (%)
          </button>
        </div>
      </div>

      {/* Course & Meeting Selectors bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Mata Kuliah
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                const nextMtgs = meetings.filter((m) => m.courseId === e.target.value);
                if (nextMtgs[0]) setSelectedMeetingId(nextMtgs[0].id);
              }}
              className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-hidden cursor-pointer"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.kode} - {c.nama} ({c.kelas})
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'input' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Pertemuan
              </label>
              {courseMeetings.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Belum ada pertemuan</span>
              ) : (
                <select
                  value={selectedMeetingId}
                  onChange={(e) => setSelectedMeetingId(e.target.value)}
                  className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-hidden cursor-pointer"
                >
                  {courseMeetings.map((m) => (
                    <option key={m.id} value={m.id}>
                      P-{m.pertemuanKe}: {m.topik} ({m.tanggal})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {activeTab === 'input' && currentMeeting && (
          <div className="flex items-center gap-2">
            {/* Toggle Self Attendance */}
            <button
              onClick={() => toggleMeetingAttendance(currentMeeting.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                currentMeeting.isAttendanceOpen
                  ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {currentMeeting.isAttendanceOpen ? (
                <>
                  <ToggleRight className="w-4 h-4" />
                  <span>Presensi Mandiri BUKA</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-slate-400" />
                  <span>Presensi Mandiri TUTUP</span>
                </>
              )}
            </button>

            {/* Mark all hadir */}
            <button
              onClick={handleMarkAllHadir}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Tandai Semua Hadir
            </button>

            {/* Save Button */}
            <button
              id="save-attendance-btn"
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors ${
                isDirty ? 'bg-blue-600 hover:bg-blue-700 animate-bounce' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Menyimpan...' : 'Simpan Presensi'}
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: INPUT PRESENSI PER PERTEMUAN */}
      {activeTab === 'input' && (
        <div className="space-y-4">
          {!currentMeeting ? (
            <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
              Pilih atau buat pertemuan terlebih dahulu untuk melakukan presensi.
            </div>
          ) : enrolledStudents.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
              Belum ada mahasiswa terdaftar di mata kuliah ini. Daftarkan mahasiswa melalui menu{' '}
              <span className="font-bold text-blue-600">Kelola Mahasiswa</span>.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50/75 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-900">
                    Pertemuan Ke-{currentMeeting.pertemuanKe}: {currentMeeting.topik}
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    Tanggal: {formatDateId(currentMeeting.tanggal)} • Total {enrolledStudents.length} Mahasiswa
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Hadir: {Object.values(attendanceDraft).filter((a) => a.status === 'Hadir').length}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Izin: {Object.values(attendanceDraft).filter((a) => a.status === 'Izin').length}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Sakit: {Object.values(attendanceDraft).filter((a) => a.status === 'Sakit').length}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Alpa: {Object.values(attendanceDraft).filter((a) => a.status === 'Alpa').length}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Mahasiswa</th>
                      <th className="py-3 px-4">NIM</th>
                      <th className="py-3 px-4">Status Kehadiran</th>
                      <th className="py-3 px-4">Metode & Waktu</th>
                      <th className="py-3 px-4">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {enrolledStudents.map((st) => {
                      if (!st.nim) return null;
                      const draft = attendanceDraft[st.nim] || { status: 'Hadir', note: '', method: 'dosen' };

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={st.avatar}
                                alt={st.name}
                                className="w-7 h-7 rounded-full object-cover shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <span className="font-bold text-slate-900">{st.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs font-semibold text-slate-700">
                              {st.nim}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {/* Attendance status toggle radio pills */}
                            <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200">
                              {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatus[]).map((stt) => {
                                const isChecked = draft.status === stt;
                                const colorStyles = {
                                  Hadir: isChecked ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-emerald-700',
                                  Izin: isChecked ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-blue-700',
                                  Sakit: isChecked ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:text-amber-700',
                                  Alpa: isChecked ? 'bg-rose-600 text-white font-bold' : 'text-slate-600 hover:text-rose-700',
                                };

                                return (
                                  <button
                                    key={stt}
                                    type="button"
                                    onClick={() => handleStatusChange(st.nim!, stt)}
                                    className={`px-3 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${colorStyles[stt]}`}
                                  >
                                    {stt}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[11px] text-slate-500">
                            {draft.method === 'mandiri' ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Mandiri • {draft.timestamp ? formatDateTimeId(draft.timestamp) : 'Baru saja'}
                              </span>
                            ) : (
                              <span className="text-slate-400">Diinput Dosen</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              placeholder="Tambah catatan jika ada..."
                              value={draft.note || ''}
                              onChange={(e) => handleNoteChange(st.nim!, e.target.value)}
                              className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-hidden"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REKAPITULASI KEHADIRAN KUMULATIF */}
      {activeTab === 'rekap' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Rekapitulasi Kehadiran Kumulatif ({currentCourse?.nama})
              </h2>
              <p className="text-xs text-slate-500">
                Total {courseMeetings.length} pertemuan terdaftar. Syarat kelayakan UAS minimal 75% kehadiran.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              Batas Minimal: 75%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Mahasiswa</th>
                  <th className="py-3 px-4">NIM</th>
                  <th className="py-3 px-4 text-center">Hadir (H)</th>
                  <th className="py-3 px-4 text-center">Izin (I)</th>
                  <th className="py-3 px-4 text-center">Sakit (S)</th>
                  <th className="py-3 px-4 text-center">Alpa (A)</th>
                  <th className="py-3 px-4 text-center">Total Pertemuan</th>
                  <th className="py-3 px-4 text-center">Persentase</th>
                  <th className="py-3 px-4 text-right">Kelayakan UAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {enrolledStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Belum ada mahasiswa terdaftar.
                    </td>
                  </tr>
                ) : (
                  enrolledStudents.map((st) => {
                    if (!st.nim) return null;
                    const studentRecords = attendance.filter(
                      (a) => a.courseId === selectedCourseId && a.studentNim === st.nim
                    );

                    const hadirCount = studentRecords.filter((a) => a.status === 'Hadir').length;
                    const izinCount = studentRecords.filter((a) => a.status === 'Izin').length;
                    const sakitCount = studentRecords.filter((a) => a.status === 'Sakit').length;
                    const alpaCount = studentRecords.filter((a) => a.status === 'Alpa').length;

                    const totalMeetingsHeld = courseMeetings.length || 1;
                    const percentage = Math.round((hadirCount / totalMeetingsHeld) * 100);
                    const isEligible = percentage >= 75;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{st.name}</td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">{st.nim}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-700 bg-emerald-50/40">
                          {hadirCount}
                        </td>
                        <td className="py-3.5 px-4 text-center text-blue-700">{izinCount}</td>
                        <td className="py-3.5 px-4 text-center text-amber-700">{sakitCount}</td>
                        <td className="py-3.5 px-4 text-center text-rose-700 font-bold">{alpaCount}</td>
                        <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                          {totalMeetingsHeld}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-black text-slate-900">{percentage}%</span>
                            <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className={`h-full ${isEligible ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min(100, percentage)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              isEligible
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {isEligible ? 'Memenuhi Syarat' : 'Kehadiran Kurang (<75%)'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
