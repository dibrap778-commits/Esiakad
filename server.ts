import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { getDb, saveDb, resetDb } from './server/db';
import { Course, Meeting, GradeRecord, AttendanceRecord, Announcement, User } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to sanitize users (strip passwords)
  const sanitizeUsers = (users: User[]) =>
    users.map(({ password, ...u }) => u);

  // Initialize DB on boot
  getDb();

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get full state
  app.get('/api/data', (req, res) => {
    const db = getDb();
    res.json({
      users: sanitizeUsers(db.users),
      courses: db.courses,
      enrollments: db.enrollments,
      meetings: db.meetings,
      attendance: db.attendance,
      grades: db.grades,
      announcements: db.announcements,
    });
  });

  // Reset to seed data
  app.post('/api/reset-db', (req, res) => {
    const db = resetDb();
    res.json({
      success: true,
      message: 'Database berhasil direset ke data awal.',
      data: {
        users: sanitizeUsers(db.users),
        courses: db.courses,
        enrollments: db.enrollments,
        meetings: db.meetings,
        attendance: db.attendance,
        grades: db.grades,
        announcements: db.announcements,
      },
    });
  });

  // Authentication Login
  app.post('/api/auth/login', (req, res) => {
    const { role, identifier, password } = req.body;
    if (!role || !identifier || !password) {
      return res.status(400).json({ error: 'Identitas dan kata sandi wajib diisi.' });
    }

    const db = getDb();
    let foundUser: User | undefined;

    if (role === 'dosen') {
      foundUser = db.users.find(
        (u) => u.role === 'dosen' && u.email.toLowerCase() === identifier.trim().toLowerCase()
      );
    } else {
      foundUser = db.users.find(
        (u) => u.role === 'mahasiswa' && u.nim === identifier.trim()
      );
    }

    if (!foundUser) {
      return res.status(401).json({
        error: role === 'dosen' ? 'Email dosen tidak terdaftar.' : 'NIM mahasiswa tidak ditemukan.',
      });
    }

    if (foundUser.password && foundUser.password !== password) {
      return res.status(401).json({ error: 'Kata sandi tidak sesuai.' });
    }

    const { password: _, ...userSafe } = foundUser;
    res.json({ user: userSafe });
  });

  // COURSES CRUD
  app.get('/api/courses', (req, res) => {
    const db = getDb();
    res.json(db.courses);
  });

  app.post('/api/courses', (req, res) => {
    const db = getDb();
    const {
      kode,
      nama,
      sks,
      kelas,
      semester,
      tahunAkademik,
      deskripsi,
      jumlahPertemuan,
      jadwal,
      ruang,
      gradeWeights,
      dosenId,
      dosenNama,
    } = req.body;

    if (!kode || !nama || !sks) {
      return res.status(400).json({ error: 'Kode, nama, dan SKS mata kuliah wajib diisi.' });
    }

    const newCourse: Course = {
      id: `crs-${Date.now()}`,
      kode: kode.trim().toUpperCase(),
      nama: nama.trim(),
      sks: Number(sks) || 3,
      kelas: kelas || 'Kelas A',
      semester: semester || 'Semester 4 - Genap 2024/2025',
      tahunAkademik: tahunAkademik || '2024/2025',
      deskripsi: deskripsi || '',
      jumlahPertemuan: Number(jumlahPertemuan) || 14,
      dosenId: dosenId || 'usr-dosen-1',
      dosenNama: dosenNama || 'Dr. Ir. Budi Santoso, M.Kom',
      jadwal: jadwal || 'Senin, 08:00 - 10:30 WIB',
      ruang: ruang || 'Ruang 101',
      gradeWeights: gradeWeights || { tugas: 20, kuis: 15, uts: 30, uas: 35 },
      createdAt: new Date().toISOString(),
    };

    db.courses.push(newCourse);
    saveDb(db);
    res.status(201).json(newCourse);
  });

  app.put('/api/courses/:id', (req, res) => {
    const db = getDb();
    const { id } = req.params;
    const index = db.courses.findIndex((c) => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Mata kuliah tidak ditemukan.' });
    }

    const current = db.courses[index];
    const updated: Course = {
      ...current,
      ...req.body,
      id: current.id, // prevent ID change
      gradeWeights: req.body.gradeWeights || current.gradeWeights,
    };

    db.courses[index] = updated;
    saveDb(db);
    res.json(updated);
  });

  app.delete('/api/courses/:id', (req, res) => {
    const db = getDb();
    const { id } = req.params;
    db.courses = db.courses.filter((c) => c.id !== id);
    // Cascade cleanup
    db.enrollments = db.enrollments.filter((e) => e.courseId !== id);
    db.meetings = db.meetings.filter((m) => m.courseId !== id);
    db.attendance = db.attendance.filter((a) => a.courseId !== id);
    db.grades = db.grades.filter((g) => g.courseId !== id);
    db.announcements = db.announcements.filter((a) => a.courseId !== id);

    saveDb(db);
    res.json({ success: true, message: 'Mata kuliah berhasil dihapus.' });
  });

  // STUDENTS CRUD
  app.get('/api/students', (req, res) => {
    const db = getDb();
    const students = db.users.filter((u) => u.role === 'mahasiswa');
    res.json(sanitizeUsers(students));
  });

  app.post('/api/students', (req, res) => {
    const db = getDb();
    const { nim, name, email, prodi, semester, password } = req.body;

    if (!nim || !name) {
      return res.status(400).json({ error: 'NIM dan nama mahasiswa wajib diisi.' });
    }

    const existing = db.users.find((u) => u.nim === nim.trim());
    if (existing) {
      return res.status(400).json({ error: 'NIM sudah terdaftar.' });
    }

    const newStudent: User = {
      id: `usr-mhs-${Date.now()}`,
      role: 'mahasiswa',
      name: name.trim(),
      email: email ? email.trim() : `${nim.trim()}@student.kampus.ac.id`,
      nim: nim.trim(),
      prodi: prodi || 'Teknik Informatika',
      semester: Number(semester) || 4,
      password: password || 'password123',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    };

    db.users.push(newStudent);
    saveDb(db);
    const { password: _, ...safe } = newStudent;
    res.status(201).json(safe);
  });

  app.put('/api/students/:nim', (req, res) => {
    const db = getDb();
    const { nim } = req.params;
    const index = db.users.findIndex((u) => u.nim === nim);

    if (index === -1) {
      return res.status(404).json({ error: 'Mahasiswa tidak ditemukan.' });
    }

    const current = db.users[index];
    const updated: User = {
      ...current,
      name: req.body.name || current.name,
      email: req.body.email || current.email,
      prodi: req.body.prodi || current.prodi,
      semester: Number(req.body.semester) || current.semester,
      password: req.body.password || current.password,
    };

    db.users[index] = updated;
    saveDb(db);
    const { password: _, ...safe } = updated;
    res.json(safe);
  });

  app.delete('/api/students/:nim', (req, res) => {
    const db = getDb();
    const { nim } = req.params;
    db.users = db.users.filter((u) => u.nim !== nim);
    db.enrollments = db.enrollments.filter((e) => e.studentNim !== nim);
    db.attendance = db.attendance.filter((a) => a.studentNim !== nim);
    db.grades = db.grades.filter((g) => g.studentNim !== nim);

    saveDb(db);
    res.json({ success: true, message: 'Mahasiswa berhasil dihapus.' });
  });

  // ENROLLMENT / MANAGE MAHASISWA IN KELAS
  app.post('/api/courses/:id/enroll', (req, res) => {
    const db = getDb();
    const { id } = req.params;
    const { studentNims } = req.body;

    if (!Array.isArray(studentNims)) {
      return res.status(400).json({ error: 'Daftar NIM mahasiswa harus berupa array.' });
    }

    // Keep enrollments for other courses, replace for this course
    db.enrollments = db.enrollments.filter((e) => e.courseId !== id);
    studentNims.forEach((nim) => {
      db.enrollments.push({
        id: `enr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        courseId: id,
        studentNim: nim,
        enrolledAt: new Date().toISOString(),
      });
    });

    saveDb(db);
    res.json({
      success: true,
      enrollments: db.enrollments.filter((e) => e.courseId === id),
    });
  });

  // MEETINGS CRUD
  app.post('/api/meetings', (req, res) => {
    const db = getDb();
    const { courseId, pertemuanKe, topik, tanggal, deskripsi, videoUrl, materials, isAttendanceOpen } = req.body;

    if (!courseId || !topik) {
      return res.status(400).json({ error: 'Mata kuliah dan topik pertemuan wajib diisi.' });
    }

    const newMeeting: Meeting = {
      id: `mtg-${Date.now()}`,
      courseId,
      pertemuanKe: Number(pertemuanKe) || db.meetings.filter((m) => m.courseId === courseId).length + 1,
      topik: topik.trim(),
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      deskripsi: deskripsi || '',
      videoUrl: videoUrl || '',
      materials: Array.isArray(materials) ? materials : [],
      isAttendanceOpen: Boolean(isAttendanceOpen),
    };

    db.meetings.push(newMeeting);
    saveDb(db);
    res.status(201).json(newMeeting);
  });

  app.put('/api/meetings/:id', (req, res) => {
    const db = getDb();
    const { id } = req.params;
    const index = db.meetings.findIndex((m) => m.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Pertemuan tidak ditemukan.' });
    }

    const current = db.meetings[index];
    const updated: Meeting = {
      ...current,
      ...req.body,
      id: current.id,
      courseId: current.courseId,
    };

    db.meetings[index] = updated;
    saveDb(db);
    res.json(updated);
  });

  app.patch('/api/meetings/:id/attendance-toggle', (req, res) => {
    const db = getDb();
    const { id } = req.params;
    const meeting = db.meetings.find((m) => m.id === id);

    if (!meeting) {
      return res.status(404).json({ error: 'Pertemuan tidak ditemukan.' });
    }

    const newState = req.body.isAttendanceOpen !== undefined ? Boolean(req.body.isAttendanceOpen) : !meeting.isAttendanceOpen;
    meeting.isAttendanceOpen = newState;
    if (!newState) {
      meeting.attendanceClosedAt = new Date().toISOString();
    }

    saveDb(db);
    res.json({
      success: true,
      meetingId: id,
      isAttendanceOpen: meeting.isAttendanceOpen,
    });
  });

  app.delete('/api/meetings/:id', (req, res) => {
    const db = getDb();
    const { id } = req.params;
    db.meetings = db.meetings.filter((m) => m.id !== id);
    db.attendance = db.attendance.filter((a) => a.meetingId !== id);

    saveDb(db);
    res.json({ success: true, message: 'Pertemuan berhasil dihapus.' });
  });

  // ATTENDANCE MANAGEMENT
  app.post('/api/attendance/bulk', (req, res) => {
    const db = getDb();
    const { records } = req.body;

    if (!Array.isArray(records)) {
      return res.status(400).json({ error: 'Records harus berupa array.' });
    }

    records.forEach((rec) => {
      const index = db.attendance.findIndex(
        (a) => a.meetingId === rec.meetingId && a.studentNim === rec.studentNim
      );

      if (index !== -1) {
        db.attendance[index] = {
          ...db.attendance[index],
          status: rec.status,
          note: rec.note || '',
          method: rec.method || 'dosen',
          timestamp: new Date().toISOString(),
        };
      } else {
        db.attendance.push({
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          courseId: rec.courseId,
          meetingId: rec.meetingId,
          studentNim: rec.studentNim,
          status: rec.status || 'Hadir',
          timestamp: new Date().toISOString(),
          method: rec.method || 'dosen',
          note: rec.note || '',
        });
      }
    });

    saveDb(db);
    res.json({ success: true, count: records.length });
  });

  // Self Attendance by Student
  app.post('/api/attendance/self', (req, res) => {
    const db = getDb();
    const { courseId, meetingId, studentNim } = req.body;

    if (!courseId || !meetingId || !studentNim) {
      return res.status(400).json({ error: 'Course, pertemuan, dan NIM wajib disertakan.' });
    }

    const meeting = db.meetings.find((m) => m.id === meetingId);
    if (!meeting) {
      return res.status(404).json({ error: 'Pertemuan tidak ditemukan.' });
    }

    if (!meeting.isAttendanceOpen) {
      return res.status(403).json({ error: 'Sesi presensi mandiri saat ini ditutup oleh dosen.' });
    }

    const existing = db.attendance.find(
      (a) => a.meetingId === meetingId && a.studentNim === studentNim
    );

    if (existing) {
      return res.json({
        success: true,
        alreadyAttended: true,
        message: 'Anda sudah mengisi presensi untuk pertemuan ini.',
        record: existing,
      });
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      courseId,
      meetingId,
      studentNim,
      status: 'Hadir',
      timestamp: new Date().toISOString(),
      method: 'mandiri',
      note: 'Presensi mandiri oleh mahasiswa',
    };

    db.attendance.push(newRecord);
    saveDb(db);

    res.status(201).json({
      success: true,
      message: 'Presensi mandiri berhasil dicatat.',
      record: newRecord,
    });
  });

  // GRADES MANAGEMENT
  app.post('/api/grades', (req, res) => {
    const db = getDb();
    const { courseId, studentNim, tugas, kuis, uts, uas, status, feedback } = req.body;

    if (!courseId || !studentNim) {
      return res.status(400).json({ error: 'Course dan NIM mahasiswa wajib disertakan.' });
    }

    const index = db.grades.findIndex(
      (g) => g.courseId === courseId && g.studentNim === studentNim
    );

    const updatedRecord: GradeRecord = {
      id: index !== -1 ? db.grades[index].id : `grd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      courseId,
      studentNim,
      tugas: Number(tugas) || 0,
      kuis: Number(kuis) || 0,
      uts: Number(uts) || 0,
      uas: Number(uas) || 0,
      status: status === 'published' ? 'published' : 'draft',
      feedback: feedback || '',
      updatedAt: new Date().toISOString(),
    };

    if (index !== -1) {
      db.grades[index] = updatedRecord;
    } else {
      db.grades.push(updatedRecord);
    }

    saveDb(db);
    res.json(updatedRecord);
  });

  // Publish all grades for course
  app.post('/api/grades/publish-all', (req, res) => {
    const db = getDb();
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID wajib diisi.' });
    }

    let updatedCount = 0;
    db.grades = db.grades.map((g) => {
      if (g.courseId === courseId) {
        updatedCount++;
        return { ...g, status: 'published', updatedAt: new Date().toISOString() };
      }
      return g;
    });

    saveDb(db);
    res.json({ success: true, updatedCount });
  });

  // ANNOUNCEMENTS
  app.post('/api/announcements', (req, res) => {
    const db = getDb();
    const { title, content, courseId, courseName, authorName, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Judul dan isi pengumuman wajib diisi.' });
    }

    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      courseId: courseId || 'all',
      courseName: courseName || 'Semua Kelas',
      authorName: authorName || 'Dosen Pengampu',
      category: category || 'Umum',
      createdAt: new Date().toISOString(),
    };

    db.announcements.unshift(newAnnouncement);
    saveDb(db);
    res.status(201).json(newAnnouncement);
  });

  app.put('/api/announcements/:id', (req, res) => {
    const db = getDb();
    const { id } = req.params;
    const index = db.announcements.findIndex((a) => a.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Pengumuman tidak ditemukan.' });
    }

    const updated: Announcement = {
      ...db.announcements[index],
      ...req.body,
      id,
    };

    db.announcements[index] = updated;
    saveDb(db);
    res.json(updated);
  });

  app.delete('/api/announcements/:id', (req, res) => {
    const db = getDb();
    const { id } = req.params;
    db.announcements = db.announcements.filter((a) => a.id !== id);
    saveDb(db);
    res.json({ success: true, message: 'Pengumuman berhasil dihapus.' });
  });

  // Server-side Gemini AI generation helper (for meeting outline & announcements)
  app.post('/api/ai/generate', async (req, res) => {
    const { prompt, type } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const systemInstruction =
          type === 'meeting'
            ? 'Anda adalah asisten dosen akademik. Buatkan silabus pertemuan kuliah yang terstruktur (Topik, Tujuan Pembelajaran, Rangkuman Materi 2-3 paragraf) dalam bahasa Indonesia profesional.'
            : 'Anda adalah asisten dosen akademik. Buatkan draf teks pengumuman kelas yang jelas, santun, dan komprehensif dalam bahasa Indonesia.';

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction,
          },
        });

        return res.json({ result: response.text });
      } catch (err: any) {
        console.error('Gemini AI API error:', err);
        // graceful fallback below
      }
    }

    // Fallback template when no API key or on error
    if (type === 'meeting') {
      res.json({
        result: `Topik Pembelajaran: ${prompt}\n\nTujuan Pembelajaran:\n1. Mahasiswa memahami konsep inti dan implementasi praktis.\n2. Mahasiswa mampu menganalisis kasus studi terkait topik.\n\nRangkuman Materi:\nPertemuan ini mengkaji prinsip dasar dan penerapan tingkat lanjut pada teknologi terkait, dilengkapi studi kasus nyata dan latihan interaktif di kelas.`,
      });
    } else {
      res.json({
        result: `Pengumuman Penting:\n\nSehubungan dengan ${prompt}, diberitahukan kepada seluruh mahasiswa agar mempersiapkan berkas dan materi terkait. Jika ada kendala, silakan berkonsultasi melalui forum portal kelas.\n\nTerima kasih.`,
      });
    }
  });

  // Vite development middleware or production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portal Kelas Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
