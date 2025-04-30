document.addEventListener('DOMContentLoaded', function() {
  // Sjekk autentisering håndteres av auth.js
  
  // Hent quiz-id fra URL
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get('id');
  
  if (!quizId) {
      window.location.href = '/student/dashboard.html';
      return;
  }
  
  // Referanser til DOM-elementer
  const quizTitle = document.getElementById('quizTitle');
  const currentQuestion = document.getElementById('currentQuestion');
  const totalQuestions = document.getElementById('totalQuestions');
  const questionText = document.getElementById('questionText');
  const answerOptions = document.getElementById('answerOptions');
  const nextButton = document.getElementById('nextButton');
  const finishButton = document.getElementById('finishButton');
  const quizContent = document.getElementById('quizContent');
  const quizResult = document.getElementById('quizResult');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const totalQuestionsResult = document.getElementById('totalQuestionsResult');
  const percentageFill = document.getElementById('percentageFill');
  const percentageDisplay = document.getElementById('percentageDisplay');
  const returnToDashboard = document.getElementById('returnToDashboard');
  const progressFill = document.querySelector('.progress-fill');
  
  // Quiz-variabler
  let quiz = null;
  let questions = [];
  let currentQuestionIndex = 0;
  let userAnswers = [];
  let besvarelseId = null;
  
  // Last inn quizen
  async function loadQuiz() {
      try {
          const response = await fetch(`/api/quizzes/${quizId}`);
          
          if (!response.ok) {
              throw new Error('Kunne ikke hente quiz');
          }
          
          const data = await response.json();
          quiz = data.quiz;
          questions = data.questions;
          
          // Sett quiz-tittel
          quizTitle.textContent = quiz.quiz_navn;
          
          // Oppdater antall spørsmål
          totalQuestions.textContent = questions.length;
          totalQuestionsResult.textContent = questions.length;
          
          // Opprett besvarelse i databasen
          const besvarelseResponse = await fetch('/api/submissions', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ quiz_id: quizId })
          });
          
          if (!besvarelseResponse.ok) {
              throw new Error('Kunne ikke opprette besvarelse');
          }
          
          const besvarelseData = await besvarelseResponse.json();
          besvarelseId = besvarelseData.besvarelse.id;
          
          // Vis første spørsmål
          showQuestion(0);
          
      } catch (error) {
          console.error('Feil ved lasting av quiz:', error);
          quizTitle.textContent = 'Feil ved lasting av quiz';
          questionText.textContent = 'Kunne ikke laste quiz. Prøv igjen senere.';
      }
  }
  
  // Vis et spørsmål
  function showQuestion(index) {
      if (index >= questions.length) {
          finishQuiz();
          return;
      }
      
      const question = questions[index];
      
      // Oppdater spørsmålstekst
      questionText.textContent = question.spørsmålstekst;
      
      // Oppdater progresjon
      currentQuestion.textContent = index + 1;
      progressFill.style.width = `${((index + 1) / questions.length) * 100}%`;
      
      // Lag svaralternativer
      answerOptions.innerHTML = '';
      
      // Blande svaralternativene
      const answers = [
          { text: question.riktig_svar, correct: true },
          { text: question.feil_svar_1, correct: false },
          { text: question.feil_svar_2, correct: false },
          { text: question.feil_svar_3, correct: false }
      ];
      
      // Fisher-Yates shuffle algoritme
      for (let i = answers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [answers[i], answers[j]] = [answers[j], answers[i]];
      }
      
      answers.forEach((answer, i) => {
          const answerOption = document.createElement('div');
          answerOption.className = 'answer-option';
          answerOption.textContent = answer.text;
          answerOption.dataset.correct = answer.correct;
          
          answerOption.addEventListener('click', function() {
              // Fjern tidligere valg
              document.querySelectorAll('.answer-option').forEach(option => {
                  option.classList.remove('selected');
              });
              
              // Sett nytt valg
              this.classList.add('selected');
              
              // Aktiver neste-knappen
              nextButton.disabled = false;
          });
          
          answerOptions.appendChild(answerOption);
      });
      
      // Deaktiver neste-knappen til et svar er valgt
      nextButton.disabled = true;
      
      // Vis fullfør-knappen på siste spørsmål
      if (index === questions.length - 1) {
          nextButton.style.display = 'none';
          finishButton.style.display = 'block';
      } else {
          nextButton.style.display = 'block';
          finishButton.style.display = 'none';
      }
  }
  
  // Gå til neste spørsmål
  async function goToNextQuestion() {
      // Lagre svaret
      const selectedOption = document.querySelector('.answer-option.selected');
      
      if (!selectedOption) {
          alert('Vennligst velg et svar');
          return;
      }
      
      const question = questions[currentQuestionIndex];
      const isCorrect = selectedOption.dataset.correct === 'true';
      
      // Lagre svaret i databasen
      try {
          await fetch('/api/submissions/answer', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  besvarelse_id: besvarelseId,
                  spørsmål_id: question.id,
                  gitt_svar: selectedOption.textContent,
                  er_riktig: isCorrect
              })
          });
      } catch (error) {
          console.error('Feil ved lagring av svar:', error);
      }
      
      // Lagre svaret lokalt
      userAnswers.push({
          questionId: question.id,
          givenAnswer: selectedOption.textContent,
          isCorrect
      });
      
      // Gå til neste spørsmål
      currentQuestionIndex++;
      showQuestion(currentQuestionIndex);
  }
  
  // Fullfør quizen
  async function finishQuiz() {
      // Beregn poengsum
      const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
      const percentage = Math.round((correctAnswers / questions.length) * 100);
      
      // Vis resultatet
      quizContent.style.display = 'none';
      quizResult.style.display = 'block';
      
      scoreDisplay.textContent = correctAnswers;
      percentageFill.style.width = `${percentage}%`;
      percentageDisplay.textContent = percentage;
      
      // Lagre resultatet i databasen
      try {
          await fetch('/api/submissions/result', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  besvarelse_id: besvarelseId,
                  poengsum: correctAnswers
              })
          });
      } catch (error) {
          console.error('Feil ved lagring av resultat:', error);
      }
  }
  
  // Hendelseslyttere
  nextButton.addEventListener('click', goToNextQuestion);
  finishButton.addEventListener('click', goToNextQuestion);
  
  returnToDashboard.addEventListener('click', function() {
      window.location.href = '/student/dashboard.html';
  });
  
  // Last inn quizen når siden lastes
  loadQuiz();
});