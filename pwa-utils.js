// Test PWA functionality
console.log('Starting PWA functionality...');

// Check if service worker is registered
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    if (registrations.length > 0) {
      console.log('Service Worker is registered:', registrations[0]);
      console.log('Scope:', registrations[0].scope);
      console.log('State:', registrations[0].state);
    } else {
      console.log('No Service Worker registered');
    }
  }).catch(error => {
    console.error('Error getting service worker registrations:', error);
  });
} else {
  console.log('Service Worker not supported');
}

// Check if the app is installed
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('App is installed and running in standalone mode');
} else {
  console.log('App is not installed (running in browser)');
}
