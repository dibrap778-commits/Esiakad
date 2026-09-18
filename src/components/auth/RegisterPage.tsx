import React, { useState } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  BookOpen,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Hash,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface RegisterPageProps {
  initialRole?: 'dosen' | 'mahasiswa';
  onNavigateToLogin: (role: 'dosen' | 'mahasiswa', prefillId?: string, notice?: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  initialRole = 'dosen',
  onNavigateToLogin,
}) => {
  const { register, courses } = useApp();

  const [role, setRole] = useState<'dosen' | 'mahasiswa'>(initialRole);

  // Dosen form state
  const [dosenName, setDosenName] = useState('');
  const [dosenEmail, setDosenEmail] = useState('');
  const [dosenPassword, setDosenPassword] = useState('');
  const [dosenConfirmPassword, setDosenConfirmPassword] = useState('');

  // Mahasiswa form state
  const [mhsNim, setMhsNim] = useState('');
  const [mhsName, setMhsName] = useState('');
  const [mhsEmail, setMhsEmail] = useState('');
  const [mhsPassword, setMhsPassword] = useState('');
  const [mhsConfirmPassword, setMhsConfirmPassword] = useState('');
  const [mhsKodeKelas, setMhsKodeKelas] = useState('');

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (newRole: 'dosen' | 'mahasiswa') => {
    setRole(newRole);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === 'dosen') {
      if (!dosenName.trim()) {
        setError('Nama lengkap dosen wajib diisi.');
        return;
      }
      if (!dosenEmail.trim()) {
        setError('Email dosen wajib diisi.');
        return;
      }
      if (dosenPassword.length < 6) {
        setError('Kata sandi minimal terdiri dari 6 karakter.');
        return;
      }
      if (dosenPassword !== dosenConfirmPassword) {
        setError('Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.');
        return;
      }

      setIsSubmitting(true);
      const res = await register({
        role: 'dosen',
        name: dosenName.trim(),
        email: dosenEmail.trim(),
        password: dosenPassword,
      });
      setIsSubmitting(false);

      if (!res.success) {
        setError(res.error || 'Pendaftaran dosen gagal. Silakan coba lagi.');
      } else {
        const message = res.message || 'Pendaftaran berhasil! Silakan masuk dengan email dan kata sandi Anda.';
        onNavigateToLogin('dosen', dosenEmail.trim(), message);
      }
    } else {
      // Role Mahasiswa
      if (!mhsNim.trim()) {
        setError('Nomor Induk Mahasiswa (NIM) wajib diisi.');
        return;
      }
      if (!mhsName.trim()) {
        setError('Nama lengkap mahasiswa wajib diisi.');
        return;
      }
      if (mhsPassword.length < 6) {
        setError('Kata sandi minimal terdiri dari 6 karakter.');
        return;
      }
      if (mhsPassword !== mhsConfirmPassword) {
        setError('Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.');
        return;
      }

      const emailFinal = mhsEmail.trim() || `${mhsNim.trim()}@student.kampus.ac.id`;

      setIsSubmitting(true);
      const res = await register({
        role: 'mahasiswa',
        nim: mhsNim.trim(),
        name: mhsName.trim(),
        email: emailFinal,
        password: mhsPassword,
        kodeKelas: mhsKodeKelas.trim() || undefined,
        prodi: 'Teknik Informatika',
        semester: 1,
      });
      setIsSubmitting(false);

      if (!res.success) {
        setError(res.error || 'Pendaftaran mahasiswa gagal. Silakan coba lagi.');
      } else {
        const message = res.message || 'Pendaftaran berhasil! Silakan masuk dengan NIM Anda.';
        onNavigateToLogin('mahasiswa', mhsNim.trim(), message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Crest Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <GraduationCap className="w-9 h-9" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Buat Akun Portal Baru
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Pendaftaran akun resmi untuk Dosen Pengampu & Mahasiswa
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200">
          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              id="register-tab-dosen"
              type="button"
              onClick={() => handleRoleChange('dosen')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                role === 'dosen'
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Daftar Dosen
            </button>
            <button
              id="register-tab-mahasiswa"
              type="button"
              onClick={() => handleRoleChange('mahasiswa')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                role === 'mahasiswa'
                  ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Daftar Mahasiswa
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === 'dosen' ? (
              <>
                {/* Dosen: Nama Lengkap */}
                <div>
                  <label
                    htmlFor="dosen-name"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Nama Lengkap & Gelar
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="dosen-name"
                      type="text"
                      value={dosenName}
                      onChange={(e) => setDosenName(e.target.value)}
                      placeholder="contoh: Dr. Rian Pratama, M.T."
                      required
                      className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Dosen: Email */}
                <div>
                  <label
                    htmlFor="dosen-email"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Email Dosen (Untuk Login)
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="dosen-email"
                      type="email"
                      value={dosenEmail}
                      onChange={(e) => setDosenEmail(e.target.value)}
                      placeholder="contoh: dosen.rian@kampus.ac.id"
                      required
                      className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Dosen: Password */}
                <div>
                  <label
                    htmlFor="dosen-password"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Kata Sandi (Min. 6 Karakter)
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="dosen-password"
                      type={showPassword ? 'text' : 'password'}
                      value={dosenPassword}
                      onChange={(e) => setDosenPassword(e.target.value)}
                      placeholder="Masukkan kata sandi aman"
                      required
                      minLength={6}
                      className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Dosen: Confirm Password */}
                <div>
                  <label
                    htmlFor="dosen-confirm-password"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="dosen-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={dosenConfirmPassword}
                      onChange={(e) => setDosenConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi di atas"
                      required
                      minLength={6}
                      className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Mahasiswa: NIM */}
                <div>
                  <label
                    htmlFor="mhs-nim"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Nomor Induk Mahasiswa (NIM)
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Hash className="w-4 h-4" />
                    </div>
                    <input
                      id="mhs-nim"
                      type="text"
                      value={mhsNim}
                      onChange={(e) => setMhsNim(e.target.value)}
                      placeholder="contoh: 2024099"
                      required
                      className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Mahasiswa: Nama Lengkap */}
                <div>
                  <label
                    htmlFor="mhs-name"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Nama Lengkap Mahasiswa
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="mhs-name"
                      type="text"
                      value={mhsName}
                      onChange={(e) => setMhsName(e.target.value)}
                      placeholder="contoh: Nadia Kusuma"
                      required
                      className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Mahasiswa: Email (Optional) */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="mhs-email"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      Email Mahasiswa
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Opsional</span>
                  </div>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="mhs-email"
                      type="email"
                      value={mhsEmail}
                      onChange={(e) => setMhsEmail(e.target.value)}
                      placeholder={mhsNim ? `${mhsNim}@student.kampus.ac.id` : 'contoh: nadia@student.kampus.ac.id'}
                      className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Mahasiswa: Kode Kelas (Opsional) */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="mhs-kode-kelas"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      Kode Kelas / Mata Kuliah
                    </label>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Otomatis Terdaftar
                    </span>
                  </div>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <input
                      id="mhs-kode-kelas"
                      type="text"
                      value={mhsKodeKelas}
                      onChange={(e) => setMhsKodeKelas(e.target.value.toUpperCase())}
                      placeholder="Misal: IF301 atau IF305"
                      className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 uppercase"
                    />
                  </div>
                  {courses.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400">Pilihan kode:</span>
                      {courses.slice(0, 3).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setMhsKodeKelas(c.kode)}
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors border border-slate-200"
                        >
                          {c.kode} ({c.nama.split(' ')[0]})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mahasiswa: Password */}
                <div>
                  <label
                    htmlFor="mhs-password"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Kata Sandi (Min. 6 Karakter)
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="mhs-password"
                      type={showPassword ? 'text' : 'password'}
                      value={mhsPassword}
                      onChange={(e) => setMhsPassword(e.target.value)}
                      placeholder="Masukkan kata sandi akun"
                      required
                      minLength={6}
                      className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Mahasiswa: Confirm Password */}
                <div>
                  <label
                    htmlFor="mhs-confirm-password"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="mhs-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={mhsConfirmPassword}
                      onChange={(e) => setMhsConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi di atas"
                      required
                      minLength={6}
                      className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              id="submit-register-button"
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all cursor-pointer ${
                role === 'dosen'
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
              }`}
            >
              {isSubmitting ? (
                'Mendaftarkan...'
              ) : (
                <>
                  <span>Daftar sebagai {role === 'dosen' ? 'Dosen (Admin)' : 'Mahasiswa'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link to login */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              Sudah punya akun?{' '}
              <button
                id="link-to-login"
                type="button"
                onClick={() => onNavigateToLogin(role)}
                className="font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Masuk di sini
              </button>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Kata sandi terenkripsi aman • Data disimpan persisten</span>
        </div>
      </div>
    </div>
  );
};
