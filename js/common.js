document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("main-nav");
    if (nav) {
        nav.innerHTML = `
        <a href="index.html">Home</a> |
        <a href="longform.html">Longform</a> |
        <a href="mulchoice.html">Multiple Choice</a> |
        <a href="filters.html">Filters</a>
        `;
    }
});

// Utility: fetch JSON question files
async function fetchQuestions(type) {
    const files = [];

    // Add all "L-" files
    for (let i = 1; i <= 13; i++) {
        files.push(`questions/L-4.${i}.json`);
    }

    // Add all "M-" files
    for (let i = 1; i <= 13; i++) {
        files.push(`questions/M-4.${i}.json`);
    }

    let allQuestions = [];

    for (const file of files) {
        try {
            const res = await fetch(file, { cache: "no-store" }); // ensure latest fetch
            if (!res.ok) {
                console.warn(`Failed to fetch ${file}: ${res.status}`);
                continue;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                allQuestions = allQuestions.concat(data);
            }
        } catch (e) {
            console.warn("Could not load:", file, e);
        }
    }

    return allQuestions.filter(q => q.question_type === type);
}

// Persistent storage helper
const store = {
    get(key, fallback) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : fallback;
        } catch {
            return fallback;
        }
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    clear(key) {
        localStorage.removeItem(key);
    }
};
