document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const gameMenu = document.getElementById('gameMenu');
    const gameArea = document.getElementById('gameArea');
    const playerVsPlayerButton = document.getElementById('playerVsPlayerButton');
    const playerVsComputerButton = document.getElementById('playerVsComputerButton');
    const gameStatus = document.getElementById('gameStatus');
    const restartButton = document.getElementById('restartButton');
    const backToMenuButton = document.getElementById('backToMenuButton');
    const muteButton = document.getElementById('muteButton');
    const gameMusic = document.getElementById('gameMusic');
    const muteIcon = muteButton.querySelector('i'); // NOVO: Seletor para o elemento <i> do ícone

    let currentPlayer = 'X';
    let board = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let isVsComputer = false;
    let isMusicPlaying = false; // Flag para controlar o estado da música (se está tocando ou pausada)

    // Condições de vitória
    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    // --- Funções Auxiliares ---

    // Função para exibir a mensagem de status
    const displayMessage = (message) => {
        gameStatus.textContent = message;
    };

    // Reseta o estado do jogo para o início
    const resetGameboard = () => {
        currentPlayer = 'X';
        board = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });
        displayMessage('É a vez do Jogador X');
    };

    // --- Lógica do Jogo Principal ---

    const handleCellClick = (event) => {
        const clickedCell = event.target;
        const clickedCellIndex = parseInt(clickedCell.dataset.cellIndex);

        if (board[clickedCellIndex] !== '' || !gameActive || (isVsComputer && currentPlayer === 'O')) {
            return;
        }

        makeMove(clickedCellIndex);
    };

    const makeMove = (index) => {
        board[index] = currentPlayer;
        cells[index].textContent = currentPlayer;
        cells[index].classList.add(currentPlayer.toLowerCase());

        const gameResult = checkGameStatus();
        if (!gameResult) {
            switchPlayer();
            if (isVsComputer && currentPlayer === 'O' && gameActive) {
                setTimeout(computerMove, 500);
            }
        }
    };

    const checkGameStatus = () => {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            const a = board[winCondition[0]];
            const b = board[winCondition[1]];
            const c = board[winCondition[2]];

            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            displayMessage(`Jogador ${currentPlayer} Venceu! 🎉`);
            gameActive = false;
            return true;
        }

        let roundDraw = !board.includes('');
        if (roundDraw) {
            displayMessage('Empate! 🤝');
            gameActive = false;
            return true;
        }

        return false;
    };

    const switchPlayer = () => {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        displayMessage(`É a vez do Jogador ${currentPlayer}`);
    };

    // --- Lógica do Computador (IA Simples) ---
    const computerMove = () => {
        let bestMove = -1;

        bestMove = findWinningOrBlockingMove('O');
        if (bestMove !== -1) {
            makeMove(bestMove);
            return;
        }

        bestMove = findWinningOrBlockingMove('X');
        if (bestMove !== -1) {
            makeMove(bestMove);
            return;
        }

        if (board[4] === '') {
            makeMove(4);
            return;
        }

        const corners = [0, 2, 6, 8].filter(index => board[index] === '');
        if (corners.length > 0) {
            bestMove = corners[Math.floor(Math.random() * corners.length)];
            makeMove(bestMove);
            return;
        }

        const sides = [1, 3, 5, 7].filter(index => board[index] === '');
        if (sides.length > 0) {
            bestMove = sides[Math.floor(Math.random() * sides.length)];
            makeMove(bestMove);
            return;
        }
    };

    const findWinningOrBlockingMove = (player) => {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const cellsInLine = [board[a], board[b], board[c]];
            const emptyCellIndex = [a, b, c].find(index => board[index] === '');

            if (cellsInLine.filter(cell => cell === player).length === 2 && emptyCellIndex !== undefined) {
                return emptyCellIndex;
            }
        }
        return -1;
    };


    // --- Gerenciamento de Modo de Jogo e Navegação ---

    const startGame = (vsComputerMode) => {
        isVsComputer = vsComputerMode;
        gameMenu.classList.add('hidden');
        gameArea.classList.remove('hidden');
        resetGameboard();
        playMusic(); // Começa a tocar a música ao iniciar o jogo
    };

    const backToMenu = () => {
        gameArea.classList.add('hidden');
        gameMenu.classList.remove('hidden');
        resetGameboard();
        // Não pausa a música aqui se ela for tocar no menu.
        // Se a música deve parar *totalmente* ao voltar ao menu, então pause aqui.
        // Se ela deve continuar tocando no menu, então não faça nada aqui.
        // Pelo que entendi da requisição anterior, ela para ao voltar.
        pauseMusic();
        updateMuteButtonIcon(); // NOVO: Atualiza o ícone ao voltar para o menu
    };

    // --- Lógica de Áudio ---
    const playMusic = () => {
        if (gameMusic.paused && !gameMusic.muted) { // Só toca se estiver pausada e não mutada
            gameMusic.volume = 0.3;
            gameMusic.play()
                .then(() => {
                    isMusicPlaying = true;
                    updateMuteButtonIcon(); // NOVO: Atualiza o ícone após tocar
                })
                .catch(error => {
                    console.error("Erro ao tentar tocar a música:", error);
                });
        }
    };

    const pauseMusic = () => {
        if (!gameMusic.paused) {
            gameMusic.pause();
            isMusicPlaying = false;
        }
        updateMuteButtonIcon(); // NOVO: Atualiza o ícone após pausar
    };

    const toggleMute = () => {
        gameMusic.muted = !gameMusic.muted; // Alterna o estado de mudo
        updateMuteButtonIcon(); // NOVO: Atualiza o ícone
        if (!gameMusic.muted && gameMusic.paused && isMusicPlaying) {
             // Se desmutou e a música estava pausada mas deveria estar tocando, tente tocar
             // Isso pode acontecer se o navegador pausou por inatividade, etc.
             playMusic();
        } else if (!gameMusic.muted && gameMusic.paused && !isMusicPlaying) {
             // Se desmutou e a música está pausada e não deveria estar tocando (ex: antes de iniciar jogo),
             // não faça nada.
        } else if (gameMusic.muted && !gameMusic.paused) {
             // Se mutou e a música estava tocando, ela continua tocando mas sem som.
             // Manter isMusicPlaying como true para que ao desmutar ela retorne.
        }
    };

    // NOVO: Função para atualizar o ícone do botão Silenciar/Tocar
    const updateMuteButtonIcon = () => {
        if (gameMusic.muted) {
            muteIcon.classList.remove('fa-volume-up');
            muteIcon.classList.add('fa-volume-mute');
        } else {
            muteIcon.classList.remove('fa-volume-mute');
            muteIcon.classList.add('fa-volume-up');
        }
    };

    // --- Event Listeners Iniciais ---
    playerVsPlayerButton.addEventListener('click', () => startGame(false));
    playerVsComputerButton.addEventListener('click', () => startGame(true));
    restartButton.addEventListener('click', resetGameboard);
    backToMenuButton.addEventListener('click', backToMenu);
    muteButton.addEventListener('click', toggleMute);

    // Estado inicial do ícone (útil se a música começar mutada ou não tocar por padrão)
    // gameMusic.muted = true; // Exemplo: se quiser que comece mutado
    updateMuteButtonIcon(); // Define o ícone inicial com base no estado de 'muted'
});
