let pokemonData = [];
let gameState = {
    mode: 'solo',
    rule: 'attribute',
    step: 'select_p1',
    p1Pokemon: null,
    p2Pokemon: null,
    selectedStat: null,
    tempSelectedPokemon: null // Guarda o Pokémon visualizado no modal antes da confirmação
};
let scores = { p1: 0, p2: 0 };

// Elementos DOM
const selectionScreen = document.getElementById('selectionScreen');
const battleScreen = document.getElementById('battleScreen');
const pokemonGrid = document.getElementById('pokemonGrid');
const searchInput = document.getElementById('searchInput');
const battleButton = document.getElementById('battleButton');
const randomButton = document.getElementById('randomButton');
const statusMessage = document.getElementById('statusMessage');
const scoreP1 = document.getElementById('scoreP1');
const scoreP2 = document.getElementById('scoreP2');
const p2Icon = document.getElementById('p2Icon');

// Modal de Detalhes
const detailsModal = document.getElementById('detailsModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');

// Menu
const menuToggle = document.getElementById('menuToggle');
const menuOverlay = document.getElementById('menuOverlay');
const sideMenu = document.getElementById('sideMenu');
const closeMenu = document.getElementById('closeMenu');
const modeSolo = document.getElementById('modeSolo');
const modePVP = document.getElementById('modePVP');
const ruleAttribute = document.getElementById('ruleAttribute');
const ruleTotal = document.getElementById('ruleTotal');
const resetGame = document.getElementById('resetGame');
const continueButton = document.getElementById('continueButton');
const nextRoundButton = document.getElementById('nextRoundButton');

// Overlays
const passOverlay = document.getElementById('passOverlay');
const resultOverlay = document.getElementById('resultOverlay');

// Carregar Dados da API Local
async function loadPokemon() {
    try {
        const response = await fetch('pokemon.json');
        const data = await response.json();
        pokemonData = data.pokemon || data;
        renderPokemonGrid();
        updateStatusMessage();
    } catch (error) {
        console.error('Erro ao carregar Pokémon:', error);
        statusMessage.innerText = 'ERRO AO CARREGAR OS DADOS!';
    }
}

// Renderização Limpa do Catálogo Principal (apenas miniaturas)
function renderPokemonGrid(filter = '') {
    pokemonGrid.innerHTML = '';
    const filtered = pokemonData.filter(p => 
        p.name.toLowerCase().includes(filter.toLowerCase())
    );
    
    filtered.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'pokemon-select-card';
        card.id = `select-card-${pokemon.id}`;
        
        card.innerHTML = `
            <img src="${pokemon.img}" alt="${pokemon.name}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png'">
            <h4>${pokemon.name}</h4>
        `;
        
        // Em vez de selecionar direto, agora abre o modal de detalhes detalhado
        card.addEventListener('click', () => openDetailsModal(pokemon));
        pokemonGrid.appendChild(card);
    });
}

