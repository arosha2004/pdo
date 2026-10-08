const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.appRole)) {
      return res.status(403).json({ 
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } 
      });
    }
    next();
  };
};

module.exports = requireRole;
