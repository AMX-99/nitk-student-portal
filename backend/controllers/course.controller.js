import * as courseService from '../services/course.service.js';

export const getAllCourses = async (req, res, next) => {
  try {
    const filters = {
      department_id: req.query.department_id,
      semester: req.query.semester,
    };
    const courses = await courseService.getAllCourses(filters);
    res.json({ data: courses });
  } catch (err) {
    next(err);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await courseService.getCourseById(id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ data: course });
  } catch (err) {
    next(err);
  }
};