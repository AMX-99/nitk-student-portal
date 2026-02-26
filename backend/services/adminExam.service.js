import * as timetableService from '../services/adminTimetable.service.js';

export const listTimetableSlots = async (req, res, next) => {
  try {
    const result = await timetableService.listTimetableSlots(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const createTimetableSlot = async (req, res, next) => {
  try {
    const slot = await timetableService.createTimetableSlot(req.body);
    res.status(201).json(slot);
  } catch (err) {
    next(err);
  }
};

export const getTimetableSlot = async (req, res, next) => {
  try {
    const slot = await timetableService.getTimetableSlotById(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Timetable slot not found' });
    res.json(slot);
  } catch (err) {
    next(err);
  }
};

export const updateTimetableSlot = async (req, res, next) => {
  try {
    const slot = await timetableService.updateTimetableSlot(req.params.id, req.body);
    res.json(slot);
  } catch (err) {
    next(err);
  }
};

export const deleteTimetableSlot = async (req, res, next) => {
  try {
    await timetableService.deleteTimetableSlot(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};