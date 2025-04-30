document.addEventListener('DOMContentLoaded', function() {
  // Sjekk autentisering håndteres av auth.js
  
  // Referanser til DOM-elementer
  const quizList = document.getElementById('quizList');
  const createQuizBtn = document.getElementById('createQuizBtn');
  
  // Last inn lærerens quizer
  async function loadTeacherQuizzes() {
      try {
          const response = await fetch('/api/teacher/quizzes');
          
          if (!response.ok) {
              throw new Error('Kunne ikke hente quizer');
          }
          
          const data = await response.json();
          
          if (data.quizzes.length === 0) {
              quizList.innerHTML = '<p class="empty-state">Du har ikke opprettet noen quizer ennå.</p>';
              return;
          }
          
          quizList.innerHTML = '';
          
          data.quizzes.forEach(quiz => {
              const quizItem = document.createElement('div');
              quizItem.className = 'quiz-item';
              quizItem.innerHTML = `
                  <h3>${quiz.quiz_navn}</h3>
                  <p>Opprettet: ${new Date(quiz.opprettet_dato).toLocaleDateString()}</p>
                  <div class="actions">
                      <button class="edit" data-id="${quiz.id}">Rediger</button>
                      <button class="view-results" data-id="${quiz.id}">Se resultater</button>
                      <button class="delete" data-id="${quiz.id}">Slett</button>
                  </div>
              `;
              quizList.appendChild(quizItem);
              
              // Legg til hendelseslyttere for knappene
              quizItem.querySelector('.edit').addEventListener('click', () => {
                  window.location.href = `/teacher/edit-quiz.html?id=${quiz.id}`;
              });
              
              quizItem.querySelector('.view-results').addEventListener('click', () => {
                  window.location.href = `/teacher/quiz-results.html?id=${quiz.id}`;
              });
              
              quizItem.querySelector('.delete').addEventListener('click', async () => {
                  if (confirm('Er du sikker på at du vil slette denne quizen?')) {
                      await deleteQuiz(quiz.id);
                  }
              });
          });
          
      } catch (error) {
          console.error('Feil ved lasting av quizer:', error);
          quizList.innerHTML = '<p class="error">Kunne ikke laste quizer. Prøv igjen senere.</p>';
      }
  }
  
  // Slett en quiz
  async function deleteQuiz(quizId) {
      try {
          const response = await fetch(`/api/quizzes/${quizId}`, {
              method: 'DELETE'
          });
          
          if (!response.ok) {
              throw new Error('Kunne ikke slette quiz');
          }
          
          // Last inn quizer på nytt etter sletting
          loadTeacherQuizzes();
          
      } catch (error) {
          console.error('Feil ved sletting av quiz:', error);
          alert('Kunne ikke slette quiz. Prøv igjen senere.');
      }
  }
  
  // Håndter klikk på "Opprett ny quiz"-knappen
  createQuizBtn.addEventListener('click', function() {
      // Spør om quiz-navn
      const quizName = prompt('Skriv inn navnet på den nye quizen:');
      
      if (quizName) {
          createQuiz(quizName);
      }
  });
  
  // Opprett en ny quiz
  async function createQuiz(quizNavn) {
      try {
          const response = await fetch('/api/quizzes', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ quiz_navn: quizNavn })
          });
          
          if (!response.ok) {
              throw new Error('Kunne ikke opprette quiz');
          }
          
          const data = await response.json();
          
          // Omdiriger til redigeringssiden for quizen
          window.location.href = `/teacher/edit-quiz.html?id=${data.quiz.id}`;
          
      } catch (error) {
          console.error('Feil ved opprettelse av quiz:', error);
          alert('Kunne ikke opprette quiz. Prøv igjen senere.');
      }
  }
  
  // Last inn quizer når siden lastes
  loadTeacherQuizzes();
});