const AFORAPPLE_PUBLIC_PATHS = [
  "/",
  "/index.html",
  "/brochure.html",
  "/contact.html",
  "/privacy.html",
  "/terms.html",
  "/thank-you.html",
  "/teacher-guide.html",
  "/pilot-report.html"
];

const AFORAPPLE_SAMPLE_PATHS = [
  "/Alphabet.html",
  "/phonics.html",
  "/trace.html"
];

const AFORAPPLE_ACCESS_STORAGE_KEY = "aforapple-access-state";
const AFORAPPLE_REPORT_STORAGE_KEY = "aforapple-pilot-report";
const AFORAPPLE_CACHE_TTL = 19 * 60 * 60 * 1000;

function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

function getNormalizedPath() {
  const pathname = window.location.pathname || "/";
  if (pathname === "") {
    return "/";
  }
  return pathname;
}

function isPublicPath(pathname) {
  return AFORAPPLE_PUBLIC_PATHS.indexOf(pathname) !== -1;
}

function isSamplePath(pathname) {
  return AFORAPPLE_SAMPLE_PATHS.indexOf(pathname) !== -1;
}

function isProtectedPath(pathname) {
  return !isPublicPath(pathname) && !isSamplePath(pathname);
}

function parseJson(value, fallback) {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function getDeviceId() {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = "device-" + Math.random().toString(36).slice(2, 18);
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
}

function nowIso() {
  return new Date().toISOString();
}

function currentLessonSlug() {
  const path = getNormalizedPath();
  if (path === "/" || path === "/index.html") {
    return "home";
  }
  return path.replace(/^\//, "").replace(/\.html$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");
}

function getAccessHelpers() {
  if (window.AFORAPPLE_UTILS) {
    return window.AFORAPPLE_UTILS;
  }

  function getAccessState() {
    return parseJson(localStorage.getItem(AFORAPPLE_ACCESS_STORAGE_KEY), {
      state: "sample",
      label: "Sample lesson",
      deviceId: getDeviceId(),
      updatedAt: nowIso()
    });
  }

  function setAccessState(nextState) {
    const current = getAccessState();
    const merged = {
      state: nextState && nextState.state ? nextState.state : current.state,
      label: nextState && nextState.label ? nextState.label : current.label,
      schoolKey: nextState && nextState.schoolKey ? nextState.schoolKey : current.schoolKey,
      schoolName: nextState && nextState.schoolName ? nextState.schoolName : current.schoolName,
      accessLevel: nextState && nextState.accessLevel ? nextState.accessLevel : current.accessLevel,
      deviceId: getDeviceId(),
      updatedAt: nowIso()
    };
    localStorage.setItem(AFORAPPLE_ACCESS_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  }

  function getReport() {
    return parseJson(localStorage.getItem(AFORAPPLE_REPORT_STORAGE_KEY), {
      createdAt: nowIso(),
      lastSeenAt: nowIso(),
      deviceId: getDeviceId(),
      accessState: "sample",
      schoolKey: "",
      schoolName: "",
      lessonVisits: {}
    });
  }

  function saveReport(report) {
    report.deviceId = getDeviceId();
    report.lastSeenAt = nowIso();
    localStorage.setItem(AFORAPPLE_REPORT_STORAGE_KEY, JSON.stringify(report));
  }

  function renderAccessBadge(target, accessState) {
    const host = target || document.querySelector(".header") || document.body;
    const state = accessState || getAccessState();
    let badge = document.getElementById("aforapple-access-badge");

    if (!badge) {
      badge = document.createElement("div");
      badge.id = "aforapple-access-badge";
      badge.style.display = "inline-flex";
      badge.style.alignItems = "center";
      badge.style.padding = "8px 14px";
      badge.style.borderRadius = "999px";
      badge.style.fontFamily = "Arial, sans-serif";
      badge.style.fontWeight = "700";
      badge.style.fontSize = "14px";
      badge.style.marginTop = "12px";
      badge.style.boxShadow = "0 10px 24px rgba(11, 31, 53, 0.08)";
      badge.style.border = "1px solid rgba(27, 94, 32, 0.12)";
    }

    if (state.state === "pilot") {
      badge.style.background = "#fff4d6";
      badge.style.color = "#7a4f01";
    } else if (state.state === "licensed") {
      badge.style.background = "#e7f1ff";
      badge.style.color = "#0f4c81";
    } else {
      badge.style.background = "#edf7ed";
      badge.style.color = "#1b5e20";
    }

    const detail = state.schoolName ? " - " + state.schoolName : "";
    badge.textContent = (state.label || "Sample lesson") + detail;

    if (!badge.parentNode) {
      host.appendChild(badge);
    }

    return badge;
  }

  function recordLessonUsage(options) {
    const report = getReport();
    const accessState = options && options.accessState ? options.accessState : "sample";
    const slug = options && options.lessonSlug ? options.lessonSlug : currentLessonSlug();
    const title = options && options.title ? options.title : document.title;
    const schoolKey = options && options.schoolKey ? options.schoolKey : "";

    if (!report.lessonVisits[slug]) {
      report.lessonVisits[slug] = {
        slug: slug,
        title: title,
        accessState: accessState,
        schoolKey: schoolKey,
        firstSeen: nowIso(),
        lastSeen: nowIso(),
        sessionCount: 0
      };
    }

    report.accessState = accessState;
    report.lessonVisits[slug].title = title;
    report.lessonVisits[slug].accessState = accessState;
    report.lessonVisits[slug].schoolKey = schoolKey;
    report.lessonVisits[slug].lastSeen = nowIso();
    report.lessonVisits[slug].sessionCount += 1;
    saveReport(report);
  }

  return {
    getAccessState: getAccessState,
    setAccessState: setAccessState,
    renderAccessBadge: renderAccessBadge,
    recordLessonUsage: recordLessonUsage,
    getReport: getReport,
    saveReport: saveReport,
    getDeviceId: getDeviceId
  };
}

function accessStateFromResponse(resp) {
  const accessLevel = resp && resp.accessLevel ? String(resp.accessLevel).toLowerCase() : "";
  if (accessLevel === "licensed") {
    return {
      state: "licensed",
      label: "Licensed school access",
      accessLevel: resp.accessLevel
    };
  }
  if (accessLevel === "trial" || accessLevel === "pilot") {
    return {
      state: "pilot",
      label: "School pilot active",
      accessLevel: resp.accessLevel
    };
  }
  return {
    state: "sample",
    label: "Sample lesson",
    accessLevel: resp && resp.accessLevel ? resp.accessLevel : "Sample"
  };
}

function applyAccessDecorations(resp) {
  const helpers = getAccessHelpers();
  const current = helpers.getAccessState ? helpers.getAccessState() : {};
  const derived = accessStateFromResponse(resp);
  const schoolKey = resp && resp.schoolKey ? resp.schoolKey : current.schoolKey || getCookie("activationKey") || "";
  const schoolName = resp && resp.schoolName ? resp.schoolName : current.schoolName || "";
  const nextState = helpers.setAccessState({
    state: derived.state,
    label: derived.label,
    schoolKey: schoolKey,
    schoolName: schoolName,
    accessLevel: derived.accessLevel
  });

  const badgeHost =
    document.querySelector("[data-access-badge-target]") ||
    document.querySelector(".header") ||
    document.body;

  if (helpers.renderAccessBadge) {
    helpers.renderAccessBadge(badgeHost, nextState);
  }

  if (helpers.recordLessonUsage) {
    helpers.recordLessonUsage({
      accessState: nextState.state,
      lessonSlug: currentLessonSlug(),
      title: document.title,
      schoolKey: nextState.schoolKey || ""
    });
  }
}

function changeBackground(backgroundImages) {
  if (!backgroundImages || !backgroundImages.length) {
    return;
  }
  const randomIndex = Math.floor(Math.random() * backgroundImages.length);
  if (settings.backgroundEnabled) {
    document.body.style.backgroundImage = 'url("images/' + backgroundImages[randomIndex] + '")';
  }
}

function sampleDataAvailable() {
  return !!window.AFORAPPLE_SAMPLE_DATA;
}

function useSampleMode() {
  const sampleResponse = {
    status: "success",
    accessLevel: "Sample",
    data: window.AFORAPPLE_SAMPLE_DATA || null
  };
  passData(sampleResponse);
  applyAccessDecorations(sampleResponse);
}

function handlePublicPageWithoutValidation() {
  const helpers = getAccessHelpers();
  helpers.setAccessState({
    state: "sample",
    label: "Public school pilot page",
    schoolKey: "",
    schoolName: "",
    accessLevel: "Public"
  });
  const badgeTarget = document.querySelector("[data-access-badge-target]");
  if (badgeTarget && helpers.renderAccessBadge) {
    helpers.renderAccessBadge(badgeTarget, helpers.getAccessState());
  }
  if (helpers.recordLessonUsage) {
    helpers.recordLessonUsage({
      accessState: "sample",
      lessonSlug: currentLessonSlug(),
      title: document.title,
      schoolKey: ""
    });
  }
}

function passData(resp) {
  if (resp && resp.data != null) {
    const scopeElement = document.getElementById("controller");
    const ngScope = scopeElement && window.angular ? angular.element(scopeElement).scope() : null;

    if (ngScope && ngScope.initiate) {
      ngScope.$applyAsync(function() {
        ngScope.initiate(resp.data);
      });
    }

    if (resp.data.bg && resp.data.bg.length > 0) {
      changeBackground(resp.data.bg);
    }

    if (typeof attachListeners === "function") {
      setTimeout(attachListeners, 500);
    }
  }
}

function getCacheKeyFromUrl(url) {
  const match = url.match(/\/([\w-]+)(?:\.html)?(?:[#?].*)?$/);
  if (!match || !match[1]) {
    return "index";
  }
  if (match[1] === "aforapple.fun" || match[1] === "www") {
    return "index";
  }
  return match[1];
}

function validateKeyWithRateLimit(key, ipAddress) {
  const data = new URLSearchParams();
  data.append("key", key);
  data.append("action", "validate");
  data.append("deviceId", getDeviceId());
  data.append("ip", ipAddress);
  data.append("url", window.location.href);

  const cacheKey = getCacheKeyFromUrl(window.location.href);
  const cachedData = localStorage.getItem(cacheKey);
  const parsedCache = parseJson(cachedData, null);
  const now = new Date().getTime();

  if (parsedCache && parsedCache.cacheExpiry && now < parseInt(parsedCache.cacheExpiry, 10)) {
    passData(parsedCache);
    applyAccessDecorations(parsedCache);
    return;
  }

  sendReq(data, function(resp) {
    if (resp && resp.status === "success") {
      resp.cacheExpiry = now + AFORAPPLE_CACHE_TTL;
      localStorage.setItem(cacheKey, JSON.stringify(resp));
      passData(resp);
      applyAccessDecorations(resp);
      return;
    }

    if (isSamplePath(getNormalizedPath()) && sampleDataAvailable()) {
      useSampleMode();
      return;
    }

    if (isPublicPath(getNormalizedPath())) {
      handlePublicPageWithoutValidation();
      return;
    }

    document.body.remove();
    window.location.href = "/brochure.html";
  });
}

function checkKeyValidation() {
  const pathname = getNormalizedPath();
  const key = getCookie("activationKey");

  if (isSamplePath(pathname) && !key && sampleDataAvailable()) {
    useSampleMode();
    return;
  }

  if (isPublicPath(pathname) && !key) {
    handlePublicPageWithoutValidation();
    return;
  }

  if (!key && isProtectedPath(pathname)) {
    document.body.remove();
    window.location.href = "/brochure.html";
    return;
  }

  if (!key) {
    return;
  }

  getUserIP(function(ip) {
    if (ip || ip === "") {
      validateKeyWithRateLimit(key, ip || "");
    } else if (isSamplePath(pathname) && sampleDataAvailable()) {
      useSampleMode();
    } else if (isPublicPath(pathname)) {
      handlePublicPageWithoutValidation();
    } else {
      validateKeyWithRateLimit(key, "");
    }
  });
}

function sendReq(req, callback) {
  const url = "https://script.google.com/macros/s/AKfycbzCva51LDrstiplGk68iIy-ETx4OCoBo2bzqrRyGzndH4V3ypZz8av46bT5pxlXEHz7/exec";
  const date = new Date();
  req.append(
    "TS",
    date.getFullYear() +
      "-" +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + date.getDate()).slice(-2) +
      "T" +
      ("0" + date.getHours()).slice(-2) +
      "." +
      ("0" + date.getMinutes()).slice(-2) +
      "." +
      ("0" + date.getSeconds()).slice(-2)
  );

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: req
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      callback(data);
    })
    .catch(function(error) {
      console.error("Error:", error);
      callback({
        status: "error",
        message: "Network error"
      });
    });
}

function getUserIP(callback) {
  fetch("https://api.ipify.org?format=json")
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      callback(data.ip);
    })
    .catch(function(error) {
      console.error("Error fetching IP:", error);
      callback(null);
    });
}

function isAndroidWebViewOrSmartTV() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(userAgent);
  const isWebView = /(wv|webview)/.test(userAgent);
  const isSmartTV = /smart-tv|smarttv|appletv|googletv|hbbtv|netcast|viera|tizen|webos|sonydtv|firetv/.test(userAgent);
  const isMobile = /android|iphone|ipad|ipod|blackberry|bb|playbook|silk|opera mini|windows phone|iemobile/.test(userAgent);
  const isLaptopOrPC = !isMobile && !isSmartTV && !isAndroid && !isWebView;

  if (isAndroid && isWebView) {
    return "Android WebView";
  }
  if (isSmartTV) {
    return "Smart TV";
  }
  if (isMobile) {
    return "Mobile Device";
  }
  if (isLaptopOrPC) {
    return "Laptop or PC";
  }
  return "Other";
}

