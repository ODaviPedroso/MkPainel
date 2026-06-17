// MKPainel — Mock data for the prototype
// Realistic Brazilian agency client list, Portuguese metrics

// Each account carries a remaining balance (saldo) and a daily burn rate.
// daysLeft = balance / dailyBurn (computed in components when needed)
const MOCK_ACCOUNTS = [
  { id: 1, name: "Loja Bella Moda", platform: "google", spent: 12450.30, conv: 248, ctr: 3.42, status: "active", roas: 4.2, balance: 3840.00, dailyBurn: 415.00 },
  { id: 2, name: "Loja Bella Moda", platform: "meta", spent: 8930.15, conv: 184, ctr: 2.18, status: "active", roas: 3.8, balance: 2960.00, dailyBurn: 297.00 },
  { id: 3, name: "Clínica Vitalis", platform: "google", spent: 6280.00, conv: 92, ctr: 4.10, status: "active", roas: 5.6, balance: 380.00, dailyBurn: 209.00 },
  { id: 4, name: "Clínica Vitalis", platform: "meta", spent: 4120.50, conv: 64, ctr: 1.92, status: "warning", roas: 2.9, balance: 1240.00, dailyBurn: 137.00 },
  { id: 5, name: "Auto Center Premium", platform: "google", spent: 18920.80, conv: 156, ctr: 2.84, status: "active", roas: 6.1, balance: 620.00, dailyBurn: 630.00 },
  { id: 6, name: "Auto Center Premium", platform: "meta", spent: 9420.25, conv: 88, ctr: 1.62, status: "active", roas: 3.2, balance: 4280.00, dailyBurn: 314.00 },
  { id: 7, name: "Restaurante Sabor Real", platform: "meta", spent: 3280.40, conv: 412, ctr: 5.28, status: "active", roas: 7.4, balance: 180.00, dailyBurn: 110.00 },
  { id: 8, name: "TechStart Brasil", platform: "google", spent: 24180.00, conv: 184, ctr: 3.92, status: "active", roas: 4.8, balance: 7820.00, dailyBurn: 806.00 },
  { id: 9, name: "TechStart Brasil", platform: "meta", spent: 16240.70, conv: 220, ctr: 2.94, status: "active", roas: 4.1, balance: 5180.00, dailyBurn: 541.00 },
  { id: 10, name: "Imobiliária Solar", platform: "google", spent: 8920.00, conv: 32, ctr: 2.10, status: "warning", roas: 2.4, balance: 980.00, dailyBurn: 297.00 },
  { id: 11, name: "Imobiliária Solar", platform: "meta", spent: 5180.30, conv: 28, ctr: 1.48, status: "paused", roas: 1.8, balance: 2100.00, dailyBurn: 0 },
  { id: 12, name: "Pet Shop Amigo Fiel", platform: "meta", spent: 2840.60, conv: 168, ctr: 4.72, status: "active", roas: 5.9, balance: 1620.00, dailyBurn: 94.00 },
  { id: 13, name: "Construtora Horizonte", platform: "google", spent: 32480.00, conv: 64, ctr: 2.20, status: "active", roas: 8.2, balance: 12480.00, dailyBurn: 1082.00 },
  { id: 14, name: "Academia Forte", platform: "meta", spent: 4280.90, conv: 312, ctr: 3.88, status: "active", roas: 4.6, balance: 280.00, dailyBurn: 142.00 },
  { id: 15, name: "Escola Aurora", platform: "google", spent: 7820.40, conv: 88, ctr: 3.18, status: "active", roas: 4.3, balance: 3120.00, dailyBurn: 260.00 },
  { id: 16, name: "Escola Aurora", platform: "meta", spent: 5120.80, conv: 64, ctr: 2.42, status: "active", roas: 3.5, balance: 1840.00, dailyBurn: 170.00 },
  { id: 17, name: "Joalheria Lúmen", platform: "meta", spent: 6480.20, conv: 48, ctr: 1.94, status: "warning", roas: 2.6, balance: 540.00, dailyBurn: 216.00 },
  { id: 18, name: "Café Origem", platform: "meta", spent: 1840.50, conv: 124, ctr: 4.18, status: "active", roas: 5.2, balance: 920.00, dailyBurn: 61.00 },
  { id: 19, name: "Studio Fotográfico Lente", platform: "google", spent: 3120.40, conv: 56, ctr: 3.02, status: "active", roas: 3.9, balance: 1480.00, dailyBurn: 104.00 },
  { id: 20, name: "Distribuidora Norte", platform: "google", spent: 14820.00, conv: 102, ctr: 2.68, status: "active", roas: 5.1, balance: 6280.00, dailyBurn: 494.00 },
];

