import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  Course,
  Enrollment,
  Meeting,
  AttendanceRecord,
  GradeRecord,
  Announcement,
  AttendanceStatus,
  RegisterPayload,
  RegisterResult,
} from '../types';
import { safeFetchJson } from '../utils/safeFetch';
import { hashPasswordClient, verifyPasswordClient } from '../utils/security';
import { initialLocalData } from '../data/seedFallback';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  meetings: Meeting[];
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  announcements: Announcement[];
  isLoading: boolean;
  error: string | null;

  // Auth
  login: (role: 'dosen' | 'mahasiswa', identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
  logout: () => void;
  quickLogin: (user: User) => void;

  // Course operations
  createCourse: (data: Partial<Course>) => Promise<boolean>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<boolean>;
  deleteCourse: (id: string) => Promise<boolean>;

  // Student operations
  createStudent: (data: Partial<User>) => Promise<boolean>;
  updateStudent: (nim: string, data: Partial<User>) => Promise<boolean>;
  deleteStudent: (nim: string) => Promise<boolean>;
  updateCourseEnrollments: (courseId: string, studentNims: string[]) => Promise<boolean>;

  // Meeting operations
  createMeeting: (data: Partial<Meeting>) => Promise<boolean>;
  updateMeeting: (id: string, data: Partial<Meeting>) => Promise<boolean>;
  deleteMeeting: (id: string) => Promise<boolean>;
  toggleMeetingAttendance: (id: string, isOpen?: boolean) => Promise<boolean>;

  // Attendance operations
  saveAttendanceBulk: (records: Array<{ courseId: string; meetingId: string; studentNim: string; status: AttendanceStatus; note?: string; method?: 'dosen' | 'mandiri' }>) => Promise<boolean>;
  submitSelfAttendance: (courseId: string, meetingId: string) => Promise<{ success: boolean; message: string }>;

  // Grades operations
  saveGrade: (data: Partial<GradeRecord>) => Promise<boolean>;
  publishAllGrades: (courseId: string) => Promise<boolean>;

  // Announcements operations
  createAnnouncement: (data: Partial<Announcement>) => Promise<boolean>;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<boolean>;
  deleteAnnouncement: (id: string) => Promise<boolean>;

  // Reset demo
  resetDatabase: () => Promise<boolean>;
  refreshData: () => Promise<void>;

  // Toast notifications
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await safeFetchJson<any>('/api/data');
      if (res.ok && res.data) {
        setUsers(res.data.users || []);
        setCourses(res.data.courses || []);
        setEnrollments(res.data.enrollments || []);
        setMeetings(res.data.meetings || []);
        setAttendance(res.data.attendance || []);
        setGrades(res.data.grades || []);
        setAnnouncements(res.data.announcements || []);
        localStorage.setItem('portal_cache_db', JSON.stringify(res.data));
        setError(null);
      } else {
        // Fallback to local cached data or seed data
        const localCached = localStorage.getItem('portal_cache_db');
        if (localCached) {
          try {
            const parsed = JSON.parse(localCached);
            setUsers(parsed.users || initialLocalData.users);
            setCourses(parsed.courses || initialLocalData.courses);
            setEnrollments(parsed.enrollments || initialLocalData.enrollments);
            setMeetings(parsed.meetings || initialLocalData.meetings);
            setAttendance(parsed.attendance || initialLocalData.attendance);
            setGrades(parsed.grades || initialLocalData.grades);
            setAnnouncements(parsed.announcements || initialLocalData.announcements);
          } catch {
            setUsers(initialLocalData.users);
            setCourses(initialLocalData.courses);
            setEnrollments(initialLocalData.enrollments);
            setMeetings(initialLocalData.meetings);
            setAttendance(initialLocalData.attendance);
            setGrades(initialLocalData.grades);
            setAnnouncements(initialLocalData.announcements);
          }
        } else {
          setUsers(initialLocalData.users);
          setCourses(initialLocalData.courses);
          setEnrollments(initialLocalData.enrollments);
          setMeetings(initialLocalData.meetings);
          setAttendance(initialLocalData.attendance);
          setGrades(initialLocalData.grades);
          setAnnouncements(initialLocalData.announcements);
          localStorage.setItem('portal_cache_db', JSON.stringify(initialLocalData));
        }
      }
    } catch {
      setUsers(initialLocalData.users);
      setCourses(initialLocalData.courses);
      setEnrollments(initialLocalData.enrollments);
      setMeetings(initialLocalData.meetings);
      setAttendance(initialLocalData.attendance);
      setGrades(initialLocalData.grades);
      setAnnouncements(initialLocalData.announcements);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Check stored user session safely
    const savedUser = localStorage.getItem('portal_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object' && parsed.role) {
          console.log('[Auth] Ditemukan sesi tersimpan:', parsed.email, 'Peran:', parsed.role);
          setCurrentUser(parsed);
        } else {
          console.warn('[Auth] Sesi tersimpan tidak valid, membersihkan storage.');
          localStorage.removeItem('portal_user');
        }
      } catch (e) {
        console.error('[Auth] Gagal membaca session user dari localStorage:', e);
        localStorage.removeItem('portal_user');
      }
    }
  }, [fetchData]);

  const login = async (role: 'dosen' | 'mahasiswa', identifier: string, password: string) => {
    console.log('[Auth] Memulai login:', { role, identifier });
    try {
      const res = await safeFetchJson<{ user: User }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, identifier, password }),
      });

      if (res.ok && res.data?.user) {
        const loggedUser = res.data.user;
        console.log('[Auth] Login via API server berhasil:', loggedUser.email, loggedUser.role);
        setCurrentUser(loggedUser);
        localStorage.setItem('portal_user', JSON.stringify(loggedUser));
        showToast(`Selamat datang, ${loggedUser.name}!`, 'success');
        return { success: true };
      }

      // If server returned a clear validation error message
      if (!res.isHtmlOrNotJson && res.error) {
        console.warn('[Auth] Server mengembalikan pesan kesalahan:', res.error);
        return { success: false, error: res.error };
      }

      console.log('[Auth] API tidak tersedia atau statis (Vercel). Beralih ke verifikasi lokal/fallback...');

      // Fallback local authentication (for static deployment / offline)
      const cleanId = identifier.trim().toLowerCase();
      const localCached = localStorage.getItem('portal_cache_db');
      let currentUsers = users;
      if (localCached) {
        try {
          const parsed = JSON.parse(localCached);
          if (Array.isArray(parsed.users) && parsed.users.length > 0) {
            currentUsers = parsed.users;
          }
        } catch {
          // ignore
        }
      }

      const found = currentUsers.find((u) => {
        if (role === 'dosen') {
          return u.role === 'dosen' && u.email.toLowerCase() === cleanId;
        } else {
          return (
            u.role === 'mahasiswa' &&
            (u.nim === identifier.trim() || u.email.toLowerCase() === cleanId)
          );
        }
      });

      if (!found) {
        const errMsg = role === 'dosen' ? 'Email dosen tidak terdaftar.' : 'NIM atau email mahasiswa tidak ditemukan.';
        console.warn('[Auth] Pengguna tidak ditemukan:', errMsg);
        return {
          success: false,
          error: errMsg,
        };
      }

      const isMatch = await verifyPasswordClient(password, found.password || '');
      if (!isMatch) {
        console.warn('[Auth] Kata sandi tidak cocok.');
        return { success: false, error: 'Kata sandi tidak sesuai. Periksa kembali kata sandi Anda.' };
      }

      const { password: _, ...userSafe } = found;
      console.log('[Auth] Login lokal berhasil untuk:', userSafe.name, 'Peran:', userSafe.role);
      setCurrentUser(userSafe);
      localStorage.setItem('portal_user', JSON.stringify(userSafe));
      showToast(`Selamat datang, ${userSafe.name}!`, 'success');
      return { success: true };
    } catch (err: any) {
      console.error('[Auth] Exception saat login:', err);
      return { success: false, error: err.message || 'Koneksi ke server gagal.' };
    }
  };

  const register = async (payload: RegisterPayload): Promise<RegisterResult> => {
    try {
      // 1. Try server API registration first
      const res = await safeFetchJson<{
        success: boolean;
        message: string;
        user: User;
        enrolledCourse?: string | null;
      }>('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok && res.data) {
        await fetchData();
        showToast(res.data.message || 'Pendaftaran berhasil!', 'success');
        return {
          success: true,
          message: res.data.message,
          user: res.data.user,
          enrolledCourse: res.data.enrolledCourse,
        };
      }

      // If server returned a business validation error (e.g. duplicate email/nim)
      if (!res.isHtmlOrNotJson && res.error) {
        return { success: false, error: res.error };
      }

      // 2. Fallback local registration (e.g. if deployed on static Vercel)
      const hashedPassword = await hashPasswordClient(payload.password);

      // Get latest cache
      const localCached = localStorage.getItem('portal_cache_db');
      const dbObj = localCached ? JSON.parse(localCached) : { ...initialLocalData };
      const currentList: User[] = dbObj.users || users;

      if (payload.role === 'dosen') {
        const cleanEmail = payload.email.trim().toLowerCase();
        if (currentList.some((u) => u.email.toLowerCase() === cleanEmail)) {
          return {
            success: false,
            error: 'Email dosen sudah terdaftar. Silakan gunakan email lain atau langsung masuk.',
          };
        }

        const newDosen: User = {
          id: `usr-dosen-${Date.now()}`,
          role: 'dosen',
          name: payload.name.trim(),
          email: cleanEmail,
          password: hashedPassword,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        };

        const updatedUsers = [...currentList, newDosen];
        setUsers(updatedUsers);
        dbObj.users = updatedUsers;
        localStorage.setItem('portal_cache_db', JSON.stringify(dbObj));

        const { password: _, ...safeDosen } = newDosen;
        const msg = 'Pendaftaran Dosen berhasil! Silakan masuk menggunakan email dan kata sandi Anda.';
        showToast(msg, 'success');
        return { success: true, message: msg, user: safeDosen };
      } else {
        // Mahasiswa
        const cleanNim = (payload.nim || '').trim();
        const cleanEmail = payload.email && payload.email.trim()
          ? payload.email.trim().toLowerCase()
          : `${cleanNim}@student.kampus.ac.id`;

        if (currentList.some((u) => u.nim === cleanNim)) {
          return {
            success: false,
            error: 'NIM sudah terdaftar dalam sistem. Silakan langsung masuk dengan NIM tersebut.',
          };
        }
        if (currentList.some((u) => u.email.toLowerCase() === cleanEmail)) {
          return {
            success: false,
            error: 'Email sudah digunakan oleh akun lain. Silakan periksa kembali email Anda.',
          };
        }

        let enrolledCourseName: string | null = null;
        const updatedEnrollments: Enrollment[] = dbObj.enrollments || [...enrollments];
        const allCourses: Course[] = dbObj.courses || courses;

        if (payload.kodeKelas && payload.kodeKelas.trim()) {
          const code = payload.kodeKelas.trim().toUpperCase();
          const crs = allCourses.find((c) => c.kode.toUpperCase() === code || c.id === payload.kodeKelas?.trim());
          if (crs) {
            enrolledCourseName = crs.nama;
            const newEnr: Enrollment = {
              id: `enr-${Date.now()}`,
              courseId: crs.id,
              studentNim: cleanNim,
              enrolledAt: new Date().toISOString(),
            };
            updatedEnrollments.push(newEnr);
            setEnrollments(updatedEnrollments);
          }
        }

        const newStudent: User = {
          id: `usr-mhs-${Date.now()}`,
          role: 'mahasiswa',
          name: payload.name.trim(),
          email: cleanEmail,
          nim: cleanNim,
          prodi: payload.prodi || 'Teknik Informatika',
          semester: Number(payload.semester) || 1,
          password: hashedPassword,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        };

        const updatedUsers = [...currentList, newStudent];
        setUsers(updatedUsers);
        dbObj.users = updatedUsers;
        dbObj.enrollments = updatedEnrollments;
        localStorage.setItem('portal_cache_db', JSON.stringify(dbObj));

        const { password: _, ...safeStudent } = newStudent;
        const msg = enrolledCourseName
          ? `Pendaftaran berhasil dan Anda otomatis terdaftar pada kelas ${enrolledCourseName}!`
          : 'Pendaftaran Mahasiswa berhasil! Silakan masuk menggunakan NIM atau Email Anda.';
        showToast(msg, 'success');
        return {
          success: true,
          message: msg,
          user: safeStudent,
          enrolledCourse: enrolledCourseName,
        };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Terjadi kesalahan saat pendaftaran.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('portal_user');
    showToast('Anda telah keluar dari akun.', 'info');
  };

  const quickLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('portal_user', JSON.stringify(user));
    showToast(`Masuk sebagai ${user.name} (${user.role.toUpperCase()})`, 'success');
  };

  // Courses
  const createCourse = async (data: Partial<Course>) => {
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Gagal menambah mata kuliah');
      const created = await res.json();
      setCourses((prev) => [...prev, created]);
      showToast(`Mata kuliah ${created.nama} berhasil ditambahkan!`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const updateCourse = async (id: string, data: Partial<Course>) => {
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Gagal memperbarui mata kuliah');
      const updated = await res.json();
      setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)));
      showToast('Perubahan mata kuliah tersimpan.', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus mata kuliah');
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setEnrollments((prev) => prev.filter((e) => e.courseId !== id));
      setMeetings((prev) => prev.filter((m) => m.courseId !== id));
      setAttendance((prev) => prev.filter((a) => a.courseId !== id));
      setGrades((prev) => prev.filter((g) => g.courseId !== id));
      showToast('Mata kuliah berhasil dihapus.', 'info');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // Students
  const createStudent = async (data: Partial<User>) => {
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Gagal mendaftarkan mahasiswa');
      setUsers((prev) => [...prev, resData]);
      showToast(`Mahasiswa ${resData.name} berhasil ditambahkan!`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const updateStudent = async (nim: string, data: Partial<User>) => {
    try {
      const res = await fetch(`/api/students/${nim}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Gagal memperbarui mahasiswa');
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.nim === nim ? updated : u)));
      showToast('Data mahasiswa berhasil diperbarui.', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const deleteStudent = async (nim: string) => {
    try {
      const res = await fetch(`/api/students/${nim}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus mahasiswa');
      setUsers((prev) => prev.filter((u) => u.nim !== nim));
      setEnrollments((prev) => prev.filter((e) => e.studentNim !== nim));
      setAttendance((prev) => prev.filter((a) => a.studentNim !== nim));
      setGrades((prev) => prev.filter((g) => g.studentNim !== nim));
      showToast('Mahasiswa telah dihapus.', 'info');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const updateCourseEnrollments = async (courseId: string, studentNims: string[]) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentNims }),
      });
      if (!res.ok) throw new Error('Gagal memperbarui pendaftaran mahasiswa');
      const data = await res.json();
      setEnrollments((prev) => [
        ...prev.filter((e) => e.courseId !== courseId),
        ...data.enrollments,
      ]);
      showToast('Daftar mahasiswa terdaftar di mata kuliah berhasil diperbarui.', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // Meetings
  const createMeeting = async (data: Partial<Meeting>) => {
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Gagal membuat pertemuan');
      const created = await res.json();
      setMeetings((prev) => [...prev, created]);
      showToast(`Pertemuan ${created.pertemuanKe} berhasil ditambahkan!`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const updateMeeting = async (id: string, data: Partial<Meeting>) => {
    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Gagal mengubah pertemuan');
      const updated = await res.json();
      setMeetings((prev) => prev.map((m) => (m.id === id ? updated : m)));
      showToast('Pertemuan berhasil diperbarui.', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const deleteMeeting = async (id: string) => {
    try {
      const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus pertemuan');
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      setAttendance((prev) => prev.filter((a) => a.meetingId !== id));
      showToast('Pertemuan berhasil dihapus.', 'info');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const toggleMeetingAttendance = async (id: string, isOpen?: boolean) => {
    try {
      const res = await fetch(`/api/meetings/${id}/attendance-toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAttendanceOpen: isOpen }),
      });
      if (!res.ok) throw new Error('Gagal mengubah status presensi');
      const data = await res.json();
      setMeetings((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isAttendanceOpen: data.isAttendanceOpen } : m))
      );
      showToast(
        data.isAttendanceOpen ? 'Sesi presensi mandiri DIBUKA untuk mahasiswa.' : 'Sesi presensi mandiri DITUTUP.',
        data.isAttendanceOpen ? 'success' : 'info'
      );
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // Attendance
  const saveAttendanceBulk = async (records: Array<{ courseId: string; meetingId: string; studentNim: string; status: AttendanceStatus; note?: string; method?: 'dosen' | 'mandiri' }>) => {
    try {
      const res = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan presensi');
      await fetchData(); // refresh clean state
      showToast('Data presensi berhasil disimpan!', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const submitSelfAttendance = async (courseId: string, meetingId: string) => {
    if (!currentUser || currentUser.role !== 'mahasiswa' || !currentUser.nim) {
      return { success: false, message: 'Hanya mahasiswa terdaftar yang dapat presensi mandiri.' };
    }

    try {
      const res = await fetch('/api/attendance/self', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          meetingId,
          studentNim: currentUser.nim,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Presensi gagal.', 'error');
        return { success: false, message: data.error };
      }

      await fetchData();
      showToast('Presensi mandiri Anda berhasil dicatat!', 'success');
      return { success: true, message: data.message };
    } catch (err: any) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  // Grades
  const saveGrade = async (data: Partial<GradeRecord>) => {
    try {
      const res = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Gagal menyimpan nilai');
      const saved = await res.json();
      setGrades((prev) => {
        const idx = prev.findIndex((g) => g.courseId === saved.courseId && g.studentNim === saved.studentNim);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [...prev, saved];
      });
      showToast('Nilai mahasiswa berhasil disimpan.', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const publishAllGrades = async (courseId: string) => {
    try {
      const res = await fetch('/api/grades/publish-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      if (!res.ok) throw new Error('Gagal mempublikasikan nilai');
      setGrades((prev) =>
        prev.map((g) => (g.courseId === courseId ? { ...g, status: 'published' } : g))
      );
      showToast('Semua nilai mata kuliah ini berhasil dipublikasikan untuk mahasiswa!', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // Announcements
  const createAnnouncement = async (data: Partial<Announcement>) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Gagal membuat pengumuman');
      const created = await res.json();
      setAnnouncements((prev) => [created, ...prev]);
      showToast('Pengumuman berhasil diterbitkan!', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const updateAnnouncement = async (id: string, data: Partial<Announcement>) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Gagal mengubah pengumuman');
      const updated = await res.json();
      setAnnouncements((prev) => prev.map((a) => (a.id === id ? updated : a)));
      showToast('Pengumuman berhasil diperbarui.', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus pengumuman');
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      showToast('Pengumuman dihapus.', 'info');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // Reset demo
  const resetDatabase = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/reset-db', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal reset data');

      setUsers(data.data.users);
      setCourses(data.data.courses);
      setEnrollments(data.data.enrollments);
      setMeetings(data.data.meetings);
      setAttendance(data.data.attendance);
      setGrades(data.data.grades);
      setAnnouncements(data.data.announcements);

      // Keep or update current session
      if (currentUser) {
        const refreshed = data.data.users.find((u: User) => u.id === currentUser.id);
        if (refreshed) {
          setCurrentUser(refreshed);
          localStorage.setItem('portal_user', JSON.stringify(refreshed));
        }
      }

      showToast('Database berhasil direset ke data contoh awal.', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        courses,
        enrollments,
        meetings,
        attendance,
        grades,
        announcements,
        isLoading,
        error,
        login,
        register,
        logout,
        quickLogin,
        createCourse,
        updateCourse,
        deleteCourse,
        createStudent,
        updateStudent,
        deleteStudent,
        updateCourseEnrollments,
        createMeeting,
        updateMeeting,
        deleteMeeting,
        toggleMeetingAttendance,
        saveAttendanceBulk,
        submitSelfAttendance,
        saveGrade,
        publishAllGrades,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        resetDatabase,
        refreshData: fetchData,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
