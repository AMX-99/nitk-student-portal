import * as adminService from '../services/admin.service.js';

export const revokeUserSessions = async (req, res, next) => {
  try {
    const { userId } = req.params; // can be student UUID, teacher UUID, or auth UUID
    // Try to resolve to an auth_id
    const authId = await adminService.getAuthIdFromProfile(userId);
    if (!authId) {
      return res.status(404).json({ error: 'User not found' });
    }
    await adminService.revokeUserSessions(authId);
    res.json({ message: 'Sessions revoked successfully' });
  } catch (err) {
    next(err);
  }
};