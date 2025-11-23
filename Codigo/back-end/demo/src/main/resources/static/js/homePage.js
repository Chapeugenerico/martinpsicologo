// =======================================================
// === FUNÇÕES DE UTILIDADE E AUTENTICAÇÃO (CORRIGIDAS) ===
// =======================================================

function obterInfoUsuarioLogado() {
    // TENTA LER A CHAVE PRINCIPAL USADA PELO FLUXO DE LOGIN/PERFIL
    try {
        const usuarioLogadoJson = localStorage.getItem('usuarioLogado');
        if (usuarioLogadoJson) {
            const usuario = JSON.parse(usuarioLogadoJson);
            
            // Lógica similar à de auth.js para determinar o tipo
            let tipo = usuario.usutipo || usuario.tipoUsuario || usuario.tipo || usuario.role;
            if (tipo) {
                tipo = String(tipo).toUpperCase();
            } else if (usuario.crp || usuario.especialidade) {
                tipo = 'PSICOLOGO';
            } else {
                tipo = 'PACIENTE'; // Padrão se não houver tipo explícito
            }
            
            const id = usuario.usucodigo || usuario.id || usuario.idUsuario;
            
            if (id && tipo) {
                return { id: parseInt(id), tipo: tipo };
            }
        }
    } catch (err) {
        console.warn('Erro ao parsear localStorage.usuarioLogado:', err);
    }

    // Fallback para chaves mais antigas ou chaves individuais
    const id = sessionStorage.getItem('usuarioId') || localStorage.getItem('usuarioId');
    const tipo = sessionStorage.getItem('usuarioTipo') || localStorage.getItem('usuarioTipo'); 

    if (id && tipo) {
        return {
            id: parseInt(id),
            tipo: String(tipo).toUpperCase()
        };
    }

    return null;
}


// Função de Logout UNIFICADA para garantir a limpeza completa e redirecionamento
function fazerLogout() {
    // Chaves principais (usadas por auth.js e perfilPaciente.js)
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('pacienteLogado');
    localStorage.removeItem('psicologoLogado');
    localStorage.removeItem('token');
    
    // Chaves auxiliares (usadas por homePage.js e outros)
    localStorage.removeItem('userId');
    localStorage.removeItem('pacienteId');
    localStorage.removeItem('userNome');
    localStorage.removeItem('userType');
    
    sessionStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioId');
    sessionStorage.removeItem('usuarioTipo');
    localStorage.removeItem('usuarioTipo');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('usuario');
    
    // Redireciona para o login (Padrão da aplicação)
    window.location.href = 'login.html';
}


// =======================================================
// === LÓGICA DE MONTAGEM DA NAVBAR (Mantida a correção anterior) ===
// =======================================================

function atualizarNavbar(userInfo) {
    const navLinksContainer = document.getElementById('navLinks');
    const userInfoEl = document.getElementById('userInfo');
    if (!navLinksContainer) return;

    // Limpa o conteúdo atual
    navLinksContainer.innerHTML = '';
    if (userInfoEl) userInfoEl.textContent = '';

    if (userInfo) {
        // Usuário AUTENTICADO
        
        // 1. Simula o comportamento do auth.js para exibir a saudação
        try {
            const usuarioLogado = localStorage.getItem('usuarioLogado');
            if (usuarioLogado) {
                const dados = JSON.parse(usuarioLogado);
                const nome = dados.nome || dados.usunome || dados.pacinome || dados.psinome || 'Usuário';
                if (userInfoEl) userInfoEl.textContent = `Olá, ${nome}`;
            }
        } catch (e) {
            console.warn("Falha ao carregar nome para saudação:", e);
        }

        // 2. Renderiza os links específicos do tipo de usuário
        if (userInfo.tipo === 'PACIENTE') {
            // Estrutura IDÊNTICA ao perfilPaciente.html (Para Paciente)
            navLinksContainer.innerHTML = `
                <a href="homePage.html">Inicio</a>
                <a href="perfilPaciente.html">Perfil</a>
                <a href="pacienteGerenciaHorarios.html">Agenda</a>
                <a href="agendarHorario.html">Agendar Horário</a>
                <button id="logoutBtn" class="logout-btn" type="button" aria-label="Sair">Logout</button>
            `;
        } else if (userInfo.tipo === 'PSICOLOGO') {
            // Estrutura para Psicólogo
            navLinksContainer.innerHTML = `
                <a href="homePage.html" class="active" aria-current="page">Início</a>
                <a href="perfilPsicologo.html">Perfil</a>
                <a href="gerenciarPaciente.html">Pacientes</a>
                <a href="gerenciaHorario.html">Horários</a>
                <a href="relatorio.html">Relatório</a>
                <button id="logoutBtn" class="logout-btn" type="button" aria-label="Sair">Logout</button>
            `;
        }
        
        // 3. Adiciona o listener de evento de Logout (Com o ID #logoutBtn)
        const btnLogout = document.getElementById('logoutBtn');
        if (btnLogout) {
            btnLogout.addEventListener('click', fazerLogout);
        }
        
    } else {
        // Usuário NÃO AUTENTICADO - O bloco final `else` agora é alcançado corretamente
        navLinksContainer.innerHTML = `
            <a href="agendarHorario.html">Agendar Horário</a>
            <a href="cadastro.html">Cadastrar</a>
            <a href="login.html">Entrar</a>
        `;
    }
}