const deviceType = isAndroidWebViewOrSmartTV();

window.onload = function() {
  if (deviceType === "Android WebView") {
    checkKeyValidation();
  } else {
    checkKeyValidation();
  }
  initializeSettings();
};

const settings = {
  backgroundEnabled: false,
  animationsEnabled: false
};

function initializeSettings() {
  const storedSettings = parseJson(localStorage.getItem("siteSettings"), null);
  if (storedSettings) {
    settings.backgroundEnabled = !!storedSettings.backgroundEnabled;
    settings.animationsEnabled = !!storedSettings.animationsEnabled;
    settings.confettiEnabled = !!storedSettings.confettiEnabled;
    settings.bgAnimationEnabled = !!storedSettings.bgAnimationEnabled;
  }

  const backgroundToggle = document.getElementById("toggle-background");
  const animationToggle = document.getElementById("toggle-animations");
  const bgMotionToggle = document.getElementById("toggle-bg-motion");
  const confettiToggle = document.getElementById("toggle-confetti");

  if (backgroundToggle) {
    backgroundToggle.checked = settings.backgroundEnabled;
  }
  if (animationToggle) {
    animationToggle.checked = settings.animationsEnabled;
  }
  if (bgMotionToggle) {
    bgMotionToggle.checked = settings.bgAnimationEnabled;
  }
  if (confettiToggle) {
    confettiToggle.checked = settings.confettiEnabled;
  }

  applySettings();
}

