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
  
  module.exports = {
    ensureAuthenticated,
    redirectIfAuthenticated
  };
  