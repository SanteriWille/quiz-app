const Quiz = require('../models/quiz');
const Question = require('../models/question');
const Submission = require('../models/submission');

// Opprett en ny quiz
exports.createQuiz = async (req, res) => {
    try {
        const { quiz_navn } = req.body;
        const lærer_id = req.session.user.id;
        
        if (!quiz_navn) {
            return res.status(400).json({ message: 'Quiz-navn er påkrevd' });
        }
        
        const quiz = await Quiz.create(lærer_id, quiz_navn);
        
        res.status(201).json({ message: 'Quiz opprettet!', quiz });
    } catch (error) {
        console.error('Opprett quiz error:', error);
        res.status(500).json({ message: 'Kunne ikke opprette quiz' });
    }
};

// Hent alle quizer for innlogget lærer
exports.getTeacherQuizzes = async (req, res) => {
    try {
        const lærer_id = req.session.user.id;
        const quizzes = await Quiz.getByTeacher(lærer_id);
        
        res.json({ quizzes });
    } catch (error) {
        console.error('Hent quizer error:', error);
        res.status(500).json({ message: 'Kunne ikke hente quizer' });
    }
};

// Hent alle quizer (for elever)
exports.getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.getAll();
        
        res.json({ quizzes });
    } catch (error) {
        console.error('Hent alle quizer error:', error);
        res.status(500).json({ message: 'Kunne ikke hente quizer' });
    }
};

// Hent en quiz med ID
exports.getQuizById = async (req, res) => {
    try {
        const quizId = req.params.id;
        const quiz = await Quiz.getById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz ikke funnet' });
        }
        
        // Hent spørsmålene for quizen
        const questions = await Question.getByQuizId(quizId);
        
        res.json({ quiz, questions });
    } catch (error) {
        console.error('Hent quiz error:', error);
        res.status(500).json({ message: 'Kunne ikke hente quiz' });
    }
};

// Legg til spørsmål i en quiz
exports.addQuestion = async (req, res) => {
    try {
        const quizId = req.params.id;
        const { spørsmålstekst, riktig_svar, feil_svar_1, feil_svar_2, feil_svar_3 } = req.body;
        
        // Validere input
        if (!spørsmålstekst || !riktig_svar || !feil_svar_1 || !feil_svar_2 || !feil_svar_3) {
            return res.status(400).json({ message: 'Alle feltene er påkrevd' });
        }
        
        // Sjekk om quizen eksisterer og tilhører læreren
        const quiz = await Quiz.getById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz ikke funnet' });
        }
        
        if (quiz.lærer_id !== req.session.user.id) {
            return res.status(403).json({ message: 'Du har ikke tilgang til å endre denne quizen' });
        }
        
        // Legg til spørsmålet
        const question = await Question.create(
            quizId, 
            spørsmålstekst, 
            riktig_svar, 
            feil_svar_1, 
            feil_svar_2, 
            feil_svar_3
        );
        
        res.status(201).json({ message: 'Spørsmål lagt til!', question });
    } catch (error) {
        console.error('Legg til spørsmål error:', error);
        res.status(500).json({ message: 'Kunne ikke legge til spørsmål' });
    }
};

// Slett en quiz
exports.deleteQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;
        
        // Sjekk om quizen eksisterer og tilhører læreren
        const quiz = await Quiz.getById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz ikke funnet' });
        }
        
        if (quiz.lærer_id !== req.session.user.id) {
            return res.status(403).json({ message: 'Du har ikke tilgang til å slette denne quizen' });
        }
        
        // Slett quizen
        await Quiz.delete(quizId);
        
        res.json({ message: 'Quiz slettet!' });
    } catch (error) {
        console.error('Slett quiz error:', error);
        res.status(500).json({ message: 'Kunne ikke slette quiz' });
    }
};

// Slett et spørsmål
exports.deleteQuestion = async (req, res) => {
    try {
        const questionId = req.params.id;
        
        // Hent spørsmålet for å sjekke eierskap
        const [questions] = await db.query(
            `SELECT s.*, q.lærer_id 
             FROM spørsmål s 
             JOIN quiz q ON s.quiz_id = q.id 
             WHERE s.id = ?`,
            [questionId]
        );
        
        if (questions.length === 0) {
            return res.status(404).json({ message: 'Spørsmål ikke funnet' });
        }
        
        const question = questions[0];
        
        // Sjekk om quizen tilhører læreren
        if (question.lærer_id !== req.session.user.id) {
            return res.status(403).json({ message: 'Du har ikke tilgang til å slette dette spørsmålet' });
        }
        
        // Slett spørsmålet
        await Question.delete(questionId);
        
        res.json({ message: 'Spørsmål slettet!' });
    } catch (error) {
        console.error('Slett spørsmål error:', error);
        res.status(500).json({ message: 'Kunne ikke slette spørsmål' });
    }
};

// Hent alle besvarelser for en quiz
exports.getQuizSubmissions = async (req, res) => {
    try {
        const quizId = req.params.id;
        
        // Sjekk om quizen eksisterer og tilhører læreren
        const quiz = await Quiz.getById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz ikke funnet' });
        }
        
        if (quiz.lærer_id !== req.session.user.id) {
            return res.status(403).json({ message: 'Du har ikke tilgang til denne quizen' });
        }
        
        // Hent alle besvarelser for quizen med detaljer
        const submissions = await Submission.getByQuizId(quizId);
        
        // Legg til antall spørsmål for hver besvarelse
        const questions = await Question.getByQuizId(quizId);
        
        for (let submission of submissions) {
            submission.total_spørsmål = questions.length;
        }
        
        res.json({ submissions });
    } catch (error) {
        console.error('Hent besvarelser error:', error);
        res.status(500).json({ message: 'Kunne ikke hente besvarelser' });
    }
};