// Abre o Modal Temático de Visualização com Barras de Status
function openDetailsModal(pokemon) {
    gameState.tempSelectedPokemon = pokemon;
    const modalBody = detailsModal.querySelector('.modal-body');
    const type = pokemon.type?.[0] || 'Normal';
    
    // Cálculo de porcentagem com base em um teto máximo de status (ex: 150)
    const getPercent = (val) => Math.min(100, Math.max(8, (parseInt(val) / 150) * 100));

    modalBody.innerHTML = `
        <div class="modal-display-section">
            <img class="modal-poke-img" src="${pokemon.img}" alt="${pokemon.name}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png'">
            <h2 class="modal-poke-name">${pokemon.name}</h2>
            <div class="modal-types-row">
                <span class="modal-type-tag" style="background-color: var(--type-${type})">${type}</span>
            </div>
        </div>
        <div class="modal-stats-section">
            <div class="modal-stat-bar-wrapper">
                <div class="modal-stat-info"><span class="stat-label">HP</span><span class="stat-val">${pokemon.hp}</span></div>
                <div class="modal-stat-bar-bg"><div class="modal-stat-bar-fill fill-hp" style="width: ${getPercent(pokemon.hp)}%"></div></div>
            </div>
            <div class="modal-stat-bar-wrapper">
                <div class="modal-stat-info"><span class="stat-label">ATTACK</span><span class="stat-val">${pokemon.attack}</span></div>
                <div class="modal-stat-bar-bg"><div class="modal-stat-bar-fill fill-attack" style="width: ${getPercent(pokemon.attack)}%"></div></div>
            </div>
            <div class="modal-stat-bar-wrapper">
                <div class="modal-stat-info"><span class="stat-label">DEFENSE</span><span class="stat-val">${pokemon.defense}</span></div>
                <div class="modal-stat-bar-bg"><div class="modal-stat-bar-fill fill-defense" style="width: ${getPercent(pokemon.defense)}%"></div></div>
            </div>
            <div class="modal-stat-bar-wrapper">
                <div class="modal-stat-info"><span class="stat-label">SPEED</span><span class="stat-val">${pokemon.speed}</span></div>
                <div class="modal-stat-bar-bg"><div class="modal-stat-bar-fill fill-speed" style="width: ${getPercent(pokemon.speed)}%"></div></div>
            </div>
        </div>
    `;
    
    detailsModal.style.display = 'flex';
}

// Fechar Modal
closeModalBtn.addEventListener('click', () => {
    detailsModal.style.display = 'none';
    gameState.tempSelectedPokemon = null;
});

// Ação de Confirmar Escolha do Modal de Detalhes
modalConfirmBtn.addEventListener('click', () => {
    if (!gameState.tempSelectedPokemon) return;
    
    const selected = gameState.tempSelectedPokemon;
    detailsModal.style.display = 'none';

    if (gameState.step === 'select_p1') {
        gameState.p1Pokemon = selected;
        if (gameState.mode === 'solo') {
            const randomIndex = Math.floor(Math.random() * pokemonData.length);
            gameState.p2Pokemon = pokemonData[randomIndex];
            goToBattle();
        } else {
            gameState.step = 'select_p2';
            searchInput.value = '';
            renderPokemonGrid();
            passOverlay.style.display = 'flex';
            updateStatusMessage();
        }
    } else if (gameState.step === 'select_p2') {
        gameState.p2Pokemon = selected;
        goToBattle();
    }
    
    gameState.tempSelectedPokemon = null;
});

searchInput.addEventListener('input', (e) => renderPokemonGrid(e.target.value));

// Sorteio Aleatório Direto com abertura do Modal
randomButton.addEventListener('click', () => {
    if (!pokemonData.length) return;
    randomButton.disabled = true;
    let count = 0;
    const currentCards = Array.from(pokemonGrid.children);
    if(currentCards.length === 0) return;

    const interval = setInterval(() => {
        currentCards.forEach(c => c.classList.remove('roulette-highlight'));
        const randomIndex = Math.floor(Math.random() * currentCards.length);
        currentCards[randomIndex].classList.add('roulette-highlight');
        
        count++;
        if (count > 10) {
            clearInterval(interval);
            currentCards.forEach(c => c.classList.remove('roulette-highlight'));
            
            const randomPokemon = pokemonData[Math.floor(Math.random() * pokemonData.length)];
            randomButton.disabled = false;
            openDetailsModal(randomPokemon);
        }
    }, 80);
});

