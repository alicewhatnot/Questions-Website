async function loadLongform() {
    const container = document.getElementById("longform-container");
    const questions = await fetchQuestions("longform");
    const asked = store.get("askedLongformIds", []);
    const selected = store.get("selectedTopics", []); // <-- get selected topics/subtopics

    // Filter questions by already-asked AND selected topics/subtopics
    let available = questions.filter(q => {
        const notAsked = !asked.includes(q.id);

        // If no filters selected, allow all
        if (selected.length === 0) return notAsked;

        // Only include if topic:subtopic is selected
        const key = `${q.topic}:${q.subtopic}`;
        return notAsked && selected.includes(key);
    });

    // Shuffle available questions
    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    available = shuffleArray(available);

    // Pick first available question
    available = resetIfEmpty(available, "longform");
    if (!available) {
        return loadLongform(); // reload with reset history
    }
    const question = available[0];

    if (!question) {
        container.innerHTML = "<p>No questions match your selected filters or all have been answered.</p>";
        return;
    }

    const markScheme = Array.isArray(question.mark_scheme)
        ? question.mark_scheme
        : JSON.parse(question.mark_scheme || "[]");

    container.innerHTML = `
    <div class="Header">
        <h1>${question.topic}</h1>
        <hr />
        <h2>${question.subtopic}</h2>
    </div>
    <div class="QuestionContainer">
        <div class="Question"><p>${question.question} [${question.marks}]</p></div>
        <div class="Response">
            <textarea id="answerBox" class="ResponseEntry" placeholder="Type your answer here..."></textarea>
        </div>
        <button id="submitBtn" class="Submit">Submit</button>
        <div id="markSchemeContainer" style="display:none">
            <h3>Did you say...</h3>
            <div id="markScheme" class="MarkScheme"></div>
            <p id="marksAchieved" class="MarksAchieved">Marks: 0/${question.marks}</p>
            <button id="nextBtn" class="Submit">Next</button>
        </div>
    </div>
    `;

    const submitBtn = document.getElementById("submitBtn");
    const nextBtn = document.getElementById("nextBtn");
    const msContainer = document.getElementById("markSchemeContainer");
    const msDiv = document.getElementById("markScheme");
    const marksAchieved = document.getElementById("marksAchieved");

    let ticked = [];

    submitBtn.onclick = () => {
        const answer = document.getElementById("answerBox").value.trim();
        if (!answer) return;

        msContainer.style.display = "block";
        submitBtn.style.display = "none";

        // Render mark points as boxes with tick icons
        msDiv.innerHTML = markScheme.map((point, i) => `
            <div class="MarkingPoint" data-idx="${i}">
                ${point}
                <div class="TickBox">
                    <img src="/assets/tick.svg" alt="tickIcon"/>
                </div>
            </div>
        `).join("");

        document.querySelectorAll(".MarkingPoint").forEach(el => {
            el.addEventListener("click", () => {
                const idx = +el.dataset.idx;
                const tickBox = el.querySelector(".TickBox img");

                if (ticked.includes(idx)) {
                    ticked = ticked.filter(i => i !== idx);
                    el.classList.remove("Ticked");
                    tickBox.classList.remove("Ticked");
                } else {
                    ticked.push(idx);
                    el.classList.add("Ticked");
                    tickBox.classList.add("Ticked");
                }

                marksAchieved.textContent = `Marks: ${Math.min(ticked.length, question.marks)}/${question.marks}`;
            });
        });
    };

    nextBtn.onclick = () => {
        // Save this question as asked
        const asked = store.get("askedLongformIds", []);
        store.set("askedLongformIds", [...asked, question.id]);

        loadLongform();
    };
}
document.addEventListener("DOMContentLoaded", loadLongform);
