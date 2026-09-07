// ==========================================
// MÓDULO EXCLUSIVO - GESTÃO DE PERFIL, SESSÃO E AVISO NO BOLETIM (PERFIL.JS)
// ==========================================

(function() {
    // Recupera o usuário logado atualmente da sessão
    window.usuarioAtual = localStorage.getItem('current_user') || null;

    // Gera chaves dinâmicas isoladas no localStorage baseadas no usuário logado
    window.getStorageKey = function(key) {
        const user = window.usuarioAtual;
        const suffix = user ? `_${user.toLowerCase().trim()}` : '_convidado';
        return `${key}${suffix}`;
    };

    // Inicializa o saldo do usuário logado (padrão: 10000.00 persistido corretamente)
    if (typeof window.saldo === 'undefined') {
        const balanceKey = window.getStorageKey('user_balance');
        if (localStorage.getItem(balanceKey) !== null) {
            window.saldo = parseFloat(localStorage.getItem(balanceKey));
        } else {
            window.saldo = 10000.00;
            localStorage.setItem(balanceKey, '10000.00');
        }
    }

    // Função moderna para exibir mensagens flutuantes (Toast) gerais
    window.mostrarToast = function(mensagem, tipo = 'info') {
        let containerToast = document.getElementById('toastContainerModerno');
        if (!containerToast) {
            containerToast = document.createElement('div');
            containerToast.id = 'toastContainerModerno';
            containerToast.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 99999;
                display: flex; flex-direction: column; gap: 10px; pointer-events: none;
            `;
            document.body.appendChild(containerToast);
        }

        const corBorda = tipo === 'erro' ? '#ef4444' : (tipo === 'sucesso' ? '#10b981' : 'var(--brand-orange, #f75c2e)');
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            background: #161922; color: #fff; border: 1px solid rgba(255,255,255,0.12);
            border-left: 4px solid ${corBorda}; padding: 0.8rem 1.1rem; border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6); font-size: 0.85rem; font-weight: 500;
            pointer-events: auto; backdrop-filter: blur(10px); opacity: 0; transform: translateY(-10px);
            transition: opacity 0.3s ease, transform 0.3s ease; max-width: 300px;
        `;
        toast.innerText = mensagem;
        containerToast.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    };

    // Modal de confirmação interno moderno
    window.mostrarModalConfirmacaoCustomizado = function(titulo, texto, corBotaoConfirmar, callbackConfirmar) {
        let modalOverlay = document.getElementById('customConfirmModalOverlay');
        if (modalOverlay) modalOverlay.remove();

        modalOverlay = document.createElement('div');
        modalOverlay.id = 'customConfirmModalOverlay';
        modalOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(6px);
            display: flex; align-items: center; justify-content: center; z-index: 100000;
            animation: fadeInModal 0.2s ease;
        `;

        modalOverlay.innerHTML = `
            <div style="background: #12151d; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; padding: 1.5rem; width: 340px; box-shadow: 0 15px 40px rgba(0,0,0,0.8); font-family: inherit; text-align: center;">
                <h3 style="color: #fff; font-size: 1.05rem; margin-bottom: 0.5rem; font-weight: 700;">${titulo}</h3>
                <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1.2rem; line-height: 1.4;">${texto}</p>
                <div style="display: flex; gap: 10px;">
                    <button id="btnModalCancelarCustom" style="flex: 1; background: #1e222d; color: #fff; border: 1px solid rgba(255,255,255,0.08); padding: 0.6rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.85rem;">Cancelar</button>
                    <button id="btnModalConfirmarCustom" style="flex: 1; background: ${corBotaoConfirmar}; color: #fff; border: none; padding: 0.6rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.85rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">Confirmar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        document.getElementById('btnModalCancelarCustom').onclick = () => modalOverlay.remove();
        document.getElementById('btnModalConfirmarCustom').onclick = () => {
            modalOverlay.remove();
            if (typeof callbackConfirmar === 'function') callbackConfirmar();
        };
    };

    // Retorna a quantidade de apostas pendentes do usuário atual
    window.obterQuantidadeApostasAbertas = function() {
        const historyKey = window.getStorageKey('historico_apostas');
        let historico = [];
        try {
            historico = JSON.parse(localStorage.getItem(historyKey)) || [];
        } catch(e) { historico = []; }
        return historico.filter(ap => ap.status === 'Pendente').length;
    };

    // Atualiza ou cria o círculo laranja de notificação no canto superior esquerdo do ícone
    window.atualizarBadgeIconePerfil = function() {
        const qtdAbertas = window.obterQuantidadeApostasAbertas();
        
        const profileBtn = document.querySelector('.profile-btn') || document.getElementById('profileBtn') || document.querySelector('[onclick*="toggleMenuPerfil"]');
        if (!profileBtn) return;

        if (getComputedStyle(profileBtn).position === 'static') {
            profileBtn.style.position = 'relative';
        }

        let badge = document.getElementById('profileHeadBadge');

        if (qtdAbertas > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.id = 'profileHeadBadge';
                badge.style.cssText = `
                    position: absolute; top: -2px; left: -2px;
                    background-color: var(--brand-orange, #f75c2e); color: #ffffff;
                    border-radius: 50%; width: 18px; height: 18px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.65rem; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.6);
                    z-index: 10; pointer-events: none; border: 2px solid #111;
                `;
                profileBtn.appendChild(badge);
            }
            badge.innerText = qtdAbertas;
        } else {
            if (badge) badge.remove();
        }
    };

    // Efeito visual de piscar no ícone do perfil (mantido caso queira sutilmente indicar o perfil)
    window.animarIconePerfil = function() {
        const perfilIcons = document.querySelectorAll('.profile-icon, .profile-btn, #profileBtn, [onclick*="toggleMenuPerfil"]');
        perfilIcons.forEach(el => {
            el.classList.remove('piscar-icone-perfil');
            void el.offsetWidth;
            el.classList.add('piscar-icone-perfil');
        });
    };

    // Injeta os estilos CSS para animações
    (function injetarEstilosDinamicos() {
        const styleId = 'perfil-dinamic-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                @keyframes piscarLaranjaPerfil {
                    0% { background-color: transparent; transform: scale(1); }
                    50% { background-color: var(--brand-orange, #f75c2e); transform: scale(1.15); box-shadow: 0 0 12px var(--brand-orange, #f75c2e); border-radius: 50%; }
                    100% { background-color: transparent; transform: scale(1); }
                }
                .piscar-icone-perfil {
                    animation: piscarLaranjaPerfil 0.6s ease-in-out 3;
                }
                @keyframes fadeInModal {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    })();

    // Intercepta a tentativa de aposta: se não estiver logado, exibe a mensagem direto no Boletim de Apostas
    const originalApostarIndividual = window.apostarIndividual;
    if (typeof originalApostarIndividual === 'function') {
        window.apostarIndividual = async function(index) {
            if (!window.usuarioAtual) {
                if (typeof selecoesApostas !== 'undefined' && selecoesApostas[index]) {
                    selecoesApostas[index].mensagemErro = "Você precisa estar logado para realizar uma aposta!";
                    if (typeof renderizarBetslip === 'function') {
                        renderizarBetslip();
                    }
                }
                window.animarIconePerfil();
                return;
            }
            return await originalApostarIndividual(index);
        };
    }

    // Intercepta a gravação da aposta no histórico para atualizar o badge do ícone instantaneamente
    const originalRegistrarAposta = window.registrarNovaApostaNoHistorico;
    if (typeof originalRegistrarAposta === 'function') {
        window.registrarNovaApostaNoHistorico = function(item) {
            originalRegistrarAposta(item);
            window.atualizarBadgeIconePerfil();
        };
    }

    // Controla o menu do perfil
    window.toggleMenuPerfil = function(event) {
        if (event) event.stopPropagation();
        let dropdown = document.getElementById('profileDropdown');
        
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'profileDropdown';
            dropdown.className = 'profile-dropdown-content';
            dropdown.style.cssText = `
                position: absolute; right: 0; top: 48px; background: #111;
                border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 0.85rem;
                width: 275px; box-shadow: 0 12px 35px rgba(0,0,0,0.8); z-index: 1100; display: none;
                backdrop-filter: blur(12px); font-family: inherit; box-sizing: border-box;
            `;
            const profileBtn = document.querySelector('.profile-btn') || document.getElementById('profileBtn');
            if (profileBtn && profileBtn.parentElement) {
                profileBtn.parentElement.style.position = 'relative';
                profileBtn.parentElement.appendChild(dropdown);
            } else {
                document.body.appendChild(dropdown);
            }
        }

        renderizarConteudoDropdownPerfil(dropdown);
        const isOpen = dropdown.style.display === 'block';
        dropdown.style.display = isOpen ? 'none' : 'block';
    };

    function renderizarConteudoDropdownPerfil(dropdown) {
        if (!window.usuarioAtual) {
            dropdown.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 0.75rem; box-sizing: border-box;" onclick="event.stopPropagation()">
                    <div style="display: flex; align-items: center; gap: 10px; padding: 0.5rem 0.6rem; background: #181818; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px;">
                        <div style="width: 34px; height: 34px; background: rgba(247, 92, 46, 0.12); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--brand-orange, #f75c2e); font-size: 1rem; flex-shrink: 0;">👤</div>
                        <div style="overflow: hidden;">
                            <span style="font-size: 0.85rem; font-weight: 700; color: #ffffff; display: block; line-height: 1.2;">Entrar</span>
                            <span style="font-size: 0.7rem; color: #888; display: block; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">Insira seu apelido para jogar</span>
                        </div>
                    </div>
                    <input type="text" id="inputNomeLogin" placeholder="Seu apelido..." style="background: #181818; border: 1px solid rgba(255, 255, 255, 0.06); color: #ffffff; padding: 0.6rem 0.75rem; border-radius: 8px; font-size: 0.85rem; outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--brand-orange, #f75c2e)'" onblur="this.style.borderColor='rgba(255, 255, 255, 0.06)'">
                    <button onclick="realizarLoginPerfil()" style="background: var(--brand-orange, #f75c2e); color: white; border: none; padding: 0.6rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.85rem; width: 100%; box-shadow: 0 4px 12px rgba(247, 92, 46, 0.3); text-align: center; display: block; transition: filter 0.2s;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='brightness(1)'">Entrar na Conta</button>
                </div>
            `;
        } else {
            const saldoFormatado = (typeof window.saldo === 'number' ? window.saldo : 10000).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            const qtdAbertas = window.obterQuantidadeApostasAbertas();

            dropdown.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 0.45rem; box-sizing: border-box;" onclick="event.stopPropagation()">
                    
                    <!-- Topo Alinhado -->
                    <div style="background: #181818; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px; padding: 0.6rem 0.75rem; display: flex; align-items: center; gap: 10px;">
                        <div style="width: 28px; height: 28px; background: #222; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ccc; flex-shrink: 0;">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                        <div style="display: flex; align-items: baseline; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">
                            <span style="font-size: 0.7rem; color: #888; text-transform: uppercase; letter-spacing: 0.4px; font-weight: 600;">CONTA:</span>
                            <strong style="font-size: 0.9rem; color: #fff; font-weight: 600; overflow: hidden; text-overflow: ellipsis;">${window.usuarioAtual}</strong>
                        </div>
                    </div>

                    <!-- Saldo Minimalista -->
                    <div style="background: #181818; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px; padding: 0.6rem 0.75rem; display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 26px; height: 26px; background: #222; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #999; font-size: 0.8rem; font-weight: bold;">R$</div>
                            <span style="font-size: 0.75rem; color: #888; font-weight: 500;">Saldo</span>
                        </div>
                        <span style="font-size: 0.95rem; color: #fff; font-weight: 700; letter-spacing: 0.3px;">${saldoFormatado}</span>
                    </div>

                    <!-- Opções e Ações -->
                    <div style="display: flex; flex-direction: column; gap: 0.45rem; margin-top: 0.1rem;">
                        <button onclick="abrirBoletimApostasMenu()" style="background: #181818; color: #fff; border: 1px solid rgba(255, 255, 255, 0.06); padding: 0.6rem 0.75rem; border-radius: 10px; font-weight: 500; cursor: pointer; font-size: 0.82rem; text-align: left; display: flex; align-items: center; justify-content: space-between; transition: background 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='#181818'">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #38bdf8;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                                <span>Boletim de Apostas</span>
                            </div>
                            <span style="background: ${qtdAbertas > 0 ? 'var(--brand-orange, #f75c2e)' : '#2a2a2a'}; color: #fff; font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: 10px; min-width: 18px; text-align: center;">${qtdAbertas}</span>
                        </button>

                        <button onclick="window.deslogarPerfil()" style="background: rgba(239, 68, 68, 0.08); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); padding: 0.6rem 0.75rem; border-radius: 10px; font-weight: 500; cursor: pointer; font-size: 0.82rem; text-align: left; display: flex; align-items: center; gap: 10px; transition: background 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.15)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.08)'">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            <span>Sair da Conta</span>
                        </button>

                        <button onclick="window.excluirContaPerfil()" style="background: rgba(153, 27, 27, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.6rem 0.75rem; border-radius: 10px; font-weight: 500; cursor: pointer; font-size: 0.82rem; text-align: left; display: flex; align-items: center; gap: 10px; transition: background 0.2s;" onmouseover="this.style.background='rgba(153, 27, 27, 0.3)'" onmouseout="this.style.background='rgba(153, 27, 27, 0.15)'">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            <span>Excluir Conta</span>
                        </button>
                    </div>

                </div>
            `;
        }
    }

    window.realizarLoginPerfil = function() {
        const input = document.getElementById('inputNomeLogin');
        const nome = input ? input.value.trim() : '';
        
        if (!nome) {
            window.mostrarToast("⚠️ Digite um nome válido para entrar.", "erro");
            return;
        }

        window.usuarioAtual = nome;
        localStorage.setItem('current_user', window.usuarioAtual);

        const balanceKey = window.getStorageKey('user_balance');
        if (localStorage.getItem(balanceKey) === null) {
            localStorage.setItem(balanceKey, '10000.00');
        }
        window.saldo = parseFloat(localStorage.getItem(balanceKey));

        const historyKey = window.getStorageKey('historico_apostas');
        if (!localStorage.getItem(historyKey)) {
            localStorage.setItem(historyKey, JSON.stringify([]));
        }

        if (typeof window.atualizarSaldoUI === 'function') {
            window.atualizarSaldoUI();
        }

        window.mostrarToast(`✨ Bem-vindo, ${window.usuarioAtual}!`, "sucesso");
        setTimeout(() => location.reload(), 800);
    };

    window.abrirBoletimApostasMenu = function() {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) dropdown.style.display = 'none';

        if (typeof window.abrirHistorico === 'function') {
            window.abrirHistorico();
        } else {
            window.mostrarToast("Painel de Boletim aberto para: " + window.usuarioAtual, "info");
        }
    };

    window.deslogarPerfil = function() {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) dropdown.style.display = 'none';

        window.mostrarModalConfirmacaoCustomizado(
            "Sair da Conta",
            "Deseja realmente sair? Seus dados ficarão salvos para quando você entrar com este mesmo nome novamente.",
            "var(--brand-orange, #f75c2e)",
            () => {
                localStorage.removeItem('current_user');
                window.usuarioAtual = null;
                window.mostrarToast("Sessão encerrada com sucesso.", "info");
                setTimeout(() => location.reload(), 800);
            }
        );
    };

    window.excluirContaPerfil = function() {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) dropdown.style.display = 'none';

        window.mostrarModalConfirmacaoCustomizado(
            "Excluir Conta Permanentemente",
            `Tem certeza que deseja excluir a conta "${window.usuarioAtual}"? Todo o seu saldo e histórico serão apagados.`,
            "#ef4444",
            () => {
                const balanceKey = window.getStorageKey('user_balance');
                const historyKey = window.getStorageKey('historico_apostas');

                localStorage.removeItem(balanceKey);
                localStorage.removeItem(historyKey);
                localStorage.removeItem('current_user');

                window.usuarioAtual = null;
                window.mostrarToast("🗑️ Conta excluída permanentemente.", "erro");
                setTimeout(() => location.reload(), 800);
            }
        );
    };

    // Fecha o menu ao clicar fora
    window.addEventListener('click', function(event) {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown && !dropdown.contains(event.target) && !event.target.closest('.profile-btn') && !event.target.closest('#profileBtn')) {
            dropdown.style.display = 'none';
        }
    });

    // Sincroniza o saldo na inicialização
    window.addEventListener('DOMContentLoaded', () => {
        const balanceKey = window.getStorageKey('user_balance');
        if (localStorage.getItem(balanceKey) !== null) {
            window.saldo = parseFloat(localStorage.getItem(balanceKey));
            if (typeof window.atualizarSaldoUI === 'function') {
                window.atualizarSaldoUI();
            }
        }
        setTimeout(window.atualizarBadgeIconePerfil, 100);
    });
})();