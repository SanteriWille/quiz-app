document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  
  registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Fjern eventuelle forrige feilmeldinger
      document.querySelectorAll('.form-group').forEach(group => {
          group.classList.remove('error');
      });
      
      const brukernavn = document.getElementById('brukernavn').value;
      const passord = document.getElementById('passord').value;
      const rolle = document.getElementById('rolle').value;
      
      // Enkel validering
      let hasError = false;
      
      if (!brukernavn || brukernavn.length < 3) {
          document.getElementById('brukernavn').parentElement.classList.add('error');
          hasError = true;
      }
      
      if (!passord || passord.length < 6) {
          document.getElementById('passord').parentElement.classList.add('error');
          hasError = true;
      }
      
      if (!rolle) {
          document.getElementById('rolle').parentElement.classList.add('error');
          hasError = true;
      }
      
      if (hasError) return;
      
      try {
          const response = await fetch('/api/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ brukernavn, passord, rolle })
          });
          
          const data = await response.json();
          
          if (response.ok) {
              alert('Registrering vellykket! Du kan nå logge inn.');
              window.location.href = '/login.html';
          } else {
              alert(data.message || 'Registrering mislyktes');
          }
      } catch (error) {
          console.error('Feil ved registrering:', error);
          alert('Noe gikk galt. Prøv igjen senere.');
      }
  });
});