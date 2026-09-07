// ==========================================
// MÓDULO EXCLUSIVO - GESTÃO DE SALDO E HISTÓRICO (HISTORY_BET.JS)
// ==========================================

// Injeta os estilos CSS para o efeito de piscar no ícone de perfil diretamente no documento
(function injetarEstilosHistorico() {
    const styleId = 'history-bet-dynamic-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            @keyframes piscarLaranja {
                0% { background-color: transparent; transform: scale(1); }
                50% { background-color: var(--brand-orange, #f75c2e); transform: scale(1.15); box-shadow: 0 0 12px var(--brand-orange, #f75c2e); }
                100% { background-color: transparent; transform: scale(1); }
            }
            .piscar-icone-perfil {
                animation: piscarLaranja 0.6s ease-in-out 3;
                border-radius: 50%;
            }
        `;
        document.head.appendChild(style);
    }
})();

// Recupera o usuário logado atual da sessão
function getUsuarioLogado() {
    return localStorage.getItem('current_user') || 'Convidado';
}

// Gera chaves dinâmicas isoladas no localStorage baseadas no usuário logado
function getStorageKey(key) {
    const user = getUsuarioLogado();
    const suffix = user !== 'Convidado' ? `_${user.toLowerCase().trim()}` : '_convidado';
    return `${key}${suffix}`;
}

// Inicializa o saldo global do usuário logado diretamente do localStorage (padrão: 10000.00)
window.saldo = localStorage.getItem(getStorageKey('user_balance')) !== null 
    ? parseFloat(localStorage.getItem(getStorageKey('user_balance'))) 
    : 10000.00;

let abaHistoricoAtual = 'pendentes';

document.addEventListener("DOMContentLoaded", () => {
    const historyKey = getStorageKey('historico_apostas');
    if (!localStorage.getItem(historyKey)) {
        localStorage.setItem(historyKey, JSON.stringify([]));
    }
    atualizarSaldoUI();
});

// Sobrescreve a função de atualizar o saldo na tela e salvá-lo no localStorage isolado do usuário
window.atualizarSaldoUI = function() {
    const elSaldo = document.getElementById('userBalance');
    if (elSaldo) {
        const valorFormatado = window.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        elSaldo.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; white-space: nowrap; gap: 10px;">
                <span style="font-size: 0.85rem; color: #ffffff; font-weight: 500; text-transform: uppercase;">Saldo:</span>
                <span style="font-size: 0.95rem; font-weight: bold; color: var(--accent-color);">R$ ${valorFormatado}</span>
            </div>
        `;
    }
    localStorage.setItem(getStorageKey('user_balance'), window.saldo);
};

function obterHistoricoLocal() {
    try {
        return JSON.parse(localStorage.getItem(getStorageKey('historico_apostas'))) || [];
    } catch (e) {
        return [];
    }
}

function salvarHistoricoLocal(historico) {
    localStorage.setItem(getStorageKey('historico_apostas'), JSON.stringify(historico));
}

// Função global chamada ao apostar com sucesso
window.registrarNovaApostaNoHistorico = function(item) {
    let historico = obterHistoricoLocal();
    
    // Evita duplicatas exatas num curto espaço de tempo
    const jaExiste = historico.some(ap => ap.idJogo === String(item.id) && ap.selecao === item.selecao && ap.status === 'Pendente' && (Date.now() - new Date(ap.data).getTime() < 3000));
    if (jaExiste) return;

    const novaAposta = {
        idUnico: 'aposta_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        idJogo: item.id || '1',
        partida: item.partida || 'Partida',
        selecao: item.selecao || 'Palpite',
        odd: parseFloat(item.odd || 1).toFixed(2),
        valor: parseFloat(item.valor || 0),
        retorno: (parseFloat(item.valor || 0) * parseFloat(item.odd || 1)).toFixed(2),
        data: new Date().toLocaleString('pt-BR'),
        status: 'Pendente',
        gIndex: item.gIndex !== undefined ? item.gIndex : null,
        sIndex: item.sIndex !== undefined ? item.sIndex : null,
        eIndex: item.eIndex !== undefined ? item.eIndex : null
    };

    historico.unshift(novaAposta);
    salvarHistoricoLocal(historico);

    // Dispara o efeito visual de piscar no ícone do perfil
    animarIconePerfil();
};

function animarIconePerfil() {
    const perfilIcon = document.querySelector('.profile-icon');
    if (perfilIcon) {
        perfilIcon.classList.remove('piscar-icone-perfil');
        void perfilIcon.offsetWidth; // Força o reflow para reiniciar a animação
        perfilIcon.classList.add('piscar-icone-perfil');
    }
}

function mudarAbaHistorico(aba) {
    abaHistoricoAtual = aba;
    const btnPendentes = document.getElementById('tabPendentes');
    const btnResolvidas = document.getElementById('tabResolvidas');

    if (btnPendentes && btnResolvidas) {
        if (aba === 'pendentes') {
            btnPendentes.style.background = 'var(--brand-orange)';
            btnPendentes.style.color = '#fff';
            btnResolvidas.style.background = 'transparent';
            btnResolvidas.style.color = 'var(--text-muted)';
        } else {
            btnResolvidas.style.background = 'var(--brand-orange)';
            btnResolvidas.style.color = '#fff';
            btnPendentes.style.background = 'transparent';
            btnPendentes.style.color = 'var(--text-muted)';
        }
    }

    abrirHistorico();
}

window.abrirHistorico = function() {
    const lista = document.getElementById('historyList');
    const historico = obterHistoricoLocal();
    const usuarioLogado = getUsuarioLogado();
    const saldoFormatado = window.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    
    // Injeta cabeçalho com informações do usuário e saldo no topo do modal se houver elemento de container adequado
    const modalHeaderInfo = document.getElementById('historyUserInfo');
    if (modalHeaderInfo) {
        modalHeaderInfo.innerHTML = `
            <div style="background: var(--card-bg); border: 1px solid var(--border-color); padding: 0.6rem 0.9rem; border-radius: 6px; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem;">
                <span>👤 Conta: <strong style="color: var(--brand-teal);">${usuarioLogado}</strong></span>
                <span>💰 Saldo: <strong style="color: var(--accent-color);">R$ ${saldoFormatado}</strong></span>
            </div>
        `;
    }

    if (!lista) return;

    const itensFiltrados = historico.filter(ap => {
        if (abaHistoricoAtual === 'pendentes') return ap.status === 'Pendente';
        return ap.status === 'Ganha' || ap.status === 'Perdida';
    });

    if (itensFiltrados.length === 0) {
        lista.innerHTML = `
            <div style="background: var(--card-bg); border: 1px solid var(--border-color); padding: 0.6rem 0.9rem; border-radius: 6px; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem;">
                <span>👤 Conta: <strong style="color: var(--brand-teal);">${usuarioLogado}</strong></span>
                <span>💰 Saldo: <strong style="color: var(--accent-color);">R$ ${saldoFormatado}</strong></span>
            </div>
            <div class="empty-msg" style="color: var(--text-muted); text-align: center; padding: 1rem;">Nenhuma aposta ${abaHistoricoAtual} encontrada para esta conta.</div>
        `;
        const modal = document.getElementById('historyModal');
        if (modal) modal.style.display = 'flex';
        return;
    }

    let html = `
        <div style="background: var(--card-bg); border: 1px solid var(--border-color); padding: 0.6rem 0.9rem; border-radius: 6px; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem;">
            <span>👤 Conta: <strong style="color: var(--brand-teal);">${usuarioLogado}</strong></span>
            <span>💰 Saldo: <strong style="color: var(--accent-color);">R$ ${saldoFormatado}</strong></span>
        </div>
    `;

    itensFiltrados.forEach(ap => {
        let corStatus = 'var(--accent-color)';
        if (ap.status === 'Ganha') corStatus = '#10B981'; 
        if (ap.status === 'Perdida') corStatus = '#EF4444'; 

        let botoesAcaoHtml = '';

        if (ap.status === 'Pendente') {
            let jogoTemStats = false;
            if (typeof cacheJogosAtuais !== 'undefined' && Array.isArray(cacheJogosAtuais)) {
                const jogoEncontrado = cacheJogosAtuais.find(j => String(j.id) === String(ap.idJogo));
                if (jogoEncontrado && jogoEncontrado.statisticInfo && jogoEncontrado.statisticInfo.gameId) {
                    jogoTemStats = true;
                }
            }

            const botaoEstatisticasHtml = jogoTemStats ? `
                <button onclick="abrirEstatisticasModal('${ap.idJogo}')" style="background: var(--border-color); color: var(--text-main); border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                    📊 Verificar Resultados
                </button>
            ` : '<span></span>';

            botoesAcaoHtml = `
                <div style="display: flex; gap: 0.5rem; margin-top: 0.6rem; border-top: 1px solid var(--border-color); padding-top: 0.5rem; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                    ${botaoEstatisticasHtml}
                    <div style="display: flex; gap: 0.4rem; margin-left: auto;">
                        <button onclick="resolverAposta('${ap.idUnico}', 'Ganha')" style="background: #10B981; color: #fff; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: bold;">Green ✓</button>
                        <button onclick="resolverAposta('${ap.idUnico}', 'Perdida')" style="background: #EF4444; color: #fff; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: bold;">Red ✕</button>
                    </div>
                </div>
            `;
        }

        html += `
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-color); padding: 0.85rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 0.5rem;">
                <div style="display: flex; justify-content: space-between; color: var(--text-muted); font-size: 0.75rem; margin-bottom: 0.3rem;">
                    <span>📅 ${ap.data}</span>
                    <span style="font-weight: bold; color: ${corStatus}; text-transform: uppercase;">${ap.status}</span>
                </div>
                <div style="font-weight: bold; color: var(--text-main); margin-bottom: 0.2rem; font-size: 0.9rem;">${ap.partida}</div>
                <div style="font-size: 0.80rem; color: var(--text-muted); margin-bottom: 0.3rem;">Palpite: <strong style="color: var(--brand-orange);">${ap.selecao}</strong></div>
                <div style="font-size: 0.80rem; color: var(--text-main);">Odd: <strong>${ap.odd}</strong> | Valor: <strong>R$ ${parseFloat(ap.valor).toFixed(2).replace('.', ',')}</strong> | Retorno: <strong style="color: var(--accent-color);">R$ ${parseFloat(ap.retorno).toFixed(2).replace('.', ',')}</strong></div>
                ${botoesAcaoHtml}
            </div>
        `;
    });

    lista.innerHTML = html;
    const modal = document.getElementById('historyModal');
    if (modal) modal.style.display = 'flex';
};

window.fecharHistorico = function() {
    const modal = document.getElementById('historyModal');
    if (modal) modal.style.display = 'none';
};

function resolverAposta(idUnico, resultado) {
    let historico = obterHistoricoLocal();
    const index = historico.findIndex(ap => ap.idUnico === idUnico);

    if (index > -1) {
        historico[index].status = resultado === 'Ganha' ? 'Ganha' : 'Perdida';
        
        if (resultado === 'Ganha') {
            window.saldo += parseFloat(historico[index].retorno);
            atualizarSaldoUI();
        }

        salvarHistoricoLocal(historico);
        abrirHistorico(); 
    }
}