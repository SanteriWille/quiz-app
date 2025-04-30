document.addEventListener('DOMContentLoaded', function() {
  // Sjekk autentisering håndteres av auth.js
  
  // Hent besvarelse-id fra URL
  const urlParams = new URLSearchParams(window.location.search);
  const besvarelseId = urlParams.get('id');
  
  if (!besvarelseId) {
      window.location.href = '/student/dashboard.html';
      return;
  }
  
  // Referanser til DOM-elementer
  const quizTitle = document.getElementById('quizTitle');
  const scorePercentage = document.getElementById('scorePercentage');
  const scoreValue = document.getElementById('scoreValue');
  const totalQuestions = document.getElementById('totalQuestions');
  const completionDate = document.getElementById('completionDate');
  const questionsList = document.getElementById('questionsList');
  const backBtn = document.getElementById('backBtn');
  
  // Last inn besvarelsesdetaljer
  async function loadResultDetails() {
      try {
          const response = await fetch(`/api/submissions/${besvarelseId}`);
          
          if (!response.ok) {
              throw new Error('Kunne ikke hente besvarelsesdetaljer');
          }
          
          const data = await response.json();
          const submission = data.submission;
          
          // Sett quiz-tittel
          quizTitle.textContent = `Resultat: ${submission.quiz_navn}`;
          
          // Sett poengsum
          const correctAnswers = submission.svar.filter(answer => answer.er_riktig).length;
          const totalQuestionCount = submission.svar.length;
          const percentage = Math.round((correctAnswers / totalQuestionCount) * 100);
          
          scorePercentage.textContent = `${percentage}%`;
          scoreValue.textContent = correctAnswers;
          totalQuestions.textContent = totalQuestionCount;
          
          // Sett fullførtdato
          completionDate.textContent = new Date(submission.fullført_dato).toLocaleString();
          
          // Grupper svar etter spørsmål
          const groupedAnswers = {};
          
          submission.svar.forEach(answer => {
              if (!groupedAnswers[answer.spørsmål_id]) {
                  groupedAnswers[answer.spørsmål_id] = {
                      question: answer.spørsmålstekst,
                      correctAnswer: answer.riktig_svar,
                      userAnswer: answer.gitt_svar,
                      isCorrect: answer.er_riktig
                  };
              }
          });
          
          // Vis spørsmål og svar
          questionsList.innerHTML = '';
          
          Object.values(groupedAnswers).forEach((item, index) => {
              const questionItem = document.createElement('div');
              questionItem.className = 'question-item';
              
              questionItem.innerHTML = `
                  <h3>Spørsmål ${index + 1}: ${item.question}</h3>
                  <div class="answer ${item.isCorrect ? 'correct user-answer' : 'incorrect user-answer'}">
                      Ditt svar: ${item.userAnswer}
                  </div>
                  ${!item.isCorrect ? `<div class="answer correct">Riktig svar: ${item.correctAnswer}</div>` : ''}
              `;
              
              questionsList.appendChild(questionItem);
          });
          
      } catch (error) {
          console.error('Feil ved lasting av besvarelsesdetaljer:', error);
          quizTitle.textContent = 'Feil ved lasting av resultat';
          questionsList.innerHTML = '<p class="error">Kunne ikke laste besvarelsesdetaljer. Prøv igjen senere.</p>';
      }
  }
  
  // Håndter klikk på tilbake-knappen
  backBtn.addEventListener('click', function() {
      window.location.href = '/student/dashboard.html';
  });
  
  // Last inn besvarelsesdetaljer når siden lastes
  loadResultDetails();
});