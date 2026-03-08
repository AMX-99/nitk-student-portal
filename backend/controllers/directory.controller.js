import supabaseAdmin from '../config/supabase.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { data: teachersData, error: tErr } = await supabaseAdmin.from('teachers')
      .select('id, name, email, phone, designation, office_hours, bio, department:department_id(name, code)')
      .order('name');
    if (tErr) throw tErr;

    const { data: studentsData, error: sErr } = await supabaseAdmin.from('students')
      .select('id, name, email, phone, roll_no, bio, current_semester, department:department_id(name, code)')
      .order('name');
    if (sErr) throw sErr;

    const mappedTeachers = teachersData.map(t => {
      const name = t.name || 'Unknown';
      const nameParts = name.split(' ');
      const initials = nameParts.map(p => p?.[0] || '').join('').slice(0,2).toUpperCase() || 'U';
      const code = t.department?.code || '';
      const deptColor = { CSE: 'var(--color-orange)', ECE: 'var(--color-blue)', ME: 'var(--color-green)', CE: 'var(--color-amber)', IT: 'var(--color-purple)' }[code] || 'var(--color-purple)';
      return {
        id: t.id,
        role: 'Teacher',
        name: t.name,
        dept: code || '—',
        designation: t.designation || 'Faculty',
        email: t.email,
        phone: t.phone || '—',
        specialization: t.bio?.split('\n')[0] || '—',
        initials,
        color: deptColor,
        office: t.office_hours?.split('\n')[0] || '—',
        qualification: '—',
        experience: '—'
      };
    });

    const mappedStudents = studentsData.map(s => {
      const name = s.name || 'Unknown';
      const nameParts = name.split(' ');
      const initials = nameParts.map(p => p?.[0] || '').join('').slice(0,2).toUpperCase() || 'U';
      const code = s.department?.code || '';
      const deptColor = { CSE: 'var(--color-orange)', ECE: 'var(--color-blue)', ME: 'var(--color-green)', CE: 'var(--color-amber)', IT: 'var(--color-purple)' }[code] || 'var(--color-blue)';
      return {
        id: s.id,
        role: 'Student',
        name: s.name,
        dept: code || '—',
        designation: `Student · Sem ${s.current_semester}`,
        email: s.email,
        phone: s.phone || '—',
        specialization: s.roll_no || '—',
        initials,
        color: deptColor,
        office: '—',
        qualification: '—',
        experience: '—'
      };
    });

    // We can merge all public profiles 
    const allUsers = [...mappedTeachers, ...mappedStudents];
    res.json({ data: allUsers });
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
      return res.json({ data: [] });
    }
    const results = await searchAll(q);
    
    // Map the results to match local directory mapping structure
    const mappedSearchTeachers = (results.teachers || []).map(t => ({
      id: t.id,
      role: 'Teacher',
      name: t.name || 'Unknown',
      dept: '—',
      designation: t.designation || 'Faculty',
      email: t.email,
      phone: t.phone || '—',
      specialization: '—',
      initials: (t.name || 'U').split(' ').map(p => p?.[0] || '').join('').slice(0,2).toUpperCase() || 'U',
      color: 'var(--color-blue)',
      office: '—',
      qualification: '—',
      experience: '—'
    }));

    const mappedSearchStudents = (results.students || []).map(s => ({
      id: s.id,
      role: 'Student',
      name: s.name || 'Unknown',
      dept: '—',
      designation: `Student · Sem ${s.current_semester || '?'}`,
      email: s.email,
      phone: s.phone || '—',
      specialization: s.roll_no || '—',
      initials: (s.name || 'U').split(' ').map(p => p?.[0] || '').join('').slice(0,2).toUpperCase() || 'U',
      color: 'var(--color-orange)',
      office: '—',
      qualification: '—',
      experience: '—'
    }));
    
    res.json({ data: [...mappedSearchTeachers, ...mappedSearchStudents] });
  } catch (err) {
    next(err);
  }
};