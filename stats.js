// ==========================================
// MÓDULO EXCLUSIVO - ESTATÍSTICAS VIA IFRAME (STATS.JS)
// ==========================================

const esportesTraducaoIngles = {
    "futebol": "football",
    "basquete": "basketball",
    "tênis": "tennis",
    "vôlei": "volleyball",
    "beisebol": "baseball",
    "hóquei no gelo": "ice-hockey",
    "futebol americano": "american-football",
    "artes marciais": "martial-arts",
    "atletismo": "athletics",
    "automobilismo": "motorsports",
    "badminton": "badminton",
    "bandy": "bandy",
    "basquete 3x3": "basketball-3x3",
    "biatlo": "biathlon",
    "bilhar": "billiards",
    "boxe": "boxing",
    "ciclismo": "cycling",
    "corridas de cavalos": "horse-racing",
    "corridas de galgos": "greyhounds",
    "críquete": "cricket",
    "dardos": "darts",
    "esports": "esports",
    "esqui": "skiing",
    "esqui alpino": "alpine-skiing",
    "floorball": "floorball",
    "fórmula 1": "formula-1",
    "gaelic football": "gaelic-football",
    "futsal": "futsal",
    "golfe": "golf",
    "greyhound antepost": "greyhounds",
    "handebol": "handball",
    "hipismo": "equestrian",
    "horse racing antepost": "horse-racing",
    "hurling": "hurling",
    "jogos de tv": "tv-games",
    "kabaddi": "kabaddi",
    "lacrosse": "lacrosse",
    "loteria": "lottery",
    "luta livre": "wrestling",
    "luta profissional": "wrestling",
    "motociclismo": "motorcycles",
    "olimpíada": "olympics",
    "padel": "padel",
    "pickleball": "pickleball",
    "pelota basca": "basque-pelota",
    "política": "politics",
    "polo aquático": "water-polo",
    "polybet": "polybet",
    "sinuca": "snooker",
    "speedway": "speedway",
    "tênis de mesa": "table-tennis",
    "toto": "toto",
    "trotando": "trotting",
    "ufc": "ufc",
    "vela": "sailing",
    "xadrez": "chess"
};

// Injeta CSS global para garantir que o título do modal de estatísticas fique centralizado e verde
(function injetarEstiloTituloStats() {
    const styleId = 'stats-modal-custom-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            #statsModal h2, #statsModal h3, #statsModal .modal-title, #statsModal header {
                text-align: center !important;
                color: #10b981 !important;
                width: 100% !important;
                display: block !important;
            }
        `;
        document.head.appendChild(style);
    }
})();

function abrirEstatisticasModal(jogoId) {
    const jogo = cacheJogosAtuais.find(j => String(j.id) === String(jogoId));
    if (!jogo) return;

    let nomeEsporteBruto = "";
    if (esporteAtualSelecionado && esporteAtualSelecionado.nome) {
        nomeEsporteBruto = esporteAtualSelecionado.nome.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '').trim().toLowerCase();
    } else if (jogo.sport && jogo.sport.name) {
        nomeEsporteBruto = jogo.sport.name.toLowerCase();
    }

    const esporteIngles = esportesTraducaoIngles[nomeEsporteBruto] || nomeEsporteBruto.replace(/\s+/g, '-') || "football";

    const gameId = (jogo.statisticInfo && jogo.statisticInfo.gameId) ? jogo.statisticInfo.gameId : null;

    if (!gameId) {
        alert("Estatísticas indisponíveis para este evento.");
        return;
    }

    const urlStats = `https://eventsstat.com/en/statisticpopup/game/${esporteIngles}/${gameId}/main`;

    const iframe = document.getElementById('statsIframe');
    if (iframe) {
        iframe.src = urlStats;
    }

    const modal = document.getElementById('statsModal');
    if (modal) {
        modal.style.display = 'flex';
        // Força via JS no momento da abertura também
        const titulos = modal.querySelectorAll('h2, h3, .modal-title, header');
        titulos.forEach(t => {
            t.style.setProperty('text-align', 'center', 'important');
            t.style.setProperty('color', '#10b981', 'important');
            t.style.setProperty('width', '100%', 'important');
        });
    }
}

function fecharModalStats() {
    const modal = document.getElementById('statsModal');
    const iframe = document.getElementById('statsIframe');
    if (modal) modal.style.display = 'none';
    if (iframe) iframe.src = '';
}

function injetarBotoesEstatisticas() {
    const cards = document.querySelectorAll('.match-row-card');
    
    cards.forEach(card => {
        const actionArea = card.querySelector('.match-action-area');
        if (actionArea) {
            const mercadoBtn = actionArea.querySelector('[onclick*="abrirDetalhesConfronto"]');
            
            if (mercadoBtn) {
                const matchIdMatch = mercadoBtn.getAttribute('onclick').match(/'([^']+)'/);
                if (!matchIdMatch) return;
                const matchId = matchIdMatch[1];

                const jogo = cacheJogosAtuais.find(j => String(j.id) === String(matchId));
                const temEstatisticas = jogo && jogo.statisticInfo && jogo.statisticInfo.gameId;

                let containerBotoes = actionArea.querySelector('.container-botoes-stats');

                if (temEstatisticas) {
                    if (!containerBotoes) {
                        containerBotoes = document.createElement('div');
                        containerBotoes.className = "container-botoes-stats";
                        containerBotoes.style.cssText = "display: flex; justify-content: flex-end; align-items: center; gap: 10px; width: 100%; margin-top: 0.5rem;";
                        
                        const btnStats = document.createElement('button');
                        btnStats.className = "btn-stats-custom";
                        btnStats.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--brand-orange); transition: opacity 0.15s;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`;
                        btnStats.title = "Estatísticas da Partida";
                        btnStats.style.cssText = "background: none; border: none; cursor: pointer; padding: 0.2rem; display: inline-flex; align-items: center; justify-content: center;";
                        
                        btnStats.onmouseover = () => btnStats.querySelector('svg').style.opacity = '0.7';
                        btnStats.onmouseout = () => btnStats.querySelector('svg').style.opacity = '1';

                        btnStats.onclick = () => abrirEstatisticasModal(matchId);

                        mercadoBtn.style.marginTop = "0";
                        
                        containerBotoes.appendChild(mercadoBtn);
                        containerBotoes.appendChild(btnStats);
                        
                        actionArea.appendChild(containerBotoes);
                    }
                } else {
                    if (containerBotoes) {
                        actionArea.appendChild(mercadoBtn);
                        containerBotoes.remove();
                    }
                    mercadoBtn.style.marginTop = "0.6rem";
                }
            }
        }
    });
}

const observerStats = new MutationObserver(() => {
    injetarBotoesEstatisticas();
});

document.addEventListener("DOMContentLoaded", () => {
    const centroArea = document.getElementById('contentCenterArea');
    if (centroArea) {
        observerStats.observe(centroArea, { childList: true, subtree: true });
    }
    setTimeout(injetarBotoesEstatisticas, 500);
});