async function resetPassword() {
  const emailInput = document.getElementById('email');
  const email = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    mostrarMensagem('Por favor, digite seu email.', 'erro');
    emailInput.focus();
    return;
  }

  if (!emailRegex.test(email)) {
    mostrarMensagem('Por favor, digite um email válido.', 'erro');
    emailInput.focus();
    return;
  }

  try {
    mostrarMensagem('Verificando email...', 'info');

    const response = await fetch('http://localhost:8080/api/usuarios/esqueceu-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('emailRecuperacao', email);
      mostrarMensagem('Email verificado! Enviando código...', 'info');
      await solicitarToken(email);
    } else {
      mostrarMensagem(data.error || 'Email não encontrado.', 'erro');
    }

  } catch (error) {
    console.error('Erro:', error);
    mostrarMensagem('Erro de conexão. Tente novamente.', 'erro');
  }
}

async function solicitarToken(email) {
  try {
    const response = await fetch(`http://localhost:8080/api/usuarios/solicitar?userEmail=${encodeURIComponent(email)}`, {
      method: 'POST'
    });

    const texto = await response.text();

    if (response.ok) {
      mostrarMensagem('Código enviado para seu e-mail. Digite-o abaixo.', 'sucesso');
      document.getElementById('codigo').style.display = 'block';
      document.getElementById('btnValidarCodigo').style.display = 'inline-block';
      document.getElementById('btnEnviarEmail').style.display = 'none';
    } else {
      mostrarMensagem(texto || 'Erro ao solicitar código.', 'erro');
    }

  } catch (error) {
    console.error('Erro ao solicitar token:', error);
    mostrarMensagem('Erro de conexão ao solicitar código.', 'erro');
  }
}

async function validarToken() {
  const email = localStorage.getItem('emailRecuperacao');
  const token = document.getElementById('codigo').value.trim();

  if (!token) {
    mostrarMensagem('Por favor, digite o código de verificação.', 'erro');
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/api/usuarios/validar?userEmail=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`, {
      method: 'POST'
    });

    const texto = await response.text();

    if (response.ok) {
      mostrarMensagem('Código validado! Redirecionando...', 'sucesso');
      setTimeout(() => {
        window.location.href = 'senhaNova.html';
      }, 2000);
    } else {
      mostrarMensagem(texto || 'Código inválido ou expirado.', 'erro');
    }

  } catch (error) {
    console.error('Erro ao validar token:', error);
    mostrarMensagem('Erro de conexão ao validar código.', 'erro');
  }
}

function mostrarMensagem(mensagem, tipo) {
  const mensagemDiv = document.getElementById('mensagem');
  if (!mensagemDiv) {
    alert(mensagem);
    return;
  }

  mensagemDiv.textContent = mensagem;
  mensagemDiv.style.display = 'block';

  if (tipo === 'sucesso') {
    mensagemDiv.style.backgroundColor = '#d4edda';
    mensagemDiv.style.color = '#155724';
    mensagemDiv.style.border = '1px solid #c3e6cb';
  } else if (tipo === 'erro') {
    mensagemDiv.style.backgroundColor = '#f8d7da';
    mensagemDiv.style.color = '#721c24';
    mensagemDiv.style.border = '1px solid #f5c6cb';
  } else {
    mensagemDiv.style.backgroundColor = '#d1ecf1';
    mensagemDiv.style.color = '#0c5460';
    mensagemDiv.style.border = '1px solid #bee5eb';
  }
}

window.resetPassword = resetPassword;
window.validarToken = validarToken;
window.mostrarMensagem = mostrarMensagem;