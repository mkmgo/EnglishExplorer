async function logActivity(pupil, pagePath, section, actionType, details = "") {
    const url = `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${CONFIG.TABLE_NAME}`;
    const payload = {
        fields: {
            Timestamp: new Date().toISOString(),
            PupilOrUser: pupil || "Anonymous",
            PagePath: pagePath,
            Section: section,
            ActionType: actionType,
            Details: details
        }
    };
    try {
        await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.AIRTABLE_PAT}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error("Tracking error:", err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    logActivity("Student_Default", currentPath, "General", "Page_View");
});
