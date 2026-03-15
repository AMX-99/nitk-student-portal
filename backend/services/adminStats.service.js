import supabaseAdmin from '../config/supabase.js';

export const getStats = async () => {
  const { count: totalStudents } = await supabaseAdmin.from('students')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
  const { count: totalTeachers } = await supabaseAdmin.from('teachers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { data: demands, error: dError } = await supabaseAdmin.from('payment_demands')
    .select('status, total_amount, updated_at');
  
  let revenue = 0;
  let pending_fees = 0;
  let pending_count = 0;
  const collectionData = {};

  if (!dError && demands) {
    demands.forEach(d => {
      if (d.status === 'paid') {
        revenue += parseFloat(d.total_amount);
        const month = new Date(d.updated_at).toLocaleString('default', { month: 'short' });
        collectionData[month] = (collectionData[month] || 0) + parseFloat(d.total_amount);
      } else {
        pending_fees += parseFloat(d.total_amount);
        pending_count++;
      }
    });
  }

  // Format last 6 months 
  const fee_collection = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.toLocaleString('default', { month: 'short' });
    fee_collection.push({ month, amount: (collectionData[month] || 0) / 100000 }); // In Lakhs
  }

  return {
    totalStudents,
    totalTeachers,
    revenue: revenue >= 100000 ? `₹${(revenue/100000).toFixed(2)}L` : `₹${revenue.toLocaleString()}`,
    pending_fees: pending_fees >= 100000 ? `₹${(pending_fees/100000).toFixed(2)}L` : `₹${pending_fees.toLocaleString()}`,
    pending_count,
    fee_collection
  };
};

export const getDeptDistribution = async () => {
  const { data, error } = await supabaseAdmin.from('departments')
    .select(`
      id, name, code,
      students:students!inner(count)
    `)
    .eq('students.is_active', true);
  if (error) throw error;
  return data.map(dept => ({
    department: dept.name,
    code: dept.code,
    count: dept.students[0].count
  }));
};