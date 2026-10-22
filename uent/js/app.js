import { initI18n, t } from "./i18n.js";
import { trackPageView } from "./tracking.js";

const $ = (selector, root = document) => root.querySelector(selector);

const tiers = [
  { name: "VIP 1", min: 10, max: 1000, rate: 0.029, base: 100 },
  { name: "VIP 2", min: 1001, max: 10000, rate: 0.032, base: 1001 },
  { name: "VIP 3", min: 10001, max: 30000, rate: 0.037, base: 10001 },
  { name: "VIP 4", min: 30001, max: 60000, rate: 0.042, base: 30001 },
  { name: "VIP 5", min: 60001, max: 100000, rate: 0.052, base: 60001 },
  { name: "VIP 6", min: 100001, max: 9999999, rate: 0.062, base: 100001 }
];

const state = {
  amount: 200,
  days: 30
};

let contactPopupTimer = null;
let contactPopupShown = false;
let contactModalVisible = false;

function fmt(value, digits = 2) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function compact(value) {
  return Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0
  });
}

function rateText(rate) {
  return `${(rate * 100).toFixed(2)}%`;
}

function rangeText(tier) {
  const max = tier.max === Infinity ? "300,000+" : compact(tier.max);
  return `${compact(tier.min)} - ${max} USDC`;
}

function compound(amount, rate, days) {
  return amount * Math.pow(1 + rate, days);
}

function getTier(amount) {
  return tiers.find((tier) => amount >= tier.min && amount <= tier.max) || tiers[0];
}

function featureIcon(index) {
  const icons = [
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5h16v10H4z"/><path d="M7 8.5V6h10v2.5M8 13h3M15 13h1"/><path d="M18 4.5l1 1.5 2 .3-1.4 1.4.3 2-1.9-.9-1.9.9.3-2L15 6.3l2-.3 1-1.5z"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 4v10l-7 4-7-4V7l7-4z"/><path d="M5 7l7 4 7-4M12 11v10M9 5.2l7 4"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7a6 6 0 0 1 9.5 2M16 17a6 6 0 0 1-9.5-2"/><path d="M17.5 5v4h-4M6.5 19v-4h4"/><circle cx="12" cy="12" r="2"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2M4 5l2-2M20 5l-2-2"/><path d="M7 20h10"/></svg>'
  ];
  return icons[index] || icons[0];
}

function projectionSvg() {
  const points = [30, 60, 90].map((days) => ({
    days,
    value: compound(state.amount, getTier(state.amount).rate, days)
  }));
  const maxValue = points[2].value;
  const minValue = state.amount;
  const range = Math.max(maxValue - minValue, 1);
  const coords = points.map((point) => ({
    x: 32 + ((point.days - 30) / 60) * 236,
    y: 102 - ((point.value - minValue) / range) * 66
  }));
  const line = coords.map((point) => `${point.x},${point.y}`).join(" ");

  return `
    <svg class="projection-svg" viewBox="0 0 300 142" role="img" aria-label="${t("calc.projectionTitle")} ">
      <defs>
        <linearGradient id="projectionFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1269e8" stop-opacity="0.16" />
          <stop offset="1" stop-color="#1269e8" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path class="projection-grid-line" d="M32 36H268M32 69H268M32 102H268" />
      <path class="projection-area" d="M32 102 L${coords[0].x} ${coords[0].y} L${coords[1].x} ${coords[1].y} L${coords[2].x} ${coords[2].y} L268 102 Z" />
      <polyline class="projection-line" points="${line}" />
      ${coords.map((point) => `<circle class="projection-point" cx="${point.x}" cy="${point.y}" r="4" />`).join("")}
      <text x="28" y="126">30d</text><text x="140" y="126">60d</text><text x="254" y="126">90d</text>
    </svg>
  `;
}

