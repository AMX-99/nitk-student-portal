import * as teacherService from '../services/adminTeacher.service.js';

export const listTeachers = async (req, res, next) => {
  try {
    const result = await teacherService.listTeachers(req.query);
    res.json(result);
  } catch (err) { next(err); }
};

export const createTeacher = async (req, res, next) => {
  try {
    const Teacher = await teacherService.createTeacher(req.body);
    res.status(201).json(Teacher);
  } catch (err) { next(err); }
};

export const updateTeacher = async (req, res, next) => {
  try {
    const Teacher = await teacherService.updateTeacher(req.params.id, req.body);
    res.json(Teacher);
  } catch (err) { next(err); }
};

export const deleteTeacher = async (req, res, next) => {
  try {
    const Teacher = await teacherService.deleteTeacher(req.params.id);
    res.json({ message: 'Teacher deactivated', Teacher});
  } catch (err) { next(err); }
};