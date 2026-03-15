import * as departmentService from '../services/adminDepartment.service.js';

export const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await departmentService.getAllDepartments();
    res.json({ data: departments });
  } catch (err) {
    next(err);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await departmentService.getDepartmentById(id);
    if (!department) return res.status(404).json({ error: 'Department not found' });
    res.json({ data: department });
  } catch (err) {
    next(err);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.createDepartment(req.body);
    res.status(201).json({ data: department });
  } catch (err) {
    // Handle unique constraint violations
    if (err.code === '23505') { // PostgreSQL unique violation
      if (err.message.includes('name')) {
        return res.status(409).json({ error: 'Department name already exists' });
      }
      if (err.message.includes('code')) {
        return res.status(409).json({ error: 'Department code already exists' });
      }
    }
    next(err);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await departmentService.updateDepartment(id, req.body);
    res.json({ data: department });
  } catch (err) {
    if (err.code === '23505') {
      if (err.message.includes('name')) {
        return res.status(409).json({ error: 'Department name already exists' });
      }
      if (err.message.includes('code')) {
        return res.status(409).json({ error: 'Department code already exists' });
      }
    }
    next(err);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await departmentService.deleteDepartment(id);
    res.status(204).send();
  } catch (err) {
    if (err.message.includes('Cannot delete department with existing')) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
};