const ALERTS = [
  { id: 1, type: "amber", title: "Orçamento próximo do limite", msg: "Auto Center Premium (Google) já consumiu 87% do orçamento mensal — restam 4 dias.", time: "há 12 min", icon: "alert" },
  { id: 2, type: "red", title: "ROAS abaixo da meta", msg: "Imobiliária Solar (Meta) caiu para 1.8x. Meta definida: 3.0x.", time: "há 38 min", icon: "trend-down" },
  { id: 3, type: "green", title: "Pico de conversões", msg: "Restaurante Sabor Real teve 47 conversões nas últimas 2h — +180% vs média.", time: "há 1h", icon: "trend-up" },
  { id: 4, type: "blue", title: "Nova conta detectada", msg: "Clínica Estética Bem Estar foi adicionada à sua MCC. Quer importar?", time: "há 2h", icon: "plus" },
  { id: 5, type: "amber", title: "CTR em queda", msg: "Joalheria Lúmen — CTR caiu 32% nos últimos 7 dias.", time: "há 3h", icon: "alert" },
];

const AI_INSIGHTS = [
  {
    id: 1,
    title: "Realocar R$ 2.400 de Imobiliária Solar para Restaurante Sabor Real",
    msg: "Sabor Real está com ROAS 7.4x mas budget esgotando às 14h. Solar tem ROAS 1.8x e budget folgado.",
    impact: "+R$ 8.200 em receita projetada / mês",
  },
  {
    id: 2,
    title: "Pausar 3 anúncios de baixa performance na Joalheria Lúmen",
    msg: "Detectei 3 criativos com CTR < 0.8% e CPA 4x acima da média. Continuar gastando neles representa R$ 1.840/mês desperdiçado.",
    impact: "Economia de R$ 1.840/mês",
  },
  {
    id: 3,
    title: "Aumentar lance no Search da Construtora Horizonte",
    msg: "Você está perdendo 38% das impressões no topo. ROAS está em 8.2x — há margem para escalar.",
    impact: "+R$ 12.000 em receita projetada / mês",
  },
];

// Generate sparkline path
function genSparkline(points = 12, trend = "up") {
  const pts = [];
  let y = 50 + Math.random() * 20;
  for (let i = 0; i < points; i++) {
    const drift = trend === "up" ? -2 : trend === "down" ? 2 : 0;
    y += (Math.random() - 0.5) * 12 + drift;
    y = Math.max(5, Math.min(75, y));
    pts.push([i * (100 / (points - 1)), y]);
  }
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
}

// Time series for the main spend chart (24 hours, hourly)
function genHourlySpend() {
  const hours = [];
  for (let h = 0; h < 24; h++) {
    // Realistic curve: low overnight, builds during day, peaks afternoon
    let base = 800;
    if (h >= 8 && h <= 22) base = 2400 + Math.sin((h - 8) / 14 * Math.PI) * 1800;
    if (h >= 12 && h <= 18) base += 800;
    base += (Math.random() - 0.5) * 600;
    hours.push({
      hour: h,
      google: Math.max(200, base * 0.6 + (Math.random() - 0.5) * 200),
      meta: Math.max(150, base * 0.4 + (Math.random() - 0.5) * 200),
    });
  }
  return hours;
}

// 30-day funnel
const FUNNEL = [
  { label: "Impressões", value: 4_280_540, rate: null, key: "impressions" },
  { label: "Cliques", value: 142_380, rate: 3.32, key: "clicks" },
  { label: "Conversões", value: 3_124, rate: 2.19, key: "conversions" },
  { label: "Clientes retidos (30d)", value: 1_870, rate: 59.86, key: "retained" },
];

window.MOCK_ACCOUNTS = MOCK_ACCOUNTS;
window.ALERTS = ALERTS;
window.AI_INSIGHTS = AI_INSIGHTS;
window.genSparkline = genSparkline;
window.genHourlySpend = genHourlySpend;
window.FUNNEL = FUNNEL;
