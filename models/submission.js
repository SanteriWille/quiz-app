const db = require("../config/db");

class Submission {
  // Start en ny besvarelse
  static async create(elevId, quizId) {
    try {
      const [result] = await db.query(
        "INSERT INTO besvarelser (elev_id, quiz_id) VALUES (?, ?)",
        [elevId, quizId]
      );

      return { id: result.insertId, elev_id: elevId, quiz_id: quizId };
    } catch (error) {
      throw error;
    }
  }

  // Lagre et svar på et spørsmål
  static async saveAnswer(besvarelseId, spørsmålId, gittSvar, erRiktig) {
    try {
      console.log(
        `Lagrer svar: besvarelse=${besvarelseId}, spørsmål=${spørsmålId}, er_riktig=${erRiktig}`
      );

      const [result] = await db.query(
        "INSERT INTO elevsvar (besvarelse_id, spørsmål_id, gitt_svar, er_riktig) VALUES (?, ?, ?, ?)",
        [besvarelseId, spørsmålId, gittSvar, erRiktig ? 1 : 0]
      );

      return {
        id: result.insertId,
        besvarelse_id: besvarelseId,
        spørsmål_id: spørsmålId,
        gitt_svar: gittSvar,
        er_riktig: erRiktig,
      };
    } catch (error) {
      console.error("Error in saveAnswer:", error);
      throw error;
    }
  }

  // Hent alle besvarelser for en quiz
  static async getByQuizId(quizId) {
    try {
      const [submissions] = await db.query(
        `SELECT b.*, br.brukernavn as elev_navn, r.poengsum 
                FROM besvarelser b 
                JOIN brukere br ON b.elev_id = br.id 
                LEFT JOIN resultater r ON b.id = r.besvarelse_id 
                WHERE b.quiz_id = ?`,
        [quizId]
      );

      return submissions;
    } catch (error) {
      throw error;
    }
  }

  // Hent alle besvarelser for en elev
  static async getByStudentId(elevId) {
    try {
      const [submissions] = await db.query(
        `SELECT b.*, q.quiz_navn, r.poengsum 
                FROM besvarelser b 
                JOIN quiz q ON b.quiz_id = q.id 
                LEFT JOIN resultater r ON b.id = r.besvarelse_id 
                WHERE b.elev_id = ?`,
        [elevId]
      );

      return submissions;
    } catch (error) {
      throw error;
    }
  }

  // Hent detaljer for en besvarelse
  static async getById(id) {
    try {
      // Hent besvarelse
      const [submissions] = await db.query(
        `SELECT b.*, br.brukernavn as elev_navn, q.quiz_navn, r.poengsum 
                FROM besvarelser b 
                JOIN brukere br ON b.elev_id = br.id 
                JOIN quiz q ON b.quiz_id = q.id 
                LEFT JOIN resultater r ON b.id = r.besvarelse_id 
                WHERE b.id = ?`,
        [id]
      );

      if (submissions.length === 0) {
        return null;
      }

      const submission = submissions[0];

      // Hent svar
      const [answers] = await db.query(
        `SELECT e.*, s.spørsmålstekst, s.riktig_svar 
                FROM elevsvar e 
                JOIN spørsmål s ON e.spørsmål_id = s.id 
                WHERE e.besvarelse_id = ?`,
        [id]
      );

      submission.svar = answers;

      return submission;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Submission;
