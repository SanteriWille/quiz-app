document.addEventListener('DOMContentLoaded', function() {
  // Sjekk autentisering håndteres av auth.js
  
  // Hent quiz-id fra URL
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get('id');
  
  if (!quizId) {
      window.location.href = '/teacher/dashboard.html';
      return;
  }
  
  // Referanser til DOM-elementer
  const quizTitle = document.getElementById('quizTitle');
  const questionList = document.getElementById('questionList');
  const addQuestionForm = document.getElementById('addQuestionForm');
  const backBtn = document.getElementById('backBtn');
  
  // Last inn quiz og spørsmål
  async function loadQuiz() {
      try {
          const response = await fetch(`/api/quizzes/${quizId}`);
          
          if (!response.ok) {
              throw new Error('Kunne ikke hente quiz');
          }
          
          const data = await response.json();
          
          // Sett quiz-tittel
          quizTitle.textContent = data.quiz.quiz_navn;
          
          // Vis spørsmål
          if (data.questions.length === 0) {
              questionList.innerHTML = '<p class="empty-state">Ingen spørsmål lagt til ennå.</p>';
              return;
          }
          
          questionList.innerHTML = '';
          
          data.questions.forEach(question => {
              const questionItem = document.createElement('div');
              questionItem.className = 'question-item';
              questionItem.innerHTML = `
                  <h3>${question.spørsmålstekst}</h3>
                  <ul class="answer-list">
                      <li class="correct">${question.riktig_svar} (Riktig)</li>
                      <li>${question.feil_svar_1}</li>
                      <li>${question.feil_svar_2}</li>
                      <li>${question.feil_svar_3}</li>
                  </ul>
                  <div class="actions">
                      <button class="delete" data-id="${question.id}">Slett spørsmål</button>
                  </div>
              `;
              questionList.appendChild(questionItem);
              
              // Legg til hendelseslytter for sletting av spørsmål
              questionItem.querySelector('.delete').addEventListener('click', () => {
                  if (confirm('Er du sikker på at du vil slette dette spørsmålet?')) {
                      deleteQuestion(question.id);
                  }
              });
          });
          
      } catch (error) {
          console.error('Feil ved lasting av quiz:', error);
          quizTitle.textContent = 'Feil ved lasting av quiz';
          questionList.innerHTML = '<p class="error">Kunne ikke laste quiz. Prøv igjen senere.</p>';
      }
  }
  
  // Legg til nytt spørsmål
  addQuestionForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const spørsmålstekst = document.getElementById('spørsmålstekst').value;
      const riktig_svar = document.getElementById('riktig_svar').value;
      const feil_svar_1 = document.getElementById('feil_svar_1').value;
      const feil_svar_2 = document.getElementById('feil_svar_2').value;
      const feil_svar_3 = document.getElementById('feil_svar_3').value;
      
      try {
          const response = await fetch(`/api/quizzes/${quizId}/questions`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  spørsmålstekst,
                  riktig_svar,
                  feil_svar_1,
                  feil_svar_2,
                  feil_svar_3
              })
          });
          
          if (!response.ok) {
              throw new Error('Kunne ikke legge til spørsmål');
          }
          
          // Tilbakestill skjemaet
          addQuestionForm.reset();
          
          // Last quiz på nytt for å vise det nye spørsmålet
          loadQuiz();
          
      } catch (error) {
          console.error('Feil ved tillegging av spørsmål:', error);
          alert('Kunne ikke legge til spørsmål. Prøv igjen senere.');
      }
  });
  
  // Slett et spørsmål
  async function deleteQuestion(questionId) {
      try {
          const response = await fetch(`/api/questions/${questionId}`, {
              method: 'DELETE'
          });
          
          if (!response.ok) {
              throw new Error('Kunne ikke slette spørsmål');
          }
          
          // Last quiz på nytt etter sletting
          loadQuiz();
          
      } catch (error) {
          console.error('Feil ved sletting av spørsmål:', error);
          alert('Kunne ikke slette spørsmål. Prøv igjen senere.');
      }
  }
  
  // Håndter klikk på tilbake-knappen
  backBtn.addEventListener('click', function() {
      window.location.href = '/teacher/dashboard.html';
  });
  
  // Last inn quiz når siden lastes
  loadQuiz();
});