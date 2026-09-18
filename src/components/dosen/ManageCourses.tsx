import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Calendar,
  Layers,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Course } from '../../types';
import { Modal } from '../common/Modal';

export const ManageCourses: React.FC = () => {
  const { courses, enrollments, meetings, createCourse, updateCourse, deleteCourse } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<Course>>({
    kode: '',
    nama: '',
    sks: 3,
    kelas: 'Kelas A',
    semester: 'Semester 4 - Genap 2024/2025',
    tahunAkademik: '2024/2025',
    deskripsi: '',
    jumlahPertemuan: 14,
    jadwal: 'Senin, 08:00 - 10:30 WIB',
    ruang: 'Lab Komputer 3',
    gradeWeights: { tugas: 20, kuis: 15, uts: 30, uas: 35 },
  });

  const resetForm = () => {
    setFormData({
      kode: '',
      nama: '',
      sks: 3,
      kelas: 'Kelas A',
      semester: 'Semester 4 - Genap 2024/2025',
      tahunAkademik: '2024/2025',
      deskripsi: '',
      jumlahPertemuan: 14,
      jadwal: 'Senin, 08:00 - 10:30 WIB',
      ruang: 'Lab Komputer 3',
      gradeWeights: { tugas: 20, kuis: 15, uts: 30, uas: 35 },
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: Course) => {
    setEditingCourse(c);
    setFormData({
      ...c,
      gradeWeights: c.gradeWeights || { tugas: 20, kuis: 15, uts: 30, uas: 35 },
    });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kode || !formData.nama) return;
    const ok = await createCourse(formData);
    if (ok) {
      setIsAddModalOpen(false);
      resetForm();
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !formData.kode || !formData.nama) return;
    const ok = await updateCourse(editingCourse.id, formData);
    if (ok) {
      setEditingCourse(null);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (!deletingCourseId) return;
    await deleteCourse(deletingCourseId);
    setDeletingCourseId(null);
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.kelas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Kelola Mata Kuliah</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar, tambah, perbarui, atau hapus kurikulum mata kuliah yang Anda ampu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode atau nama matkul..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>
          <button
            id="btn-tambah-mata-kuliah"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> Tambah Matkul
          </button>
        </div>
      </div>

      {/* Course Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Kode & Mata Kuliah</th>
                <th className="py-3.5 px-4">SKS & Kelas</th>
                <th className="py-3.5 px-4">Semester & Tahun</th>
                <th className="py-3.5 px-4">Jadwal & Ruang</th>
                <th className="py-3.5 px-4 text-center">Pertemuan</th>
                <th className="py-3.5 px-4 text-center">Mahasiswa</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada mata kuliah yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => {
                  const mhsCount = enrollments.filter((e) => e.courseId === c.id).length;
                  const mtgCount = meetings.filter((m) => m.courseId === c.id).length;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {c.kode}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block">{c.nama}</span>
                            <span className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">{c.deskripsi}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{c.sks} SKS</span>
                        <span className="text-slate-500 block text-[11px]">{c.kelas}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-800">{c.semester}</span>
                        <span className="text-slate-500 block text-[11px]">T.A {c.tahunAkademik}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 font-medium">{c.jadwal}</span>
                        <span className="text-slate-500 block text-[11px]">{c.ruang}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                        {mtgCount} / {c.jumlahPertemuan}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                          <Users className="w-3 h-3 text-blue-600" />
                          {mhsCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`btn-edit-course-${c.kode}`}
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ubah Mata Kuliah"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-course-${c.kode}`}
                            onClick={() => setDeletingCourseId(c.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Mata Kuliah"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Course */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Mata Kuliah Baru"
        subtitle="Lengkapi informasi kurikulum, kelas, jadwal, dan bobot penilaian."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kode Matkul *
              </label>
              <input
                type="text"
                required
                placeholder="misal: IF301"
                value={formData.kode || ''}
                onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Mata Kuliah *
              </label>
              <input
                type="text"
                required
                placeholder="misal: Pemrograman Web Lanjutan"
                value={formData.nama || ''}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Bobot SKS
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={formData.sks || 3}
                onChange={(e) => setFormData({ ...formData, sks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kelas
              </label>
              <input
                type="text"
                placeholder="Kelas A"
                value={formData.kelas || ''}
                onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tahun Akademik
              </label>
              <input
                type="text"
                placeholder="2024/2025"
                value={formData.tahunAkademik || ''}
                onChange={(e) => setFormData({ ...formData, tahunAkademik: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jml Pertemuan
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.jumlahPertemuan || 14}
                onChange={(e) => setFormData({ ...formData, jumlahPertemuan: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Semester
              </label>
              <input
                type="text"
                value={formData.semester || ''}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jadwal Hari & Jam
              </label>
              <input
                type="text"
                placeholder="Senin, 08:00 - 10:30 WIB"
                value={formData.jadwal || ''}
                onChange={(e) => setFormData({ ...formData, jadwal: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ruang Kuliah
              </label>
              <input
                type="text"
                placeholder="Lab Komputer 3"
                value={formData.ruang || ''}
                onChange={(e) => setFormData({ ...formData, ruang: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Deskripsi Singkat Mata Kuliah
            </label>
            <textarea
              rows={2}
              placeholder="Deskripsikan capaian dan materi umum..."
              value={formData.deskripsi || ''}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
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
              id="submit-add-course-btn"
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Simpan Mata Kuliah
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Course */}
      <Modal
        isOpen={Boolean(editingCourse)}
        onClose={() => setEditingCourse(null)}
        title="Ubah Mata Kuliah"
        subtitle={`Memperbarui informasi mata kuliah ${editingCourse?.nama || ''}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kode Matkul *
              </label>
              <input
                type="text"
                required
                value={formData.kode || ''}
                onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Mata Kuliah *
              </label>
              <input
                type="text"
                required
                value={formData.nama || ''}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Bobot SKS
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={formData.sks || 3}
                onChange={(e) => setFormData({ ...formData, sks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kelas
              </label>
              <input
                type="text"
                value={formData.kelas || ''}
                onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tahun Akademik
              </label>
              <input
                type="text"
                value={formData.tahunAkademik || ''}
                onChange={(e) => setFormData({ ...formData, tahunAkademik: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jml Pertemuan
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.jumlahPertemuan || 14}
                onChange={(e) => setFormData({ ...formData, jumlahPertemuan: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Semester
              </label>
              <input
                type="text"
                value={formData.semester || ''}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jadwal Hari & Jam
              </label>
              <input
                type="text"
                value={formData.jadwal || ''}
                onChange={(e) => setFormData({ ...formData, jadwal: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ruang Kuliah
              </label>
              <input
                type="text"
                value={formData.ruang || ''}
                onChange={(e) => setFormData({ ...formData, ruang: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              value={formData.deskripsi || ''}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setEditingCourse(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              id="submit-edit-course-btn"
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
        isOpen={Boolean(deletingCourseId)}
        onClose={() => setDeletingCourseId(null)}
        title="Hapus Mata Kuliah?"
        subtitle="Tindakan ini permanen dan akan menghapus pertemuan serta nilai terkait mata kuliah ini."
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Apakah Anda yakin ingin menghapus mata kuliah ini? Seluruh data pertemuan, materi video, presensi, dan nilai mahasiswa di kelas ini akan dihapus.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeletingCourseId(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              id="confirm-delete-course-btn"
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
            >
              Ya, Hapus Mata Kuliah
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