function nav() {
  return `
    <header class="topbar">
      <div class="container topbar-inner">
        <a class="brand" href="#top" aria-label="POS Mining">
          <img src="./images/pos-logo.png" alt="POS Mining" />
          <span>${t("brand.name")}</span>
        </a>
        <nav class="nav" aria-label="Main navigation">
          <a href="#features">${t("nav.features")}</a>
          <a href="#calculator">${t("nav.calculator")}</a>
          <a href="#vip">${t("nav.vip")}</a>
          <a href="#how">${t("nav.how")}</a>
          <a href="#faq">${t("nav.faq")}</a>
        </nav>
        <div class="top-actions">
          <button class="primary-button top-start-button" type="button" data-open-contact-modal>
            ${t("cta.startNow")}
          </button>
        </div>
      </div>
    </header>
  `;
}

function hero() {
  return `
    <section class="hero" id="top">
      <div class="hero-grid"></div>
      <div class="container hero-content">
        <div class="hero-copy-column">
          <div class="eyebrow">${t("hero.badge")}</div>
          <h1 class="hero-title">${t("hero.titleA")} <span>${t("hero.titleB")}</span></h1>
          <p class="hero-copy">${t("hero.desc")}</p>
          <div class="hero-actions">
            <a class="primary-button" href="#calculator">${t("cta.startNow")}</a>
            <a class="ghost-button" href="#features">${t("cta.explore")}</a>
          </div>
          <div class="hero-trust" aria-label="Infrastructure indicators">
            <span><i class="status-dot"></i>Polygon Network</span>
            <span><i class="status-dot"></i>Non-custodial</span>
            <span><i class="status-dot"></i>On-chain verified</span>
          </div>
        </div>

        <div class="hero-system" aria-label="Wallet to automated on-chain process">
          <div class="system-header">
            <span class="system-title"><img src="./images/pos-logo.png" alt="" aria-hidden="true" />LIVE SYSTEM MAP</span>
            <span class="system-status"><i class="status-dot"></i>Operational</span>
          </div>
          <img class="system-visual" src="./images/infrastructure-grid.svg" alt="On-chain infrastructure network visualization" />
          <div class="system-flow">
            <div class="system-node">
              <span class="system-icon">W</span>
              <strong>Wallet</strong>
              <small>User controlled</small>
            </div>
            <span class="system-connector"><i></i></span>
            <div class="system-node system-node-accent">
              <span class="system-icon">P</span>
              <strong>Polygon</strong>
              <small>Network layer</small>
            </div>
            <span class="system-connector"><i></i></span>
            <div class="system-node">
              <span class="system-icon">$</span>
              <strong>USDC</strong>
              <small>Supported asset</small>
            </div>
            <span class="system-connector"><i></i></span>
            <div class="system-node system-node-success">
              <span class="system-icon">A</span>
              <strong>Automated</strong>
              <small>On-chain process</small>
            </div>
          </div>
          <div class="system-footer">
            <span><b></b> Transparent activity</span>
            <span><b></b> No custody transfer</span>
          </div>
        </div>

        <div class="hero-metrics">
          <div class="hero-stat">
            <small>${t("hero.stat1.label")}</small>
            <strong>${t("hero.stat1.value")}</strong>
          </div>
          <div class="hero-stat">
            <small>${t("hero.stat2.label")}</small>
            <strong>${t("hero.stat2.value")}</strong>
          </div>
          <div class="hero-stat">
            <small>${t("hero.stat3.label")}</small>
            <strong>${t("hero.stat3.value")}</strong>
          </div>
          <div class="hero-stat hero-stat-status">
            <small>System status</small>
            <strong><i class="status-dot"></i>Online</strong>
          </div>
        </div>

        <div class="hero-console">
          <div class="console-panel">
            <div class="console-title">${t("hashpower.title")}</div>
            <div class="console-row">
              <div>
                <small>${t("hashpower.activeMiners")}</small>
                <strong>172,894</strong>
              </div>
              <div>
                <small>${t("hashpower.totalHash")}</small>
                <strong>44.8 ${t("hashpower.thPerS")}</strong>
              </div>
              <div>
                <small>${t("hashpower.uptime")}</small>
                <strong>99.98%</strong>
              </div>
            </div>
          </div>
          <div class="console-panel">
            <span class="compact-label">${t("calc.vipLine")}</span>
            <span class="compact-value">2.90% - 6.20%</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function features() {
  const data = [
    ["features.c1.k", "features.c1.t", "features.c1.d"],
    ["features.c2.k", "features.c2.t", "features.c2.d"],
    ["features.c3.k", "features.c3.t", "features.c3.d"],
    ["features.c4.k", "features.c4.t", "features.c4.d"]
  ];

  return `
    <section class="section" id="features">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="section-kicker">${t("overview.k")}</p>
            <h2 class="section-title">${t("features.title")}</h2>
            <p class="section-subtitle">${t("features.subtitle")}</p>
          </div>
          <a class="plain-button" href="#calculator">${t("cta.openCalc")}</a>
        </div>
        <div class="feature-grid">
          ${data.map(([k, title, desc], index) => `
            <article class="feature">
              <span class="feature-icon" aria-hidden="true">${featureIcon(index)}</span>
              <div class="feature-code">${t(k)}</div>
              <h3>${t(title)}</h3>
              <p>${t(desc)}</p>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function calculator() {
  const current = getTier(state.amount);

  return `
    <section class="section alt" id="calculator">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="section-kicker">${t("calc.title")}</p>
            <h2 class="section-title">${t("calc.h")}</h2>
            <p class="section-subtitle">${t("calc.subtitle")}</p>
          </div>
        </div>

        <div class="calc-layout">
          <div class="panel">
            <div class="field">
              <label for="amountInput">
                <span>${t("calc.amountLabel")}</span>
                <span id="amountMirror">${compact(state.amount)} USDC</span>
              </label>
              <input id="amountInput" type="number" min="10" max="9999999" step="1" value="${state.amount}" inputmode="numeric" />
              <div class="range-note">
                <span>10 USDC</span>
                <span>9,999,999 USDC</span>
              </div>
            </div>
            <div class="field">
              <label>${t("calc.periodLabel")}</label>
              <div class="periods">
                ${[30, 60, 90].map((days) => `
                  <button type="button" data-period="${days}" class="${state.days === days ? "active" : ""}">
                    ${days}${t("calc.daysSuffix")}
                  </button>
                `).join("")}
              </div>
            </div>
            <div class="tier-list">
              ${tiers.map((tier) => `
                <div class="tier-pill ${tier.name === current.name ? "active" : ""}">
                  <strong>${tier.name}</strong>
                  <span>${rateText(tier.rate)}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="panel">
            <div class="result-grid">
              <div class="result-card highlight">
                <small>${t("calc.vipTier")}</small>
                <strong id="tierName">${current.name}</strong>
              </div>
              <div class="result-card">
                <small>${t("vip.th3")}</small>
                <strong id="tierRate">${rateText(current.rate)}</strong>
              </div>
              <div class="result-card">
                <small>${t("calc.earn")}</small>
                <strong id="earningsValue">0.00 USDC</strong>
              </div>
              <div class="result-card">
                <small>${t("calc.after")} <span id="daysLabel">${state.days}</span>${t("calc.daysSuffix")}</small>
                <strong id="totalValue">0.00 USDC</strong>
              </div>
            </div>
            <div class="projection-block">
              <div class="projection-heading">
                <span>${t("calc.projectionTitle")}</span>
                <small>${t("calc.projectionNote")}</small>
              </div>
              <div id="projectionChart">${projectionSvg()}</div>
            </div>
            <p class="section-subtitle">${t("calc.note")}</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function vip() {
  return `
    <section class="section" id="vip">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="section-kicker">${t("vip.title")}</p>
            <h2 class="section-title">${t("vip.subtitle")}</h2>
            <p class="section-subtitle">${t("vip.note")}</p>
          </div>
        </div>
        <div class="vip-progress" aria-hidden="true">
          ${tiers.map((tier, index) => `
            <span class="vip-progress-step ${index === 0 ? "active" : ""}">
              <i>${index + 1}</i><b>${tier.name}</b>
            </span>
          `).join("")}
        </div>
        <div class="vip-grid">
          ${tiers.map((tier) => {
            const total = compound(tier.base, tier.rate, 30);
            return `
              <article class="vip-card">
                <h3>${tier.name}</h3>
                <div class="vip-rate">${rateText(tier.rate)}</div>
                <p>${rangeText(tier)}</p>
                <div class="vip-meta">
                  <span>${t("vip.th4")}: ${compact(tier.base)} USDC</span>
                  <strong>${fmt(total)} USDC</strong>
                </div>
              </article>
            `;
          }).join("")}
        </div>
      </div>
    </section>
  `;
}

function referral() {
  const career = [
    ["ref.c1.stage", "ref.c1.requirement", "ref.c1.reward"],
    ["ref.c2.stage", "ref.c2.requirement", "ref.c2.reward"],
    ["ref.c3.stage", "ref.c3.requirement", "ref.c3.reward"],
    ["ref.c4.stage", "ref.c4.requirement", "ref.c4.reward"]
  ];

  return `
    <section class="section alt" id="referral">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="section-kicker">${t("ref.title")}</p>
            <h2 class="section-title">${t("ref.subtitle")}</h2>
          </div>
        </div>
        <div class="ref-layout">
          <div class="ref-stack">
            <article class="ref-card">
              <div class="ref-percent">16%</div>
              <h3>${t("ref.l1.t")}</h3>
              <p>${t("ref.l1.d")}</p>
            </article>
            <article class="ref-card">
              <div class="ref-percent">10%</div>
              <h3>${t("ref.l2.t")}</h3>
              <p>${t("ref.l2.d")}</p>
            </article>
          </div>
          <div class="panel">
            <h3>${t("ref.career.t")}</h3>
            <div class="career-list">
              ${career.map(([stage, requirement, reward]) => `
                <div class="career-item">
                  <strong>${t(stage)}</strong>
                  <span>${t(requirement)}</span>
                  <b>${t(reward)}</b>
                </div>
              `).join("")}
            </div>
            <p class="section-subtitle">${t("ref.note")}</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function security() {
  return `
    <section class="section security-section" id="security">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="section-kicker">${t("security.kicker")}</p>
            <h2 class="section-title">${t("security.title")}</h2>
            <p class="section-subtitle">${t("security.subtitle")}</p>
          </div>
        </div>
        <div class="security-layout">
          <article class="security-column security-user">
            <span class="security-label">${t("security.control")}</span>
            <div class="security-item"><span class="security-glyph">W</span><div><strong>${t("security.wallet")}</strong><p>${t("security.walletDesc")}</p></div></div>
            <div class="security-item"><span class="security-glyph">$</span><div><strong>${t("security.asset")}</strong><p>${t("security.assetDesc")}</p></div></div>
          </article>
          <div class="security-route" aria-label="Wallet to on-chain process">
            <span>Wallet</span><i></i><span>Asset</span><i></i><span>Polygon</span><i></i><span>Process</span>
          </div>
          <article class="security-column security-system-column">
            <span class="security-label">${t("security.system")}</span>
            <div class="security-item"><span class="security-glyph">N</span><div><strong>${t("security.network")}</strong><p>${t("security.networkDesc")}</p></div></div>
            <div class="security-item"><span class="security-glyph">A</span><div><strong>${t("security.workflow")}</strong><p>${t("security.workflowDesc")}</p></div></div>
          </article>
          <div class="security-boundary"><span>${t("security.boundary")}</span><strong>${t("security.boundaryText")}</strong></div>
        </div>
      </div>
    </section>
  `;
}

function how() {
  const steps = [
    ["01", "how.s1.t", "how.s1.d"],
    ["02", "how.s2.t", "how.s2.d"],
    ["03", "how.s3.t", "how.s3.d"]
  ];

  return `
    <section class="section" id="how">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="section-kicker">${t("how.title")}</p>
            <h2 class="section-title">${t("how.subtitle")}</h2>
          </div>
        </div>
        <div class="steps">
          ${steps.map(([num, title, desc]) => `
            <article class="step-card">
              <div class="step-number">${num}</div>
              <span class="step-glyph" aria-hidden="true">${num === "01" ? "W" : num === "02" ? "$" : "A"}</span>
              <h3>${t(title)}</h3>
              <p>${t(desc)}</p>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function faq() {
  const items = [
    ["faq.q1", "faq.a1"],
    ["faq.q2", "faq.a2"],
    ["faq.q3", "faq.a3"],
    ["faq.q4", "faq.a4"],
    ["faq.q5", "faq.a5"],
    ["faq.q6", "faq.a6"]
  ];

  return `
    <section class="section alt" id="faq">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="section-kicker">${t("faq.title")}</p>
            <h2 class="section-title">${t("faq.subtitle")}</h2>
          </div>
        </div>
        <div class="faq-grid">
          ${items.map(([question, answer]) => `
            <details class="faq-item">
              <summary>
                <span class="faq-question">${t(question)}</span>
                <span class="faq-indicator" aria-hidden="true"></span>
              </summary>
              <div class="faq-answer">
                <p>${t(answer)}</p>
              </div>
            </details>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function contact() {
  return `
    <section class="contact-band" id="contact">
      <div class="container">
        <div class="contact-panel">
          <div>
            <h2 class="section-title">${t("contact.title")}</h2>
            <p>${t("contact.subtitle")}</p>
          </div>
          <div class="contact-buttons">
            <a class="primary-button contact-button" href="#contact" data-contact="telegram">
              <img src="./images/telegram.png" alt="" aria-hidden="true" />
              ${t("cta.contactTG")}
            </a>
          </div>
        </div>
      </div>
    </section>
  `;
}

function floatingContacts() {
  return `
    <div class="float-stack" aria-label="Contact options">
      <button class="float-contact" type="button" data-contact="telegram" aria-label="Telegram">
        <img src="./images/telegram.png" alt="" />
      </button>
    </div>
  `;
}

function footer() {
  const year = new Date().getFullYear();

  return `
    <footer class="footer">
      <div class="container footer-grid">
        <section class="footer-brand">
          <a class="footer-logo" href="#top" aria-label="POS Mining">
            <img src="./images/pos-logo.png" alt="" aria-hidden="true" />
            <strong>${t("brand.name")}</strong>
          </a>
          <p>${t("hero.desc")}</p>
          <div class="footer-socials">
            <button type="button" data-contact="telegram" aria-label="Telegram">
              <img src="./images/telegram.png" alt="" aria-hidden="true" />
              <span>Telegram</span>
            </button>
          </div>
        </section>

        <section class="footer-column">
          <h3>${t("footer.quickLinks")}</h3>
          <nav class="footer-links" aria-label="${t("footer.quickLinks")}">
            <a href="#top">${t("footer.backToTop")}</a>
            <a href="#features">${t("nav.features")}</a>
            <a href="#calculator">${t("nav.calculator")}</a>
            <a href="#vip">${t("nav.vip")}</a>
            <a href="#how">${t("nav.how")}</a>
            <a href="#faq">${t("nav.faq")}</a>
          </nav>
        </section>

        <section class="footer-column">
          <h3>${t("footer.contactUs")}</h3>
          <p class="footer-contact">${t("footer.contact")}</p>
          <div class="footer-trust" aria-label="Platform">
            <span>Polygon</span>
            <span>USDC</span>
            <span>24/7</span>
          </div>
        </section>
      </div>

      <div class="footer-bottom">
        <div class="container footer-bottom-inner">
          <span>© ${year} ${t("brand.name")} · ${t("footer.rights")}</span>
          <span>${t("footer.poweredBy")}</span>
        </div>
      </div>
    </footer>
  `;
}

function render() {
  document.title = t("meta.title") || "POS Mining";
  $("#app").innerHTML = `
    <div class="site-shell">
      ${nav()}
      ${hero()}
      ${features()}
      ${calculator()}
      ${vip()}
      ${referral()}
      ${security()}
      ${how()}
      ${faq()}
      ${contact()}
      ${footer()}
      ${floatingContacts()}
    </div>
  `;

  bindActions();
  updateCalculator();
}

function bindActions() {
  document.querySelectorAll("[data-contact]").forEach((node) => {
    node.addEventListener("click", (event) => {
      event.preventDefault();
      k2();
    });
  });

  document.querySelectorAll("[data-open-contact-modal]").forEach((button) => {
    button.addEventListener("click", () => k2());
  });

  const input = $("#amountInput");
  if (input) {
    input.addEventListener("input", () => {
      const raw = Number(input.value || 0);
      state.amount = Math.min(9999999, Math.max(10, raw || 10));
      updateCalculator();
    });
  }

  document.querySelectorAll("[data-period]").forEach((button) => {
    button.addEventListener("click", () => {
      state.days = Number(button.dataset.period);
      document.querySelectorAll("[data-period]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      updateCalculator();
    });
  });
}

function updateCalculator() {
  const tier = getTier(state.amount);
  const total = compound(state.amount, tier.rate, state.days);
  const earnings = total - state.amount;

  const amountMirror = $("#amountMirror");
  const tierName = $("#tierName");
  const tierRate = $("#tierRate");
  const earningsValue = $("#earningsValue");
  const totalValue = $("#totalValue");
  const daysLabel = $("#daysLabel");

  if (amountMirror) amountMirror.textContent = `${compact(state.amount)} USDC`;
  if (tierName) tierName.textContent = tier.name;
  if (tierRate) tierRate.textContent = rateText(tier.rate);
  if (earningsValue) earningsValue.textContent = `${fmt(earnings)} USDC`;
  if (totalValue) totalValue.textContent = `${fmt(total)} USDC`;
  if (daysLabel) daysLabel.textContent = String(state.days);
  const projectionChart = $("#projectionChart");
  if (projectionChart) projectionChart.innerHTML = projectionSvg();

  document.querySelectorAll(".tier-pill").forEach((node) => {
    const isActive = node.querySelector("strong")?.textContent === tier.name;
    node.classList.toggle("active", isActive);
  });
}

function contactModalHtml() {
  return `
    <div class="modal-backdrop" id="contactModal">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="contactModalTitle">
        <div class="modal-head">
          <h3 id="contactModalTitle">${t("contact.title")}</h3>
          <button class="modal-close" type="button" data-modal-close aria-label="Close">x</button>
        </div>
        <p>${t("contact.subtitle")}</p>
        <div class="modal-choices">
          <button class="modal-choice" type="button" data-modal-contact="telegram">
            <img src="./images/telegram.png" alt="" aria-hidden="true" />
            <span>${t("cta.contactTG")}</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function showContactModal(force = false) {
  if (contactPopupShown && !force) return;
  contactPopupShown = true;
  contactModalVisible = true;

  $("#contactModal")?.remove();
  document.body.insertAdjacentHTML("beforeend", contactModalHtml());

  $("#contactModal")?.addEventListener("click", (event) => {
    if (event.target.id === "contactModal") closeContactModal();
  });

  document.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", closeContactModal);
  });

  document.querySelectorAll("[data-modal-contact]").forEach((button) => {
    button.addEventListener("click", () => {
      k2();
      closeContactModal();
    });
  });
}

function closeContactModal() {
  contactModalVisible = false;
  $("#contactModal")?.remove();
}

function scheduleContactModal() {
  if (contactPopupTimer) clearTimeout(contactPopupTimer);
  contactPopupTimer = setTimeout(() => showContactModal(), 8000);
}

async function init() {
  if (document.readyState === "loading") {
    await new Promise((resolve) => document.addEventListener("DOMContentLoaded", resolve, { once: true }));
  }

  await initI18n();
  render();
  trackPageView();
  scheduleContactModal();

  const loading = $("#loading");
  if (loading) {
    loading.classList.add("hidden");
    setTimeout(() => loading.remove(), 220);
  }

  window.addEventListener("i18n:changed", () => {
    render();
    if (contactModalVisible) showContactModal(true);
  });
}

init().catch((error) => {
  console.error(error);
  document.body.innerHTML = `<main style="padding:40px;font-family:Arial,sans-serif"><h1>POS Mining</h1><p>Failed to load the page. Please refresh.</p></main>`;
});
