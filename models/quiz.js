const db = require('../config/db');

class Quiz {
    // Opprett ny quiz
    static async create(lærerId, quizNavn) {
        try {
            const [result] = await db.query(
                'INSERT INTO quiz (lærer_id, quiz_navn) VALUES (?, ?)',
                [lærerId, quizNavn]
            );
            
            return { id: result.insertId, lærer_id: lærerId, quiz_navn: quizNavn };
        } catch (error) {
            throw error;
        }
    }
    
    // Hent en quiz med ID
    static async getById(id) {
        try {
            const [quizzes] = await db.query(
                'SELECT q.*, b.brukernavn as lærer_navn FROM quiz q JOIN brukere b ON q.lærer_id = b.id WHERE q.id = ?',
                [id]
            );
            
            if (quizzes.length === 0) {
                return null;
            }
            
            return quizzes[0];
        } catch (error) {
            throw error;
        }
    }
    
    // Hent alle quizer
    static async getAll() {
        try {
            const [quizzes] = await db.query(
                'SELECT q.*, b.brukernavn as lærer_navn FROM quiz q JOIN brukere b ON q.lærer_id = b.id'
            );
            
            return quizzes;
        } catch (error) {
            throw error;
        }
    }
    
    // Hent alle quizer laget av en lærer
    static async getByTeacher(lærerId) {
        try {
            const [quizzes] = await db.query(
                'SELECT * FROM quiz WHERE lærer_id = ?',
                [lærerId]
            );
            
            return quizzes;
        } catch (error) {
            throw error;
        }
    }
    
    // Slett en quiz
    static async delete(id) {
        try {
            await db.query('DELETE FROM quiz WHERE id = ?', [id]);
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Quiz;