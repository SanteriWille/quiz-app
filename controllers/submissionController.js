const Submission = require('../models/submission');
const Quiz = require('../models/quiz');
const Question = require('../models/question');

// Opprett en ny besvarelse
exports.createSubmission = async (req, res) => {
    try {
        const { quiz_id } = req.body;
        const elev_id = req.session.user.id;
        
        if (!quiz_id) {
            return res.status(400).json({ message: 'Quiz-ID er påkrevd' });
        }
        
        const besvarelse = await Submission.create(elev_id, quiz_id);
        
        res.status(201).json({ message: 'Besvarelse opprettet!', besvarelse });
    } catch (error) {
        console.error('Opprett besvarelse error:', error);
        res.status(500).json({ message: 'Kunne ikke opprette besvarelse' });
    }
};

// Lagre svar på et spørsmål
exports.saveAnswer = async (req, res) => {
    try {
        const { besvarelse_id, spørsmål_id, gitt_svar, er_riktig } = req.body;
        
        // Valider input
        if (!besvarelse_id || !spørsmål_id || gitt_svar === undefined || er_riktig === undefined) {
            return res.status(400).json({ message: 'Alle feltene er påkrevd' });
        }
        
        // Sjekk om besvarelsen tilhører eleven
        const besvarelse = await Submission.getById(besvarelse_id);
        
        if (!besvarelse || besvarelse.elev_id !== req.session.user.id) {
            return res.status(403).json({ message: 'Du har ikke tilgang til denne besvarelsen' });
        }
        
        // Lagre svaret
        const answer = await Submission.saveAnswer(
            besvarelse_id,
            spørsmål_id,
            gitt_svar,
            er_riktig
        );
        
        res.status(201).json({ message: 'Svar lagret!', answer });
    } catch (error) {
        console.error('Lagre svar error:', error);
        res.status(500).json({ message: 'Kunne ikke lagre svar' });
    }
};

// Lagre resultat for en besvarelse
exports.saveResult = async (req, res) => {
    try {
        const { besvarelse_id, poengsum } = req.body;
        
        // Valider input
        if (!besvarelse_id || poengsum === undefined) {
            return res.status(400).json({ message: 'Alle feltene er påkrevd' });
        }
        
        // Sjekk om besvarelsen tilhører eleven
        const besvarelse = await Submission.getById(besvarelse_id);
        
        if (!besvarelse || besvarelse.elev_id !== req.session.user.id) {
            return res.status(403).json({ message: 'Du har ikke tilgang til denne besvarelsen' });
        }
        
        // Lagre resultatet
        const result = await Submission.saveResult(besvarelse_id, poengsum);
        
        res.status(201).json({ message: 'Resultat lagret!', result });
    } catch (error) {
        console.error('Lagre resultat error:', error);
        res.status(500).json({ message: 'Kunne ikke lagre resultat' });
    }
};

// Hent besvarelse med detaljer
exports.getSubmissionDetails = async (req, res) => {
    try {
        const submissionId = req.params.id;
        const submission = await Submission.getById(submissionId);
        
        if (!submission) {
            return res.status(404).json({ message: 'Besvarelse ikke funnet' });
        }
        
        // Sjekk tilgang - kun læreren som eier quizen eller eleven som tok quizen kan se besvarelsen
        const isTeacher = req.session.user.rolle === 'lærer';
        const isStudent = req.session.user.rolle === 'elev';
        
        if (isStudent && submission.elev_id !== req.session.user.id) {
            return res.status(403).json({ message: 'Du har ikke tilgang til denne besvarelsen' });
        }
        
        if (isTeacher) {
            // Hent quiz-info for å sjekke om læreren eier quizen
            const quiz = await Quiz.getById(submission.quiz_id);
            if (quiz.lærer_id !== req.session.user.id) {
                return res.status(403).json({ message: 'Du har ikke tilgang til denne besvarelsen' });
            }
        }
        
        res.json({ submission });
    } catch (error) {
        console.error('Hent besvarelse error:', error);
        res.status(500).json({ message: 'Kunne ikke hente besvarelse' });
    }
};

// Hent alle besvarelser for en elev
exports.getStudentResults = async (req, res) => {
    try {
        const elevId = req.session.user.id;
        const submissions = await Submission.getByStudentId(elevId);
        
        // Konverter til resultater med ekstra info
        const results = await Promise.all(submissions.map(async (submission) => {
            // Hent antall spørsmål i quizen
            const questions = await Question.getByQuizId(submission.quiz_id);
            
            return {
                besvarelse_id: submission.id,
                quiz_id: submission.quiz_id,
                quiz_navn: submission.quiz_navn,
                fullført_dato: submission.fullført_dato,
                poengsum: submission.poengsum || 0,
                total_spørsmål: questions.length
            };
        }));
        
        res.json({ results });
    } catch (error) {
        console.error('Hent elevresultater error:', error);
        res.status(500).json({ message: 'Kunne ikke hente resultater' });
    }
};