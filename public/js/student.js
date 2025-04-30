document.addEventListener('DOMContentLoaded', function() {
  // Sjekk autentisering håndteres av auth.js
  
  // Referanser til DOM-elementer
  const quizList = document.getElementById('quizList');
  const resultsList = document.getElementById('resultsList');
  
  // Last inn tilgjengelige quizer
  async function loadAvailableQuizzes() {
      try {
          const response = await fetch('/api/quizzes');
          
          if (!response.ok) {
              throw new Error('Kunne ikke hente quizer');
          }
          
          const data = await response.json();
          
          if (data.quizzes.length === 0) {
              quizList.innerHTML = '<p class="empty-state">Det er ingen tilgjengelige quizer for øyeblikket.</p>';
              return;
          }
          
          quizList.innerHTML = '';
          
          data.quizzes.forEach(quiz => {
              const quizItem = document.createElement('div');
              quizItem.className = 'quiz-item';
              quizItem.innerHTML = `
                  <h3>${quiz.quiz_navn}</h3>
                  <p>Lærer: ${quiz.lærer_navn}</p>
                  <p>Opprettet: ${new Date(quiz.opprettet_dato).toLocaleDateString()}</p>
                  <div class="actions">
                      <button class="start-quiz" data-id="${quiz.id}">Start Quiz</button>
                  </div>
              `;
              quizList.appendChild(quizItem);
              
              // Legg til hendelseslytter for å starte quizen
              quizItem.querySelector('.start-quiz').addEventListener('click', () => {
                  window.location.href = `/student/take-quiz.html?id=${quiz.id}`;
              });
          });
          
      } catch (error) {
          console.error('Feil ved lasting av quizer:', error);
          quizList.innerHTML = '<p class="error">Kunne ikke laste quizer. Prøv igjen senere.</p>';
      }
  }
  
  // Last inn elevens resultater
  async function loadStudentResults() {
      try {
          const response = await fetch('/api/student/results');
          
          if (!response.ok) {
              throw new Error('Kunne ikke hente resultater');
          }
          
          const data = await response.json();
          
          if (data.results.length === 0) {
              resultsList.innerHTML = '<p class="empty-state">Du har ikke fullført noen quizer ennå.</p>';
              return;
          }
          
          resultsList.innerHTML = '';
          
          data.results.forEach(result => {
              const resultItem = document.createElement('div');
              resultItem.className = 'result-item';
              
              // Beregn prosent riktig
              const percentCorrect = Math.round((result.poengsum / result.total_spørsmål) * 100);
              
              resultItem.innerHTML = `
                  <h3>${result.quiz_navn}</h3>
                  <p>Fullført: ${new Date(result.fullført_dato).toLocaleString()}</p>
                  <p>Poengsum: ${result.poengsum} av ${result.total_spørsmål} (${percentCorrect}%)</p>
                  <div class="actions">
                      <button class="view-result" data-id="${result.besvarelse_id}">Se detaljer</button>
                  </div>
              `;
              resultsList.appendChild(resultItem);
              
              // Legg til hendelseslytter for å se resultatet
              resultItem.querySelector('.view-result').addEventListener('click', () => {
                  window.location.href = `/student/result-details.html?id=${result.besvarelse_id}`;
              });
          });
          
      } catch (error) {
          console.error('Feil ved lasting av resultater:', error);
          resultsList.innerHTML = '<p class="error">Kunne ikke laste resultater. Prøv igjen senere.</p>';
      }
  }
  
  // Last inn quizer og resultater når siden lastes
  loadAvailableQuizzes();
  loadStudentResults();
});