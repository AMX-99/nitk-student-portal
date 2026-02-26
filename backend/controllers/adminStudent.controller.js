import * as studentService from '../services/adminStudent.service.js';

export const listStudents = async (req, res, next) => {
  try {
    const result = await studentService.listStudents(req.query);
    res.json(result);
  } catch (err) { next(err); }
};

export const createStudent = async (req, res, next) => {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json(student);
  } catch (err) { next(err); }
};

export const updateStudent = async (req, res, next) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);
    res.json(student);
  } catch (err) { next(err); }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const student = await studentService.deleteStudent(req.params.id);
    res.json({ message: 'Student deactivated', student });
  } catch (err) { next(err); }
};