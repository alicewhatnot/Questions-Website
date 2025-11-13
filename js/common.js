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
// Load all JSON files and filter by question type (e.g., "longform", "mul_choice")
async function fetchQuestions(type) {

    // Generate all file paths automatically for L-4.1 → L-4.13 and M-4.1 → M-4.13
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
        const res = await fetch(file);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
            allQuestions = allQuestions.concat(data);
            }
        }
        } catch (e) {
        console.warn("Could not load:", file, e);
        }
    }

    // Filter by question_type field
    return allQuestions.filter(q => q.question_type === type);
}


// Persistent storage helper
const store = {
    get(key, fallback) {
        try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
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
