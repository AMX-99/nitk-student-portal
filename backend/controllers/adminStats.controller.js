import * as statsService from '../services/adminStats.service.js';

export const getStats = async (req, res, next) => {
  try {
    const stats = await statsService.getStats();
    res.json(stats);
  } catch (err) { next(err); }
};

export const getDeptDistribution = async (req, res, next) => {
  try {
    const data = await statsService.getDeptDistribution();
    res.json(data);
  } catch (err) { next(err); }
};