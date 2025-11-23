// Variáveis globais
let psicologoId = null;
let dadosOriginais = null;

// Carregar dados do psicólogo
async function carregarDadosPsicologo() {
    if (!psicologoId) {
        console.error('ID do psicólogo não definido');
        return;
    }

    try {
        const response = await fetch(`/api/psicologos/${psicologoId}`);
        if (response.ok) {
            const psicologo = await response.json();
            // Verifica se o usuário é do tipo PSICOLOGO
            const tipo = psicologo.usutipo || psicologo.usutipo;
            if (!tipo || String(tipo).toUpperCase() !== 'PSICOLOGO') {
                alert('Usuário não é do tipo psicólogo ou não possui permissão para acessar esta página.');
                console.warn('Usuário carregado não é psicólogo:', psicologo);
                window.location.href = 'login.html';
                return;
            }

            dadosOriginais = { ...psicologo }; // Salva cópia dos dados originais
            preencherFormulario(psicologo);
            console.log('Dados carregados:', psicologo);
        } else {
            console.error('Psicólogo não encontrado');
            alert('Erro ao carregar dados do perfil');
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro de conexão ao carregar dados');
    }
}

// Preencher formulário com dados
function preencherFormulario(psicologo) {
    document.querySelector('input[name="nome"]').value = psicologo.usunome || '';
    document.querySelector('input[name="email"]').value = psicologo.usuemail || '';
    document.querySelector('input[name="telefone"]').value = psicologo.telefone || '';
    document.querySelector('input[name="insta"]').value = psicologo.instagram || '';
    
    // Desabilitar campos inicialmente
    toggleEdicao(false);
}

// Salvar dados no backend
async function salvarDados() {
    const dadosAtualizados = {
        usunome: document.querySelector('input[name="nome"]').value,
        usuemail: document.querySelector('input[name="email"]').value,
        telefone: document.querySelector('input[name="telefone"]').value,
        instagram: document.querySelector('input[name="insta"]').value
    };
    
    // Validações básicas
    if (!dadosAtualizados.usunome.trim()) {
        alert('Nome é obrigatório');
        return;
    }
    
    if (!dadosAtualizados.usuemail.trim()) {
        alert('E-mail é obrigatório');
        return;
    }
    
    try {
        const response = await fetch(`/api/psicologos/${psicologoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosAtualizados)
        });
        
        if (response.ok) {
            const psicologoAtualizado = await response.json();
            dadosOriginais = { ...psicologoAtualizado };
            alert('Dados salvos com sucesso!');
            toggleEdicao(false);
        } else if (response.status === 404) {
            alert('Psicólogo não encontrado');
        } else {
            alert('Erro ao salvar dados');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão ao salvar dados');
    }
}

// Cancelar edição e restaurar dados originais
function cancelarEdicao() {
    if (dadosOriginais) {
        preencherFormulario(dadosOriginais);
    }
    toggleEdicao(false);
}

// Controle de edição dos campos
function toggleEdicao(editando) {
    const inputs = document.querySelectorAll('.campoDeTexto input');
    inputs.forEach(input => {
        input.disabled = !editando;
        if (editando) {
            input.style.backgroundColor = '#fff';
            input.style.border = '1px solid #007bff';
        } else {
            input.style.backgroundColor = '#f8f9fa';
            input.style.border = '1px solid #ced4da';
        }
    });
    
    // Mostrar/ocultar ícones de edição
    const botoesEditar = document.querySelectorAll('.edit p');
    botoesEditar.forEach(botao => {
        botao.style.display = editando ? 'none' : 'block';
    });
    
    // Alternar classe .editing no container .box para controlar visibilidade dos botões via CSS
    const box = document.querySelector('.box');
    if (box) {
        if (editando) box.classList.add('editing'); else box.classList.remove('editing');
    }
}

// Inicializar máscara de telefone
function inicializarMascaraTelefone() {
    const phoneInputField = document.querySelector("#telefone");
    if (phoneInputField) {
        const phoneInput = window.intlTelInput(phoneInputField, {
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
            initialCountry: "br",
            preferredCountries: ["br"],
            separateDialCode: true
        });
    }
}

// Função para obter ID do usuário logado
function obterUsuarioLogadoId() {
    // Implemente conforme sua lógica de autenticação
    // Exemplos:
    
    // 1. De sessionStorage (após login)
    const idSessao = sessionStorage.getItem('usuarioId');
    if (idSessao) return parseInt(idSessao);
    
    // 2. De localStorage
    const idLocal = localStorage.getItem('usuarioId');
    if (idLocal) return parseInt(idLocal);
    
    // 3. De URL parameters (ex: perfilPsicologo.html?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const idUrl = urlParams.get('id');
    if (idUrl) return parseInt(idUrl);
    
    // 4. Fallback para desenvolvimento (REMOVER EM PRODUÇÃO)
    console.warn('Usando ID fixo para desenvolvimento');
    return null; // não assumimos id; se não houver, vamos procurar por usuários do tipo psicólogo
}

// Função de logout
function fazerLogout() {
    sessionStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioId');
    window.location.href = 'login.html';
}

// Função de redirecionamento
function redirecionarPara(pagina) {
    window.location.href = pagina;
}

// Event Listeners quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    // Obter ID do usuário logado
    psicologoId = obterUsuarioLogadoId();
    console.log('ID do psicólogo (storage/url):', psicologoId);

    // Se não temos id no storage/URL, procurar por um usuário do tipo PSICOLOGO
    (async function init() {
        if (!psicologoId) {
            try {
                const res = await fetch('/api/usuarios');
                if (res.ok) {
                    const list = await res.json();
                    const psi = list.find(u => (u.usutipo && String(u.usutipo).toUpperCase() === 'PSICOLOGO'));
                    if (psi) {
                        psicologoId = psi.usucodigo;
                        console.log('Encontrado psicólogo para preencher perfil, id=', psicologoId);
                    } else {
                        alert('Nenhum usuário do tipo psicólogo encontrado. Redirecionando...');
                        window.location.href = 'login.html';
                        return;
                    }
                } else {
                    console.error('Erro ao listar usuários para encontrar psicólogo');
                }
            } catch (err) {
                console.error('Erro ao buscar usuários:', err);
            }
        }

        if (psicologoId) {
            carregarDadosPsicologo();
        } else {
            alert('Usuário não identificado. Redirecionando para login...');
            window.location.href = 'login.html';
            return;
        }
    })();
    
    // Inicializar máscara de telefone
    inicializarMascaraTelefone();
    
    // Botões de editar em cada campo
    document.querySelectorAll('.edit p').forEach(botao => {
        botao.addEventListener('click', function() {
            toggleEdicao(true);
        });
    });
    
    // Botão Salvar
    const btnSalvar = document.getElementById('btnSalvar');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', salvarDados);
    }
    
    // Botão Cancelar
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', cancelarEdicao);
    }
    
    // Logout
    const btnLogout = document.querySelector('.logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', fazerLogout);
    }
    
    // Navegação entre abas
    document.querySelectorAll('.btn-aba').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove classe ativa de todos os botões
            document.querySelectorAll('.btn-aba').forEach(b => {
                b.classList.remove('btn-aba-1');
            });
            // Adiciona classe ativa no botão clicado
            this.classList.add('btn-aba-1');
        });
    });
});

// Adicionar estilos dinâmicos
const style = document.createElement('style');
style.textContent = `
    .campoDeTexto input:disabled {
        background-color: #f8f9fa !important;
        color: #495057 !important;
        cursor: not-allowed !important;
    }
    
    .campoDeTexto input:enabled {
        background-color: #ffffff !important;
        border: 1px solid #007bff !important;
        box-shadow: 0 0 5px rgba(0, 123, 255, 0.3) !important;
    }
    
    .edit p {
        cursor: pointer;
        transition: color 0.3s;
    }
    
    .edit p:hover {
        color: #007bff;
    }
`;
document.head.appendChild(style);