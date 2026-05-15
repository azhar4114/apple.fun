(function() {
  var FORM_RESPONSE_URL = "https://docs.google.com/forms/d/e/1FAIpQLScxYEEL2W9dsYkTU1KmQ9h8mmRQB-az03m8Yo-XeKN6wd06fA/formResponse";
  var TRACKING_ENDPOINT = "https://script.google.com/macros/s/AKfycbzCva51LDrstiplGk68iIy-ETx4OCoBo2bzqrRyGzndH4V3ypZz8av46bT5pxlXEHz7/exec";
  var REPORT_STORAGE_KEY = "aforapple-pilot-report";
  var ACCESS_STORAGE_KEY = "aforapple-access-state";
  var TEACHER_WORKSPACE_KEY = "aforapple-teacher-workspace";

  function getDeviceId() {
    var deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = "device-" + Math.random().toString(36).slice(2, 18);
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  }

  function nowIso() {
    return new Date().toISOString();
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

  function getLessonSlug(pathname) {
    var path = pathname || window.location.pathname || "/";
    if (path === "/" || path === "/index.html") {
      return "home";
    }
    return path.replace(/^\//, "").replace(/\.html$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");
  }

  function getAccessState() {
    return parseJson(localStorage.getItem(ACCESS_STORAGE_KEY), {
      state: "sample",
      label: "Sample lesson",
      deviceId: getDeviceId(),
      updatedAt: nowIso()
    });
  }

  function normalizeLessonItem(item) {
    if (!item) {
      return null;
    }

    var url = item.url || item.l || "";
    var title = item.title || item.t || "";
    var description = item.description || item.d || "";
    var category = item.category || "";
    var subcategory = item.subcategory || "";
    var slug = item.slug || getLessonSlug(url || title);

    if (!slug || !title || !url) {
      return null;
    }

    return {
      slug: slug,
      title: title,
      url: url,
      description: description,
      category: category,
      subcategory: subcategory
    };
  }

  function getTeacherWorkspace() {
    var workspace = parseJson(localStorage.getItem(TEACHER_WORKSPACE_KEY), null);
    if (workspace) {
      workspace.favorites = Array.isArray(workspace.favorites) ? workspace.favorites : [];
      workspace.playlist = Array.isArray(workspace.playlist) ? workspace.playlist : [];
      return workspace;
    }

    return {
      favorites: [],
      playlist: [],
      updatedAt: nowIso()
    };
  }

  function saveTeacherWorkspace(workspace) {
    workspace.updatedAt = nowIso();
    localStorage.setItem(TEACHER_WORKSPACE_KEY, JSON.stringify(workspace));
    return workspace;
  }

  function hasLesson(list, slug) {
    return list.some(function(item) {
      return item && item.slug === slug;
    });
  }

  function toggleFavoriteLesson(item) {
    var normalized = normalizeLessonItem(item);
    var workspace = getTeacherWorkspace();
    if (!normalized) {
      return workspace;
    }

    if (hasLesson(workspace.favorites, normalized.slug)) {
      workspace.favorites = workspace.favorites.filter(function(entry) {
        return entry.slug !== normalized.slug;
      });
    } else {
      workspace.favorites.unshift(normalized);
    }

    return saveTeacherWorkspace(workspace);
  }

  function addPlaylistLesson(item) {
    var normalized = normalizeLessonItem(item);
    var workspace = getTeacherWorkspace();
    if (!normalized) {
      return workspace;
    }

    if (!hasLesson(workspace.playlist, normalized.slug)) {
      workspace.playlist.push(normalized);
    }

    return saveTeacherWorkspace(workspace);
  }

  function removePlaylistLesson(slug) {
    var workspace = getTeacherWorkspace();
    workspace.playlist = workspace.playlist.filter(function(item) {
      return item.slug !== slug;
    });
    return saveTeacherWorkspace(workspace);
  }

  function movePlaylistLesson(slug, direction) {
    var workspace = getTeacherWorkspace();
    var index = workspace.playlist.findIndex(function(item) {
      return item.slug === slug;
    });

    if (index === -1) {
      return workspace;
    }

    var targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= workspace.playlist.length) {
      return workspace;
    }

    var temp = workspace.playlist[targetIndex];
    workspace.playlist[targetIndex] = workspace.playlist[index];
    workspace.playlist[index] = temp;
    return saveTeacherWorkspace(workspace);
  }

  function cyclePlaylist() {
    var workspace = getTeacherWorkspace();
    if (workspace.playlist.length > 1) {
      workspace.playlist.push(workspace.playlist.shift());
      return saveTeacherWorkspace(workspace);
    }
    return workspace;
  }

  function clearPlaylist() {
    var workspace = getTeacherWorkspace();
    workspace.playlist = [];
    return saveTeacherWorkspace(workspace);
  }

  function isFavoriteLesson(slug) {
    return hasLesson(getTeacherWorkspace().favorites, slug);
  }

  function setAccessState(nextState) {
    var current = getAccessState();
    var merged = {
      state: nextState && nextState.state ? nextState.state : current.state,
      label: nextState && nextState.label ? nextState.label : current.label,
      schoolKey: nextState && nextState.schoolKey ? nextState.schoolKey : current.schoolKey,
      schoolName: nextState && nextState.schoolName ? nextState.schoolName : current.schoolName,
      accessLevel: nextState && nextState.accessLevel ? nextState.accessLevel : current.accessLevel,
      deviceId: getDeviceId(),
      updatedAt: nowIso()
    };
    localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  }

  function getReport() {
    var report = parseJson(localStorage.getItem(REPORT_STORAGE_KEY), null);
    if (report) {
      return report;
    }
    return {
      createdAt: nowIso(),
      lastSeenAt: nowIso(),
      deviceId: getDeviceId(),
      accessState: "sample",
      schoolKey: "",
      schoolName: "",
      lessonVisits: {}
    };
  }

  function saveReport(report) {
    report.deviceId = getDeviceId();
    report.lastSeenAt = nowIso();
    localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(report));
  }

  function renderAccessBadge(target, accessState) {
    var host = target || document.body;
    var state = accessState || getAccessState();
    var badge = document.getElementById("aforapple-access-badge");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "aforapple-access-badge";
      badge.style.display = "inline-flex";
      badge.style.alignItems = "center";
      badge.style.gap = "8px";
      badge.style.padding = "8px 14px";
      badge.style.borderRadius = "999px";
      badge.style.fontFamily = "'Arial', sans-serif";
      badge.style.fontSize = "14px";
      badge.style.fontWeight = "700";
      badge.style.marginTop = "12px";
      badge.style.background = "#edf7ed";
      badge.style.color = "#1b5e20";
      badge.style.boxShadow = "0 10px 24px rgba(11, 31, 53, 0.08)";
      badge.style.border = "1px solid rgba(27, 94, 32, 0.12)";
    }

    if (state.state === "pilot") {
      badge.style.background = "#fff4d6";
      badge.style.color = "#7a4f01";
      badge.style.border = "1px solid rgba(122, 79, 1, 0.12)";
    } else if (state.state === "licensed") {
      badge.style.background = "#e7f1ff";
      badge.style.color = "#0f4c81";
      badge.style.border = "1px solid rgba(15, 76, 129, 0.12)";
    } else {
      badge.style.background = "#edf7ed";
      badge.style.color = "#1b5e20";
      badge.style.border = "1px solid rgba(27, 94, 32, 0.12)";
    }

    var detail = state.schoolName ? " - " + state.schoolName : "";
    badge.textContent = (state.label || "Sample lesson") + detail;

    if (!badge.parentNode) {
      host.appendChild(badge);
    }

    return badge;
  }

  function bestEffortRemoteTrack(payload) {
    try {
      var body = new URLSearchParams();
      Object.keys(payload).forEach(function(key) {
        if (payload[key] !== undefined && payload[key] !== null) {
          body.append(key, payload[key]);
        }
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          TRACKING_ENDPOINT,
          new Blob([body.toString()], {
            type: "application/x-www-form-urlencoded;charset=UTF-8"
          })
        );
        return;
      }

      fetch(TRACKING_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body
      }).catch(function() {});
    } catch (error) {
      console.log("Tracking skipped", error);
    }
  }

  function recordLessonUsage(options) {
    var access = options && options.accessState ? options.accessState : getAccessState().state;
    var slug = options && options.lessonSlug ? options.lessonSlug : getLessonSlug();
    var title = options && options.title ? options.title : document.title;
    var schoolKey = options && options.schoolKey ? options.schoolKey : getAccessState().schoolKey || "";
    var report = getReport();

    if (!report.lessonVisits[slug]) {
      report.lessonVisits[slug] = {
        slug: slug,
        title: title,
        accessState: access,
        schoolKey: schoolKey,
        firstSeen: nowIso(),
        lastSeen: nowIso(),
        sessionCount: 0
      };
    }

    report.accessState = access;
    if (schoolKey) {
      report.schoolKey = schoolKey;
    }
    report.lessonVisits[slug].title = title;
    report.lessonVisits[slug].accessState = access;
    report.lessonVisits[slug].schoolKey = schoolKey;
    report.lessonVisits[slug].lastSeen = nowIso();
    report.lessonVisits[slug].sessionCount += 1;

    saveReport(report);

    bestEffortRemoteTrack({
      action: "track_usage",
      lessonSlug: slug,
      lessonTitle: title,
      accessState: access,
      schoolKey: schoolKey,
      deviceId: getDeviceId(),
      url: window.location.href,
      TS: nowIso()
    });

    return report;
  }

  function reportToCsv(report) {
    var lines = [
      [
        "lesson_slug",
        "lesson_title",
        "access_state",
        "school_key",
        "first_seen",
        "last_seen",
        "session_count",
        "device_id"
      ].join(",")
    ];

    Object.keys(report.lessonVisits).sort().forEach(function(slug) {
      var item = report.lessonVisits[slug];
      var row = [
        item.slug,
        item.title,
        item.accessState,
        item.schoolKey || "",
        item.firstSeen,
        item.lastSeen,
        item.sessionCount,
        report.deviceId
      ].map(function(value) {
        var safeValue = String(value || "").replace(/"/g, '""');
        return '"' + safeValue + '"';
      });
      lines.push(row.join(","));
    });

    return lines.join("\n");
  }

  function downloadFile(filename, content, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function() {
      URL.revokeObjectURL(link.href);
    }, 500);
  }

  function exportReportAsJson() {
    downloadFile(
      "aforapple-pilot-report.json",
      JSON.stringify(getReport(), null, 2),
      "application/json"
    );
  }

  function exportReportAsCsv() {
    downloadFile(
      "aforapple-pilot-report.csv",
      reportToCsv(getReport()),
      "text/csv"
    );
  }

  function formatPilotNotes(data) {
    return [
      "Pilot request source: " + (data.requestType || "Pilot request"),
      "School name: " + data.schoolName,
      "City/State: " + data.cityState,
      "Grades served: " + data.gradesServed,
      "Number of classrooms: " + data.classroomCount,
      "Languages needed: " + data.languagesNeeded,
      "Devices used: " + data.deviceType,
      "Preferred demo time: " + data.preferredDemoTime,
      "Work email: " + data.workEmail,
      "Phone/WhatsApp: " + data.phone,
      "Extra notes: " + (data.notes || "None")
    ].join("\n");
  }

  function submitPilotRequest(data) {
    var params = new URLSearchParams();
    params.append("entry.2005620554", data.contactName);
    params.append("entry.1045781291", data.workEmail);
    params.append("entry.1166974658", data.phone);
    params.append("entry.839337160", formatPilotNotes(data));

    return fetch(FORM_RESPONSE_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: params.toString()
    });
  }

  window.AFORAPPLE_UTILS = {
    getDeviceId: getDeviceId,
    getLessonSlug: getLessonSlug,
    normalizeLessonItem: normalizeLessonItem,
    getAccessState: getAccessState,
    setAccessState: setAccessState,
    getReport: getReport,
    saveReport: saveReport,
    getTeacherWorkspace: getTeacherWorkspace,
    saveTeacherWorkspace: saveTeacherWorkspace,
    toggleFavoriteLesson: toggleFavoriteLesson,
    addPlaylistLesson: addPlaylistLesson,
    removePlaylistLesson: removePlaylistLesson,
    movePlaylistLesson: movePlaylistLesson,
    cyclePlaylist: cyclePlaylist,
    clearPlaylist: clearPlaylist,
    isFavoriteLesson: isFavoriteLesson,
    renderAccessBadge: renderAccessBadge,
    recordLessonUsage: recordLessonUsage,
    exportReportAsJson: exportReportAsJson,
    exportReportAsCsv: exportReportAsCsv,
    submitPilotRequest: submitPilotRequest
  };
})();
