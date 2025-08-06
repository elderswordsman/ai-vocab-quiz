const missedWords = JSON.parse(localStorage.getItem("missedWords")) || [];
const masteredWords = JSON.parse(localStorage.getItem("masteredWords")) || [];

function ReviewQuiz({ words }) {
  const [index, setIndex] = React.useState(0);
  const [input, setInput] = React.useState("");
  const [feedback, setFeedback] = React.useState("");
  const [showMastered, setShowMastered] = React.useState(false);
  const [activeWords, setActiveWords] = React.useState(words);
  const [mastered, setMastered] = React.useState(masteredWords);
  const [checked, setChecked] = React.useState({});

  const currentWord = activeWords[index];

  function handleCheck() {
    fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: currentWord, userInput: input })
    })
      .then(res => res.json())
      .then(({ result, correct }) => {
        setFeedback(result);
        setShowMastered(correct);
      });
  }

  function handleNext() {
    setInput("");
    setFeedback("");
    setShowMastered(false);
    if (index < activeWords.length - 1) {
      setIndex(index + 1);
    } else {
      setIndex(0);
    }
  }

  function markAsMastered() {
    const updated = activeWords.filter(w => w !== currentWord);
    const updatedMastered = [...mastered, currentWord];

    localStorage.setItem("missedWords", JSON.stringify(updated));
    localStorage.setItem("masteredWords", JSON.stringify(updatedMastered));

    setActiveWords(updated);
    setMastered(updatedMastered);
    setIndex(0);
    setShowMastered(false);
    setInput("");
    setFeedback("");
  }

  function toggleChecked(word) {
    setChecked(prev => ({ ...prev, [word]: !prev[word] }));
  }

  function moveBackToPractice() {
    const toReadd = Object.keys(checked).filter(w => checked[w]);
    const newMissed = [...new Set([...missedWords, ...toReadd])];
    const newMastered = mastered.filter(w => !toReadd.includes(w));

    localStorage.setItem("missedWords", JSON.stringify(newMissed));
    localStorage.setItem("masteredWords", JSON.stringify(newMastered));

    setMastered(newMastered);
    setChecked({});
    setActiveWords(newMissed);
    setIndex(0);
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🧠 Missed Word Quiz</h2>

      {mastered.length > 0 && (
        <div className="mb-6 border p-4 rounded shadow bg-green-50">
          <h3 className="font-semibold mb-2 text-green-800">✅ Mastered Words ({mastered.length})</h3>
          <ul className="mb-2">
            {mastered.map(word => (
              <li key={word} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!checked[word]}
                  onChange={() => toggleChecked(word)}
                />
                <span>{word}</span>
              </li>
            ))}
          </ul>
          {Object.values(checked).some(v => v) && (
            <button
              onClick={moveBackToPractice}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              🔄 Remove from mastery list. I want to keep this word in my practice list!
            </button>
          )}
        </div>
      )}

      {activeWords.length === 0 ? (
        <div className="text-center text-green-600 text-xl">🎉 All review words are mastered!</div>
      ) : (
        <>
          <h2 className="text-lg font-bold mb-2">Practice: {currentWord}</h2>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="border px-2 py-1 w-full mb-2"
            placeholder="Type your definition"
          />
          <button
            onClick={handleCheck}
            className="bg-blue-600 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700"
          >
            Submit
          </button>

          {feedback && (
            <div className="mt-3 text-sm text-gray-700">
              <p><strong>AI Feedback:</strong> {feedback}</p>
            </div>
          )}

          {showMastered && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={markAsMastered}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                ✅ Mark as Mastered
              </button>
              <button
                onClick={handleNext}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Skip for Now
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

ReactDOM.render(
  <ReviewQuiz words={missedWords} />,
  document.getElementById("quiz-root")
);

window.showQuizView = function showQuizView() {
  document.getElementById("missed-list").style.display = "none";
  document.getElementById("quiz-root").style.display = "block";

  const rootElement = document.getElementById("quiz-root");
  if (!rootElement.hasChildNodes()) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<ReviewQuiz words={missedWords} />);
  }
};