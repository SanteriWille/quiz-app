const db = require('../config/db');

class Question {
    // Legg til spørsmål i en quiz
    static async create(quizId, spørsmålstekst, riktigSvar, feilSvar1, feilSvar2, feilSvar3) {
        try {
            const [result] = await db.query(
                'INSERT INTO spørsmål (quiz_id, spørsmålstekst, riktig_svar, feil_svar_1, feil_svar_2, feil_svar_3) VALUES (?, ?, ?, ?, ?, ?)',
                [quizId, spørsmålstekst, riktigSvar, feilSvar1, feilSvar2, feilSvar3]
            );
            
            return { id: result.insertId, quiz_id: quizId, spørsmålstekst, riktig_svar: riktigSvar };
        } catch (error) {
            throw error;
        }
    }
    
    // Hent alle spørsmål for en quiz
    static async getByQuizId(quizId) {
        try {
            const [questions] = await db.query(
                'SELECT * FROM spørsmål WHERE quiz_id = ?',
                [quizId]
            );
            
            return questions;
        } catch (error) {
            throw error;
        }
    }
    
    // Slett et spørsmål
    static async delete(id) {
        try {
            await db.query('DELETE FROM spørsmål WHERE id = ?', [id]);
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Question;