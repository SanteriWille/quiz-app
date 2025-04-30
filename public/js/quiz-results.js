document.addEventListener("DOMContentLoaded", function () {
  // Sjekk autentisering håndteres av auth.js

  // Hent quiz-id fra URL
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get("id");

  if (!quizId) {
    window.location.href = "/teacher/dashboard.html";
    return;
  }

  // Referanser til DOM-elementer
  const quizTitle = document.getElementById("quizTitle");
  const totalSubmissions = document.getElementById("totalSubmissions");
  const averageScore = document.getElementById("averageScore");
  const highestScore = document.getElementById("highestScore");
  const submissionsList = document.getElementById("submissionsList");
  const questionsStats = document.getElementById("questionsStats");
  const backBtn = document.getElementById("backBtn");

  // Last inn quiz og resultater
  async function loadQuizResults() {
    try {
      // Hent quiz-info
      const quizResponse = await fetch(`/api/quizzes/${quizId}`);

      if (!quizResponse.ok) {
        throw new Error("Kunne ikke hente quiz");
      }

      const quizData = await quizResponse.json();
      quizTitle.textContent = `Resultater: ${quizData.quiz.quiz_navn}`;

      // Sjekk at spørsmålene finnes
      const questions = quizData.questions || [];

      // Hent besvarelser for quizen
      const submissionsResponse = await fetch(
        `/api/teacher/quizzes/${quizId}/submissions`
      );

      if (!submissionsResponse.ok) {
        throw new Error("Kunne ikke hente besvarelser");
      }

      const submissionsData = await submissionsResponse.json();

      // Håndter ingen besvarelser
      const submissions = submissionsData.submissions || [];

      if (submissions.length === 0) {
        totalSubmissions.textContent = "0";
        averageScore.textContent = "0%";
        highestScore.textContent = "0%";
        submissionsList.innerHTML =
          '<p class="empty-state">Ingen besvarelser for denne quizen ennå.</p>';

        // Vis spørsmålene selv om det ikke er noen besvarelser
        if (questions.length > 0) {
          questionsStats.innerHTML = "<h3>Spørsmål i denne quizen:</h3>";

          questions.forEach((question, index) => {
            const questionStatItem = document.createElement("div");
            questionStatItem.className = "question-stat-item";
            questionStatItem.innerHTML = `
                          <h3>Spørsmål ${index + 1}: ${
              question.spørsmålstekst
            }</h3>
                          <p>Riktig svar: ${question.riktig_svar}</p>
                      `;
            questionsStats.appendChild(questionStatItem);
          });
        } else {
          questionsStats.innerHTML =
            '<p class="empty-state">Ingen spørsmål i denne quizen ennå.</p>';
        }

        return;
      }

      // Oppsummering
      const totalSubmissionsCount = submissions.length;
      totalSubmissions.textContent = totalSubmissionsCount;

      // Beregn statistikk
      let totalScore = 0;
      let maxScore = 0;
      const questionStats = {};

      // Initialiser spørsmålsstatistikk
      questions.forEach((question) => {
        questionStats[question.id] = {
          id: question.id,
          text: question.spørsmålstekst,
          correctAnswer: question.riktig_svar,
          correct: 0,
          total: 0,
        };
      });

      // Gå gjennom besvarelser for å beregne statistikk
      submissions.forEach((submission) => {
        // Sjekk at submission.svar er definert
        const answers = submission.svar || [];

        // Regn ut prosentvis score for denne besvarelsen
        if (submission.poengsum !== null && submission.total_spørsmål > 0) {
          const submissionScore =
            (submission.poengsum / submission.total_spørsmål) * 100;
          totalScore += submissionScore;
          maxScore = Math.max(maxScore, submissionScore);

          // Oppdater statistikk for hvert spørsmål
          answers.forEach((answer) => {
            if (questionStats[answer.spørsmål_id]) {
              questionStats[answer.spørsmål_id].total++;
              if (answer.er_riktig) {
                questionStats[answer.spørsmål_id].correct++;
              }
            }
          });
        }
      });

      // Vis gjennomsnitt og høyeste score
      const avgScore =
        totalSubmissionsCount > 0
          ? Math.round(totalScore / totalSubmissionsCount)
          : 0;
      averageScore.textContent = `${avgScore}%`;
      highestScore.textContent = `${Math.round(maxScore)}%`;

      // Vis besvarelser
      submissionsList.innerHTML = "";

      submissions.forEach((submission) => {
        const submissionItem = document.createElement("div");
        submissionItem.className = "submission-item";

        // Beregn prosent riktig
        const percentCorrect =
          submission.total_spørsmål > 0
            ? Math.round(
                (submission.poengsum / submission.total_spørsmål) * 100
              )
            : 0;

        submissionItem.innerHTML = `
                  <h3>${submission.elev_navn || "Ukjent elev"}</h3>
                  <p>Fullført: ${new Date(
                    submission.fullført_dato
                  ).toLocaleString()}</p>
                  <p>Poengsum: ${submission.poengsum || 0} av ${
          submission.total_spørsmål || 0
        } (${percentCorrect}%)</p>
                  <div class="actions">
                      <button class="view-details" data-id="${
                        submission.id
                      }">Se detaljer</button>
                  </div>
              `;
        submissionsList.appendChild(submissionItem);

        // Legg til hendelseslytter for å se detaljer
        submissionItem
          .querySelector(".view-details")
          .addEventListener("click", () => {
            window.location.href = `/teacher/submission-details.html?id=${submission.id}`;
          });
      });

      // Vis spørsmålsstatistikk
      if (questions.length > 0) {
        questionsStats.innerHTML = "";

        // Debugging
        console.log("Questions:", questions);
        console.log("Submissions:", submissions);

        // Sammenstill statistikk på nytt ved å gå gjennom alle besvarelser og svar
        const statsMap = {};

        // Opprett en base for alle spørsmål
        questions.forEach((question) => {
          statsMap[question.id] = {
            id: question.id,
            text: question.spørsmålstekst,
            correctAnswer: question.riktig_svar,
            correct: 0,
            total: 0,
          };
        });

        // Gå gjennom alle besvarelser og svar
        submissions.forEach((submission) => {
          if (submission.svar && Array.isArray(submission.svar)) {
            submission.svar.forEach((answer) => {
              if (statsMap[answer.spørsmål_id]) {
                statsMap[answer.spørsmål_id].total++;

                if (answer.er_riktig) {
                  statsMap[answer.spørsmål_id].correct++;
                }
              }
            });
          }
        });

        console.log("Stats Map:", statsMap);

        // Vis statistikk for hvert spørsmål
        questions.forEach((question, index) => {
          const stat = statsMap[question.id];
          const percentCorrect =
            stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;

          const questionStatItem = document.createElement("div");
          questionStatItem.className = "question-stat-item";
          questionStatItem.innerHTML = `
          <h3>Spørsmål ${index + 1}: ${question.spørsmålstekst}</h3>
          <div class="stat-bar">
              <div class="stat-bar-fill" style="width: ${percentCorrect}%"></div>
          </div>
          <p>${stat.correct} av ${
            stat.total
          } elever svarte riktig (${percentCorrect}%)</p>
          <p>Riktig svar: ${question.riktig_svar}</p>
      `;
          questionsStats.appendChild(questionStatItem);
        });
      } else {
        questionsStats.innerHTML =
          '<p class="empty-state">Ingen spørsmål i denne quizen ennå.</p>';
      }
    } catch (error) {
      console.error("Feil ved lasting av quizresultater:", error);
      quizTitle.textContent = "Feil ved lasting av resultater";
      submissionsList.innerHTML =
        '<p class="error">Kunne ikke laste resultater. Prøv igjen senere.</p>';
      questionsStats.innerHTML =
        '<p class="error">Kunne ikke laste statistikk. Prøv igjen senere.</p>';
    }
  }

  // Håndter klikk på tilbake-knappen
  backBtn.addEventListener("click", function () {
    window.location.href = "/teacher/dashboard.html";
  });

  // Last inn resultater når siden lastes
  loadQuizResults();
});
