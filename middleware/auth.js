// Sjekk om brukeren er logget inn
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
      return res.status(401).json({ message: 'Ikke autorisert. Vennligst logg inn.' });
  }
  next();
};

// Sjekk om brukeren er en lærer
const isTeacher = (req, res, next) => {
  if (!req.session.user || req.session.user.rolle !== 'lærer') {
      return res.status(403).json({ message: 'Ikke tilgang. Kun for lærere.' });
  }
  next();
};

// Sjekk om brukeren er en elev
const isStudent = (req, res, next) => {
  if (!req.session.user || req.session.user.rolle !== 'elev') {
      return res.status(403).json({ message: 'Ikke tilgang. Kun for elever.' });
  }
  next();
};

module.exports = {
  isAuthenticated,
  isTeacher,
  isStudent
};