// ============================================================
// dashboard.js — Tableau de bord ORMVA/SM
// ============================================================

// Instances de graphiques déclarées en dehors de DOMContentLoaded
// pour rester accessibles au listener "resize" (corrige le bug de
// portée de la version précédente : "aoChart is not defined").
const charts = {};

document.addEventListener("DOMContentLoaded", () => {
  const data = window.DASHBOARD_DATA || {};

  const evolutionAO = data.evolutionAO || { labels: [], data: [] };
  const repartitionMarches = data.repartitionMarches || [];
  const budgetAnnuel = data.budgetAnnuel || { labels: [], data: [] };
  const repartitionDomaine = data.repartitionDomaine || [];

  const COLOR_AMBER = "#C88A34";
  const COLOR_AMBER_SOFT = "#E7B76A";
  const COLOR_DARK = "#1F2E28";
  const COLOR_INFO = "#3B6EA5";
  const COLOR_SUCCESS = "#2F8F5B";
  const COLOR_DANGER = "#D96C4B";
  const PIE_PALETTE = [
    COLOR_SUCCESS,
    COLOR_INFO,
    COLOR_DANGER,
    COLOR_AMBER,
    COLOR_AMBER_SOFT,
  ];

  // ==========================
  // Évolution des appels d'offres
  // ==========================
  const aoEl = document.getElementById("aoChart");
  if (aoEl && window.echarts) {
    charts.ao = echarts.init(aoEl);
    charts.ao.setOption({
      tooltip: { trigger: "axis" },
      grid: { left: 40, right: 16, top: 20, bottom: 30 },
      xAxis: { type: "category", data: evolutionAO.labels },
      yAxis: { type: "value" },
      color: [COLOR_AMBER],
      series: [
        {
          data: evolutionAO.data,
          type: "line",
          smooth: true,
          areaStyle: { color: "rgba(200, 138, 52, 0.12)" },
          lineStyle: { width: 3 },
        },
      ],
    });
  }

  // ==========================
  // Répartition des marchés par statut
  // ==========================
  const statusEl = document.getElementById("statusChart");
  if (statusEl && window.echarts) {
    charts.status = echarts.init(statusEl);
    charts.status.setOption({
      tooltip: { trigger: "item" },
      legend: { bottom: 0, textStyle: { fontSize: 11 } },
      color: PIE_PALETTE,
      series: [
        {
          type: "pie",
          radius: "62%",
          data: repartitionMarches,
          label: { fontSize: 11 },
        },
      ],
    });
  }

  // ==========================
  // Budget annuel
  // ==========================
  const budgetEl = document.getElementById("budgetChart");
  if (budgetEl && window.echarts) {
    charts.budget = echarts.init(budgetEl);
    charts.budget.setOption({
      tooltip: { trigger: "axis" },
      grid: { left: 40, right: 16, top: 20, bottom: 30 },
      xAxis: { type: "category", data: budgetAnnuel.labels },
      yAxis: { type: "value", name: "MDH" },
      color: [COLOR_DARK],
      series: [
        {
          type: "bar",
          data: budgetAnnuel.data,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    });
  }

  // ==========================
  // Répartition par domaine
  // ==========================
  const domainEl = document.getElementById("domainChart");
  if (domainEl && window.echarts) {
    charts.domain = echarts.init(domainEl);
    charts.domain.setOption({
      tooltip: { trigger: "item" },
      legend: { bottom: 0, textStyle: { fontSize: 11 } },
      color: PIE_PALETTE,
      series: [
        {
          type: "pie",
          radius: ["42%", "68%"],
          data: repartitionDomaine,
          label: { fontSize: 11 },
        },
      ],
    });
  }

  // ==========================
  // Animation des compteurs
  // ==========================
  function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      element.textContent = Math.floor(progress * (end - start) + start);
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }

  document.querySelectorAll("[data-counter]").forEach((el) => {
    const value = parseInt(el.getAttribute("data-counter"), 10);
    if (!isNaN(value)) animateValue(el, 0, value, 1000);
  });

  // ==========================
  // Animation "Activité récente"
  // ==========================
  document.querySelectorAll(".activity-item").forEach((item, index) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(20px)";
    setTimeout(() => {
      item.style.transition = "0.4s ease";
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    }, index * 150);
  });

  // ==========================
  // Export du graphique AO (image PNG)
  // ==========================
  const exportBtn = document.getElementById("exportAoChart");
  if (exportBtn && charts.ao) {
    exportBtn.addEventListener("click", () => {
      const url = charts.ao.getDataURL({
        type: "png",
        pixelRatio: 2,
        backgroundColor: "#fff",
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = "evolution-appels-offres.png";
      a.click();
    });
  }

  console.log(
    "%cTableau de bord ORMVA/SM chargé avec succès.",
    "color:#2F8F5B;font-weight:bold;",
  );
});

// ==========================
// Redimensionnement des graphiques
// ==========================
window.addEventListener("resize", () => {
  Object.values(charts).forEach((chart) => chart && chart.resize());
});
