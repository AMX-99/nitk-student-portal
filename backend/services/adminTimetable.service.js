import supabaseAdmin from '../config/supabase.js';

export const listTimetableSlots = async (filters) => {
  let query = supabaseAdmin.from('timetable_slots')
    .select(`
      *,
      courses (id, name, code),
      teachers (id, name)
    `, { count: 'exact' });
  if (filters.academic_year) query = query.eq('academic_year', filters.academic_year);
  if (filters.semester) query = query.eq('semester', filters.semester);
  if (filters.section) query = query.eq('section', filters.section);
  if (filters.day_of_week !== undefined) query = query.eq('day_of_week', filters.day_of_week);
  const from = (filters.page - 1) * filters.limit;
  const to = from + filters.limit - 1;
  query = query.range(from, to).order('day_of_week').order('start_time');
  const { data, error, count } = await query;
  if (error) throw error;
  return { data, total: count, page: filters.page, limit: filters.limit };
};

export const createTimetableSlot = async (slotData) => {
  const { data, error } = await supabaseAdmin.from('timetable_slots')
    .insert(slotData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getTimetableSlotById = async (id) => {
  const { data, error } = await supabaseAdmin.from('timetable_slots')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const updateTimetableSlot = async (id, updates) => {
  const { data, error } = await supabaseAdmin.from('timetable_slots')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteTimetableSlot = async (id) => {
  const { error } = await supabaseAdmin.from('timetable_slots')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};