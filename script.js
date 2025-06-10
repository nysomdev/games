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
        gameActive = true;
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
        const clickedCell = event.target;
        const clickedCellIndex = parseInt(clickedCell.dataset.cellIndex);

        // Impede jogada se: célula já preenchida, jogo inativo, ou se é a vez do computador (em modo vs. PC)
        if (board[clickedCellIndex] !== '' || !gameActive || (isVsComputer && currentPlayer === 'O')) {
            return;
        }

        makeMove(clickedCellIndex);
    };


    // --- Lógica do Computador (IA Simples) ---

    const computerMove = () => {
        let bestMove = -1;

        // Estratégia da IA:
        // 1. Tentar vencer (verificar se 'O' pode vencer na próxima jogada)
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

        // 3. Ocupar o centro (célula 4) se estiver vazio
        if (board[4] === '') {
            makeMove(4);
            return;
        }

        // 4. Ocupar um dos cantos (0, 2, 6, 8) aleatoriamente se estiver vazio
        const corners = [0, 2, 6, 8].filter(index => board[index] === '');
        if (corners.length > 0) {
            bestMove = corners[Math.floor(Math.random() * corners.length)];
            makeMove(bestMove);
            return;
        }

        // 5. Ocupar um dos lados (1, 3, 5, 7) aleatoriamente se estiver vazio
        const sides = [1, 3, 5, 7].filter(index => board[index] === '');
        if (sides.length > 0) {
            bestMove = sides[Math.floor(Math.random() * sides.length)];
            makeMove(bestMove);
            return;
        }
    };

    // Função auxiliar para encontrar uma jogada que vença ou bloqueie um jogador
    const findWinningOrBlockingMove = (player) => {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const cellsInLine = [board[a], board[b], board[c]];
            const emptyCellIndex = [a, b, c].find(index => board[index] === '');

            // Se houver exatamente duas marcações do 'player' e uma célula vazia na linha
            if (cellsInLine.filter(cell => cell === player).length === 2 && emptyCellIndex !== undefined) {
                return emptyCellIndex; // Retorna o índice da célula vazia para a jogada
            }
        }
        return -1; // Nenhuma jogada de vitória/bloqueio encontrada
    };


    // --- Gerenciamento de Modo de Jogo e Navegação de Telas ---

    // Inicia o jogo no modo selecionado
    const startGame = (vsComputerMode) => {
        isVsComputer = vsComputerMode;
        gameMenu.classList.add('hidden'); // Esconde o menu de seleção
        gameArea.classList.remove('hidden'); // Mostra a área do jogo
        resetGameboard(); // Prepara o tabuleiro para o novo jogo

        // Tenta tocar a música (ação do usuário é o clique no botão)
        gameMusic.volume = 0.3; // Define um volume inicial (0.0 a 1.0)
        gameMusic.play().catch(error => {
            console.error("Erro ao tentar tocar a música (possível bloqueio de autoplay):", error);
            // Mensagem opcional para o usuário se o autoplay for bloqueado
            // alert("A música não pôde ser iniciada automaticamente. Por favor, clique no ícone de volume para ativar o som.");
        });
        updateMuteButtonIcon(); // Atualiza o ícone de áudio para refletir o estado de reprodução
    };

    // Volta para o menu de seleção de modo de jogo
    const backToMenu = () => {
        gameArea.classList.add('hidden'); // Esconde a área do jogo
        gameMenu.classList.remove('hidden'); // Mostra o menu de seleção
        resetGameboard(); // Reseta o tabuleiro ao voltar para o menu
        gameMusic.pause(); // Pausa a música ao sair do jogo
        gameMusic.currentTime = 0; // Volta a música para o início
        updateMuteButtonIcon(); // Atualiza o ícone (normalmente para "volume-up" se não está tocando no menu)
    };

    // --- Lógica de Áudio e Controle de Mute ---

    // Alterna o estado de mudo da música
    const toggleMute = () => {
        gameMusic.muted = !gameMusic.muted; // Alterna entre mutado e desmutado
        updateMuteButtonIcon(); // Atualiza o ícone do botão

        // Se desmutou e a música estava pausada, tenta tocar novamente
        if (!gameMusic.muted && gameMusic.paused) {
            gameMusic.play().catch(error => {
                console.error("Erro ao tentar retomar a música após desmutar:", error);
            });
        }
    };

    // Atualiza o ícone do botão de som com base no estado da música
    const updateMuteButtonIcon = () => {
        if (gameMusic.muted) {
            muteIcon.classList.remove('fa-volume-up');
            muteIcon.classList.add('fa-volume-mute'); // Ícone de som desligado
            muteButton.setAttribute('aria-label', 'Tocar Música'); // Acessibilidade
        } else {
            muteIcon.classList.remove('fa-volume-mute');
            muteIcon.classList.add('fa-volume-up'); // Ícone de som ligado
            muteButton.setAttribute('aria-label', 'Silenciar Música'); // Acessibilidade
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
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));

    // Define o ícone inicial do botão de áudio ao carregar a página
    // (Útil se a música começar mutada por padrão ou se o navegador a pausar)
    // Se quiser que a música comece mutada por padrão: gameMusic.muted = true;
    updateMuteButtonIcon();
});
