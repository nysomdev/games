document.addEventListener('DOMContentLoaded', () => {
    // Seleção de elementos HTML
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
    const playerWinSound = document.getElementById('playerWinSound'); // NOVO: Seletor para o som de vitória do jogador
    const computerWinSound = document.getElementById('computerWinSound'); // NOVO: Seletor para o som de vitória do computador
    const muteIcon = muteButton.querySelector('i');

    // Variáveis de estado do jogo
    let currentPlayer = 'X'; // 'X' é sempre o jogador humano no modo vs. computador
    let board = ['', '', '', '', '', '', '', '', '']; // Representa o tabuleiro
    let gameActive = true; // True enquanto o jogo não terminou
    let isVsComputer = false; // True se o jogo é contra o computador

    // Condições de vitória possíveis (índices das células)
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
        [0, 4, 8], [2, 4, 6]  // Diagonais
    ];

    // --- Funções Auxiliares de UI ---

    // Função para exibir a mensagem de status no jogo
    const displayMessage = (message) => {
        gameStatus.textContent = message;
    };

    // --- Lógica de Reinício e Estado do Jogo ---

    // Reseta o tabuleiro e o estado do jogo para um novo início
    const resetGameboard = () => {
        currentPlayer = 'X';
        board = ['', '', '', '', '', '', '', '', ''];
        gameActive = true; // Garante que o jogo esteja ativo
        cells.forEach(cell => {
            cell.textContent = ''; // Limpa o conteúdo da célula
            cell.classList.remove('x', 'o'); // Remove as classes de jogador
        });
        displayMessage('É a vez do Jogador X'); // Define a mensagem inicial

        // Opcional: Pausar os sons de vitória se eles estiverem tocando e o jogo for reiniciado rapidamente
        if (!playerWinSound.paused) {
            playerWinSound.pause();
            playerWinSound.currentTime = 0;
        }
        if (!computerWinSound.paused) {
            computerWinSound.pause();
            computerWinSound.currentTime = 0;
        }
    };

    // Verifica o status atual do jogo (vitória ou empate)
    const checkGameStatus = () => {
        let roundWon = false;
        // Percorre todas as condições de vitória
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            const a = board[winCondition[0]];
            const b = board[winCondition[1]];
            const c = board[winCondition[2]];

            // Se qualquer célula da condição estiver vazia, não há vitória nesta condição ainda
            if (a === '' || b === '' || c === '') {
                continue;
            }
            // Verifica se as três células são iguais (vitória)
            if (a === b && b === c) {
                roundWon = true;
                break; // Encontrou uma vitória, pode sair do loop
            }
        }

        if (roundWon) {
            displayMessage(`Jogador ${currentPlayer} Venceu! 🎉`);
            gameActive = false; // Desativa o jogo

            // NOVO: Toca o som de vitória apropriado
            if (isVsComputer && currentPlayer === 'O') { // Se for modo vs. Computador e o 'O' (computador) venceu
                playComputerWinSound();
            } else { // Se for jogador vs. jogador, ou jogador vs. computador e o 'X' (humano) venceu
                playPlayerWinSound();
            }
            return true; // Retorna true para indicar que o jogo terminou com vitória
        }

        // Verifica empate (se não há mais células vazias e ninguém venceu)
        let roundDraw = !board.includes(''); // true se não houver células vazias
        if (roundDraw) {
            displayMessage('Empate! 🤝');
            gameActive = false; // Desativa o jogo
            // Opcional: Se quiser um som diferente para empate, adicione aqui
            return true; // Retorna true para indicar que o jogo terminou com empate
        }

        return false; // Retorna false para indicar que o jogo ainda está ativo
    };

    // Troca o jogador atual (inalterado)
    const switchPlayer = () => {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        displayMessage(`É a vez do Jogador ${currentPlayer}`);
    };

    // --- Lógica de Jogada (Humano e IA - inalterado) ---

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

    const handleCellClick = (event) => {
        const clickedCell = event.currentTarget;
        const clickedCellIndex = parseInt(clickedCell.dataset.cellIndex);

        if (board[clickedCellIndex] !== '' || !gameActive || (isVsComputer && currentPlayer === 'O')) {
            return;
        }

        makeMove(clickedCellIndex);
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


    // --- Gerenciamento de Modo de Jogo e Navegação de Telas ---

    const startGame = (vsComputerMode) => {
        isVsComputer = vsComputerMode;
        gameMenu.classList.add('hidden');
        gameArea.classList.remove('hidden');
        resetGameboard();

        gameMusic.volume = 0.3;
        gameMusic.play().catch(error => {
            console.error("Erro ao tentar tocar a música (possível bloqueio de autoplay):", error);
        });
        updateMuteButtonIcon();
    };

    const backToMenu = () => {
        gameArea.classList.add('hidden');
        gameMenu.classList.remove('hidden');
        resetGameboard();
        gameMusic.pause();
        gameMusic.currentTime = 0;
        updateMuteButtonIcon();
    };

    // --- Lógica de Áudio e Controle de Mute ---

    const toggleMute = () => {
        gameMusic.muted = !gameMusic.muted;
        updateMuteButtonIcon();

        if (!gameMusic.muted && gameMusic.paused) {
            gameMusic.play().catch(error => {
                console.error("Erro ao tentar retomar a música após desmutar:", error);
            });
        }
    };

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

    // NOVA: Função para tocar o som de vitória do JOGADOR
    const playPlayerWinSound = () => {
        gameMusic.volume = 0.1; // Reduz o volume da música de fundo
        playerWinSound.volume = 0.6; // Define um volume para o som de vitória do jogador
        playerWinSound.currentTime = 0; // Garante que o som sempre comece do início
        playerWinSound.play().catch(error => {
            console.error("Erro ao tocar som de vitória do jogador:", error);
        });

        // Restaurar o volume da música de fundo após o som de vitória terminar
        playerWinSound.onended = () => {
            if (!gameMusic.muted) {
                gameMusic.volume = 0.3;
            }
        };
    };

    // NOVA: Função para tocar o som de vitória do COMPUTADOR
    const playComputerWinSound = () => {
        gameMusic.volume = 0.1; // Reduz o volume da música de fundo
        computerWinSound.volume = 0.6; // Define um volume para o som de vitória do computador
        computerWinSound.currentTime = 0; // Garante que o som sempre comece do início
        computerWinSound.play().catch(error => {
            console.error("Erro ao tocar som de vitória do computador:", error);
        });

        // Restaurar o volume da música de fundo após o som de vitória terminar
        computerWinSound.onended = () => {
            if (!gameMusic.muted) {
                gameMusic.volume = 0.3;
            }
        };
    };


    // --- Configuração de Event Listeners ---

    playerVsPlayerButton.addEventListener('click', () => startGame(false));
    playerVsComputerButton.addEventListener('click', () => startGame(true));

    restartButton.addEventListener('click', resetGameboard);

    backToMenuButton.addEventListener('click', backToMenu);

    muteButton.addEventListener('click', toggleMute);

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));

    updateMuteButtonIcon();
});
