import supabaseAdmin from '../config/supabase.js';

export const getStudentDemandById = async (demandId) => {
  const { data, error } = await supabaseAdmin
    .from('payment_demands')
    .select('*')
    .eq('id', demandId)
    .single();

  if (error) throw error;
  return data;
};

export const getFeeStructures = async (filters = {}) => {
  let query = supabaseAdmin.from('fee_structures')
    .select(`
      *,
      fee_categories (name, code),
      departments (name)
    `)
    .order('academic_year', { ascending: false });
  if (filters.academic_year) query = query.eq('academic_year', filters.academic_year);
  if (filters.semester) query = query.eq('semester', filters.semester);
  if (filters.department_id) query = query.eq('department_id', filters.department_id);
  if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createFeeStructure = async (payload, adminId) => {
  const { data, error } = await supabaseAdmin.from('fee_structures')
    .insert({
      ...payload,
      created_by: adminId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateFeeStructure = async (id, updates) => {
  const { data, error } = await supabaseAdmin.from('fee_structures')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteFeeStructure = async (id) => {
  const { error } = await supabaseAdmin.from('fee_structures')
    .update({ is_active: false })
    .eq('id', id);
  if (error) throw error;
};

export const getApplicableFee = async ( feeCategoryId, academicYear, semester, studentId) => {
  const { data: student, error: studentError } = await supabaseAdmin.from('students')
    .select('department_id, batch_year, student_category, income_slab, income_verified')
    .eq('id', studentId)
    .single();
  if (studentError) throw studentError;
  const { data, error } = await supabaseAdmin.rpc('get_applicable_fee', {
    p_fee_category_id: feeCategoryId,
    p_academic_year: academicYear,
    p_semester: semester,
    p_department_id: student.department_id,
    p_batch_year: student.batch_year,
    p_student_category: student.student_category,
    p_income_slab: student.income_slab,
    p_income_verified: student.income_verified
  });
  if (error) throw error;
  return data;
};

export const generateDemand = async (studentId, academicYear, semester, adminId) => {
  const { data: categories, error: catError } = await supabaseAdmin.from('fee_categories')
    .select('id, name, is_mandatory')
    .eq('is_active', true)
    .eq('is_mandatory', true);
  if (catError) throw catError;
  const breakdown = [];
  let totalAmount = 0;
  for (const cat of categories) {
    const amount = await getApplicableFee(cat.id, academicYear, semester, studentId);
    if (amount !== null && amount > 0) {
      breakdown.push({
        category_id: cat.id,
        name: cat.name,
        amount,
        waived: false,
        waived_reason: null
      });
      totalAmount += amount;
    }
  }
  const { data, error } = await supabaseAdmin.from('payment_demands')
    .insert({
      student_id: studentId,
      academic_year: academicYear,
      semester,
      total_amount: totalAmount,
      due_date: new Date(new Date().getFullYear(), 11, 15),
      breakdown,
      raised_by: adminId
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getStudentDemand = async (studentId, academicYear, semester) => {
  const { data, error } = await supabaseAdmin.from('payment_demands')
    .select('*')
    .eq('student_id', studentId)
    .eq('academic_year', academicYear)
    .eq('semester', semester)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const getStudentPayments = async (studentId) => {
  const { data, error } = await supabaseAdmin.from('payments')
    .select('*')
    .eq('student_id', studentId)
    .order('initiated_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getAllDemands = async (filters = {}) => {
  let query = supabaseAdmin.from('payment_demands')
    .select(`
      *,
      students (name, roll_no, department_id)
    `);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.student_id) query = query.eq('student_id', filters.student_id);
  if (filters.academic_year) query = query.eq('academic_year', filters.academic_year);
  if (filters.semester) query = query.eq('semester', filters.semester);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const markDemandPaid = async (demandId, adminId, notes = '') => {
  const { data: demand, error: fetchError } = await supabaseAdmin.from('payment_demands')
    .select('student_id, total_amount')
    .eq('id', demandId)
    .single();
  if (fetchError) throw fetchError;
  const { error: paymentError } = await supabaseAdmin.from('payments')
    .insert({
      demand_id: demandId,
      student_id: demand.student_id,
      amount: demand.total_amount,
      payment_method: 'cash',
      status: 'success',
      verified_by: adminId,
      notes
    });
  if (paymentError) throw paymentError;
  const { error: updateError } = await supabaseAdmin.from('payment_demands')
    .update({ status: 'paid' })
    .eq('id', demandId);

  if (updateError) throw updateError;
};