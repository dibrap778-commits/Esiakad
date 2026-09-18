import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  Mail,
  CheckSquare,
  Square,
  Check,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, Course } from '../../types';
import { Modal } from '../common/Modal';

export const ManageStudents: React.FC = () => {
  const {
    users,
    courses,
    enrollments,
    createStudent,
    updateStudent,
    deleteStudent,
    updateCourseEnrollments,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProdi, setSelectedProdi] = useState('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [deletingStudentNim, setDeletingStudentNim] = useState<string | null>(null);

  // Enrollment modal state
  const [enrollStudent, setEnrollStudent] = useState<User | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  // Form states for Add / Edit
  const [formData, setFormData] = useState<Partial<User>>({
    nim: '',
    name: '',
    email: '',
    prodi: 'Teknik Informatika',
    semester: 4,
    password: 'password123',
  });

  const students = users.filter((u) => u.role === 'mahasiswa');

  const prodiList = Array.from(new Set(students.map((s) => s.prodi || 'Teknik Informatika')));

  const handleOpenAdd = () => {
    setFormData({
      nim: '',
      name: '',
      email: '',
      prodi: 'Teknik Informatika',
      semester: 4,
      password: 'password123',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: User) => {
    setEditingStudent(s);
    setFormData({ ...s });
  };

  const handleOpenEnroll = (student: User) => {
    setEnrollStudent(student);
    const currentCourses = enrollments
      .filter((e) => e.studentNim === student.nim)
      .map((e) => e.courseId);
    setSelectedCourseIds(currentCourses);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nim || !formData.name) return;
    const ok = await createStudent(formData);
    if (ok) {
      setIsAddModalOpen(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !formData.name || !editingStudent.nim) return;
    const ok = await updateStudent(editingStudent.nim, formData);
    if (ok) {
      setEditingStudent(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingStudentNim) return;
    await deleteStudent(deletingStudentNim);
    setDeletingStudentNim(null);
  };

  const handleSaveEnrollment = async () => {
    if (!enrollStudent || !enrollStudent.nim) return;

    // For each course, adjust student's enrollment
    for (const c of courses) {
      const isSelected = selectedCourseIds.includes(c.id);
      const courseEnrolledNims = enrollments
        .filter((e) => e.courseId === c.id)
        .map((e) => e.studentNim);

      const hasStudent = courseEnrolledNims.includes(enrollStudent.nim);

      if (isSelected && !hasStudent) {
        await updateCourseEnrollments(c.id, [...courseEnrolledNims, enrollStudent.nim]);
      } else if (!isSelected && hasStudent) {
        await updateCourseEnrollments(c.id, courseEnrolledNims.filter((n) => n !== enrollStudent.nim));
      }
    }

    showToast(`Pendaftaran kelas untuk ${enrollStudent.name} berhasil disimpan.`, 'success');
    setEnrollStudent(null);
  };

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nim && s.nim.includes(searchTerm)) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchProdi = selectedProdi === 'all' || s.prodi === selectedProdi;
    return matchSearch && matchProdi;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Kelola Data Mahasiswa</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar mahasiswa terdaftar, tambah mahasiswa baru, dan kelola pendaftaran ke mata kuliah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari NIM atau nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <select
            value={selectedProdi}
            onChange={(e) => setSelectedProdi(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 outline-hidden cursor-pointer"
          >
            <option value="all">Semua Program Studi</option>
            {prodiList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <button
            id="btn-tambah-mahasiswa"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> Tambah Mahasiswa
          </button>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Mahasiswa</th>
                <th className="py-3.5 px-4">NIM</th>
                <th className="py-3.5 px-4">Program Studi & Semester</th>
                <th className="py-3.5 px-4">Email Akademik</th>
                <th className="py-3.5 px-4">Mata Kuliah Diambil</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada data mahasiswa yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const studentEnrollments = enrollments.filter((e) => e.studentNim === s.nim);
                  const enrolledCourses = courses.filter((c) =>
                    studentEnrollments.some((e) => e.courseId === c.id)
                  );

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.avatar}
                            alt={s.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{s.name}</span>
                            <span className="text-[11px] text-slate-400">ID: {s.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {s.nim}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{s.prodi}</span>
                        <span className="text-[11px] text-slate-500">Semester {s.semester}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {s.email}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                          {enrolledCourses.length === 0 ? (
                            <span className="text-[11px] text-slate-400 italic">Belum terdaftar kelas</span>
                          ) : (
                            enrolledCourses.map((c) => (
                              <span
                                key={c.id}
                                className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200"
                                title={c.nama}
                              >
                                {c.kode} ({c.kelas})
                              </span>
                            ))
                          )}
                          <button
                            onClick={() => handleOpenEnroll(s)}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                          >
                            + Atur Kelas
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`btn-enroll-student-${s.nim}`}
                            onClick={() => handleOpenEnroll(s)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Daftarkan ke Mata Kuliah"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-edit-student-${s.nim}`}
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ubah Data Mahasiswa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-student-${s.nim}`}
                            onClick={() => setDeletingStudentNim(s.nim || null)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Mahasiswa"
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

      {/* Modal Add Student */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Mahasiswa Baru"
        subtitle="Registrasikan mahasiswa ke dalam database portal perkuliahan."
        maxWidth="md"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nomor Induk Mahasiswa (NIM) *
            </label>
            <input
              type="text"
              required
              placeholder="misal: 2024005"
              value={formData.nim || ''}
              onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Lengkap Mahasiswa *
            </label>
            <input
              type="text"
              required
              placeholder="misal: Rian Hidayat"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Akademik
            </label>
            <input
              type="email"
              placeholder="rian@student.kampus.ac.id"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Program Studi
              </label>
              <input
                type="text"
                value={formData.prodi || 'Teknik Informatika'}
                onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Semester
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={formData.semester || 4}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Kata Sandi Login Mahasiswa
            </label>
            <input
              type="text"
              value={formData.password || 'password123'}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              id="submit-add-student-btn"
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Simpan Mahasiswa
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Student */}
      <Modal
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        title="Ubah Data Mahasiswa"
        subtitle={`Memperbarui informasi ${editingStudent?.name || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              NIM (Permanen)
            </label>
            <input
              type="text"
              disabled
              value={formData.nim || ''}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-100 text-slate-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Akademik
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Program Studi
              </label>
              <input
                type="text"
                value={formData.prodi || ''}
                onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Semester
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={formData.semester || 4}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setEditingStudent(null)}
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

      {/* Modal Enroll Student to Courses */}
      <Modal
        isOpen={Boolean(enrollStudent)}
        onClose={() => setEnrollStudent(null)}
        title="Daftarkan Mahasiswa ke Mata Kuliah"
        subtitle={`Pilih mata kuliah yang diambil oleh ${enrollStudent?.name} (${enrollStudent?.nim})`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Centang mata kuliah yang ingin didaftarkan untuk mahasiswa ini. Mahasiswa otomatis memiliki akses ke materi, presensi, dan penilaian pada kelas terpilih.
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {courses.map((c) => {
              const isSelected = selectedCourseIds.includes(c.id);

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedCourseIds((prev) => prev.filter((id) => id !== c.id));
                    } else {
                      setSelectedCourseIds((prev) => [...prev, c.id]);
                    }
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/60'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700">{c.kode}</span>
                        <span className="text-xs font-bold text-slate-800">{c.nama}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {c.kelas} • {c.sks} SKS • {c.jadwal}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-blue-200/60 text-blue-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isSelected ? 'Terdaftar' : 'Tidak Terdaftar'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setEnrollStudent(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              id="submit-save-enrollment-btn"
              type="button"
              onClick={handleSaveEnrollment}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Simpan Pendaftaran ({selectedCourseIds.length} Kelas)
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingStudentNim)}
        onClose={() => setDeletingStudentNim(null)}
        title="Hapus Data Mahasiswa?"
        subtitle="Menghapus mahasiswa dari sistem perkuliahan."
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Apakah Anda yakin ingin menghapus mahasiswa dengan NIM <span className="font-bold">{deletingStudentNim}</span>? Seluruh riwayat presensi dan nilai mahasiswa ini juga akan dihapus.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeletingStudentNim(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              id="confirm-delete-student-btn"
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
            >
              Ya, Hapus Mahasiswa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
