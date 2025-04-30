const mysql = require('mysql2');

// Opprett en tilkoblingspool
const pool = mysql.createPool({
  host: 'localhost', // Endre hvis databasen er på en annen server
  user: 'root',      // Endre til din MySQL-bruker
  password: 'Passord4321',      // Endre til ditt MySQL-passord
  database: 'quizapp'
});

// Eksporterer promiseversjonen av pool for å bruke async/await
module.exports = pool.promise();