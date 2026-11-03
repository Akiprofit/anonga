// Capacitor setup - runs after native context available
if (window.Capacitor) {
  const { App } = window.Capacitor.Plugins;

  if (App) {
    App.addListener('pause', () => {
      console.log('App paused');
    });

    App.addListener('resume', () => {
      console.log('App resumed');
    });

    App.addListener('backButton', () => {
      console.log('Back button pressed');
    });
  }
}
