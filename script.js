const sensorState = {
    a: false,
    b: false,
};

const gameState = {
    playerName: "",
    currentLevel: 1,
    score: 0,
    lives: 3,
    timeLeft: 60,
    timerInterval: null,
    selectedOperator: null,
    isTransitioning: false,
    highscores: JSON.parse(localStorage.getItem('EncanaLogicaHighscores')) || []
};

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const playerNameInput = document.getElementById('player-name');
const startBtn = document.getElementById('start-btn');
const displayName = document.getElementById('display-name');
const levelDisplay = document.getElementById('level-display');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const missionText = document.getElementById('mission-text');
const grid = document.getElementById('grid');
const testBtn = document.getElementById('test-btn');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const highscoresList = document.getElementById('highscores');

const successSound = document.getElementById('success-sound');
const errorSound = document.getElementById('error-sound');
const clockSound = document.getElementById('clock-sound');
const gameoverSound = document.getElementById('gameover-sound');

const socket = io("https://encanalogica-server.onrender.com");

socket.on('update-rankings', (updatedRankings) => {
    gameState.highscores = updatedRankings;
    showHighscores();

    if (gameoverScreen.classList.contains('hidden')) {
        finalScoreDisplay.textContent = `Pontuação: ${gameState.score}`;
        gameScreen.classList.add('hidden');
        gameoverScreen.classList.remove('hidden');
    }
});

