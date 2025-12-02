// prontuario.js - Funcionalidades da página de prontuário
const API_BASE_URL = 'historical-pepi-puc-tis-d0d4bf2c.koyeb.app/api';

// Função para salvar prontuário
async function salvarProntuario(dadosProntuario) {
    try {
        const pacienteAtual = JSON.parse(localStorage.getItem('pacienteAtual'));

        if (!pacienteAtual || !pacienteAtual.prontuarioId) {
            throw new Error('Dados do paciente não encontrados');
        }

        const response = await fetch(`${API_BASE_URL}/prontuarios/${pacienteAtual.prontuarioId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosProntuario)
        });

        if (response.ok) {
            const prontuarioAtualizado = await response.json();
            console.log('Prontuário salvo com sucesso:', prontuarioAtualizado);
            return true;
        } else {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('Erro:', error);
        return false;
    }
}

// Função para excluir prontuário
async function excluirProntuario() {
    try {
        const pacienteAtual = JSON.parse(localStorage.getItem('pacienteAtual'));

        if (!pacienteAtual || !pacienteAtual.prontuarioId) {
            alert('Nenhum prontuário encontrado para excluir.');
            return false;
        }

        const confirmacao = confirm(`Tem certeza que deseja excluir o prontuário de ${pacienteAtual.nome}? Esta ação não pode ser desfeita.`);

        if (!confirmacao) {
            return false;
        }

        const response = await fetch(`${API_BASE_URL}/prontuarios/${pacienteAtual.prontuarioId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log('Prontuário excluído com sucesso');

            // Remove o prontuarioId do paciente no localStorage
            pacienteAtual.prontuarioId = null;
            localStorage.setItem('pacienteAtual', JSON.stringify(pacienteAtual));

            // Limpa o formulário
            limparFormulario();

            alert('Prontuário excluído com sucesso!');
            return true;
        } else {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('Erro ao excluir prontuário:', error);
        alert('Erro ao excluir prontuário. Tente novamente.');
        return false;
    }
}

// Função para limpar o formulário
function limparFormulario() {
    document.getElementById('idade').value = '';
    document.getElementById('nascimento').value = '';
    document.getElementById('estadoCivil').value = '';
    document.getElementById('profissao').value = '';
    document.getElementById('religiao').value = '';
    document.getElementById('filho').value = '';
    document.getElementById('resideCom').value = '';
    document.getElementById('tabagismo').value = '';
    document.getElementById('substancia').value = '';
    document.getElementById('queixaPrincipal').value = '';
    document.getElementById('historicoFamiliar').value = '';
    document.getElementById('notas').value = '';
}

// Função para carregar prontuário existente
async function carregarProntuario() {
    try {
        const pacienteAtual = JSON.parse(localStorage.getItem('pacienteAtual'));

        if (!pacienteAtual || !pacienteAtual.prontuarioId) {
            console.log('Nenhum prontuário encontrado para carregar');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/prontuarios/${pacienteAtual.prontuarioId}`);

        if (response.ok) {
            const prontuario = await response.json();
            preencherFormulario(prontuario);
        } else if (response.status === 404) {
            console.log('Prontuário não encontrado, será criado novo ao salvar');
        } else {
            throw new Error(`Erro ${response.status}`);
        }
    } catch (error) {
        console.error('Erro ao carregar prontuário:', error);
    }
}

// Função para preencher o formulário com dados existentes
function preencherFormulario(prontuario) {
    if (prontuario.idade) document.getElementById('idade').value = prontuario.idade;
    if (prontuario.dataNascimento) document.getElementById('nascimento').value = prontuario.dataNascimento;
    if (prontuario.estadoCivil) document.getElementById('estadoCivil').value = prontuario.estadoCivil;
    if (prontuario.profissao) document.getElementById('profissao').value = prontuario.profissao;
    if (prontuario.religiao) document.getElementById('religiao').value = prontuario.religiao;
    if (prontuario.filhos) document.getElementById('filho').value = prontuario.filhos;
    if (prontuario.resideCom) document.getElementById('resideCom').value = prontuario.resideCom;
    if (prontuario.tabagismo) document.getElementById('tabagismo').value = prontuario.tabagismo;
    if (prontuario.usoSubstancias) document.getElementById('substancia').value = prontuario.usoSubstancias;
    if (prontuario.queixaPrincipal) document.getElementById('queixaPrincipal').value = prontuario.queixaPrincipal;
    if (prontuario.historicoFamiliar) document.getElementById('historicoFamiliar').value = prontuario.historicoFamiliar;
    if (prontuario.notas) document.getElementById('notas').value = prontuario.notas;
}

// Coletar dados do formulário
function coletarDadosFormulario() {
    return {
        idade: document.getElementById('idade').value ? parseInt(document.getElementById('idade').value) : null,
        dataNascimento: document.getElementById('nascimento').value,
        estadoCivil: document.getElementById('estadoCivil').value,
        profissao: document.getElementById('profissao').value,
        religiao: document.getElementById('religiao').value,
        filhos: document.getElementById('filho').value,
        resideCom: document.getElementById('resideCom').value,
        tabagismo: document.getElementById('tabagismo').value,
        usoSubstancias: document.getElementById('substancia').value,
        queixaPrincipal: document.getElementById('queixaPrincipal').value,
        historicoFamiliar: document.getElementById('historicoFamiliar').value,
        notas: document.getElementById('notas').value
    };
}

// Inicialização da página de prontuário
document.addEventListener('DOMContentLoaded', async function () {
    const pacienteAtual = JSON.parse(localStorage.getItem('pacienteAtual'));

    if (pacienteAtual) {
        // Atualiza a interface com dados do paciente
        document.getElementById('patientTypeDisplay').textContent =
            pacienteAtual.nome + (pacienteAtual.tipo === 'crianca' ? ' (Paciente Infantil)' : ' (Paciente Adulto)');

        if (pacienteAtual.telefone) {
            document.querySelector('.patient-phone').textContent = `Telefone ${pacienteAtual.telefone}`;
        }

        // Carrega dados existentes do prontuário
        await carregarProntuario();
    } else {
        alert('Nenhum paciente selecionado. Redirecionando...');
        window.location.href = 'gerenciarPaciente.html';
        return;
    }

    // Event listener para salvar
    document.querySelector('.btn-salvar').addEventListener('click', async function () {
        const dadosProntuario = coletarDadosFormulario();

        const sucesso = await salvarProntuario(dadosProntuario);

        if (sucesso) {
            alert('Prontuário salvo com sucesso!');
            // Opcional: redirecionar de volta
            // window.location.href = 'gerenciarPaciente.html';
        } else {
            alert('Erro ao salvar prontuário. Tente novamente.');
        }
    });

    

    // Event listener para excluir
    document.querySelector('.btn-excluir').addEventListener('click', async function () {
        await excluirProntuario();
        if (confirm('Tem certeza que deseja excluir? Essa ação não podera ser reversivel')) {
            window.location.href = 'gerenciarPaciente.html';
        }
    });

    // Event listener para cancelar
    document.querySelector('.btn-cancelar').addEventListener('click', function () {
        if (confirm('Tem certeza que deseja cancelar? As alterações não salvas serão perdidas.')) {
            window.location.href = 'gerenciarPaciente.html';
        }
    });


});

// Função de redirecionamento (mantida para compatibilidade)
function redirecionarPara(pagina) {
    window.location.href = pagina;
}