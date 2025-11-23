// FUNÇÕES DEFINIDAS NO TOPO - GLOBAIS
function determinarTipoUsuario(dadosUsuario) {
    console.log('Analisando dados do usuário:', dadosUsuario);
    
    // Verificar todos os campos possíveis
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
    
    // Verificar campos específicos
    if (dadosUsuario.crp || dadosUsuario.especialidade || dadosUsuario.psiinstagram) {
        return 'psicologo';
    }
    
    // Por padrão, assume paciente
    return 'paciente';
}

function redirecionarUsuario(tipoUsuario) {
    if (tipoUsuario === 'psicologo') {
        window.location.href = 'perfilPsicologo.html';
    } else {
        window.location.href = 'perfilPaciente.html';
    }
}

// EVENT LISTENER PRINCIPAL
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

    const email = document.querySelector('input[name="email"]').value;
    const senha = document.querySelector('input[name="senha"]').value;

    // Validação básica
    if (!email || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    console.log('Iniciando login para:', email);

    // Fazer requisição para API de login
    fetch('http://localhost:8080/api/usuarios/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            usuemail: email,
            ususenha: senha
        })
    })
    .then(response => {
        console.log('Status da resposta:', response.status);
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            throw new Error('Email ou senha incorretos!');
        } else {
            throw new Error('Erro no servidor! Tente novamente.');
        }
    })
    .then(data => {
        console.log('Dados recebidos da API:', data);
        alert('Login realizado com sucesso!');
        
        // Salvar dados de forma consistente
            salvarDadosUsuario(data);

    
        const tipoUsuario = determinarTipoUsuario(data);
        console.log('Tipo de usuário determinado:', tipoUsuario);
        
        redirecionarUsuario(tipoUsuario);
    })
    .catch(error => {
        console.error('Erro completo no login:', error);
        alert('Erro no login: ' + error.message);
    });
});
}

function salvarDadosUsuario(data) {
    console.log('Salvando dados do usuário:', data);
    
    // Salva o objeto completo do usuário
    localStorage.setItem('usuarioLogado', JSON.stringify(data));
    
    // Salva o ID do usuário (usucodigo)
    const userId = data.usucodigo;
    if (userId) {
        localStorage.setItem('userId', userId);
        localStorage.setItem('usuCodigo', userId); // Específico para agendamentos
        console.log('ID do usuário salvo:', userId);
    }
    
    // Salva o nome do usuário
    const userNome = data.usunome || 'Usuário';
    localStorage.setItem('userNome', userNome);
    console.log('Nome do usuário salvo:', userNome);
    
    // Salva o tipo de usuário
    const userType = determinarTipoUsuario(data);
    localStorage.setItem('userType', userType);
    console.log('Tipo de usuário salvo:', userType);
}

// Funcionalidade do botão Google - COM VERIFICAÇÃO
const googleBtn = document.querySelector('.google-btn');
if (googleBtn) {
    googleBtn.addEventListener('click', function() {
        console.log('Login com Google clicado');
        window.location.href = '/oauth2/authorization/google';
    });
} else {
    console.log('Botão Google não encontrado nesta página.');
}


// Verificar se as funções foram carregadas corretamente
console.log('Script login.js carregado com sucesso');
console.log('determinarTipoUsuario carregada?', typeof determinarTipoUsuario);
console.log('redirecionarUsuario carregada?', typeof redirecionarUsuario);
console.log('salvarDadosUsuario carregada?', typeof salvarDadosUsuario);