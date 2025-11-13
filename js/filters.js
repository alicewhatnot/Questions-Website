async function loadFilters() {
    const container = document.getElementById("filter-container");

    const longform = await fetchQuestions("longform");
    const mulchoice = await fetchQuestions("mulchoice");
    const all = [...longform, ...mulchoice];

    // Build topic → subtopic map
    const map = {};
    all.forEach(q => {
        if (!map[q.topic]) map[q.topic] = new Set();
        if (q.subtopic) map[q.topic].add(q.subtopic);
    });

    const selected = store.get("selectedTopics", []);

    // --- Select All checkbox ---
    container.innerHTML = `
        <label class="selectAllTopics">
            <input type="checkbox" class="checkbox"id="selectAll">
            <span>Select All Topics</span>
        </label>
    `;

    // --- Build all topics + subtopics ---
    Object.entries(map).forEach(([topic, subs]) => {

        // Topic section wrapper
        const topicDiv = document.createElement("div");
        topicDiv.className = "TopicSelect";

        const topicKey = `${topic}:*`; // special marker for whole topic

        // Topic checkbox
        const topicLabel = document.createElement("label");
        topicLabel.innerHTML = `
            <input type="checkbox" class="topic-checkbox" data-topic="${topic}">
            <span>${topic}</span>
        `;
        topicDiv.appendChild(topicLabel);
        container.appendChild(topicDiv);

        // Subtopic list
        subs.forEach(sub => {
            const key = `${topic}:${sub}`;
            const subLabel = document.createElement("label");
            subLabel.className = "SubtopicOption";

            subLabel.innerHTML = `
                <input type="checkbox" class="subtopic-checkbox" data-topic="${topic}" data-sub="${sub}"
                    ${selected.includes(key) ? "checked" : ""}>
                <span>${sub}</span>
            `;

            // Store subtopic changes
            subLabel.querySelector("input").addEventListener("change", e => {
                let sel = store.get("selectedTopics", []);
                if (e.target.checked) {
                    if (!sel.includes(key)) sel.push(key);
                } else {
                    sel = sel.filter(x => x !== key);
                }
                store.set("selectedTopics", sel);
            });

            container.appendChild(subLabel);
        });

    });

    // --- Select All logic ---
    const selectAll = document.getElementById("selectAll");
    const topicCheckboxes = document.querySelectorAll(".topic-checkbox");
    const subCheckboxes = document.querySelectorAll(".subtopic-checkbox");

    selectAll.addEventListener("change", () => {
        const checked = selectAll.checked;
        topicCheckboxes.forEach(cb => cb.checked = checked);
        subCheckboxes.forEach(cb => cb.checked = checked);

        let allKeys = [];
        Object.entries(map).forEach(([t, subs]) => {
            subs.forEach(sub => allKeys.push(`${t}:${sub}`));
        });

        store.set("selectedTopics", checked ? allKeys : []);
    });

    // --- Topic checkbox controls all its subtopics ---
    topicCheckboxes.forEach(cb => {
        cb.addEventListener("change", e => {
            const topic = e.target.dataset.topic;
            const subCbs = document.querySelectorAll(`.subtopic-checkbox[data-topic="${topic}"]`);
            const checked = e.target.checked;

            let sel = store.get("selectedTopics", []);

            subCbs.forEach(subCb => {
                subCb.checked = checked;
                const key = `${topic}:${subCb.dataset.sub}`;
                if (checked && !sel.includes(key)) sel.push(key);
                if (!checked) sel = sel.filter(x => x !== key);
            });

            store.set("selectedTopics", sel);
        });
    });
}

document.addEventListener("DOMContentLoaded", loadFilters);
