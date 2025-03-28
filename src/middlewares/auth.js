function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login'); // Or send 401 for APIs
}

function redirectIfAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/'); // or a dashboard page
  }
  next();
}

function ensureAdminOrOwner(req, res, next) {
  const roles = req.user?.user_role_assignments?.map(r => r.user_roles?.role_name) || [];

  if (roles.includes('admin') || roles.includes('owner')) {
    return next();
  }

  return res.status(403).send('Access denied: Admins only.');
}


module.exports = {
  ensureAuthenticated,
  redirectIfAuthenticated,
  ensureAdminOrOwner
};
