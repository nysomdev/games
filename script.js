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
    const muteIcon = muteButton.querySelector('i'); // Seleciona o elemento <i> dentro do botão

    // Variáveis de estado do jogo
    let currentPlayer = 'X';
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
            return true; // Retorna true para indicar que o jogo terminou com vitória
        }

        // Verifica empate (se não há mais células vazias e ninguém venceu)
        let roundDraw = !board.includes(''); // true se não houver células vazias
        if (roundDraw) {
            displayMessage('Empate! 🤝');
            gameActive = false; // Desativa o jogo
            return true; // Retorna true para indicar que o jogo terminou com empate
        }

        return false; // Retorna false para indicar que o jogo ainda está ativo
    };

    // Troca o jogador atual
    const switchPlayer = () => {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        displayMessage(`É a vez do Jogador ${currentPlayer}`);
    };

    // --- Lógica de Jogada (Humano e IA) ---

    // Função principal para realizar uma jogada
    const makeMove = (index) => {
        board[index] = currentPlayer; // Atualiza o tabuleiro interno
        cells[index].textContent = currentPlayer; // Atualiza a célula na UI
        cells[index].classList.add(currentPlayer.toLowerCase()); // Adiciona classe para estilo

        const gameResult = checkGameStatus(); // Verifica se a jogada terminou o jogo
        if (!gameResult) { // Se o jogo não terminou
            switchPlayer(); // Troca o jogador
            // Se for modo contra computador e a vez do computador, faz a jogada da IA
            if (isVsComputer && currentPlayer === 'O' && gameActive) {
                setTimeout(computerMove, 500); // Pequeno atraso para a jogada da IA parecer natural
            }
        }
    };

    // Handler para o clique na célula (jogador humano)
    const handleCellClick = (event) => {
        // CORREÇÃO POTENCIAL AQUI: Garantir que o 'event.target' seja a própria célula clicada
        // Se houver algum conteúdo dentro da célula que está recebendo o clique,
        // event.target pode ser o conteúdo (ex: texto 'X' ou 'O'), não a div 'cell'.
        // Podemos usar event.currentTarget se o listener estiver na célula, ou um 'closest'
        const clickedCell = event.currentTarget; // Usar currentTarget para garantir que seja a célula com o listener
        const clickedCellIndex = parseInt(clickedCell.dataset.cellIndex);

        // Impede jogada se: célula já preenchida, jogo inativo, ou se é a vez do computador (em modo vs. PC)
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
        gameMenu.classList.add('hidden'); // Esconde o menu de seleção
        gameArea.classList.remove('hidden'); // Mostra a área do jogo
        resetGameboard(); // Prepara o tabuleiro para o novo jogo

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
        gameMusic.pause(); // Pausa a música ao sair do jogo
        gameMusic.currentTime = 0; // Volta a música para o início
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


    // --- Configuração de Event Listeners ---

    // Event listeners para os botões de seleção de modo
    playerVsPlayerButton.addEventListener('click', () => startGame(false));
    playerVsComputerButton.addEventListener('click', () => startGame(true));

    // Event listener para o botão "Reiniciar Jogo"
    restartButton.addEventListener('click', resetGameboard);

    // Event listener para o botão "Menu Anterior"
    backToMenuButton.addEventListener('click', backToMenu);

    // Event listener para o botão de silenciar/tocar música
    muteButton.addEventListener('click', toggleMute);

    // Event listeners para o clique nas células do tabuleiro
    // AQUI É A MUDANÇA MAIS IMPORTANTE: Adicionado o listener às células
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));

    // Define o ícone inicial do botão de áudio ao carregar a página
    updateMuteButtonIcon();
});
