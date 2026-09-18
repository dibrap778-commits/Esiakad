export type UserRole = 'dosen' | 'mahasiswa';

export interface RegisterPayload {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  nim?: string;
  kodeKelas?: string;
  prodi?: string;
  semester?: number;
}

export interface RegisterResult {
  success: boolean;
  message?: string;
  error?: string;
  user?: User;
  enrolledCourse?: string | null;
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  nim?: string;
  nidn?: string;
  prodi?: string;
  semester?: number;
  avatar?: string;
  password?: string;
}

export interface GradeWeights {
  tugas: number;
  kuis: number;
  uts: number;
  uas: number;
}

export interface Course {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  kelas: string;
  semester: string;
  tahunAkademik: string;
  deskripsi: string;
  jumlahPertemuan: number;
  dosenId: string;
  dosenNama: string;
  jadwal: string;
  ruang: string;
  gradeWeights: GradeWeights;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentNim: string;
  enrolledAt: string;
}

export interface MeetingMaterial {
  id: string;
  title: string;
  url: string;
  type: 'slide' | 'document' | 'link' | 'code';
}

export interface Meeting {
  id: string;
  courseId: string;
  pertemuanKe: number;
  topik: string;
  tanggal: string;
  deskripsi: string;
  videoUrl: string;
  materials: MeetingMaterial[];
  isAttendanceOpen: boolean;
  attendanceClosedAt?: string;
}

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

export interface AttendanceRecord {
  id: string;
  courseId: string;
  meetingId: string;
  studentNim: string;
  status: AttendanceStatus;
  timestamp: string;
  method: 'mandiri' | 'dosen';
  note?: string;
}

export type GradePublishStatus = 'draft' | 'published';

export interface GradeRecord {
  id: string;
  courseId: string;
  studentNim: string;
  tugas: number;
  kuis: number;
  uts: number;
  uas: number;
  status: GradePublishStatus;
  feedback?: string;
  updatedAt: string;
}

export type AnnouncementCategory = 'Penting' | 'Umum' | 'Tugas' | 'Ujian';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  courseId: string; // 'all' for all courses or courseId
  courseName?: string;
  authorName: string;
  category: AnnouncementCategory;
  createdAt: string;
}

export interface StudentSummary {
  student: User;
  attendanceCount: number;
  totalMeetings: number;
  attendancePercentage: number;
  grades?: {
    tugas: number;
    kuis: number;
    uts: number;
    uas: number;
    finalScore: number;
    letterGrade: string;
    gpa: number;
    status: GradePublishStatus;
    passed: boolean;
  };
}
