import * as tcService from '../services/adminTeacherCourse.service.js';

export const createAssignment = async (req, res, next) => {
  try {
    const assignment = await tcService.createAssignment(req.body);
    res.status(201).json({ data: assignment });
  } catch (err) {
    next(err);
  }
};

export const getAllAssignments = async (req, res, next) => {
  try {
    const filters = {
      teacher_id: req.query.teacher_id,
      course_id: req.query.course_id,
      academic_year: req.query.academic_year,
      semester: req.query.semester,
      section: req.query.section
    };
    const assignments = await tcService.getAllAssignments(filters);
    res.json({ data: assignments });
  } catch (err) {
    next(err);
  }
};

export const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await tcService.getAssignmentById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ data: assignment });
  } catch (err) {
    next(err);
  }
};

export const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await tcService.updateAssignment(req.params.id, req.body);
    res.json({ data: assignment });
  } catch (err) {
    next(err);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    await tcService.deleteAssignment(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};