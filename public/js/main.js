document.addEventListener("DOMContentLoaded", () => {
  console.log("Application ORMVA/SM chargée.");

  // Fermer automatiquement les alertes Bootstrap
  document.querySelectorAll(".alert").forEach((alert) => {
    setTimeout(() => {
      const instance = bootstrap.Alert.getOrCreateInstance(alert);

      instance.close();
    }, 5000);
  });

  // Activer les tooltips Bootstrap
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
    new bootstrap.Tooltip(el);
  });

  // Activer les popovers Bootstrap
  document.querySelectorAll('[data-bs-toggle="popover"]').forEach((el) => {
    new bootstrap.Popover(el);
  });
});
