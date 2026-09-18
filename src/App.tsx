import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Navbar } from './components/common/Navbar';
import { Toast } from './components/common/Toast';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { DosenDashboard } from './components/dosen/DosenDashboard';
import { ManageCourses } from './components/dosen/ManageCourses';
import { ManageStudents } from './components/dosen/ManageStudents';
import { ManageMeetings } from './components/dosen/ManageMeetings';
import { ManageAttendance } from './components/dosen/ManageAttendance';
import { ManageGrades } from './components/dosen/ManageGrades';
import { StudentDashboard } from './components/mahasiswa/StudentDashboard';

const MainLayout: React.FC = () => {
  const { currentUser, isLoading } = useApp();
  const [currentDosenView, setCurrentDosenView] = useState<string>('dashboard');

  // Auth navigation state
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [authPrefill, setAuthPrefill] = useState<{
    role: 'dosen' | 'mahasiswa';
    identifier: string;
    notice: string | null;
  }>({
    role: 'dosen',
    identifier: '',
    notice: null,
  });

  // Parameters passed between views (e.g. shortcut to attendance for a specific meeting)
  const [navParams, setNavParams] = useState<{ courseId?: string; meetingId?: string }>({});

  useEffect(() => {
    console.log('[App:MainLayout] Rendered. isLoading:', isLoading, 'currentUser:', currentUser ? `${currentUser.name} (${currentUser.role})` : 'null');
  }, [isLoading, currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Memuat Portal Perkuliahan...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        {authView === 'login' ? (
          <LoginPage
            onNavigateToRegister={(targetRole) => {
              console.log('[App] Navigating to register for role:', targetRole);
              setAuthPrefill((prev) => ({ ...prev, role: targetRole, notice: null }));
              setAuthView('register');
            }}
            prefillRole={authPrefill.role}
            prefillIdentifier={authPrefill.identifier}
            confirmationNotice={authPrefill.notice}
          />
        ) : (
          <RegisterPage
            initialRole={authPrefill.role}
            onNavigateToLogin={(targetRole, prefillId, notice) => {
              console.log('[App] Navigating to login for role:', targetRole);
              setAuthPrefill({
                role: targetRole,
                identifier: prefillId || '',
                notice: notice || null,
              });
              setAuthView('login');
            }}
          />
        )}
        <Toast />
      </>
    );
  }

  const handleDosenNavigate = (view: string, courseId?: string, meetingId?: string) => {
    console.log('[App] Dosen navigate to view:', view, 'params:', { courseId, meetingId });
    setCurrentDosenView(view);
    if (courseId || meetingId) {
      setNavParams({ courseId, meetingId });
    }
  };

  const validDosenViews = ['dashboard', 'courses', 'students', 'meetings', 'attendance', 'grades'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        currentView={currentDosenView}
        onNavigate={(view: string) => {
          setCurrentDosenView(view);
          setNavParams({});
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <ErrorBoundary fallbackTitle="Terjadi Kendala saat Memuat Halaman Dashboard">
          {currentUser.role === 'dosen' ? (
            <>
              {currentDosenView === 'dashboard' && (
                <DosenDashboard onNavigate={handleDosenNavigate} />
              )}
              {currentDosenView === 'courses' && <ManageCourses />}
              {currentDosenView === 'students' && <ManageStudents />}
              {currentDosenView === 'meetings' && (
                <ManageMeetings
                  initialCourseId={navParams.courseId}
                  onNavigateToAttendance={(cid, mid) => handleDosenNavigate('attendance', cid, mid)}
                />
              )}
              {currentDosenView === 'attendance' && (
                <ManageAttendance
                  initialCourseId={navParams.courseId}
                  initialMeetingId={navParams.meetingId}
                />
              )}
              {currentDosenView === 'grades' && (
                <ManageGrades initialCourseId={navParams.courseId} />
              )}
              {!validDosenViews.includes(currentDosenView) && (
                <DosenDashboard onNavigate={handleDosenNavigate} />
              )}
            </>
          ) : currentUser.role === 'mahasiswa' ? (
            <StudentDashboard />
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-600 font-semibold">Peran akun ({currentUser.role}) tidak dikenali.</p>
            </div>
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400">
        <p>
          Portal Kelas & Akademik Perkuliahan • Terhubung dengan sistem basis data persisten real-time.
        </p>
      </footer>

      {/* Global Toast System */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Terjadi Kendala pada Aplikasi Portal Perkuliahan">
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
