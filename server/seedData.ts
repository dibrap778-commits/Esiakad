import { User, Course, Enrollment, Meeting, AttendanceRecord, GradeRecord, Announcement } from '../src/types';

export interface DatabaseSchema {
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  meetings: Meeting[];
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  announcements: Announcement[];
}

export function getDefaultSeedData(): DatabaseSchema {
  const users: User[] = [
    {
      id: 'usr-dosen-1',
      role: 'dosen',
      name: 'Dr. Ir. Budi Santoso, M.Kom',
      email: 'dosen@kampus.ac.id',
      nidn: '0412038501',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-mhs-1',
      role: 'mahasiswa',
      name: 'Ahmad Pratama',
      email: 'ahmad@student.kampus.ac.id',
      nim: '2024001',
      prodi: 'Teknik Informatika',
      semester: 4,
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-mhs-2',
      role: 'mahasiswa',
      name: 'Siti Rahmawati',
      email: 'siti@student.kampus.ac.id',
      nim: '2024002',
      prodi: 'Teknik Informatika',
      semester: 4,
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-mhs-3',
      role: 'mahasiswa',
      name: 'Dimas Anggara',
      email: 'dimas@student.kampus.ac.id',
      nim: '2024003',
      prodi: 'Sistem Informasi',
      semester: 4,
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-mhs-4',
      role: 'mahasiswa',
      name: 'Putri Amelia',
      email: 'putri@student.kampus.ac.id',
      nim: '2024004',
      prodi: 'Teknik Informatika',
      semester: 4,
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const courses: Course[] = [
    {
      id: 'crs-if301',
      kode: 'IF301',
      nama: 'Pemrograman Web Lanjutan',
      sks: 3,
      kelas: 'Kelas A',
      semester: 'Semester 4 - Genap 2024/2025',
      tahunAkademik: '2024/2025',
      deskripsi: 'Mata kuliah mendalam mengenai arsitektur web modern, full-stack development dengan React, Express, RESTful APIs, otentikasi aman, dan implementasi cloud.',
      jumlahPertemuan: 14,
      dosenId: 'usr-dosen-1',
      dosenNama: 'Dr. Ir. Budi Santoso, M.Kom',
      jadwal: 'Senin, 08:00 - 10:30 WIB',
      ruang: 'Lab Komputer 3 (Gedung B Lt. 2)',
      gradeWeights: {
        tugas: 20,
        kuis: 15,
        uts: 30,
        uas: 35,
      },
      createdAt: '2025-02-01T08:00:00.000Z',
    },
    {
      id: 'crs-if305',
      kode: 'IF305',
      nama: 'Rekayasa Perangkat Lunak',
      sks: 3,
      kelas: 'Kelas B',
      semester: 'Semester 4 - Genap 2024/2025',
      tahunAkademik: '2024/2025',
      deskripsi: 'Mempelajari siklus hidup pengembangan perangkat lunak (SDLC), metodologi Agile Scrum, pemodelan UML, perancangan arsitektur sistem, dan pengujian perangkat lunak.',
      jumlahPertemuan: 14,
      dosenId: 'usr-dosen-1',
      dosenNama: 'Dr. Ir. Budi Santoso, M.Kom',
      jadwal: 'Rabu, 13:00 - 15:30 WIB',
      ruang: 'Ruang Teori 204 (Gedung A)',
      gradeWeights: {
        tugas: 25,
        kuis: 15,
        uts: 30,
        uas: 30,
      },
      createdAt: '2025-02-01T09:00:00.000Z',
    },
  ];

  const enrollments: Enrollment[] = [
    { id: 'enr-1', courseId: 'crs-if301', studentNim: '2024001', enrolledAt: '2025-02-05T00:00:00.000Z' },
    { id: 'enr-2', courseId: 'crs-if301', studentNim: '2024002', enrolledAt: '2025-02-05T00:00:00.000Z' },
    { id: 'enr-3', courseId: 'crs-if301', studentNim: '2024003', enrolledAt: '2025-02-05T00:00:00.000Z' },
    { id: 'enr-4', courseId: 'crs-if301', studentNim: '2024004', enrolledAt: '2025-02-05T00:00:00.000Z' },

    { id: 'enr-5', courseId: 'crs-if305', studentNim: '2024001', enrolledAt: '2025-02-05T00:00:00.000Z' },
    { id: 'enr-6', courseId: 'crs-if305', studentNim: '2024002', enrolledAt: '2025-02-05T00:00:00.000Z' },
    { id: 'enr-7', courseId: 'crs-if305', studentNim: '2024004', enrolledAt: '2025-02-05T00:00:00.000Z' },
  ];

  const meetings: Meeting[] = [
    {
      id: 'mtg-if301-1',
      courseId: 'crs-if301',
      pertemuanKe: 1,
      topik: 'Pengenalan Arsitektur Full-Stack Modern & Node.js Environment',
      tanggal: '2025-02-17',
      deskripsi: 'Membahas perkembangan arsitektur web modern dari monolith ke SPA, pengenalan Node.js runtime, npm package ecosystem, dan setup initial project full-stack.',
      videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
      materials: [
        { id: 'mat-1', title: 'Slide Pertemuan 1 - Arsitektur Web Modern.pdf', url: 'https://example.com/slide-p1.pdf', type: 'slide' },
        { id: 'mat-2', title: 'Dokumentasi Node.js & Express Starter Guide', url: 'https://nodejs.org/en/docs', type: 'link' },
      ],
      isAttendanceOpen: false,
    },
    {
      id: 'mtg-if301-2',
      courseId: 'crs-if301',
      pertemuanKe: 2,
      topik: 'React Component Lifecycle, State Management & Hooks',
      tanggal: '2025-02-24',
      deskripsi: 'Memahami state deklaratif, efek samping (useEffect), custom hooks, serta integrasi state global pada aplikasi web interaktif berskala besar.',
      videoUrl: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
      materials: [
        { id: 'mat-3', title: 'Slide Pertemuan 2 - React Hooks & Deep Dive.pdf', url: 'https://example.com/slide-p2.pdf', type: 'slide' },
        { id: 'mat-4', title: 'Repository Latihan Starter Template', url: 'https://github.com/reactjs', type: 'code' },
      ],
      isAttendanceOpen: true, // Currently OPEN for students to test self-attendance!
    },
    {
      id: 'mtg-if301-3',
      courseId: 'crs-if301',
      pertemuanKe: 3,
      topik: 'Perancangan RESTful API, Routing & Middleware Express',
      tanggal: '2025-03-03',
      deskripsi: 'Praktik implementasi Express router, middleware penanganan validasi, error handling terpusat, dan standardisasi respons HTTP JSON.',
      videoUrl: 'https://www.youtube.com/watch?v=mbsmsi7l3r4',
      materials: [
        { id: 'mat-5', title: 'Panduan Praktikum API Express & Postman Collection.pdf', url: 'https://example.com/modul-p3.pdf', type: 'document' },
      ],
      isAttendanceOpen: false,
    },

    {
      id: 'mtg-if305-1',
      courseId: 'crs-if305',
      pertemuanKe: 1,
      topik: 'Fundamental Rekayasa Perangkat Lunak & Siklus SDLC',
      tanggal: '2025-02-19',
      deskripsi: 'Konsep dasar software engineering, model waterfall vs iterative, manajemen resiko rekayasa, dan kriteria perangkat lunak berkualitas tinggi.',
      videoUrl: 'https://www.youtube.com/watch?v=9TycLR0TqFA',
      materials: [
        { id: 'mat-6', title: 'Silabus & Kontrak Kuliah RPL 2025.pdf', url: 'https://example.com/kontrak-rpl.pdf', type: 'slide' },
      ],
      isAttendanceOpen: false,
    },
    {
      id: 'mtg-if305-2',
      courseId: 'crs-if305',
      pertemuanKe: 2,
      topik: 'Agile Software Development & Kerangka Kerja Scrum',
      tanggal: '2025-02-26',
      deskripsi: 'Prinsip Agile Manifesto, peran Scrum Master, Product Owner, Development Team, pembuatan Product Backlog, dan simulasi Sprint Planning.',
      videoUrl: 'https://www.youtube.com/watch?v=D8vT7G02qgg',
      materials: [
        { id: 'mat-7', title: 'Scrum Guide & Template User Story.pdf', url: 'https://example.com/scrum-guide.pdf', type: 'document' },
      ],
      isAttendanceOpen: true, // OPEN for self-attendance
    },
  ];

  const attendance: AttendanceRecord[] = [
    // IF301 Pertemuan 1
    { id: 'att-1', courseId: 'crs-if301', meetingId: 'mtg-if301-1', studentNim: '2024001', status: 'Hadir', timestamp: '2025-02-17T08:05:00.000Z', method: 'dosen' },
    { id: 'att-2', courseId: 'crs-if301', meetingId: 'mtg-if301-1', studentNim: '2024002', status: 'Hadir', timestamp: '2025-02-17T08:03:00.000Z', method: 'dosen' },
    { id: 'att-3', courseId: 'crs-if301', meetingId: 'mtg-if301-1', studentNim: '2024003', status: 'Izin', timestamp: '2025-02-17T07:50:00.000Z', method: 'dosen', note: 'Surat tugas UKM' },
    { id: 'att-4', courseId: 'crs-if301', meetingId: 'mtg-if301-1', studentNim: '2024004', status: 'Hadir', timestamp: '2025-02-17T08:10:00.000Z', method: 'dosen' },

    // IF301 Pertemuan 2 (some have attended mandiri)
    { id: 'att-5', courseId: 'crs-if301', meetingId: 'mtg-if301-2', studentNim: '2024001', status: 'Hadir', timestamp: '2025-02-24T08:02:14.000Z', method: 'mandiri' },
    { id: 'att-6', courseId: 'crs-if301', meetingId: 'mtg-if301-2', studentNim: '2024002', status: 'Hadir', timestamp: '2025-02-24T08:04:45.000Z', method: 'mandiri' },

    // IF305 Pertemuan 1
    { id: 'att-7', courseId: 'crs-if305', meetingId: 'mtg-if305-1', studentNim: '2024001', status: 'Hadir', timestamp: '2025-02-19T13:02:00.000Z', method: 'dosen' },
    { id: 'att-8', courseId: 'crs-if305', meetingId: 'mtg-if305-1', studentNim: '2024002', status: 'Hadir', timestamp: '2025-02-19T13:05:00.000Z', method: 'dosen' },
    { id: 'att-9', courseId: 'crs-if305', meetingId: 'mtg-if305-1', studentNim: '2024004', status: 'Sakit', timestamp: '2025-02-19T12:30:00.000Z', method: 'dosen', note: 'Surat dokter' },
  ];

  const grades: GradeRecord[] = [
    // IF301 Grades
    {
      id: 'grd-1',
      courseId: 'crs-if301',
      studentNim: '2024001',
      tugas: 88,
      kuis: 85,
      uts: 90,
      uas: 92,
      status: 'published',
      feedback: 'Pengerjaan kode sangat rapi, pemahaman arsitektur RESTful sangat baik.',
      updatedAt: '2025-03-10T10:00:00.000Z',
    },
    {
      id: 'grd-2',
      courseId: 'crs-if301',
      studentNim: '2024002',
      tugas: 92,
      kuis: 90,
      uts: 86,
      uas: 88,
      status: 'published',
      feedback: 'Tugas antarmuka sangat estetik dan fungsionalitas React teruji dengan baik.',
      updatedAt: '2025-03-10T10:00:00.000Z',
    },
    {
      id: 'grd-3',
      courseId: 'crs-if301',
      studentNim: '2024003',
      tugas: 75,
      kuis: 70,
      uts: 78,
      uas: 72,
      status: 'draft', // Dosen can see it, student sees "Belum Dipublikasikan"
      feedback: 'Perlu peningkatan pada penanganan error dan asynchronous handling.',
      updatedAt: '2025-03-10T10:00:00.000Z',
    },
    {
      id: 'grd-4',
      courseId: 'crs-if301',
      studentNim: '2024004',
      tugas: 82,
      kuis: 80,
      uts: 84,
      uas: 85,
      status: 'published',
      feedback: 'Aktif bertanya dan hasil implementasi sesuai spesifikasi.',
      updatedAt: '2025-03-10T10:00:00.000Z',
    },

    // IF305 Grades
    {
      id: 'grd-5',
      courseId: 'crs-if305',
      studentNim: '2024001',
      tugas: 90,
      kuis: 85,
      uts: 88,
      uas: 91,
      status: 'published',
      feedback: 'Dokumen SRS dan use case diagram sangat lengkap dan terstruktur.',
      updatedAt: '2025-03-11T11:00:00.000Z',
    },
    {
      id: 'grd-6',
      courseId: 'crs-if305',
      studentNim: '2024002',
      tugas: 85,
      kuis: 80,
      uts: 82,
      uas: 87,
      status: 'published',
      feedback: 'Analisis kebutuhan sistem tepat sasaran.',
      updatedAt: '2025-03-11T11:00:00.000Z',
    },
    {
      id: 'grd-7',
      courseId: 'crs-if305',
      studentNim: '2024004',
      tugas: 78,
      kuis: 75,
      uts: 80,
      uas: 79,
      status: 'draft',
      feedback: 'Perlu perbaikan pemodelan sequence diagram.',
      updatedAt: '2025-03-11T11:00:00.000Z',
    },
  ];

  const announcements: Announcement[] = [
    {
      id: 'ann-1',
      title: 'Pemberitahuan: Sesi Presensi Mandiri Pertemuan 2 Telah Dibuka',
      content: 'Bagi seluruh mahasiswa kelas Pemrograman Web Lanjutan (IF301-A), sesi presensi mandiri untuk Pertemuan 2 sudah aktif. Silakan lakukan presensi pada menu Pertemuan sebelum batas waktu pukul 10:30 WIB.',
      courseId: 'crs-if301',
      courseName: 'IF301 - Pemrograman Web Lanjutan',
      authorName: 'Dr. Ir. Budi Santoso, M.Kom',
      category: 'Penting',
      createdAt: '2025-02-24T07:45:00.000Z',
    },
    {
      id: 'ann-2',
      title: 'Pedoman Penilaian & Bobot Nilai Semester Genap 2024/2025',
      content: 'Selamat datang di perkuliahan semester genap. Harap perhatikan bahwa komponen nilai akhir terdiri dari Tugas (20%), Kuis (15%), UTS (30%), dan UAS (35%). Mahasiswa dengan kehadiran di bawah 75% tidak diperkenankan mengikuti UAS.',
      courseId: 'all',
      courseName: 'Semua Kelas',
      authorName: 'Dr. Ir. Budi Santoso, M.Kom',
      category: 'Umum',
      createdAt: '2025-02-15T09:00:00.000Z',
    },
    {
      id: 'ann-3',
      title: 'Pengumuman Tugas 1: Perancangan Arsitektur Web RESTful API',
      content: 'Tugas 1 telah diunggah ke materi pertemuan. Buatlah API sederhana dengan minimal 3 endpoint CRUD menggunakan Express dan simulasikan pengujian via Postman. Batas submit adalah tanggal 2 Maret 2025 pukul 23:59 WIB.',
      courseId: 'crs-if301',
      courseName: 'IF301 - Pemrograman Web Lanjutan',
      authorName: 'Dr. Ir. Budi Santoso, M.Kom',
      category: 'Tugas',
      createdAt: '2025-02-20T14:00:00.000Z',
    },
  ];

  return {
    users,
    courses,
    enrollments,
    meetings,
    attendance,
    grades,
    announcements,
  };
}
