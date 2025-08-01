// File: review.js (Missed Word Review Route with CSV export, full reset, and guess tracking)

const ReviewMissedWords = () => {
  const [missed, setMissed] = React.useState([]);
  const [missedWithGuesses, setMissedWithGuesses] = React.useState({});

  React.useEffect(() => {
    const stored = window.sessionStorage.getItem("missedWords");
    const guessLog = window.sessionStorage.getItem("missedGuessLog");
    if (stored) setMissed(JSON.parse(stored));
    if (guessLog) setMissedWithGuesses(JSON.parse(guessLog));
  }, []);

  const handleClickWord = (word) => {
    window.sessionStorage.setItem("reviewMode", "true");
    window.sessionStorage.setItem("reviewWords", JSON.stringify([word]));
    window.location.href = "/";
  };

  const startReviewSession = () => {
    window.sessionStorage.setItem("reviewMode", "true");
    window.sessionStorage.setItem("reviewWords", JSON.stringify(missed));
    window.location.href = "/";
  };

  const handleNextNewWord = () => {
    window.sessionStorage.setItem("reviewMode", "false");
    window.location.href = "/";
  };

  const handleResetAllStats = () => {
    if (confirm("Are you sure you want to reset all stats?")) {
      sessionStorage.removeItem("missedWords");
      sessionStorage.removeItem("missedGuessLog");
      sessionStorage.removeItem("correctWords");
      sessionStorage.removeItem("reviewWords");
      sessionStorage.removeItem("reviewMode");
      sessionStorage.removeItem("usedIndices");
      setMissed([]);
      setMissedWithGuesses({});
    }
  };

  const handleDownloadCSV = () => {
    const csv = ["Word,Guesses\n"];
    for (const word of missed) {
      const guesses = missedWithGuesses[word] || [];
      csv.push(`"${word}","${guesses.join("; ")}"\n`);
    }
    const blob = new Blob(csv, { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "missed_words_with_guesses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return React.createElement("div", { className: "p-8 max-w-xl mx-auto font-sans" }, [
    React.createElement("h1", { className: "text-2xl font-bold mb-4" }, "Review Missed Words"),
    React.createElement("p", { className: "mb-4" }, "Click a word to try it now, or review the full list below."),
    React.createElement("ul", { className: "mb-6 list-disc list-inside" },
      missed.map(word => React.createElement("li", {
        key: word,
        className: "text-blue-600 cursor-pointer hover:underline",
        onClick: () => handleClickWord(word)
      }, word))
    ),
    React.createElement("div", { className: "flex flex-wrap gap-4" }, [
      React.createElement("button", {
        className: "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700",
        onClick: startReviewSession
      }, "Quiz Me on All Missed Words"),
      React.createElement("button", {
        className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
        onClick: handleNextNewWord
      }, "Next New Word"),
      React.createElement("button", {
        className: "bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700",
        onClick: handleDownloadCSV
      }, "Download Missed Words (.csv)"),
      React.createElement("button", {
        className: "bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800",
        onClick: handleResetAllStats
      }, "Reset All Stats")
    ])
  ]);
};

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(ReviewMissedWords));
