// auth.js - Verificação global de autenticação
class Auth {
    static getUsuarioLogado() {
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        if (usuarioLogado) {
            const dados = JSON.parse(usuarioLogado);
            const tipo = localStorage.getItem('userType') || this.determinarTipoUsuario(dados);
            return { tipo, dados };
        }

        // Tenta obter do token (como fallback)
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const tipo = payload.tipo || 'paciente';
                return { tipo, dados: payload };
            } catch (error) {
                console.error('Erro ao decodificar token:', error);
            }
        }

        return null;
    }

    static determinarTipoUsuario(dadosUsuario) {
        // mesma lógica do login.js
        if (dadosUsuario.usutipo) {
            return dadosUsuario.usutipo.toLowerCase();
        }
        if (dadosUsuario.tipoUsuario) {
            return dadosUsuario.tipoUsuario.toLowerCase();
        }
        if (dadosUsuario.tipo) {
            return dadosUsuario.tipo.toLowerCase();
        }
        if (dadosUsuario.role) {
            return dadosUsuario.role.toLowerCase();
        }
        if (dadosUsuario.crp || dadosUsuario.especialidade || dadosUsuario.psiinstagram) {
            return 'psicologo';
        }
        return 'paciente';
    }
    
    static redirecionarParaPerfilCorreto() {
        const usuario = this.getUsuarioLogado();
        
        if (!usuario) {
            window.location.href = 'login.html';
            return;
        }
        
        // Verificar se está na página correta
        const paginaAtual = window.location.pathname;
        
        if (usuario.tipo === 'paciente' && !paginaAtual.includes('perfilPaciente')) {
            window.location.href = 'perfilPaciente.html';
        } else if (usuario.tipo === 'psicologo' && !paginaAtual.includes('perfilPsicologo')) {
            window.location.href = 'perfilPsicologo.html';
        }
    }
    
    static logout() {
        // Remove todos os dados de autenticação
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('pacienteId');
        localStorage.removeItem('userNome');
        localStorage.removeItem('userType');
        window.location.href = 'login.html';
    }

    static verificarAutenticacao() {
        const usuario = this.getUsuarioLogado();
        const currentPage = window.location.pathname;
        
        if (!usuario && !currentPage.includes('login.html')) {
            window.location.href = 'login.html';
            return false;
        }
        
        if (usuario && currentPage.includes('login.html')) {
            this.redirecionarParaPerfilCorreto();
            return false;
        }
        
        return true;
    }
}

// Configuração global para todas as páginas
document.addEventListener('DOMContentLoaded', function() {
    Auth.verificarAutenticacao();
    
    // Configurar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            Auth.logout();
        });
    }
    
    // Exibir informações do usuário
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        const usuario = Auth.getUsuarioLogado();
        if (usuario) {
            const nome = usuario.dados.nome || usuario.dados.usunome || usuario.dados.pacinome || usuario.dados.psinome || 'Usuário';
            userInfo.textContent = `Olá, ${nome}`;
        }
    }
});