import { supabaseAdmin } from '../config/supabase.js';

export const getTeachers = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('teachers')
      .select(`
        id, name, email, phone, designation, office_hours, bio, research_url,
        department:department_id ( name, code )
      `)
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    const formatted = data.map(teacher => {
      const nameParts = teacher.name.split(' ');
      const initials = nameParts.map(p => p[0]).join('').slice(0,2).toUpperCase();
      const deptColor = {
        CSE: 'var(--color-orange)',
        ECE: 'var(--color-blue)',
        ME: 'var(--color-green)',
        CE: 'var(--color-amber)',
        IT: 'var(--color-purple)',
      }[teacher.department?.code] || 'var(--color-grey)';
      return {
        name: teacher.name,
        dept: teacher.department?.code,
        designation: teacher.designation,
        email: teacher.email,
        phone: teacher.phone,
        specialization: teacher.bio?.split('\n')[0] || '—',
        initials,
        color: deptColor,
        office: teacher.office_hours?.split('\n')[0] || '—'
      };
    });
    res.json({ data: formatted });
  } catch (err) {
    next(err);
  }
};

export const searchAll = async (query) => {
  const searchTerm = `%${query}%`;
  const { data: students, error: studentError } = await supabaseAdmin.from('v_student_public')
    .select('*')
    .or(`name.ilike.${searchTerm},roll_no.ilike.${searchTerm}`)
    .limit(10);
  const { data: teachers, error: teacherError } = await supabaseAdmin.from('v_teacher_public')
    .select('*')
    .or(`name.ilike.${searchTerm},designation.ilike.${searchTerm}`)
    .limit(10);
  const { data: courses, error: courseError } = await supabaseAdmin.from('courses')
    .select('id, name, code, department_id')
    .or(`name.ilike.${searchTerm},code.ilike.${searchTerm}`)
    .limit(10);
  if (studentError || teacherError || courseError) {
    throw studentError || teacherError || courseError;
  }
  return { students, teachers, courses };
};

export const searchDirectory = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ students: [], teachers: [], courses: [] });
    }
    const results = await searchAll(q);
    res.json(results);
  } catch (err) {
    next(err);
  }
};