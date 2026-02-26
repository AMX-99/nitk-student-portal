import { body, query, param } from 'express-validator';

export const updateStudentSchema = [
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('address').optional().isString().trim().isLength({ max: 500 }),
  body('bio').optional().isString().trim().isLength({ max: 1000 }),
  body('github_url').optional().isURL().withMessage('Invalid URL'),
  body('linkedin_url').optional().isURL().withMessage('Invalid URL')
];

export const validateListStudents = [
  query('department_id').optional().isInt().toInt(),
  query('batch_year').optional().isInt().toInt(),
  query('semester').optional().isInt({ min: 1, max: 8 }).toInt(),
  query('search').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }).toInt().default(1),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(20),
];

export const validateCreateStudent = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('roll_no').notEmpty().trim(),
  body('department_id').isInt().toInt(),
  body('batch_year').isInt().toInt(),
  body('current_semester').isInt({ min: 1, max: 8 }).toInt(),
  body('section').isLength({ min: 1, max: 1 }).trim(),
  body('student_category').optional().isIn(['General','OBC','OBC_NCL','SC','ST','EWS']),
  body('income_slab').optional().isIn(['Above5L','Between1L_5L','Below1L']),
  body('income_verified').optional().isBoolean().toBoolean(),
];

export const validateUpdateStudent = [
  param('id').isUUID(),
  body('name').optional().trim(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('student_category').optional().isIn(['General','OBC','OBC_NCL','SC','ST','EWS']),
  body('income_slab').optional().isIn(['Above5L','Between1L_5L','Below1L']),
  body('income_verified').optional().isBoolean().toBoolean(),
  body('is_active').optional().isBoolean().toBoolean(),
];

export const validateDeleteStudent = [
  param('id').isUUID(),
];

export const passwordValidation = [
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Must contain at least one number')
    .not()
    .isIn(['password', '12345678', 'qwertyui'])
    .withMessage('Password is too common'),
];

export const validateListTeachers = [
  query('department_id').optional().isInt().toInt(),
  query('search').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }).toInt().default(1),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(20),
];

export const validateCreateTeacher = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('department_id').isInt().toInt(),
  body('designation').optional().trim(),
  body('employee_id').optional().trim(),
  body('phone').optional().trim(),
  body('office_hours').optional().trim(),
];

export const validateUpdateTeacher = [
  param('id').isUUID(),
  body('name').optional().trim(),
  body('designation').optional().trim(),
  body('phone').optional().trim(),
  body('office_hours').optional().trim(),
  body('is_active').optional().isBoolean().toBoolean(),
];

export const validateDeleteTeacher = [
  param('id').isUUID(),
];

export const validateListTimetable = [
  query('academic_year').optional().isString().trim(),
  query('semester').optional().isInt({ min: 1, max: 8 }).toInt(),
  query('section').optional().isLength({ min: 1, max: 1 }).trim(),
  query('day_of_week').optional().isInt({ min: 0, max: 6 }).toInt(),
  query('page').optional().isInt({ min: 1 }).toInt().default(1),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(20),
];

export const validateCreateTimetableSlot = [
  body('section').isLength({ min: 1, max: 1 }).trim(),
  body('day_of_week').isInt({ min: 0, max: 6 }).toInt(),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  body('course_id').isInt().toInt(),
  body('teacher_id').optional().isUUID(),
  body('room').optional().trim(),
  body('academic_year').notEmpty().trim(),
  body('semester').isInt({ min: 1, max: 8 }).toInt(),
];

export const validateUpdateTimetableSlot = [
  param('id').isInt(),
  body('section').optional().isLength({ min: 1, max: 1 }).trim(),
  body('day_of_week').optional().isInt({ min: 0, max: 6 }).toInt(),
  body('start_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  body('end_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  body('course_id').optional().isInt().toInt(),
  body('teacher_id').optional().isUUID(),
  body('room').optional().trim(),
  body('academic_year').optional().trim(),
  body('semester').optional().isInt({ min: 1, max: 8 }).toInt(),
];

export const validateDeleteTimetableSlot = [
  param('id').isInt(),
];

export const validateListExams = [
  query('academic_year').optional().isString().trim(),
  query('semester').optional().isInt({ min: 1, max: 8 }).toInt(),
  query('course_id').optional().isInt().toInt(),
  query('from_date').optional().isISO8601().toDate(),
  query('to_date').optional().isISO8601().toDate(),
  query('page').optional().isInt({ min: 1 }).toInt().default(1),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(20),
];

export const validateCreateExam = [
  body('course_id').isInt().toInt(),
  body('section').isLength({ min: 1, max: 1 }).trim(),
  body('exam_date').isISO8601().toDate(),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  body('room').optional().trim(),
  body('academic_year').notEmpty().trim(),
  body('semester').isInt({ min: 1, max: 8 }).toInt(),
];

export const validateUpdateExam = [
  param('id').isInt(),
  body('course_id').optional().isInt().toInt(),
  body('section').optional().isLength({ min: 1, max: 1 }).trim(),
  body('exam_date').optional().isISO8601().toDate(),
  body('start_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  body('end_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  body('room').optional().trim(),
  body('academic_year').optional().trim(),
  body('semester').optional().isInt({ min: 1, max: 8 }).toInt(),
];

export const validateDeleteExam = [
  param('id').isInt(),
];