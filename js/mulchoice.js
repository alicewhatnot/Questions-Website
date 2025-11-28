async function loadMulChoice() {
    const container = document.getElementById("mulchoice-container");
    const questions = await fetchQuestions("mul_choice"); // consistent type
    const asked = store.get("askedMulChoiceIds", []);

    // Get selected topics/subtopics
    const selected = store.get("selectedTopics", []);

    // Filter questions by selected filters and unanswered
    let available = questions.filter(q => {
        const notAsked = !asked.includes(q.question);
        if (selected.length === 0) return notAsked; // no filters = all allowed
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

    // Pick the first available question
    available = resetIfEmpty(available, "mul_choice");
    if (!available) {
        return loadMulChoice(); // reload with reset history
    }
    const question = available[0];

    if (!question) {
        container.innerHTML = "<p>No multiple choice questions found.</p>";
        return;
    }

    // --- Parse data safely ---
    const correctAnswers = Array.isArray(question.mark_scheme)
        ? question.mark_scheme
        : [question.mark_scheme];

    let wrongChoices = [];
    try {
        wrongChoices =
        typeof question.wrong_choices === "string"
            ? JSON.parse(question.wrong_choices)
            : question.wrong_choices || [];
    } catch {
        wrongChoices = [];
    }

    // --- Combine and shuffle all choices ---
    const choices = shuffleArray([...wrongChoices, ...correctAnswers]);
    container.innerHTML = `
        <div class="Header">
            <h1>${question.topic}</h1>
            <hr />
            <h2>${question.subtopic}</h2>
        </div>
        <div class="QuestionContainer">
            <div class="Question"><p>${question.question}</p></div> <!-- removed [marks] -->
            <div id="choices"></div>
            <button id="nextBtn" disabled>Next</button>
        </div>
    `;

    const nextBtn = document.getElementById("nextBtn");
    const choicesDiv = document.getElementById("choices");
    let answered = false;

    // --- Create choice buttons ---
    choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.className = "answerChoice";
        btn.textContent = choice;
        btn.onclick = () => {
        if (answered) return;
        answered = true;

        const correct = correctAnswers.includes(choice);
        btn.style.border = correct ? "2px solid #00b179" : "2px solid #c1272d";

        if (!correct) {
            // highlight the correct answer
            [...choicesDiv.children].forEach(b => {
            if (correctAnswers.includes(b.textContent)) {
                b.style.border = "2px solid #00b179";
            }
            });
        }

        nextBtn.disabled = false;
        };

        choicesDiv.appendChild(btn);
    });

        nextBtn.onclick = () => {
            const asked = store.get("askedMulChoiceIds", []);
            store.set("askedMulChoiceIds", [...asked, question.question]);
            loadMulChoice();
        };
    }

    // --- Utility: shuffle array ---
    function shuffle(array) {
    let m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        [array[m], array[i]] = [array[i], array[m]];
    }
    return array;
    }

document.addEventListener("DOMContentLoaded", loadMulChoice);