// Niveis
const levels = [
    // Nivel 1
    {
        mission: "Nenhum cachorro é peixe. Meu pet é um cachorro. Logo, meu pet não é peixe",
        solution: () => true,
        time: 60,
        answer: "Silogismo (válido)"
    },
    // Nivel 2
    {
        mission: "Todos os gatos são mamíferos. O Garfield é um gato. Logo, Garfield é um mamífero",
        solution: () => true,
        time: 60,
        answer: "Silogismo (válido)"
    },
    // Nivel 3
    {
        mission: "Todos os peixes vivem na água. Alguns animais vivem na água. Logo, esses animais são peixes",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 4
    {
        mission: "Se chover, a grama molha. Está chovendo. Logo, a grama molha",
        solution: () => true,
        time: 60,
        answer: "Silogismo (válido)"
    },
    // Nivel 5
    {
        mission: "Todos os triângulos têm três lados. Uma figura tem três lados. Logo, é um triângulo",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 6
    {
        mission: "Se um animal é cão, então ele late. Meu gato late. Logo, ele é um cão",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 7
    {
        mission: "Todos os livros têm páginas. A Bíblia é um livro. Logo, a Bíblia tem páginas",
        solution: () => true,
        time: 60,
        answer: "Silogismo (válido)"
    },
    // Nivel 8
    {
        mission: "Alguns médicos são pianistas. Todos os pianistas tocam piano. Logo, todos os médicos tocam piano",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 9
    {
        mission: "Se estou gripado, então espirro. Estou gripado. Logo, espirro",
        solution: () => true,
        time: 60,
        answer: "Silogismo (válido)"
    },
    // Nivel 10
    {
        mission: "Todos os estudantes leem livros. Alguns leitores são estudantes. Logo, todos os leitores leem livros",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 11
    {
        mission: "Nenhum ser humano é perfeito. Algumas máquinas são perfeitas. Logo, algumas máquinas não são seres humanos",
        solution: () => true,
        time: 60,
        answer: "Silogismo (válido)"
    },
    // Nivel 12
    {
        mission: "Todos os cães são mamíferos. Todos os gatos são mamíferos. Logo, todos os gatos são cães",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 13
    {
        mission: "Se o motor está funcionando, o carro pode andar. O carro está andando. Logo, o motor está funcionando",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 14
    {
        mission: "Todos os filósofos são pensadores. Sócrates é pensador. Logo, Sócrates é filósofo",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 15
    {
        mission: "Se um número é divisível por 2, então é par. 6 é par. Logo, é divisível por 2",
        solution: () => true,
        time: 60,
        answer: "Silogismo (válido)"
    }
];

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

function startGame() {
    const name = playerNameInput.value.trim();
    if (!name) {
        alert("Por favor, digite seu nome!");
        return;
    }

    gameState.playerName = name;
    displayName.textContent = name;

    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    resetGame();
    loadLevel(gameState.currentLevel);
}

function restartGame() {
    gameoverScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    resetGame();
    loadLevel(1);
}

function resetGame() {
    gameState.currentLevel = 1;
    gameState.score = 0;
    gameState.lives = 3;
    updateHUD();
}

function loadLevel(levelNum) {
    document.getElementById('oil-flow').style.height = "0%";
    gameState.isTransitioning = false;
    testBtn.disabled = true;

    if (gameState.timerInterval) clearInterval(gameState.timerInterval);

    gameState.currentLevel = levelNum;
    const level = levels[levelNum - 1];
    gameState.timeLeft = level.time;

    levelDisplay.textContent = `Nível: ${levelNum}`;
    missionText.textContent = level.mission;
    updateHUD();

    grid.innerHTML = '';
    for (let i = 0; i < 1; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.addEventListener('click', () => placeOperator(cell));
        grid.appendChild(cell);
    }

    startTimer();
}

function startTimer() {
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);

    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateHUD();

        if (gameState.timeLeft <= 0) {
            timeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    timerDisplay.textContent = `⏱️ ${gameState.timeLeft}s`;
}

function timeUp() {
    clearInterval(gameState.timerInterval);
    clockSound.pause();
    clockSound.currentTime = 0;

    errorSound.play();
    loseLife();
}

function placeOperator(cell) {
    if (!gameState.selectedOperator || gameState.isTransitioning) return;

    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('placed');
        c.textContent = '';
    });

    cell.textContent = gameState.selectedOperator === 'sil' ? 'Silogismo' : 'Sofismo';
    cell.classList.add('placed');
    testBtn.disabled = false;
}

document.querySelectorAll('.operator-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        gameState.selectedOperator = this.dataset.operator;

        document.querySelectorAll('.operator-btn').forEach(b => {
            b.classList.remove('btn-primary');
            b.classList.add('btn-outline-primary');
        });

        this.classList.remove('btn-outline-primary');
        this.classList.add('btn-primary');
    });
});

testBtn.addEventListener('click', function () {
    const hasAnswer = document.querySelector('.cell.placed') !== null;
    if (!hasAnswer) {
        return;
    }
    testSolution();
});

function testSolution() {
    if (gameState.isTransitioning || !document.querySelector('.cell.placed')) {
        if (!document.querySelector('.cell.placed')) {
        }
        return;
    }

    const level = levels[gameState.currentLevel - 1];
    const expected = level.solution();
    const actual = evaluateSolution();

    if (expected === actual) {
        levelComplete();
    } else {
        levelFailed();
    }
}

function evaluateSolution() {
    const cell = document.querySelector('.cell.placed');
    if (!cell) return false;

    return cell.textContent.trim() === 'Silogismo';
}

function levelComplete() {
    gameState.isTransitioning = true;
    clearInterval(gameState.timerInterval);
    clockSound.pause();
    clockSound.currentTime = 0;

    gameState.score += 100 + gameState.timeLeft;
    updateHUD();

    successSound.play();
    document.getElementById('oil-flow').style.height = "100%";
    showFeedback("", true);

    testBtn.disabled = true;

    setTimeout(() => {
        if (gameState.currentLevel < levels.length) {
            loadLevel(gameState.currentLevel + 1);
        } else {
            gameCompleted();
        }
        gameState.isTransitioning = false;
    }, 2000);
}

function levelFailed() {
    gameState.isTransitioning = true;
    errorSound.play();
    document.getElementById('oil-flow').style.height = "30%";
    showFeedback("", false);
    grid.classList.add('shake');
    testBtn.disabled = true;

    setTimeout(() => {
        grid.classList.remove('shake');
        loseLife();
        gameState.isTransitioning = false;
    }, 300);
}

function loseLife() {
    gameState.lives--;
    updateHUD();

    if (gameState.lives <= 0) {
        gameOver();
    } else {
        loadLevel(gameState.currentLevel);
    }
}

function gameCompleted() {
    saveScore();
    showGameOver("Parabéns! Você completou todos os níveis!");
}

function gameOver() {
    document.getElementById('oil-flow').style.height = "0%";

    clearInterval(gameState.timerInterval);
    clockSound.pause();
    clockSound.currentTime = 0;

    gameoverSound.play();
    saveScore();
    showGameOver("Game Over! Tente novamente.");
}

function showGameOver(message) {
    gameScreen.classList.add('hidden');
    gameoverScreen.classList.remove('hidden');

    finalScoreDisplay.textContent = `${message} Pontuação: ${gameState.score}`;
}

function showFeedback(message, isSuccess) {
    const feedback = document.createElement('div');
    feedback.className = `feedback ${isSuccess ? 'success' : 'error'}`;
    feedback.textContent = message;

    document.body.appendChild(feedback);

    setTimeout(() => feedback.remove(), 3000);
}

function updateHUD() {
    document.getElementById('level-display').textContent = gameState.currentLevel;
    document.getElementById('timer').textContent = gameState.timeLeft;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;

    const timerBadge = document.getElementById('timer-badge');
    if (gameState.timeLeft <= 10) {
        timerBadge.classList.add('text-danger', 'border-danger');
        if (!clockSound.paused) clockSound.play();
    } else {
        timerBadge.classList.remove('text-danger', 'border-danger');
    }
}

function saveScore() {
    const playerData = {
        name: gameState.playerName,
        score: gameState.score,
        level: gameState.currentLevel
    };

    socket.emit('submit-score', playerData);
}

socket.on('update-rankings', (updatedRankings) => {
    gameState.highscores = updatedRankings;
    showHighscores();
});

function showHighscores() {
    highscoresList.innerHTML = '';

    gameState.highscores.forEach((player, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${player.name} - ${player.score} pts (Nível ${player.level})`;
        highscoresList.appendChild(li);
    });
}