// =======================================================
// === LÓGICA DO RODAPÉ (Mantida para preencher dados públicos) ===
// =======================================================

// A função obterPsicologoId da solução anterior foi integrada à carregarDadosPsicologoParaRodape para simplificar.

async function carregarDadosPsicologoParaRodape() {
    const userInfo = obterInfoUsuarioLogado();
    let psicologoId = userInfo && userInfo.tipo === 'PSICOLOGO' ? userInfo.id : null;
    
    // Fallback: Se não for um psicólogo logado, busca o primeiro psicólogo para preencher dados públicos
    if (!psicologoId) {
         try {
            // Busca o primeiro usuário com usutipo = 'PSICOLOGO'
            // NOTA: A API /api/usuarios não está presente neste arquivo, assumindo que exista.
            const res = await fetch('/api/usuarios');
            if (res.ok) {
                const list = await res.json();
                const psi = list.find(u => (u.usutipo && String(u.usutipo).toUpperCase() === 'PSICOLOGO'));
                if (psi) {
                    psicologoId = psi.usucodigo;
                }
            }
        } catch (err) {
            // Tratamento de erro de API omitido para foco no JavaScript
            console.error('Erro ao buscar usuários para encontrar psicólogo público:', err);
        }
    }

    if (!psicologoId) {
        console.warn('Não foi possível identificar o ID do psicólogo. O rodapé usará dados estáticos.');
        return;
    }

    try {
        const response = await fetch(`/api/psicologos/${psicologoId}`); 
        if (response.ok) {
            const psicologo = await response.json();
            preencherRodape(psicologo);
        } else {
            console.error('Erro ao carregar dados do psicólogo para o rodapé.');
        }
    } catch (error) {
        console.error('Erro de conexão ao carregar dados do psicólogo:', error);
    }
}

// Preencher o rodapé com dados (mantida a função original)
function preencherRodape(psicologo) {
    const telefoneElement = document.getElementById('footer-telefone');
    if (telefoneElement && psicologo.telefone) { telefoneElement.textContent = psicologo.telefone; }

    const emailElement = document.getElementById('footer-email');
    if (emailElement && psicologo.usuemail) { emailElement.textContent = psicologo.usuemail; }

    const instaTextElement = document.getElementById('footer-instagram');
    const instaLinkElement = document.getElementById('footer-instagram-link');

    if (instaTextElement && instaLinkElement && psicologo.instagram) {
        let instagramHandle = psicologo.instagram.startsWith('@') ? psicologo.instagram : '@' + psicologo.instagram;
        instaTextElement.textContent = instagramHandle;
        let instaLink = `https://www.instagram.com/${psicologo.instagram.replace('@', '')}`;
        instaLinkElement.href = instaLink;
    }
}

// =======================================================
// === LÓGICA DO ACORDION/FAQ (Mantida) ===
// =======================================================

function inicializarFaqAccordion() {
    const questions = document.querySelectorAll('.faq-question');

    questions.forEach(question => {
        question.addEventListener('click', function() {
            // Alterna a classe 'active' na pergunta
            this.classList.toggle('active');

            // Seleciona o elemento de resposta imediatamente após a pergunta
            const answer = this.nextElementSibling; 

            // Alterna a classe 'open' na resposta para animar a altura
            if (answer && answer.classList.contains('faq-answer')) {
                answer.classList.toggle('open');
            }
        });
    });
}

// Chamar a inicialização do FAQ quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarFaqAccordion);


// =======================================================
// === INICIALIZAÇÃO ===
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    const userInfo = obterInfoUsuarioLogado();
    
    // 1. Atualiza a barra de navegação com base no status e tipo de login
    atualizarNavbar(userInfo);
    
    // 2. Carrega os dados do psicólogo para o rodapé
    carregarDadosPsicologoParaRodape(); 
});

// Escuta mudanças no storage (quando o login ocorre em outra aba ou script atualiza localStorage)
window.addEventListener('storage', (e) => {
    if (!e) return;
    // Qualquer mudança relevante no storage pode afetar a navbar
    const userInfo = obterInfoUsuarioLogado();
    atualizarNavbar(userInfo);
});

// Em alguns fluxos o login pode acontecer via script sem recarregar a página;
// para cobrir esse caso faremos uma checagem curta por mudanças no key 'usuario'.
(function watchLocalUserChange() {
    let last = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    const maxChecks = 10; // 10 * 500ms = 5s
    let checks = 0;
    const interval = setInterval(() => {
        const current = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
        if (current !== last) {
            last = current;
            const userInfo = obterInfoUsuarioLogado();
            atualizarNavbar(userInfo);
            // atualizar rodapé também caso o usuário mude
            carregarDadosPsicologoParaRodapé();
        }
        checks++;
        if (checks >= maxChecks) clearInterval(interval);
    }, 500);
})();