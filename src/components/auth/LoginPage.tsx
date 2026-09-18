import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LoginPageProps {
  onNavigateToRegister?: (role: 'dosen' | 'mahasiswa') => void;
  prefillIdentifier?: string;
  prefillRole?: 'dosen' | 'mahasiswa';
  confirmationNotice?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToRegister,
  prefillIdentifier = '',
  prefillRole = 'dosen',
  confirmationNotice = null,
}) => {
  const { login, quickLogin, users } = useApp();
  const [role, setRole] = useState<'dosen' | 'mahasiswa'>(prefillRole);
  const [identifier, setIdentifier] = useState(
    prefillIdentifier || (prefillRole === 'dosen' ? 'dosen@kampus.ac.id' : '2024001')
  );
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(confirmationNotice);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoBox, setShowDemoBox] = useState(false);

  useEffect(() => {
    if (prefillRole) {
      setRole(prefillRole);
    }
    if (prefillIdentifier) {
      setIdentifier(prefillIdentifier);
      setPassword(''); // User inputs their created password
    }
    if (confirmationNotice) {
      setSuccessMsg(confirmationNotice);
    }
  }, [prefillIdentifier, prefillRole, confirmationNotice]);

  const handleRoleChange = (newRole: 'dosen' | 'mahasiswa') => {
    setRole(newRole);
    setError(null);
    setSuccessMsg(null);
    if (newRole === 'dosen') {
      setIdentifier('dosen@kampus.ac.id');
      setPassword('password123');
    } else {
      setIdentifier('2024001');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(role, identifier, password);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Autentikasi gagal. Periksa kembali kredensial Anda.');
    }
  };

  const dosenList = users.filter((u) => u.role === 'dosen');
  const mahasiswaList = users.filter((u) => u.role === 'mahasiswa');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Crest */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <GraduationCap className="w-9 h-9" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Portal Kelas Akademik
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sistem Informasi Pembelajaran, Presensi Mandiri, & Penilaian Terpadu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200">
          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              id="login-tab-dosen"
              type="button"
              onClick={() => handleRoleChange('dosen')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                role === 'dosen'
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Dosen (Admin)
            </button>
            <button
              id="login-tab-mahasiswa"
              type="button"
              onClick={() => handleRoleChange('mahasiswa')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                role === 'mahasiswa'
                  ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Mahasiswa
            </button>
          </div>

          {/* Success / Registration Confirmation Notification */}
          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block">Akun Berhasil Dibuat!</span>
                {successMsg}
              </div>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                {role === 'dosen' ? 'Email Dosen' : 'Nomor Induk Mahasiswa (NIM) / Email'}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  {role === 'dosen' ? <Mail className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                </div>
                <input
                  id="identifier"
                  type={role === 'dosen' ? 'email' : 'text'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={role === 'dosen' ? 'contoh: dosen@kampus.ac.id' : 'contoh: 2024001'}
                  required
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Kata Sandi
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="submit-login-button"
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all cursor-pointer ${
                role === 'dosen'
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
              }`}
            >
              {isSubmitting ? (
                'Memverifikasi Akun...'
              ) : (
                <>
                  <span>Masuk sebagai {role === 'dosen' ? 'Dosen (Admin)' : 'Mahasiswa'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              Belum punya akun?{' '}
              <button
                id="link-to-register"
                type="button"
                onClick={() => onNavigateToRegister && onNavigateToRegister(role)}
                className="font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Daftar di sini
              </button>
            </p>
          </div>

          {/* Collapsible Demo Switcher (Hidden by default as requested to avoid confusing real users) */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowDemoBox(!showDemoBox)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 hover:text-slate-600 py-1 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {showDemoBox ? 'Sembunyikan Akun Contoh / Demo' : 'Buka Akun Contoh / Demo (Mode Uji Coba)'}
              </span>
              {showDemoBox ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDemoBox && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                  <span>Pilih Akun Contoh Tersedia:</span>
                  <span className="text-[10px] text-slate-400 font-normal">1-Klik Langsung Masuk</span>
                </div>

                {/* Dosen demo button */}
                {dosenList.map((d) => (
                  <button
                    key={d.id}
                    id="quick-demo-dosen-button"
                    type="button"
                    onClick={() => quickLogin(d)}
                    className="w-full text-left p-2 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={d.avatar}
                        alt={d.name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-indigo-300"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="text-xs font-bold text-indigo-950 group-hover:text-indigo-700">
                          {d.name}
                        </div>
                        <div className="text-[10px] text-indigo-600">{d.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                      Masuk
                    </span>
                  </button>
                ))}

                {/* Mahasiswa demo list */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {mahasiswaList.slice(0, 4).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => quickLogin(m)}
                      className="text-left p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-5 h-5 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-slate-800 truncate">
                          {m.name.split(' ')[0]}
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono">{m.nim}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Portal Akademik Terproteksi • Enkripsi Kata Sandi SHA-256</span>
        </div>
      </div>
    </div>
  );
};
