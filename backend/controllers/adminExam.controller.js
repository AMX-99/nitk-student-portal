import * as examService from '../services/adminExam.service.js';

export const listExams = async (req, res, next) => {
  try {
    const result = await examService.listExams(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const createExam = async (req, res, next) => {
  try {
    const examData = { ...req.body };
    const exam = await examService.createExam(examData);
    res.status(201).json(exam);
  } catch (err) {
    next(err);
  }
};

export const getExam = async (req, res, next) => {
  try {
    const exam = await examService.getExamById(req.params.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json(exam);
  } catch (err) {
    next(err);
  }
};

export const updateExam = async (req, res, next) => {
  try {
    const exam = await examService.updateExam(req.params.id, req.body);
    res.json(exam);
  } catch (err) {
    next(err);
  }
};

export const deleteExam = async (req, res, next) => {
  try {
    await examService.deleteExam(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};