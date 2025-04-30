const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  secret: 'quiz-app-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 time
}));

// API-ruter
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Serve HTML filer
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Feilhåndtering
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Noe gikk galt!');
});

// Lærer ruter
app.get('/teacher/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'teacher', 'dashboard.html'));
});

// Elev ruter
app.get('/student/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'student', 'dashboard.html'));
});

// Lærer ruter
app.get('/teacher/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'teacher', 'dashboard.html'));
});

app.get('/teacher/edit-quiz.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'teacher', 'edit-quiz.html'));
});

// Elev ruter
app.get('/student/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'student', 'dashboard.html'));
});

app.get('/student/take-quiz.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'student', 'take-quiz.html'));
});

app.get('/student/result-details.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'student', 'result-details.html'));
});

// Lærer ruter
app.get('/teacher/quiz-results.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'teacher', 'quiz-results.html'));
});

// Start serveren
app.listen(PORT, () => {
  console.log(`Server kjører på http://localhost:${PORT}`);
});