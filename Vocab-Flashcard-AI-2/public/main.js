// File: public/main.js (updated with dynamic button swapping after correct guess)

const wordList = window.defaultWords.words;
const totalWordCount = window.defaultWords.total || wordList.length;
let usedIndices = JSON.parse(sessionStorage.getItem("usedIndices")) || [];
let correctWords = JSON.parse(sessionStorage.getItem("correctWords")) || [];
let missedWords = JSON.parse(sessionStorage.getItem("missedWords")) || [];
let missedGuessLog = JSON.parse(sessionStorage.getItem("missedGuessLog")) || {};

const reviewMode = sessionStorage.getItem("reviewMode") === "true";
const reviewWords = reviewMode ? JSON.parse(sessionStorage.getItem("reviewWords")) : null;

let availableIndices = reviewMode
  ? reviewWords.map(word => wordList.findIndex(w => w === word))
  : wordList.map((_, i) => i).filter(i => !correctWords.includes(wordList[i]));

function getRandomIndex() {
  if (availableIndices.length === 0) return null;
  const randomIdx = Math.floor(Math.random() * availableIndices.length);
  const selected = availableIndices[randomIdx];
  availableIndices.splice(randomIdx, 1);
  usedIndices.push(selected);
  sessionStorage.setItem("usedIndices", JSON.stringify(usedIndices));
  return selected;
}

let currentIndex = getRandomIndex();
let currentWord = wordList[currentIndex];
let guessCount = 0;

function handleSubmission() {
  const input = document.getElementById("guess").value.trim();
  if (!input) return;
  guessCount++;
  document.getElementById("guessCount").textContent = guessCount;

  if (!missedGuessLog[currentWord]) missedGuessLog[currentWord] = [];
  missedGuessLog[currentWord].push(input);
  sessionStorage.setItem("missedGuessLog", JSON.stringify(missedGuessLog));

  fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word: currentWord, userInput: input })
  })
    .then(res => {
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      return res.json();
    })
    .then(({ result, correct }) => {
      console.log("✅ API result:", result, "Correct:", correct);

      const feedback = document.getElementById("feedback");
      feedback.textContent = result;

      if (correct) {
        if (!correctWords.includes(currentWord)) correctWords.push(currentWord);
        sessionStorage.setItem("correctWords", JSON.stringify(correctWords));

        document.getElementById("submit").style.display = "none";
        document.getElementById("skip").style.display = "none";

        document.getElementById("nextContainer").innerHTML = `
          <button id="next" class="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Next Word</button>
        `;

        document.getElementById("next").onclick = () => {
          guessCount = 0;
          currentIndex = getRandomIndex();
          if (currentIndex === null) {
            document.getElementById("root").innerHTML = "<p class='text-center mt-8'>You've completed all words!</p>";
          } else {
            currentWord = wordList[currentIndex];
            renderApp();
          }
        };
      } else {
        if (!missedWords.includes(currentWord)) missedWords.push(currentWord);
        sessionStorage.setItem("missedWords", JSON.stringify(missedWords));
      }
    })
    .catch(err => {
      console.error("❌ Submission error:", err);
      document.getElementById("feedback").textContent = "There was a problem submitting your guess.";
    });
}

function renderApp() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="p-8 max-w-xl mx-auto font-sans">
      <h1 class="text-2xl font-bold mb-4">Adrian's AI Vocab Quizzer</h1>
      <p id="progress" class="mb-2 text-sm text-gray-600">Word ${usedIndices.length + 1} of ${totalWordCount}</p>
      <p class="text-xl mb-2">Word: <strong>${currentWord}</strong></p>
      <input id="guess" type="text" placeholder="Your definition..." class="border px-2 py-1 w-full mb-2" />
      <button id="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit Response</button>
      <button id="skip" class="ml-2 px-4 py-2 border rounded">Skip Word</button>
      <p class="text-sm mt-2 text-gray-500">Guesses for this word: <span id="guessCount">0</span></p>
      <p id="feedback" class="mt-4 font-semibold"></p>
      <div id="nextContainer" class="mt-4"></div>
      <button id="reviewToggle" class="mt-6 text-blue-600 underline">Review missed words</button>
    </div>
  `;

  document.getElementById("submit").onclick = handleSubmission;

  const guessInput = document.getElementById("guess");
  guessInput.focus();
  guessInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleSubmission();
    }
  });

  document.getElementById("skip").onclick = () => {
    guessCount = 0;
    currentIndex = getRandomIndex();
    if (currentIndex === null) {
      document.getElementById("root").innerHTML = "<p class='text-center mt-8'>You've completed all words!</p>";
    } else {
      currentWord = wordList[currentIndex];
      renderApp();
    }
  };

  document.getElementById("reviewToggle").onclick = () => {
    window.location.href = "/review.html";
  };
}

renderApp();
