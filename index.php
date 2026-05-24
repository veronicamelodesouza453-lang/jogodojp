<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Pokémon Card Duel - Arena de Batalha</title>
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-container">
        <div class="game-header">
            <button class="menu-button" id="menuToggle">
                <i class="fas fa-bars"></i>
            </button>
            <div class="game-title">
                <i class="fas fa-circle-notch"></i>
                <span>CARD DUEL</span>
            </div>
            <div class="score-display">
                <div class="score-item">
                    <i class="fas fa-user"></i>
                    <span id="scoreP1">0</span>
                </div>
                <div class="score-vs">VS</div>
                <div class="score-item">
                    <i class="fas fa-robot" id="p2Icon"></i>
                    <span id="scoreP2">0</span>
                </div>
            </div>
        </div>

        <div class="battle-status" id="battleStatus">
            <div class="status-content">
                <i class="fas fa-gamepad"></i>
                <span id="statusMessage">ESCOLHA SEU POKÉMON</span>
            </div>
        </div>

        <div class="screen active" id="selectionScreen">
            <div class="selection-header">
                <div class="search-wrapper">
                    <i class="fas fa-search"></i>
                    <input type="text" id="searchInput" placeholder="Buscar Pokémon...">
                </div>
                <button class="random-button" id="randomButton">
                    <i class="fas fa-dice-d6"></i>
                    <span>ALEATÓRIO</span>
                </button>
            </div>

            <div class="cards-grid" id="pokemonGrid"></div>
        </div>

        <div class="screen" id="battleScreen">
            <div class="cards-battle">
                <div class="card-container" id="cardP1Container">
                    <div class="pokemon-card-front" id="cardP1">
                        <div class="card-image">
                            <img id="battleImgP1" src="" alt="">
                        </div>
                        <div class="card-name" id="battleNameP1">???</div>
                        <div class="card-type" id="battleTypeP1"></div>
                        <div class="card-stats-area" id="battleStatsP1"></div>
                    </div>
                    <div class="pokemon-card-front pokemon-card-back" id="cardP1Back">
                        <div class="back-pattern"></div>
                        <div class="back-logo">
                            <i class="fas fa-id-badge"></i>
                            <p>JOGADOR 1</p>
                        </div>
                    </div>
                </div>

                <div class="card-container" id="cardP2Container">
                    <div class="pokemon-card-front" id="cardP2">
                        <div class="card-image">
                            <img id="battleImgP2" src="" alt="">
                        </div>
                        <div class="card-name" id="battleNameP2">???</div>
                        <div class="card-type" id="battleTypeP2"></div>
                        <div class="card-stats-area" id="battleStatsP2"></div>
                    </div>
                    <div class="pokemon-card-front pokemon-card-back" id="cardP2Back">
                        <div class="back-pattern"></div>
                        <div class="back-logo">
                            <i class="fas fa-ghost"></i>
                            <p id="backLabelP2">OPONENTE</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="action-footer">
                <button class="action-button battle-button" id="battleButton" disabled>
                    <i class="fas fa-bolt"></i>
                    REVELAR E BATALHAR!
                </button>
            </div>
        </div>

        <div class="modal-overlay" id="detailsModal">
            <div class="modal-card">
                <button class="modal-close" id="closeModalBtn">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-body">
                    </div>
                <div class="modal-footer">
                    <button class="action-button primary" id="modalConfirmBtn">
                        <i class="fas fa-check-circle"></i> CHOOSE THIS POKÉMON
                    </button>
                </div>
            </div>
        </div>

        <div class="menu-overlay" id="menuOverlay"></div>
        <div class="side-menu" id="sideMenu">
            <div class="menu-header">
                <h3>CONFIGURAÇÕES</h3>
                <button class="close-menu" id="closeMenu"><i class="fas fa-times"></i></button>
            </div>
            <div class="menu-section">
                <label>MODO DE JOGO</label>
                <div class="menu-buttons">
                    <button class="menu-option active" id="modeSolo">
                        <i class="fas fa-microchip"></i> SOLO
                    </button>
                    <button class="menu-option" id="modePVP">
                        <i class="fas fa-users"></i> 2 JOGADORES
                    </button>
                </div>
            </div>
            <div class="menu-section">
                <label>REGRAS</label>
                <div class="menu-buttons">
                    <button class="menu-option active" id="ruleAttribute">
                        <i class="fas fa-star"></i> ATRIBUTO
                    </button>
                    <button class="menu-option" id="ruleTotal">
                        <i class="fas fa-chart-line"></i> SOMA TOTAL
                    </button>
                </div>
            </div>
            <button class="reset-button" id="resetGame">
                <i class="fas fa-undo-alt"></i> RESETAR PLACAR
            </button>
        </div>

        <div class="game-overlay" id="passOverlay">
            <div class="overlay-card">
                <div class="overlay-icon">
                    <i class="fas fa-random"></i>
                </div>
                <h2>VEZ DO JOGADOR 2!</h2>
                <p>Passe o aparelho para o próximo jogador escolher em segredo.</p>
                <button class="overlay-button" id="continueButton">
                    <i class="fas fa-arrow-right"></i> CONTINUAR
                </button>
            </div>
        </div>

        <div class="game-overlay" id="resultOverlay">
            <div class="overlay-card result-card">
                <div class="result-icon" id="resultIcon">
                    <i class="fas fa-trophy"></i>
                </div>
                <h2 id="resultTitle">VITÓRIA!</h2>
                <div class="result-details" id="resultDetails"></div>
                <button class="overlay-button" id="nextRoundButton">
                    <i class="fas fa-forward"></i> PRÓXIMA RODADA
                </button>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>