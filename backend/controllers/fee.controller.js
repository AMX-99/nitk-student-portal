import * as feeService from '../services/fee.service.js';
import supabaseAdmin from '../config/supabase.js';

export const getMyFees = async (req, res, next) => {
  try {
    const { academic_year, semester } = req.query;
    const studentId = req.user.studentId;
    const demand = await feeService.getStudentDemand(studentId, academic_year, semester);
    const payments = await feeService.getStudentPayments(studentId);
    res.json({ demand, payments });
  } catch (err) {
    next(err);
  }
};

export const getAllFeeStructures = async (req, res, next) => {
  try {
    const filters = req.query;
    const data = await feeService.getFeeStructures(filters);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const createFeeStructure = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const data = await feeService.createFeeStructure(req.body, adminId);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

export const updateFeeStructure = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await feeService.updateFeeStructure(id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const deleteFeeStructure = async (req, res, next) => {
  try {
    const { id } = req.params;
    await feeService.deleteFeeStructure(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getAllDemands = async (req, res, next) => {
  try {
    const filters = req.query;
    const data = await feeService.getAllDemands(filters);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

export const raiseDemand = async (req, res, next) => {
  try {
    const { student_id, academic_year, semester } = req.body;
    const adminId = req.user.id;
    const demand = await feeService.generateDemand(student_id, academic_year, semester, adminId);
    res.status(201).json({ data: demand });
  } catch (err) {
    next(err);
  }
};

export const raiseBatchDemand = async (req, res, next) => {
  try {
    const { batch_year, department_id, academic_year, semester } = req.body;
    const adminId = req.user.id;
    let query = supabaseAdmin.from('students')
      .select('id')
      .eq('batch_year', batch_year)
      .eq('is_active', true);
    if (department_id) query = query.eq('department_id', department_id);
    const { data: students, error } = await query;
    if (error) throw error;
    const results = [];
    for (const student of students) {
      try {
        const demand = await feeService.generateDemand(student.id, academic_year, semester, adminId);
        results.push({ student: student.id, success: true, demand });
      } catch (err) {
        results.push({ student: student.id, success: false, error: err.message });
      }
    }
    res.json({ results });
  } catch (err) {
    next(err);
  }
};

export const markDemandPaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { notes } = req.body;
    await feeService.markDemandPaid(id, adminId, notes);
    res.json({ message: 'Demand marked as paid' });
  } catch (err) {
    next(err);
  }
};