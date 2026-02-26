export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized  no user context' });
    }
    // Extracting role from user metadata 
    const role = req.user.user_metadata?.role;
    if (!role) {
      return res.status(403).json({ error: 'Forbidden  no role assigned' });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden  insufficient permissions' });
    }
    next();
  };
};