document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const gameMenu = document.getElementById('gameMenu');
    const gameArea = document.getElementById('gameArea');
    const playerVsPlayerButton = document.getElementById('playerVsPlayerButton');
    const playerVsComputerButton = document.getElementById('playerVsComputerButton');
    const gameStatus = document.getElementById('gameStatus');
    const restartButton = document.getElementById('restartButton');
    const backToMenuButton = document.getElementById('backToMenuButton'); // Novo seletor

    let currentPlayer = 'X';
    let board = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let isVsComputer = false; // Nova variável para controlar o modo de jogo

    // Condições de vitória
    const winningConditions = [
        [0, 1, 2], // Linhas
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6], // Colunas
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8], // Diagonais: principal
        [2, 4, 6]  // Diagonais: secundária
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

        // Se a célula já está preenchida, o jogo acabou ou não é a vez do jogador (no modo contra computador)
        if (board[clickedCellIndex] !== '' || !gameActive || (isVsComputer && currentPlayer === 'O')) {
            return;
        }

        makeMove(clickedCellIndex);
    };

    // Função para realizar a jogada (compartilhada entre jogador e computador)
    const makeMove = (index) => {
        board[index] = currentPlayer;
        cells[index].textContent = currentPlayer;
        cells[index].classList.add(currentPlayer.toLowerCase());

        const gameResult = checkGameStatus();
        if (!gameResult) { // Se o jogo não terminou
            switchPlayer();
            if (isVsComputer && currentPlayer === 'O' && gameActive) {
                // Pequeno atraso para o movimento do computador parecer mais natural
                setTimeout(computerMove, 500);
            }
        }
    };

    // Verifica o status do jogo (vitória ou empate)
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
            return true; // Jogo terminou com vitória
        }

        let roundDraw = !board.includes('');
        if (roundDraw) {
            displayMessage('Empate! 🤝');
            gameActive = false;
            return true; // Jogo terminou com empate
        }

        return false; // Jogo continua
    };

    // Troca o jogador atual
    const switchPlayer = () => {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        displayMessage(`É a vez do Jogador ${currentPlayer}`);
    };

    // --- Lógica do Computador (IA Simples) ---
    const computerMove = () => {
        // Estratégia da IA:
        // 1. Tentar vencer
        // 2. Bloquear o jogador
        // 3. Ocupar o centro
        // 4. Ocupar cantos
        // 5. Ocupar lados vazios

        let bestMove = -1;

        // 1. Tentar vencer (verificar se 'O' pode vencer)
        bestMove = findWinningOrBlockingMove('O');
        if (bestMove !== -1) {
            makeMove(bestMove);
            return;
        }

        // 2. Bloquear o jogador (verificar se 'X' pode vencer e bloquear)
        bestMove = findWinningOrBlockingMove('X');
        if (bestMove !== -1) {
            makeMove(bestMove);
            return;
        }

        // 3. Ocupar o centro (célula 4)
        if (board[4] === '') {
            makeMove(4);
            return;
        }

        // 4. Ocupar cantos (0, 2, 6, 8)
        const corners = [0, 2, 6, 8].filter(index => board[index] === '');
        if (corners.length > 0) {
            bestMove = corners[Math.floor(Math.random() * corners.length)];
            makeMove(bestMove);
            return;
        }

        // 5. Ocupar lados vazios (1, 3, 5, 7)
        const sides = [1, 3, 5, 7].filter(index => board[index] === '');
        if (sides.length > 0) {
            bestMove = sides[Math.floor(Math.random() * sides.length)];
            makeMove(bestMove);
            return;
        }
    };

    // Função auxiliar para encontrar uma jogada vencedora ou de bloqueio para um dado jogador
    const findWinningOrBlockingMove = (player) => {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const cellsInLine = [board[a], board[b], board[c]];
            const emptyCellIndex = [a, b, c].find(index => board[index] === '');

            // Se houver exatamente duas do 'player' e uma vazia, essa é a jogada
            if (cellsInLine.filter(cell => cell === player).length === 2 && emptyCellIndex !== undefined) {
                return emptyCellIndex;
            }
        }
        return -1; // Nenhuma jogada de vitória/bloqueio encontrada
    };


    // --- Gerenciamento de Modo de Jogo e Navegação ---

    const startGame = (vsComputerMode) => {
        isVsComputer = vsComputerMode;
        gameMenu.classList.add('hidden'); // Esconde o menu
        gameArea.classList.remove('hidden'); // Mostra a área do jogo
        resetGameboard(); // Reinicia o tabuleiro
    };

    const backToMenu = () => {
        gameArea.classList.add('hidden'); // Esconde a área do jogo
        gameMenu.classList.remove('hidden'); // Mostra o menu
        resetGameboard(); // Opcional: reseta o tabuleiro ao voltar para o menu
    };

    // --- Event Listeners Iniciais ---
    playerVsPlayerButton.addEventListener('click', () => startGame(false));
    playerVsComputerButton.addEventListener('click', () => startGame(true));
    restartButton.addEventListener('click', resetGameboard);
    backToMenuButton.addEventListener('click', backToMenu); // Novo event listener
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));

    // A tela inicial agora é o menu, então não há mensagem padrão ao carregar.
});