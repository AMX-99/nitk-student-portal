import { supabaseAdmin } from "../config/supabase.js";

const getStudentId = async (authId) => {
  const { data, error } = await supabaseAdmin
    .from("students")
    .select("id")
    .eq("auth_id", authId)
    .single();
  if (error || !data) throw new Error("Student not found");
  return data.id;
};

export const getProfile = async (authId) => {
  const { data, error } = await supabaseAdmin
    .from("students")
    .select(
      `
      *,
      department:departments(name, code)
    `,
    )
    .eq("auth_id", authId)
    .single();
  if (error) throw error;
  return data;
};

export const updateProfile = async (authId, updates) => {
  const allowed = ["phone", "address", "bio", "github_url", "linkedin_url"];
  const filtered = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) filtered[key] = updates[key];
  }
  const { data, error } = await supabaseAdmin
    .from("students")
    .update(filtered)
    .eq("auth_id", authId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const generateAvatarUploadUrl = async (authId) => {
  const fileName = `avatars/${authId}-${Date.now()}.jpg`;
  const { data, error } = await supabaseAdmin.storage
    .from("profiles")
    .createSignedUploadUrl(fileName, {
      upsert: true,
      contentType: "image/*",
    });
  if (error) throw error;
  const publicUrl = supabaseAdmin.storage
    .from("profiles")
    .getPublicUrl(fileName).data.publicUrl;
  return { signedUrl: data.signedUrl, publicUrl };
};

const computeAcademicYear = (batchYear, semester) => {
  const startYear = batchYear + Math.floor((semester - 1) / 2);
  const endYear = startYear + 1;
  return `${startYear}-${endYear.toString().slice(-2)}`;
};

export const getCourses = async (authId) => {
  const { data: student, error: studentError } = await supabaseAdmin
    .from("students")
    .select("id, batch_year, current_semester")
    .eq("auth_id", authId)
    .single();
  if (studentError || !student) throw new Error("Student not found");
  const { id: studentId, batch_year, current_semester } = student;
  const academicYear = computeAcademicYear(batch_year, current_semester);
  const { data, error } = await supabaseAdmin
    .from("enrollments")
    .select(
      `
      course:courses(id, code, name, credits),
      attendance:attendance!inner(
        status,date
      )
    `,
    )
    .eq("student_id", studentId)
    .eq("academic_year", academicYear)
    .eq("semester", current_semester);

  if (error) throw error;
  const courses = data.map((item) => {
    const total = item.attendance.length;
    const present = item.attendance.filter((a) => a.status === "P").length;
    const pct = total ? Math.round((present / total) * 100 * 10) / 10 : 0;
    return {
      code: item.course.code,
      name: item.course.name,
      present,
      total,
      pct,
    };
  });
  return courses;
};

export const getCgpaTrend = async (authId) => {
  const studentId = await getStudentId(authId);
  const { data, error } = await supabaseAdmin
    .from("results")
    .select(
      `
      semester,grade_points,
      course:courses(credits)
    `,
    )
    .eq("student_id", studentId)
    .order("semester", { ascending: true });
  if (error) throw error;
  // Group by semester, compute weighted average (grade_points * credits) / total credits
  const semesters = {};
  data.forEach((item) => {
    const sem = `Sem ${item.semester}`;
    if (!semesters[sem]) {
      semesters[sem] = { totalPoints: 0, totalCredits: 0 };
    }
    semesters[sem].totalPoints += item.grade_points * item.course.credits;
    semesters[sem].totalCredits += item.course.credits;
  });
  const trend = Object.entries(semesters).map(([sem, values]) => ({
    sem,
    cgpa: Number((values.totalPoints / values.totalCredits).toFixed(2)),
  }));
  return trend;
};

export const getAttendance = async (authId) => {
  // reuse getCourses – they return the same structure
  return getCourses(authId);
};

export const getResults = async (authId, semester) => {
  const studentId = await getStudentId(authId);
  const { data, error } = await supabaseAdmin
    .from("results")
    .select(
      `
      course:courses(code, name),
      internal_marks,external_marks,total_marks,
      grade,grade_points
    `,
    )
    .eq("student_id", studentId)
    .eq("semester", semester);
  if (error) throw error;
  return data.map((item) => ({
    code: item.course.code,
    name: item.course.name,
    int: item.internal_marks,
    ext: item.external_marks,
    total: item.total_marks,
    grade: item.grade,
    pts: item.grade_points,
  }));
};

export const getFees = async (authId) => {
  const studentId = await getStudentId(authId);
  // get the latest demand for the student (assuming current semester)
  const { data, error } = await supabaseAdmin
    .from("payment_demands")
    .select(
      "breakdown, total_amount, paid_amount, due_amount, due_date, status",
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  if (!data) return null; // no demand yet
  return {
    breakdown: data.breakdown,
    total: data.total_amount,
    paid: data.paid_amount,
    due: data.due_amount,
    dueDate: data.due_date,
    status: data.status,
  };
};

// GET payment history
export const getPayments = async (authId) => {
  const studentId = await getStudentId(authId);
  const { data, error } = await supabaseAdmin
    .from("payments")
    .select(
      `
      id,amount,
      payment_method,transaction_id,
      status,paid_at,
    `,
    )
    .eq("student_id", studentId)
    .order("paid_at", { ascending: false });
  if (error) throw error;
  return data.map((p) => ({
    id: p.transaction_id,
    date: p.paid_at
      ? new Date(p.paid_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-",
    amount: `₹${p.amount.toLocaleString("en-IN")}`,
    mode:
      p.payment_method === "upi"
        ? "UPI"
        : p.payment_method === "net_banking"
          ? "Net Banking"
          : p.payment_method,
    status: p.status === "success" ? "Success" : p.status,
  }));
};

export const getPublicStudentById = async (studentId) => {
  const { data, error } = await supabaseAdmin.from('v_student_public')
    .select('*')
    .eq('id', studentId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const doesTeacherTeachStudent = async (teacherAuthId, studentId) => {
  const { data: teacher, error: teacherError } = await supabaseAdmin.from('teachers')
    .select('id')
    .eq('auth_id', teacherAuthId)
    .single();
  if (teacherError || !teacher) return false;
  const { count, error } = await supabaseAdmin.from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .in('course_id', (
      supabaseAdmin.from('teacher_courses')
        .select('course_id')
        .eq('teacher_id', teacher.id)
    ));
  if (error) return false;
  return count > 0;
};

export const getFullStudentById = async (studentId) => {
  const { data, error } = await supabaseAdmin.from('students')
    .select(`
      *,
      departments!inner (name, code)
    `)
    .eq('id', studentId)
    .single();
  if (error) throw error;
  return data;
};