// Transição para Arena de Batalha
function goToBattle() {
    gameState.step = 'battle';
    selectionScreen.classList.remove('active');
    battleScreen.classList.add('active');
    
    p2Icon.className = gameState.mode === 'solo' ? 'fas fa-robot' : 'fas fa-user';
    document.getElementById('backLabelP2').innerText = gameState.mode === 'solo' ? 'OPONENTE' : 'JOGADOR 2';
    
    document.getElementById('battleNameP1').innerText = gameState.p1Pokemon.name;
    document.getElementById('battleImgP1').src = gameState.p1Pokemon.img;
    const type1 = gameState.p1Pokemon.type?.[0] || 'Normal';
    document.getElementById('battleTypeP1').innerHTML = `<span style="background: var(--type-${type1})">${type1}</span>`;
    
    document.getElementById('battleNameP2').innerText = gameState.p2Pokemon.name;
    document.getElementById('battleImgP2').src = gameState.p2Pokemon.img;
    const type2 = gameState.p2Pokemon.type?.[0] || 'Normal';
    document.getElementById('battleTypeP2').innerHTML = `<span style="background: var(--type-${type2})">${type2}</span>`;
    
    const cardP1 = document.getElementById('cardP1Container');
    const cardP2 = document.getElementById('cardP2Container');
    
    if (gameState.mode === 'solo') {
        cardP1.classList.remove('flipped');
        cardP2.classList.add('flipped');
    } else {
        cardP1.classList.add('flipped');
        cardP2.classList.add('flipped');
    }
    
    renderBattleStats();
    updateStatusMessage();
    
    if (gameState.rule === 'total') {
        gameState.selectedStat = 'total';
        battleButton.disabled = false;
    } else {
        gameState.selectedStat = null;
        battleButton.disabled = true;
    }
}

function renderBattleStats() {
    const stats = ['hp', 'attack', 'defense', 'speed'];
    const containerP1 = document.getElementById('battleStatsP1');
    const containerP2 = document.getElementById('battleStatsP2');
    
    containerP1.innerHTML = '';
    containerP2.innerHTML = '';
    
    stats.forEach(stat => {
        const isSelectable = gameState.rule === 'attribute';
        const statP1 = document.createElement('div');
        statP1.className = `card-stat ${isSelectable ? 'selectable' : ''}`;
        statP1.innerHTML = `<span>${stat.toUpperCase()}</span> <strong>${gameState.p1Pokemon[stat]}</strong>`;
        
        if (isSelectable) {
            statP1.addEventListener('click', () => {
                const cardP1 = document.getElementById('cardP1Container');
                if (cardP1.classList.contains('flipped')) {
                    cardP1.classList.remove('flipped');
                }
                document.querySelectorAll('#battleStatsP1 .card-stat').forEach(s => s.classList.remove('selected'));
                statP1.classList.add('selected');
                gameState.selectedStat = stat;
                battleButton.disabled = false;
            });
        }
        containerP1.appendChild(statP1);
        
        const statP2 = document.createElement('div');
        statP2.className = 'card-stat';
        statP2.innerHTML = `<span>${stat.toUpperCase()}</span> <strong>${gameState.p2Pokemon[stat]}</strong>`;
        containerP2.appendChild(statP2);
    });
}

// Batalha e Resolução
battleButton.addEventListener('click', () => {
    battleButton.disabled = true;
    
    document.getElementById('cardP1Container').classList.remove('flipped');
    document.getElementById('cardP2Container').classList.remove('flipped');
    
    let value1 = 0, value2 = 0;
    let details = '';
    
    if (gameState.rule === 'total') {
        value1 = parseInt(gameState.p1Pokemon.hp) + parseInt(gameState.p1Pokemon.attack) + parseInt(gameState.p1Pokemon.defense) + parseInt(gameState.p1Pokemon.speed);
        value2 = parseInt(gameState.p2Pokemon.hp) + parseInt(gameState.p2Pokemon.attack) + parseInt(gameState.p2Pokemon.defense) + parseInt(gameState.p2Pokemon.speed);
        details = `<strong>CONFRONTO TOTAL</strong><br>${gameState.p1Pokemon.name}: ${value1} pts<br>${gameState.p2Pokemon.name}: ${value2} pts`;
    } else {
        const stat = gameState.selectedStat;
        value1 = parseInt(gameState.p1Pokemon[stat]);
        value2 = parseInt(gameState.p2Pokemon[stat]);
        details = `<strong>ATRIBUTO: ${stat.toUpperCase()}</strong><br>${gameState.p1Pokemon.name}: ${value1}<br>${gameState.p2Pokemon.name}: ${value2}`;
    }
    
    let result = '';
    let icon = '';
    
    if (value1 > value2) {
        result = 'VITÓRIA DO JOGADOR 1!';
        icon = '<i class="fas fa-crown"></i>';
        scores.p1++;
    } else if (value2 > value1) {
        result = gameState.mode === 'solo' ? 'VITÓRIA DA MÁQUINA!' : 'VITÓRIA DO JOGADOR 2!';
        icon = '<i class="fas fa-skull"></i>';
        scores.p2++;
    } else {
        result = 'EMPATE!';
        icon = '<i class="fas fa-handshake"></i>';
    }
    
    updateScores();
    
    setTimeout(() => {
        document.getElementById('resultTitle').innerText = result;
        document.getElementById('resultIcon').innerHTML = icon;
        document.getElementById('resultDetails').innerHTML = details;
        resultOverlay.style.display = 'flex';
    }, 800);
});

