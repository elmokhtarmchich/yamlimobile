  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Save the event so it can be triggered later
    deferredPrompt = e;
    // Show the add to home screen button
    const a2hsButton = document.getElementById('a2hsButton');
    a2hsButton.style.display = 'block';

    a2hsButton.addEventListener('click', () => {
      // Hide the button after it's clicked
      a2hsButton.style.display = 'none';
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt = null;
      });
    });
  });
