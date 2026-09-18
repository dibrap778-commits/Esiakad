import React, { useState } from 'react';
import {
  GraduationCap,
  LogOut,
  Users,
  RotateCcw,
  Sparkles,
  ChevronDown,
  BookOpen,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';

interface NavbarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { currentUser, users, quickLogin, logout, resetDatabase, isLoading } = useApp();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  if (!currentUser) return null;

  const isDosen = currentUser.role === 'dosen';

  const dosenNavItems = [
    { id: 'dashboard', label: 'Ringkasan' },
    { id: 'courses', label: 'Mata Kuliah' },
    { id: 'students', label: 'Mahasiswa' },
    { id: 'meetings', label: 'Materi & Video' },
    { id: 'attendance', label: 'Presensi' },
    { id: 'grades', label: 'Penilaian' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                  Portal Kelas
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    isDosen
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isDosen ? 'DOSEN (ADMIN)' : 'MAHASISWA'}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Sistem Pengelolaan Perkuliahan & Presensi Mandiri
              </p>
            </div>
          </div>

          {/* Dosen Navigation Tabs (Desktop) */}
          {isDosen && onNavigate && (
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
              {dosenNavItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => onNavigate(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* User badge & actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Switcher button */}
            <button
              id="quick-demo-switcher-button"
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Ganti Peran / Akun Demo"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Ganti Akun Demo</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Reset Database button */}
            <button
              id="reset-demo-data-button"
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              disabled={isLoading}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Reset Database ke Seed Awal"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline ml-1.5">Reset Data</span>
            </button>

            {/* Current Profile Card */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 ring-1 ring-slate-300 shrink-0">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name || 'User'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-600">
                    {(currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
                  {currentUser.name || currentUser.email || 'Pengguna'}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                  {isDosen ? `NIDN: ${currentUser.nidn || '-'}` : `NIM: ${currentUser.nim || '-'}`}
                </div>
              </div>

              {/* Logout */}
              <button
                id="logout-button"
                type="button"
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Keluar dari Akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dosen Subnav */}
        {isDosen && onNavigate && (
          <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2 px-4 border-t border-slate-100 bg-slate-50/75">
            {dosenNavItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Demo Switcher Modal */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="Pilih Akun Demo untuk Pengujian"
        subtitle="Beralih instan antara Dosen dan Mahasiswa dengan 1-klik tanpa perlu mengetik ulang kata sandi."
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <UserCheck className="w-4 h-4" /> Akun Dosen (Admin)
            </div>
            {users
              .filter((u) => u.role === 'dosen')
              .map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    quickLogin(u);
                    setIsDemoModalOpen(false);
                  }}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    currentUser.id === u.id
                      ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-200'
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-500">Email: {u.email} • NIDN: {u.nidn}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-600 text-white">
                    {currentUser.id === u.id ? 'Aktif' : 'Pilih Dosen'}
                  </span>
                </div>
              ))}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <BookOpen className="w-4 h-4" /> Akun Mahasiswa
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {users
                .filter((u) => u.role === 'mahasiswa')
                .map((u) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      quickLogin(u);
                      setIsDemoModalOpen(false);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      currentUser.id === u.id
                        ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-200'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{u.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">NIM: {u.nim}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                        currentUser.id === u.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700'
                      }`}
                    >
                      {currentUser.id === u.id ? 'Aktif' : 'Masuk'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Reset Database Confirmation Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Reset Data ke Awal?"
        subtitle="Tindakan ini akan mengembalikan semua data mata kuliah, materi, presensi, nilai, dan pengumuman ke seed bawaan."
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Seluruh data pengujian yang baru ditambahkan akan direset kembali ke kondisi awal dengan 1 dosen, 4 mahasiswa, 2 mata kuliah, serta materi video dan presensi contoh.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={async () => {
                await resetDatabase();
                setIsResetConfirmOpen(false);
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
            >
              Ya, Reset Data
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
