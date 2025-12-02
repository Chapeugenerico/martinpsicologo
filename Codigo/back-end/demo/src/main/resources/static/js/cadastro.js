document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();

  const nome = document.querySelector('input[name="nome"]').value;
  const email = document.querySelector('input[name="email"]').value;
  const telefone = document.querySelector('input[name="telefone"]').value;
  const senha = document.querySelector('input[name="senha"]').value;
  const cpf = document.querySelector('input[name="cpf"]').value;
  const cep = document.querySelector('input[name="cep"]').value;
  const nomeSocial = document.querySelector('input[name="meuCheckbox"]').checked;

  
  const usuarioData = {
    usunome: nome,
    usuemail: email,
    ususenha: senha,
    telefone: telefone,      
    cpf: cpf,                 
    cep: cep,               
    nomeSocial: nomeSocial, 
    usutipo: "PACIENTE"     // Campo OBRIGATÓRIO
  };

  console.log('Enviando dados:', usuarioData);

  fetch('historical-pepi-puc-tis-d0d4bf2c.koyeb.app/api/usuarios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(usuarioData)
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => { 
        throw new Error(err.error || 'Erro na API'); 
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('Sucesso:', data);
    alert('Cadastro realizado com sucesso!');
    window.location.href = 'login.html';
  })
  .catch(error => {
    console.error('Erro detalhado:', error);
    alert('Erro ao cadastrar: ' + error.message);
  });
});