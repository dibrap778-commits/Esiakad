import React, { useState } from 'react';
import {
  Video,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  FileText,
  ExternalLink,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ClipboardCheck,
  Play,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Meeting, MeetingMaterial } from '../../types';
import { formatDateId } from '../../utils/gradeHelper';
import { Modal } from '../common/Modal';
import { VideoPlayer } from '../common/VideoPlayer';

interface ManageMeetingsProps {
  initialCourseId?: string;
  onNavigateToAttendance?: (courseId: string, meetingId: string) => void;
}

export const ManageMeetings: React.FC<ManageMeetingsProps> = ({
  initialCourseId,
  onNavigateToAttendance,
}) => {
  const {
    courses,
    meetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    toggleMeetingAttendance,
    showToast,
  } = useApp();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseId || (courses[0]?.id ?? '')
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [deletingMeetingId, setDeletingMeetingId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<Meeting>>({
    pertemuanKe: 1,
    topik: '',
    tanggal: new Date().toISOString().split('T')[0],
    deskripsi: '',
    videoUrl: '',
    materials: [],
    isAttendanceOpen: false,
  });

  // Material input inside form
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');

  // AI syllabus helper state
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const courseMeetings = meetings
    .filter((m) => m.courseId === selectedCourseId)
    .sort((a, b) => a.pertemuanKe - b.pertemuanKe);

  const handleOpenAdd = () => {
    const nextPertemuan = courseMeetings.length + 1;
    setFormData({
      courseId: selectedCourseId,
      pertemuanKe: nextPertemuan,
      topik: '',
      tanggal: new Date().toISOString().split('T')[0],
      deskripsi: '',
      videoUrl: '',
      materials: [],
      isAttendanceOpen: false,
    });
    setNewMaterialTitle('');
    setNewMaterialUrl('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (m: Meeting) => {
    setEditingMeeting(m);
    setFormData({
      ...m,
      materials: m.materials || [],
    });
    setNewMaterialTitle('');
    setNewMaterialUrl('');
  };

  const handleAddMaterialToForm = () => {
    if (!newMaterialTitle.trim() || !newMaterialUrl.trim()) return;
    const item: MeetingMaterial = {
      id: `mat-${Date.now()}`,
      title: newMaterialTitle.trim(),
      url: newMaterialUrl.trim(),
      type: newMaterialUrl.endsWith('.pdf') ? 'slide' : 'link',
    };
    setFormData((prev) => ({
      ...prev,
      materials: [...(prev.materials || []), item],
    }));
    setNewMaterialTitle('');
    setNewMaterialUrl('');
  };

  const handleRemoveMaterialFromForm = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      materials: (prev.materials || []).filter((m) => m.id !== id),
    }));
  };

  const handleGenerateAiOutline = async () => {
    if (!formData.topik) {
      showToast('Ketikkan topik pertemuan terlebih dahulu untuk bantuan AI.', 'info');
      return;
    }
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'meeting',
          prompt: `Mata kuliah: ${currentCourse?.nama}. Topik: ${formData.topik}`,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setFormData((prev) => ({
          ...prev,
          deskripsi: data.result,
        }));
        showToast('Deskripsi dan silabus berhasil disusun oleh AI!', 'success');
      }
    } catch {
      showToast('Gagal memproses bantuan AI.', 'error');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topik || !selectedCourseId) return;
    const ok = await createMeeting({
      ...formData,
      courseId: selectedCourseId,
    });
    if (ok) {
      setIsAddModalOpen(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting || !formData.topik) return;
    const ok = await updateMeeting(editingMeeting.id, formData);
    if (ok) {
      setEditingMeeting(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingMeetingId) return;
    await deleteMeeting(deletingMeetingId);
    setDeletingMeetingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Course Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Kelola Materi & Pertemuan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Unggah topik, materi kuliah, sematkan video YouTube/Google Drive, dan atur sesi presensi mandiri.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Select Course dropdown */}
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
            id="btn-tambah-pertemuan"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> Tambah Pertemuan
          </button>
        </div>
      </div>

      {/* Course Banner Info */}
      {currentCourse && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {currentCourse.kode}
              </span>
              <h2 className="text-base font-bold">{currentCourse.nama}</h2>
              <span className="text-xs text-slate-400 font-medium">({currentCourse.kelas})</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Jadwal: {currentCourse.jadwal} • Ruang: {currentCourse.ruang} • Total Target: {currentCourse.jumlahPertemuan} Pertemuan
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs font-semibold text-slate-300 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
              {courseMeetings.length} Pertemuan Terisi
            </span>
          </div>
        </div>
      )}

      {/* Meetings List */}
      {courseMeetings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-slate-700">Belum ada pertemuan dibuat</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Mulai tambahkan pertemuan 1 dengan topik, materi, dan tautan video embed untuk kelas ini.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            <Plus className="w-4 h-4" /> Tambah Pertemuan Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {courseMeetings.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
            >
              {/* Meeting Header */}
              <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
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
                      {m.isAttendanceOpen ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Presensi Mandiri Terbuka
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                          Presensi Mandiri Ditutup
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{m.topik}</h3>
                  </div>
                </div>

                {/* Actions & Attendance Control */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Toggle Self Attendance */}
                  <button
                    onClick={() => toggleMeetingAttendance(m.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      m.isAttendanceOpen
                        ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                    title={m.isAttendanceOpen ? 'Klik untuk menutup sesi presensi mandiri' : 'Klik untuk membuka sesi presensi mandiri bagi mahasiswa'}
                  >
                    {m.isAttendanceOpen ? (
                      <>
                        <ToggleRight className="w-4 h-4" />
                        <span>Sesi Presensi: Buka</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-slate-400" />
                        <span>Sesi Presensi: Tutup</span>
                      </>
                    )}
                  </button>

                  {/* Input Attendance shortcut */}
                  {onNavigateToAttendance && (
                    <button
                      onClick={() => onNavigateToAttendance(selectedCourseId, m.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold border border-blue-200 transition-colors"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      <span>Input Kehadiran</span>
                    </button>
                  )}

                  {/* Edit & Delete */}
                  <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ubah Pertemuan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingMeetingId(m.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Pertemuan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Meeting Content: Grid Video Embed & Description */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Embedded Video Player */}
                <div className="lg:col-span-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-blue-600" />
                      Video Materi Kuliah
                    </span>
                    {m.videoUrl && (
                      <span className="text-[11px] text-slate-400 truncate max-w-xs font-mono">
                        {m.videoUrl}
                      </span>
                    )}
                  </div>
                  <VideoPlayer url={m.videoUrl} title={`Video Pertemuan ${m.pertemuanKe}: ${m.topik}`} />
                </div>

                {/* Description & Materials */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Deskripsi & Silabus Pembelajaran
                    </span>
                    <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {m.deskripsi || 'Tidak ada deskripsi detail untuk pertemuan ini.'}
                    </div>
                  </div>

                  {/* Materials list */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                      Berkas & Bahan Rujukan ({m.materials?.length || 0})
                    </span>
                    {(!m.materials || m.materials.length === 0) ? (
                      <p className="text-xs text-slate-400 italic">Belum ada dokumen materi terlampir.</p>
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
                              Unduh / Buka <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Meeting */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Pertemuan Baru"
        subtitle={`Mata Kuliah: ${currentCourse?.nama || ''}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pertemuan Ke *
              </label>
              <input
                type="number"
                min="1"
                max="30"
                required
                value={formData.pertemuanKe || 1}
                onChange={(e) => setFormData({ ...formData, pertemuanKe: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Perkuliahan *
              </label>
              <input
                type="date"
                required
                value={formData.tanggal || ''}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Topik / Judul Pertemuan *
              </label>
              <button
                type="button"
                onClick={handleGenerateAiOutline}
                disabled={isAiGenerating}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                {isAiGenerating ? 'Menyusun...' : 'Bantu Buat Silabus dengan AI'}
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="misal: Desain Pola MVC dan Integrasi Database"
              value={formData.topik || ''}
              onChange={(e) => setFormData({ ...formData, topik: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              URL Video Pembelajaran (YouTube / Google Drive Embed)
            </label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=... atau link Google Drive"
              value={formData.videoUrl || ''}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Mendukung URL YouTube biasa, shortlink youtu.be, atau tautan pratinjau file Google Drive.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Deskripsi & Rangkuman Materi
            </label>
            <textarea
              rows={3}
              placeholder="Rangkuman materi, tujuan pembelajaran, atau instruksi tugas..."
              value={formData.deskripsi || ''}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Materials in Form */}
          <div className="pt-2 border-t border-slate-200">
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Lampiran Bahan / Slide / Tautan
            </span>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Judul Berkas (misal: Slide Pertemuan 1.pdf)"
                value={newMaterialTitle}
                onChange={(e) => setNewMaterialTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                placeholder="https://..."
                value={newMaterialUrl}
                onChange={(e) => setNewMaterialUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddMaterialToForm}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 shrink-0"
              >
                + Tambah
              </button>
            </div>

            {formData.materials && formData.materials.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {formData.materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-lg text-xs border border-slate-200"
                  >
                    <span className="font-medium text-slate-800 truncate">{mat.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterialFromForm(mat.id)}
                      className="text-rose-600 hover:text-rose-800 font-bold ml-2 text-xs"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Toggle Self Attendance initially */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Buka Sesi Presensi Mandiri Saat Diterbitkan
              </span>
              <span className="text-[11px] text-slate-500">
                Mahasiswa dapat langsung melakukan presensi mandiri saat pertemuan dibuat.
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.isAttendanceOpen || false}
              onChange={(e) => setFormData({ ...formData, isAttendanceOpen: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              id="submit-add-meeting-btn"
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Simpan Pertemuan
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Meeting */}
      <Modal
        isOpen={Boolean(editingMeeting)}
        onClose={() => setEditingMeeting(null)}
        title={`Ubah Pertemuan ${editingMeeting?.pertemuanKe || ''}`}
        subtitle={`Topik: ${editingMeeting?.topik || ''}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pertemuan Ke *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.pertemuanKe || 1}
                onChange={(e) => setFormData({ ...formData, pertemuanKe: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Perkuliahan *
              </label>
              <input
                type="date"
                required
                value={formData.tanggal || ''}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Topik / Judul Pertemuan *
              </label>
              <button
                type="button"
                onClick={handleGenerateAiOutline}
                disabled={isAiGenerating}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                {isAiGenerating ? 'Menyusun...' : 'Bantu Buat Silabus dengan AI'}
              </button>
            </div>
            <input
              type="text"
              required
              value={formData.topik || ''}
              onChange={(e) => setFormData({ ...formData, topik: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              URL Video Pembelajaran
            </label>
            <input
              type="url"
              value={formData.videoUrl || ''}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Deskripsi & Rangkuman Materi
            </label>
            <textarea
              rows={3}
              value={formData.deskripsi || ''}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Materials */}
          <div className="pt-2 border-t border-slate-200">
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Bahan & Tautan
            </span>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Judul Berkas"
                value={newMaterialTitle}
                onChange={(e) => setNewMaterialTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                placeholder="URL"
                value={newMaterialUrl}
                onChange={(e) => setNewMaterialUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddMaterialToForm}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 shrink-0"
              >
                + Tambah
              </button>
            </div>

            {formData.materials && formData.materials.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {formData.materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-lg text-xs border border-slate-200"
                  >
                    <span className="font-medium text-slate-800 truncate">{mat.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterialFromForm(mat.id)}
                      className="text-rose-600 hover:text-rose-800 font-bold ml-2 text-xs"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setEditingMeeting(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingMeetingId)}
        onClose={() => setDeletingMeetingId(null)}
        title="Hapus Pertemuan Ini?"
        subtitle="Data presensi terkait pertemuan ini juga akan dihapus."
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Apakah Anda yakin ingin menghapus pertemuan ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeletingMeetingId(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
            >
              Ya, Hapus Pertemuan
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
