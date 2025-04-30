const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
    // Registrer ny bruker
    static async register(brukernavn, passord, rolle) {
        try {
            // Sjekk om brukernavn allerede eksisterer
            const [eksisterende] = await db.query(
                'SELECT * FROM brukere WHERE brukernavn = ?', 
                [brukernavn]
            );
            
            if (eksisterende.length > 0) {
                throw new Error('Brukernavnet er allerede i bruk');
            }
            
            // Hash passordet
            const hashedPassord = await bcrypt.hash(passord, 10);
            
            // Lagre bruker i databasen
            const [result] = await db.query(
                'INSERT INTO brukere (brukernavn, passord, rolle) VALUES (?, ?, ?)',
                [brukernavn, hashedPassord, rolle]
            );
            
            return { id: result.insertId, brukernavn, rolle };
        } catch (error) {
            throw error;
        }
    }
    
    // Logg inn bruker
    static async login(brukernavn, passord) {
        try {
            // Finn bruker i databasen
            const [users] = await db.query(
                'SELECT * FROM brukere WHERE brukernavn = ?',
                [brukernavn]
            );
            
            if (users.length === 0) {
                throw new Error('Ugyldig brukernavn eller passord');
            }
            
            const user = users[0];
            
            // Sjekk passord
            const isMatch = await bcrypt.compare(passord, user.passord);
            
            if (!isMatch) {
                throw new Error('Ugyldig brukernavn eller passord');
            }
            
            // Ikke returner passordet
            const { passord: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            throw error;
        }
    }
    
    // Hent bruker ved ID
    static async getById(id) {
        try {
            const [users] = await db.query(
                'SELECT id, brukernavn, rolle FROM brukere WHERE id = ?',
                [id]
            );
            
            if (users.length === 0) {
                return null;
            }
            
            return users[0];
        } catch (error) {
            throw error;
        }
    }
    
    // Hent alle lærere
    static async getAllTeachers() {
        try {
            const [teachers] = await db.query(
                'SELECT id, brukernavn FROM brukere WHERE rolle = "lærer"'
            );
            
            return teachers;
        } catch (error) {
            throw error;
        }
    }
    
    // Hent alle elever
    static async getAllStudents() {
        try {
            const [students] = await db.query(
                'SELECT id, brukernavn FROM brukere WHERE rolle = "elev"'
            );
            
            return students;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;