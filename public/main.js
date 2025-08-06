// DOM-based AI Vocab Quiz main.js (used on index.html)
const wordList = window.defaultWords.words;
let currentIndex = 0;
let guessCount = 0;

function pickWord() {
  currentIndex = Math.floor(Math.random() * wordList.length);
  document.getElementById("wordPrompt").textContent = wordList[currentIndex];
  document.getElementById("guess").value = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("guess").focus(); // Always focus input
}

function submitGuess() {
  const input = document.getElementById("guess").value.trim();
  const currentWord = wordList[currentIndex];

  fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word: currentWord, userInput: input })
  })
    .then(res => res.json())
    .then(({ result, correct }) => {
      document.getElementById("feedback").textContent = result;
    });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("submit").onclick = submitGuess;

  document.getElementById("next").onclick = function() {
    pickWord();
    this.blur();
    document.getElementById("guess").focus();
  };

  pickWord();

  const guessInput = document.getElementById("guess");
  if (guessInput) {
    guessInput.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        submitGuess();
      }
    });
    guessInput.focus();
  }
});
