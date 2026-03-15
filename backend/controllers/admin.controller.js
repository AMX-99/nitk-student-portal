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

export const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const updated = await adminService.updateProfile(req.user.id, updates);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    const { signedUrl, publicUrl } = await adminService.generateAvatarUploadUrl(req.user.id);
    res.json({ signedUrl, publicUrl });
  } catch (err) {
    next(err);
  }
};