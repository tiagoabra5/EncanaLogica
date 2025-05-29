const sensorState = {
    a: false,
    b: false,
    c: false
};

const gameState = {
    playerName: "",
    currentLevel: 1,
    score: 0,
    lives: 3,
    timeLeft: 60,
    timerInterval: null,
    selectedOperator: null,
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

const socket = new WebSocket("wss:https://encanalogica-ws.onrender.com");

// Niveis
const levels = [
    // Nivel 1
    {
        mission: "Nenhum gato é cachorro. Meu pet é um gato. Logo, meu pet não é cachorro",
        solution: () => true,
        time: 60,
        answer: "Silogismo (válido)"
    },
    // Nivel 2
    {
        mission: "Todas as plantas são verdes. Algumas flores são verdes. Logo, algumas flores são plantas",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 3
    {
        mission: "Todos os mamíferos têm pulmões. Baleias são mamíferos. Logo, baleias têm pulmões",
        solution: () => true,
        time: 60,
        answer: "Silogismo (válido)"
    },
    // Nivel 4
    {
        mission: "Quem estuda passa. João não estuda. Logo, João não passa",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 5
    {
        mission: "Todos os pássaros voam. O pinguim é um pássaro. Logo, o pinguim voa",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 6
    {
        mission: "Todos os A são B. Alguns C são B. Logo, alguns C são A",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 7
    {
        mission: "Nenhum político é honesto. Alguns professores são políticos. Logo, alguns professores não são honestos",
        solution: () => true,
        time: 60,
        answer: "Silogismo"
    },
    // Nivel 8
    {
        mission: "Se é dia, há luz. Há luz. Logo, é dia",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 9
    {
        mission: "Tudo que é raro é valioso. Água não é rara. Logo, água não é valiosa",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 10
    {
        mission: "Nenhum peixe é mamífero. Alguns golfinhos são peixes. Logo, alguns golfinhos não são mamíferos",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 11
    {
        mission: "Se está chovendo, então a rua está molhada. A rua está molhada. Logo, está chovendo",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 12
    {
        mission: "Todos os médicos estudaram. Alguns que estudaram são artistas. Logo, alguns médicos são artistas",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
    },
    // Nivel 13
    {
        mission: "Nenhum réptil tem pelos. Alguns animais de estimação têm pelos. Logo, alguns animais de estimação não são répteis",
        solution: () => true,
        time: 60,
        answer: "Silogismo"
    },
    // Nivel 14
    {
        mission: "Alguns professores são pacientes. Todos os pacientes são educados. Logo, alguns professores são educados",
        solution: () => true,
        time: 60,
        answer: "Silogismo"
    },
    // Nivel 15
    {
        mission: "Todas as estrelas brilham. O sol brilha. Logo, o sol é uma estrela",
        solution: () => false,
        time: 60,
        answer: "Sofisma"
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
    updateTimerDisplay();

    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();

        if (gameState.timeLeft === 10) {
            clockSound.play();
            timerDisplay.classList.add('warning');
        }

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
    if (!gameState.selectedOperator) return;

    cell.textContent = gameState.selectedOperator;
    cell.classList.add('placed');

    document.querySelectorAll('.cell').forEach(otherCell => {
        if (otherCell !== cell) {
            otherCell.textContent = '';
            otherCell.classList.remove('placed');
        }
    });
}

document.querySelectorAll('.btn-logic').forEach(btn => {
    btn.addEventListener('click', function () {
        gameState.selectedOperator = this.dataset.operator;

        document.querySelectorAll('.btn-logic').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
    });
});

testBtn.addEventListener('click', testSolution);

function testSolution() {
    const level = levels[gameState.currentLevel - 1];
    const cells = document.querySelectorAll('.cell.placed');

    const expected = level.solution(sensorState.a, sensorState.b);
    const actual = evaluateSolution(sensorState.a, sensorState.b);

    if (expected === actual) {
        levelComplete();
    } else {
        levelFailed();
    }
}

function evaluateSolution() {
    const cells = document.querySelectorAll('.cell.placed');
    let result = null;

    for (const cell of cells) {
        const operators = cell.textContent.trim().split(/\s+/);

        let current = null;

        for (const op of operators) {
            switch (op) {
                case 'sil': current = true; break;
                case 'sof': current = false; break;
                default: current = false; break;
            }
        }

        if (result === null) {
            result = current;
        } else {
            result = result || current;
        }
    }

    return result;
}

function levelComplete() {
    clearInterval(gameState.timerInterval);
    clockSound.pause();
    clockSound.currentTime = 0;

    gameState.score += 100 + gameState.timeLeft;
    updateHUD();

    successSound.play();
    document.getElementById('oil-flow').style.height = "100%";
    showFeedback("", true);

    setTimeout(() => {
        if (gameState.currentLevel < levels.length) {
            loadLevel(gameState.currentLevel + 1);
        } else {
            gameCompleted();
        }
    }, 2000);
}

function levelFailed() {
    errorSound.play();
    document.getElementById('oil-flow').style.height = "30%";
    showFeedback("", false);
    grid.classList.add('shake');

    setTimeout(() => grid.classList.remove('shake'), 300);
    loseLife();
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
    showHighscores();
}

function showFeedback(message, isSuccess) {
    const feedback = document.createElement('div');
    feedback.className = `feedback ${isSuccess ? 'success' : 'error'}`;
    feedback.textContent = message;

    document.body.appendChild(feedback);

    setTimeout(() => feedback.remove(), 3000);
}

function updateHUD() {
    scoreDisplay.textContent = `🏆 ${gameState.score}`;
    livesDisplay.textContent = `❤️ `.repeat(gameState.lives);
}

function saveScore() {
    const playerData = {
        name: gameState.playerName,
        score: gameState.score,
        level: gameState.currentLevel,
        date: new Date().toLocaleDateString()
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
