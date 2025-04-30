document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  
  loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Fjern eventuelle forrige feilmeldinger
      document.querySelectorAll('.form-group').forEach(group => {
          group.classList.remove('error');
      });
      
      const brukernavn = document.getElementById('brukernavn').value;
      const passord = document.getElementById('passord').value;
      
      // Enkel validering
      let hasError = false;
      
      if (!brukernavn) {
          document.getElementById('brukernavn').parentElement.classList.add('error');
          hasError = true;
      }
      
      if (!passord) {
          document.getElementById('passord').parentElement.classList.add('error');
          hasError = true;
      }
      
      if (hasError) return;
      
      try {
          const response = await fetch('/api/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ brukernavn, passord })
          });
          
          const data = await response.json();
          
          if (response.ok) {
              // Lagre brukerinfo i localStorage for enkel tilgang i frontend
              localStorage.setItem('user', JSON.stringify(data.user));
              
              // Omdirigering basert på rolle
              if (data.user.rolle === 'lærer') {
                  window.location.href = '/teacher/dashboard.html';
              } else {
                  window.location.href = '/student/dashboard.html';
              }
          } else {
              alert(data.message || 'Feil brukernavn eller passord');
          }
      } catch (error) {
          console.error('Feil ved innlogging:', error);
          alert('Noe gikk galt. Prøv igjen senere.');
      }
  });
});