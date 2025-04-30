// Sjekk om brukeren er logget inn
async function checkAuth() {
  try {
      // Sjekk om bruker finnes i localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
          console.log('Ingen bruker funnet i localStorage');
          redirectToLogin();
          return null;
      }
      
      // Sjekk om sesjonen fortsatt er gyldig
      const response = await fetch('/api/user');
      
      if (!response.ok) {
          // Hvis API-kallet feiler, er sesjonen sannsynligvis utløpt
          console.log('Sesjon utløpt eller ugyldig');
          localStorage.removeItem('user');
          redirectToLogin();
          return null;
      }
      
      const data = await response.json();
      const user = data.user;
      
      // Sjekk om bruker har tilgang til siden basert på rolle
      const currentPath = window.location.pathname;
      
      if (user.rolle === 'lærer' && currentPath.includes('/student/')) {
          window.location.href = '/teacher/dashboard.html';
          return null;
      }
      
      if (user.rolle === 'elev' && currentPath.includes('/teacher/')) {
          window.location.href = '/student/dashboard.html';
          return null;
      }
      
      return user;
  } catch (error) {
      console.error('Feil ved autentisering:', error);
      redirectToLogin();
      return null;
  }
}

// Omdiriger til innloggingssiden
function redirectToLogin() {
  window.location.href = '/login.html';
}

// Logg ut funksjon
async function logout() {
  try {
      await fetch('/api/logout', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          }
      });
      
      // Fjern bruker fra localStorage
      localStorage.removeItem('user');
      
      // Omdiriger til hovedsiden
      window.location.href = '/index.html';
  } catch (error) {
      console.error('Feil ved utlogging:', error);
      alert('Noe gikk galt ved utlogging. Prøv igjen senere.');
  }
}

// Sett opp autentisering når siden lastes
document.addEventListener('DOMContentLoaded', function() {
  // Sjekk autentisering
  checkAuth().then(user => {
      if (user) {
          // Sett velkommen-melding
          const welcomeMessage = document.getElementById('welcomeMessage');
          if (welcomeMessage) {
              welcomeMessage.textContent = `Velkommen, ${user.brukernavn}`;
          }
          
          // Legg til lytter for utloggingsknapp
          const logoutBtn = document.getElementById('logoutBtn');
          if (logoutBtn) {
              logoutBtn.addEventListener('click', function(e) {
                  e.preventDefault();
                  logout();
              });
          }
      }
  });
});