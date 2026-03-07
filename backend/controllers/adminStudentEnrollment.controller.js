import * as enrollmentService from '../services/adminStudentEnrollment.service.js';

export const listEnrollments = async (req, res, next) => {
  try {
    const result = await enrollmentService.listEnrollments(req.query);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const createEnrollment = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.createEnrollment(req.body);
    res.status(201).json({ data: enrollment });
  } catch (err) {
    next(err);
  }
};

export const getEnrollmentById = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.getEnrollmentById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    res.json({ data: enrollment });
  } catch (err) {
    next(err);
  }
};

export const updateEnrollment = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.updateEnrollment(req.params.id, req.body);
    res.json({ data: enrollment });
  } catch (err) {
    next(err);
  }
};

export const deleteEnrollment = async (req, res, next) => {
  try {
    await enrollmentService.deleteEnrollment(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};