function updateScores() {
    scoreP1.innerText = scores.p1;
    scoreP2.innerText = scores.p2;
}

nextRoundButton.addEventListener('click', () => {
    resultOverlay.style.display = 'none';
    resetRound();
});

function resetRound() {
    gameState.step = 'select_p1';
    gameState.p1Pokemon = null;
    gameState.p2Pokemon = null;
    gameState.selectedStat = null;
    
    battleScreen.classList.remove('active');
    selectionScreen.classList.add('active');
    
    searchInput.value = '';
    renderPokemonGrid();
    updateStatusMessage();
}

// Menu Lateral Controls e Travas de Segurança
menuToggle.addEventListener('click', () => {
    sideMenu.classList.add('active');
    menuOverlay.style.display = 'block';
});

function closeSideMenu() {
    sideMenu.classList.remove('active');
    menuOverlay.style.display = 'none';
}

closeMenu.addEventListener('click', closeSideMenu);
menuOverlay.addEventListener('click', closeSideMenu);

modeSolo.addEventListener('click', () => {
    gameState.mode = 'solo';
    modeSolo.classList.add('active');
    modePVP.classList.remove('active');
    ruleAttribute.disabled = false;
    ruleAttribute.style.opacity = "1";
    closeSideMenu();
    resetRound();
});

modePVP.addEventListener('click', () => {
    gameState.mode = 'pvp';
    modePVP.classList.add('active');
    modeSolo.classList.remove('active');
    
    gameState.rule = 'total';
    ruleTotal.classList.add('active');
    ruleAttribute.classList.remove('active');
    ruleAttribute.disabled = true;
    ruleAttribute.style.opacity = "0.3";
    
    closeSideMenu();
    resetRound();
});

ruleAttribute.addEventListener('click', () => {
    if (gameState.mode === 'pvp') return;
    gameState.rule = 'attribute';
    ruleAttribute.classList.add('active');
    ruleTotal.classList.remove('active');
    closeSideMenu();
    resetRound();
});

ruleTotal.addEventListener('click', () => {
    gameState.rule = 'total';
    ruleTotal.classList.add('active');
    ruleAttribute.classList.remove('active');
    closeSideMenu();
    resetRound();
});

resetGame.addEventListener('click', () => {
    scores = { p1: 0, p2: 0 };
    updateScores();
    closeSideMenu();
    resetRound();
});

continueButton.addEventListener('click', () => {
    passOverlay.style.display = 'none';
    updateStatusMessage();
    renderPokemonGrid();
});

function updateStatusMessage() {
    if (gameState.step === 'select_p1') {
        statusMessage.innerText = gameState.mode === 'solo' ? 'ESCOLHA SEU POKÉMON' : 'JOGADOR 1: ESCOLHA SEU POKÉMON';
    } else if (gameState.step === 'select_p2') {
        statusMessage.innerText = 'JOGADOR 2: ESCOLHA EM SEGREDO';
    } else if (gameState.step === 'battle') {
        statusMessage.innerText = gameState.rule === 'attribute' ? 'SELECIONE UM ATRIBUTO PARA ATACAR!' : 'PRONTO PARA O CONFRONTO TOTAL!';
    }
}

loadPokemon();