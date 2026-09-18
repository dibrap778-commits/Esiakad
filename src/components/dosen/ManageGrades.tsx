import React, { useState, useEffect } from 'react';
import {
  Award,
  Sliders,
  CheckCircle2,
  Clock,
  Save,
  Send,
  AlertCircle,
  HelpCircle,
  Eye,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GradeWeights, GradeRecord, GradePublishStatus } from '../../types';
import { calculateFinalScore, getLetterGrade } from '../../utils/gradeHelper';
import { Modal } from '../common/Modal';

interface ManageGradesProps {
  initialCourseId?: string;
}

export const ManageGrades: React.FC<ManageGradesProps> = ({ initialCourseId }) => {
  const {
    courses,
    users,
    enrollments,
    grades,
    saveGrade,
    publishAllGrades,
    updateCourse,
    showToast,
  } = useApp();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseId || (courses[0]?.id ?? '')
  );

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // Grade weights state
  const [weights, setWeights] = useState<GradeWeights>(
    currentCourse?.gradeWeights || { tugas: 20, kuis: 15, uts: 30, uas: 35 }
  );
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isPublishAllModalOpen, setIsPublishAllModalOpen] = useState(false);

  // Local draft state for grade edits: { [nim]: { tugas, kuis, uts, uas, status, feedback } }
  const [gradesDraft, setGradesDraft] = useState<
    Record<string, { tugas: number; kuis: number; uts: number; uas: number; status: GradePublishStatus; feedback: string }>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Enrolled students
  const enrolledStudents = users.filter((u) =>
    u.role === 'mahasiswa' &&
    enrollments.some((e) => e.courseId === selectedCourseId && e.studentNim === u.nim)
  );

  useEffect(() => {
    if (currentCourse?.gradeWeights) {
      setWeights(currentCourse.gradeWeights);
    }
  }, [currentCourse]);

  // Sync draft from global grades
  useEffect(() => {
    const draft: typeof gradesDraft = {};
    enrolledStudents.forEach((st) => {
      if (!st.nim) return;
      const rec = grades.find(
        (g) => g.courseId === selectedCourseId && g.studentNim === st.nim
      );

      if (rec) {
        draft[st.nim] = {
          tugas: rec.tugas,
          kuis: rec.kuis,
          uts: rec.uts,
          uas: rec.uas,
          status: rec.status,
          feedback: rec.feedback || '',
        };
      } else {
        draft[st.nim] = {
          tugas: 0,
          kuis: 0,
          uts: 0,
          uas: 0,
          status: 'draft',
          feedback: '',
        };
      }
    });

    setGradesDraft(draft);
    setIsDirty(false);
  }, [selectedCourseId, grades.length, enrolledStudents.length]);

  const handleScoreChange = (nim: string, field: 'tugas' | 'kuis' | 'uts' | 'uas', val: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    setGradesDraft((prev) => ({
      ...prev,
      [nim]: {
        ...(prev[nim] || { tugas: 0, kuis: 0, uts: 0, uas: 0, status: 'draft', feedback: '' }),
        [field]: clamped,
      },
    }));
    setIsDirty(true);
  };

  const handleStatusToggle = (nim: string) => {
    setGradesDraft((prev) => {
      const current = prev[nim]?.status || 'draft';
      const nextStatus: GradePublishStatus = current === 'draft' ? 'published' : 'draft';
      return {
        ...prev,
        [nim]: {
          ...(prev[nim] || { tugas: 0, kuis: 0, uts: 0, uas: 0, feedback: '' }),
          status: nextStatus,
        },
      };
    });
    setIsDirty(true);
  };

  const handleSaveAllGrades = async () => {
    if (!selectedCourseId) return;
    setIsSaving(true);

    for (const [nim, data] of Object.entries(gradesDraft)) {
      await saveGrade({
        courseId: selectedCourseId,
        studentNim: nim,
        tugas: data.tugas,
        kuis: data.kuis,
        uts: data.uts,
        uas: data.uas,
        status: data.status,
        feedback: data.feedback,
      });
    }

    setIsSaving(false);
    setIsDirty(false);
    showToast('Seluruh nilai mahasiswa berhasil disimpan.', 'success');
  };

  const handleSaveWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(weights.tugas) + Number(weights.kuis) + Number(weights.uts) + Number(weights.uas);
    if (total !== 100) {
      showToast(`Total bobot harus tepat 100% (saat ini: ${total}%).`, 'error');
      return;
    }

    if (currentCourse) {
      await updateCourse(currentCourse.id, { gradeWeights: weights });
      setIsWeightModalOpen(false);
      showToast('Bobot persentase penilaian berhasil disimpan.', 'success');
    }
  };

  const handlePublishAll = async () => {
    if (!selectedCourseId) return;
    await publishAllGrades(selectedCourseId);
    // Update local draft
    setGradesDraft((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        next[k] = { ...next[k], status: 'published' };
      });
      return next;
    });
    setIsPublishAllModalOpen(false);
  };

  const totalWeight =
    (Number(weights.tugas) || 0) +
    (Number(weights.kuis) || 0) +
    (Number(weights.uts) || 0) +
    (Number(weights.uas) || 0);

  return (
    <div className="space-y-6">
      {/* Header & Course selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Penilaian Terstruktur Mahasiswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola bobot komponen (Tugas, Kuis, UTS, UAS), kalkulasi nilai akhir otomatis, dan kendalikan publikasi nilai ke portal mahasiswa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Mata Kuliah:
            </span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.kode} - {c.nama} ({c.kelas})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsWeightModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Atur Bobot Nilai</span>
          </button>
        </div>
      </div>

      {/* Grade Weights Pill Info */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
            Bobot Aktif:
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-200">
            Tugas: {weights.tugas}%
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-bold border border-indigo-200">
            Kuis: {weights.kuis}%
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-800 font-bold border border-violet-200">
            UTS: {weights.uts}%
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 font-bold border border-purple-200">
            UAS: {weights.uas}%
          </span>
          <span className="text-slate-400 font-medium">(Total: {totalWeight}%)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPublishAllModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publikasikan Semua Nilai</span>
          </button>

          <button
            id="save-grades-btn"
            onClick={handleSaveAllGrades}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors ${
              isDirty ? 'bg-blue-600 hover:bg-blue-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Menyimpan...' : 'Simpan Semua Nilai'}
          </button>
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Mahasiswa</th>
                <th className="py-3.5 px-4">NIM</th>
                <th className="py-3.5 px-3 text-center">Tugas ({weights.tugas}%)</th>
                <th className="py-3.5 px-3 text-center">Kuis ({weights.kuis}%)</th>
                <th className="py-3.5 px-3 text-center">UTS ({weights.uts}%)</th>
                <th className="py-3.5 px-3 text-center">UAS ({weights.uas}%)</th>
                <th className="py-3.5 px-4 text-center">Nilai Akhir</th>
                <th className="py-3.5 px-4 text-center">Nilai Huruf</th>
                <th className="py-3.5 px-4 text-center">Kelulusan</th>
                <th className="py-3.5 px-4 text-center">Status Publikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {enrolledStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Belum ada mahasiswa yang terdaftar di mata kuliah ini.
                  </td>
                </tr>
              ) : (
                enrolledStudents.map((st) => {
                  if (!st.nim) return null;
                  const item = gradesDraft[st.nim] || {
                    tugas: 0,
                    kuis: 0,
                    uts: 0,
                    uas: 0,
                    status: 'draft',
                    feedback: '',
                  };

                  const finalScore = calculateFinalScore(
                    item.tugas,
                    item.kuis,
                    item.uts,
                    item.uas,
                    weights
                  );
                  const letterInfo = getLetterGrade(finalScore);
                  const isPublished = item.status === 'published';

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
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
                      <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                        {st.nim}
                      </td>

                      {/* Inputs for 4 components */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.tugas}
                          onChange={(e) => handleScoreChange(st.nim!, 'tugas', Number(e.target.value))}
                          className="w-16 px-2 py-1.5 text-center text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.kuis}
                          onChange={(e) => handleScoreChange(st.nim!, 'kuis', Number(e.target.value))}
                          className="w-16 px-2 py-1.5 text-center text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.uts}
                          onChange={(e) => handleScoreChange(st.nim!, 'uts', Number(e.target.value))}
                          className="w-16 px-2 py-1.5 text-center text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.uas}
                          onChange={(e) => handleScoreChange(st.nim!, 'uas', Number(e.target.value))}
                          className="w-16 px-2 py-1.5 text-center text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                        />
                      </td>

                      {/* Calculated Final Score */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-black text-slate-900 text-sm">
                          {finalScore.toFixed(1)}
                        </span>
                      </td>

                      {/* Letter Grade */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block w-7 h-7 leading-7 text-center font-black rounded-lg border text-xs ${letterInfo.color} ${letterInfo.bg}`}
                        >
                          {letterInfo.letter}
                        </span>
                      </td>

                      {/* Pass status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            letterInfo.status === 'Lulus'
                              ? 'bg-emerald-50 text-emerald-700'
                              : letterInfo.status === 'Lulus Bersyarat'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {letterInfo.status}
                        </span>
                      </td>

                      {/* Status toggle (Draft vs Published) */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(st.nim!)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                          }`}
                          title={isPublished ? 'Klik untuk ubah jadi Draf' : 'Klik untuk Publikasikan ke mahasiswa'}
                        >
                          {isPublished ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Dipublikasikan</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Draf</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Configure Weights */}
      <Modal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        title="Atur Bobot Penilaian Mata Kuliah"
        subtitle={`Mata Kuliah: ${currentCourse?.nama || ''} (Total harus tepat 100%)`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveWeights} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Bobot Tugas (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={weights.tugas}
                onChange={(e) => setWeights({ ...weights, tugas: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Bobot Kuis (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={weights.kuis}
                onChange={(e) => setWeights({ ...weights, kuis: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Bobot UTS (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={weights.uts}
                onChange={(e) => setWeights({ ...weights, uts: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Bobot UAS (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={weights.uas}
                onChange={(e) => setWeights({ ...weights, uas: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
              totalWeight === 100
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <span>Total Bobot: {totalWeight}%</span>
            <span>{totalWeight === 100 ? 'Tepat 100% Valid' : 'Wajib bernilai tepat 100%'}</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsWeightModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={totalWeight !== 100}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs"
            >
              Simpan Bobot
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Publish All Confirmation */}
      <Modal
        isOpen={isPublishAllModalOpen}
        onClose={() => setIsPublishAllModalOpen(false)}
        title="Publikasikan Seluruh Nilai?"
        subtitle={`Mata Kuliah: ${currentCourse?.nama || ''}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Tindakan ini akan mengubah status seluruh nilai mahasiswa di mata kuliah ini menjadi <span className="font-bold text-emerald-700">Dipublikasikan</span>. Mahasiswa dapat langsung melihat rincian nilai tugas, kuis, UTS, UAS, dan nilai huruf pada portal mereka.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPublishAllModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handlePublishAll}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Ya, Publikasikan Semua Nilai
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
