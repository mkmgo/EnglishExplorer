async function logActivity(pupil, pagePath, section, actionType, details = "") {
  const url = "https://english-explorer-tracker.mkmueller-mission.workers.dev";
  const payload = {
    fields: {
      Timestamp: new Date().toISOString(),
      PupilOrUser: pupil || "Anonymous",
      PagePath: pagePath,
      Section: section,
      ActionType: actionType,
      Details: details,
    },
  };
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Tracking error:", err);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;
  logActivity("Student_Default", currentPath, "General", "Page_View");
});
