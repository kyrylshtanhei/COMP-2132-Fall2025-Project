class HangmanGame {
  constructor() {
    this.words = [];
    this.currentWord = "";
    this.currentHint = "";
    this.guessedLetters = new Set();
    this.wrongGuesses = 0;
    this.maxWrongGuesses = 6;
    this.isGameOver = false;
  }

  async loadWords() {
    try {
      const response = await fetch("data/words.json");
      const data = await response.json();
      this.words = data.words;
      return true;
    } catch (error) {
      console.error("Error loading words:", error);
      return false;
    }
  }

  startNewGame() {
    const randomIndex = Math.floor(Math.random() * this.words.length);
    const wordData = this.words[randomIndex];

    this.currentWord = wordData.word.toUpperCase();
    this.currentHint = wordData.hint;
    this.guessedLetters.clear();
    this.wrongGuesses = 0;
    this.isGameOver = false;
  }

  guessLetter(letter) {
    if (this.isGameOver || this.guessedLetters.has(letter)) {
      return { alreadyGuessed: true };
    }

    this.guessedLetters.add(letter);
    const isCorrect = this.currentWord.includes(letter);

    if (!isCorrect) {
      this.wrongGuesses++;
    }

    if (this.wrongGuesses >= this.maxWrongGuesses) {
      this.isGameOver = true;
      return { isCorrect, gameOver: true, won: false };
    }

    if (this.isWordComplete()) {
      this.isGameOver = true;
      return { isCorrect, gameOver: true, won: true };
    }

    return { isCorrect, gameOver: false };
  }

  isWordComplete() {
    for (let letter of this.currentWord) {
      if (!this.guessedLetters.has(letter)) {
        return false;
      }
    }
    return true;
  }

  getWordDisplay() {
    return this.currentWord.split("").map((letter) => {
      return this.guessedLetters.has(letter) ? letter : "_";
    });
  }
}

const game = new HangmanGame();

function initGame() {
  document.getElementById("year").textContent = new Date().getFullYear();

  game.loadWords().then((success) => {
    if (success) {
      startNewGame();
      setupEventListeners();
    } else {
      displayError();
    }
  });
}

function startNewGame() {
  game.startNewGame();

  resetUI();
  displayHint();
  displayWord();
  generateAlphabet();
}

function resetUI() {
  document.getElementById("wrongCount").textContent = "0";

  for (let i = 1; i <= 6; i++) {
    document.getElementById(`hangman${i}`).classList.add("hidden");
  }

  document.getElementById("gameOverModal").classList.add("hidden");
  document.getElementById("playAgainBtn").classList.add("hidden");
}

function displayHint() {
  document.getElementById("hintText").textContent = game.currentHint;
}

function displayWord() {
  const wordDisplay = document.getElementById("wordDisplay");
  const letters = game.getWordDisplay();

  wordDisplay.innerHTML = "";

  letters.forEach((letter) => {
    const box = document.createElement("div");
    box.className = "letter-box";

    if (letter !== "_") {
      box.textContent = letter;
      box.classList.add("revealed");
    }

    wordDisplay.appendChild(box);
  });
}

function generateAlphabet() {
  const alphabetGrid = document.getElementById("alphabetGrid");
  alphabetGrid.innerHTML = "";

  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const button = document.createElement("button");
    button.className = "letter-btn";
    button.textContent = letter;
    button.dataset.letter = letter;
    button.addEventListener("click", () => handleLetterGuess(letter, button));
    alphabetGrid.appendChild(button);
  }
}

function handleLetterGuess(letter, button) {
  const result = game.guessLetter(letter);

  if (result.alreadyGuessed) {
    return;
  }

  button.disabled = true;

  if (result.isCorrect) {
    button.classList.add("correct");
    displayWord();
  } else {
    button.classList.add("incorrect");
    updateHangman();
  }

  if (result.gameOver) {
    endGame(result.won);
  }
}

function updateHangman() {
  const count = game.wrongGuesses;
  document.getElementById("wrongCount").textContent = count;

  if (count > 0 && count <= 6) {
    document.getElementById(`hangman${count}`).classList.remove("hidden");
  }
}

function endGame(won) {
  const modal = document.getElementById("gameOverModal");
  const modalIcon = document.getElementById("modalIcon");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const revealWord = document.getElementById("revealWord");

  if (won) {
    modalIcon.textContent = "🎉";
    modalTitle.textContent = "You Win!";
    modalMessage.textContent = "Congratulations! You guessed the word.";
  } else {
    modalIcon.textContent = "💀";
    modalTitle.textContent = "Game Over!";
    modalMessage.textContent = "Better luck next time!";
  }

  revealWord.textContent = game.currentWord;

  modal.classList.remove("hidden");
  document.getElementById("playAgainBtn").classList.remove("hidden");

  disableAllLetters();
}

function disableAllLetters() {
  const buttons = document.querySelectorAll(".letter-btn");
  buttons.forEach((button) => {
    button.disabled = true;
  });
}

function setupEventListeners() {
  document
    .getElementById("playAgainBtn")
    .addEventListener("click", startNewGame);
  document
    .getElementById("modalPlayAgain")
    .addEventListener("click", startNewGame);

  document.addEventListener("keydown", (e) => {
    if (game.isGameOver) return;

    const key = e.key.toUpperCase();
    if (key.length === 1 && key >= "A" && key <= "Z") {
      const button = document.querySelector(`[data-letter="${key}"]`);
      if (button && !button.disabled) {
        handleLetterGuess(key, button);
      }
    }
  });
}

function displayError() {
  document.getElementById("hintText").textContent =
    "Error loading game data. Please refresh the page.";
}

document.addEventListener("DOMContentLoaded", initGame);
