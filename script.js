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
    const muteIcon = muteButton.querySelector('i');

    let currentPlayer = 'X';
    let board = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let isVsComputer = false;
    // Removendo isMusicPlaying - o estado de `gameMusic.paused` e `gameMusic.muted` será o suficiente.
    // let isMusicPlaying = false;

    // Condições de vitória (inalterado)
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // --- Funções Auxiliares (inalterado) ---
    const displayMessage = (message) => {
        gameStatus.textContent = message;
    };

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

    // --- Lógica do Jogo Principal (inalterado) ---
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

    // --- Lógica do Computador (IA Simples - inalterado) ---
    const computerMove = () => {
        let bestMove = -1;
        bestMove = findWinningOrBlockingMove('O');
        if (bestMove !== -1) { makeMove(bestMove); return; }
        bestMove = findWinningOrBlockingMove('X');
        if (bestMove !== -1) { makeMove(bestMove); return; }
        if (board[4] === '') { makeMove(4); return; }
        const corners = [0, 2, 6, 8].filter(index => board[index] === '');
        if (corners.length > 0) {
            bestMove = corners[Math.floor(Math.random() * corners.length)];
            makeMove(bestMove); return;
        }
        const sides = [1, 3, 5, 7].filter(index => board[index] === '');
        if (sides.length > 0) {
            bestMove = sides[Math.floor(Math.random() * sides.length)];
            makeMove(bestMove); return;
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
        // Aumentar volume e tentar tocar. A política de autoplay já deveria permitir aqui.
        gameMusic.volume = 0.3; // Define um volume inicial (ajuste se quiser)
        gameMusic.play().catch(error => {
            console.error("Erro ao tentar tocar a música (pode ser autoplay block):", error);
        });
        updateMuteButtonIcon(); // Garante que o ícone esteja correto após tentar tocar
    };

    const backToMenu = () => {
        gameArea.classList.add('hidden');
        gameMenu.classList.remove('hidden');
        resetGameboard();
        // Não precisamos pausar a música aqui se ela não deve parar no menu.
        // Se ela DEVE parar ao voltar ao menu, então:
        gameMusic.pause(); // Pausa a música
        gameMusic.currentTime = 0; // Volta para o início da música
        updateMuteButtonIcon(); // Atualiza o ícone (para volume-up se não for tocado automaticamente no menu)
    };

    // --- Lógica de Áudio ---
    // Removi as funções playMusic e pauseMusic como separadas,
    // a lógica está agora mais diretamente no toggleMute e startGame/backToMenu.

    const toggleMute = () => {
        gameMusic.muted = !gameMusic.muted; // Alterna o estado de mudo
        updateMuteButtonIcon(); // Atualiza o ícone imediatamente

        if (!gameMusic.muted && gameMusic.paused) {
            // Se desmutou e a música estava pausada (ex: por autoplay block anterior, ou estava em loop mas mutada),
            // tenta tocar novamente para garantir que ela retome.
            gameMusic.play().catch(error => {
                console.error("Erro ao tentar retomar a música após desmutar:", error);
            });
        }
    };

    // Função para atualizar o ícone do botão Silenciar/Tocar
    const updateMuteButtonIcon = () => {
        if (gameMusic.muted) {
            muteIcon.classList.remove('fa-volume-up');
            muteIcon.classList.add('fa-volume-mute');
            muteButton.setAttribute('aria-label', 'Tocar Música');
        } else {
            muteIcon.classList.remove('fa-volume-mute');
            muteIcon.classList.add('fa-volume-up');
            muteButton.setAttribute('aria-label', 'Silenciar Música');
        }
    };

    // --- Event Listeners Iniciais ---
    playerVsPlayerButton.addEventListener('click', () => startGame(false));
    playerVsComputerButton.addEventListener('click', () => startGame(true));
    restartButton.addEventListener('click', resetGameboard);
    backToMenuButton.addEventListener('click', backToMenu);
    muteButton.addEventListener('click', toggleMute);

    // Estado inicial do ícone (sempre bom chamar no início para refletir o estado padrão do elemento <audio>)
    // Se você quer que a música comece mutada por padrão:
    // gameMusic.muted = true;
    updateMuteButtonIcon();
});
