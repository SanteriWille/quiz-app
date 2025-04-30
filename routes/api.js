const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const quizController = require('../controllers/quizController');
const { isAuthenticated, isTeacher, isStudent } = require('../middleware/auth');
const submissionController = require('../controllers/submissionController');
const Quiz = require('../models/quiz');
const Question = require('../models/question');

// Autentiseringsruter
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/user', isAuthenticated, userController.getCurrentUser);

// Quiz-ruter for lærere
router.post('/quizzes', isAuthenticated, isTeacher, quizController.createQuiz);
router.get('/teacher/quizzes', isAuthenticated, isTeacher, quizController.getTeacherQuizzes);
router.get('/quizzes/:id', isAuthenticated, quizController.getQuizById);
router.post('/quizzes/:id/questions', isAuthenticated, isTeacher, quizController.addQuestion);
router.delete('/quizzes/:id', isAuthenticated, isTeacher, quizController.deleteQuiz);

// Quiz-ruter for elever
router.get('/quizzes', isAuthenticated, quizController.getAllQuizzes);

// Slett et spørsmål
router.delete('/questions/:id', isAuthenticated, isTeacher, quizController.deleteQuestion);

// Besvarelses-ruter
router.post('/submissions', isAuthenticated, isStudent, submissionController.createSubmission);
router.post('/submissions/answer', isAuthenticated, isStudent, submissionController.saveAnswer);
router.post('/submissions/result', isAuthenticated, isStudent, submissionController.saveResult);
router.get('/submissions/:id', isAuthenticated, submissionController.getSubmissionDetails);
router.get('/student/results', isAuthenticated, isStudent, submissionController.getStudentResults);

// Hent besvarelser for en quiz (lærer)
router.get('/teacher/quizzes/:id/submissions', isAuthenticated, isTeacher, quizController.getQuizSubmissions);

module.exports = router;