const CONTACT_LINKS = {
  telegram: "https://t.me/POS_Service1_Bot"
};

const TG_CODE_KEY = "tg_code";
const TG_CODE_TIME_KEY = "tg_code_time";
const TG_CODE_TTL_MS = 24 * 60 * 60 * 1000;

function generateTgCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const part1 = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part2 = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `TG-${part1}-${part2}`;
}

function getOrCreateTgCode() {
  const now = Date.now();

  try {
    const storedCode = localStorage.getItem(TG_CODE_KEY);
    const storedAt = Number(localStorage.getItem(TG_CODE_TIME_KEY) || 0);

    if (storedCode && now - storedAt < TG_CODE_TTL_MS) {
      return storedCode;
    }

    const code = generateTgCode();
    localStorage.setItem(TG_CODE_KEY, code);
    localStorage.setItem(TG_CODE_TIME_KEY, String(now));
    return code;
  } catch {
    return generateTgCode();
  }
}

function appendParam(url, key, value) {
  try {
    const parsed = new URL(url, window.location.href);
    parsed.searchParams.set(key, value);
    return parsed.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }
}

function normalizeChannel(channel) {
  if (channel === "tg") return "telegram";
  return channel;
}

function trackTelegramClick(channel, code = getOrCreateTgCode()) {
  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", "TelegramClick", {
      channel,
      code,
      page_url: window.location.href
    });
  }
}

function buildContactUrl(channel, code) {
  const normalized = normalizeChannel(channel);
  const url = CONTACT_LINKS[normalized];

  if (!url) return "";
  if (normalized === "telegram") return appendParam(url, "start", code);
  return url;
}

function openContact(channel) {
  const normalized = normalizeChannel(channel);
  const code = getOrCreateTgCode();
  const url = buildContactUrl(normalized, code);

  if (!url) return;

  trackTelegramClick(normalized, code);
  window.open(url, "_blank", "noopener,noreferrer");
}

// PageView is fired by the HTML Meta Pixel snippet. These keep existing imports compatible.
function trackPageView() {}
function trackButtonClick() {}
function trackFormSubmit() {}
function trackCalculatorInteraction() {}

function trackContactClick(contactType) {
  openContact(contactType);
}

function trackEvent(eventName, customData = {}) {
  if (eventName === "TelegramClick") {
    trackTelegramClick(customData.channel || "contact", customData.code);
  }
}

export {
  trackPageView,
  trackButtonClick,
  trackFormSubmit,
  trackCalculatorInteraction,
  trackContactClick,
  trackEvent,
  trackTelegramClick,
  openContact
};