function toggleSettingsPopup() {
  const popup = document.getElementById("settings-popup");
  if (popup) {
    popup.classList.toggle("hidden");
  }
}

function closeSettingsPopup() {
  const popup = document.getElementById("settings-popup");
  if (popup) {
    popup.classList.add("hidden");
  }
}

function toggleBackground() {
  const toggle = document.getElementById("toggle-background");
  settings.backgroundEnabled = !!(toggle && toggle.checked);
  localStorage.setItem("siteSettings", JSON.stringify(settings));
  applySettings();
  window.location.reload();
}

function toggleAnimations() {
  const toggle = document.getElementById("toggle-animations");
  settings.animationsEnabled = !!(toggle && toggle.checked);
  localStorage.setItem("siteSettings", JSON.stringify(settings));
  applySettings();
}

function toggleConfetti() {
  const toggle = document.getElementById("toggle-confetti");
  settings.confettiEnabled = !!(toggle && toggle.checked);
  localStorage.setItem("siteSettings", JSON.stringify(settings));
}

function toggleBgAnimations() {
  const toggle = document.getElementById("toggle-bg-motion");
  settings.bgAnimationEnabled = !!(toggle && toggle.checked);
  localStorage.setItem("siteSettings", JSON.stringify(settings));
  applySettings();
}

function applySettings() {
  if (!settings.backgroundEnabled) {
    document.body.style.backgroundImage = "none";
  }

  if (!settings.animationsEnabled) {
    document.body.classList.add("no-animations");
  } else {
    document.body.classList.remove("no-animations");
  }

  if (!settings.bgAnimationEnabled) {
    document.body.classList.add("no-bg-animations");
  } else {
    document.body.classList.remove("no-bg-animations");
  }
}
