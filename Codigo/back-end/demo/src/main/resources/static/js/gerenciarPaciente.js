// gerenciarPaciente.js - popula a tabela de pacientes

let pacientes = [];
const API_BASE_URL = 'historical-pepi-puc-tis-d0d4bf2c.koyeb.app/api';
let pacienteSelecionadoId = null; // VARIÁVEL QUE ESTAVA FALTANDO

async function carregarPacientes() {
    try {
        const tbody = document.getElementById('pacientes');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Carregando dados...</td></tr>';

        // Busca pacientes da API Spring Boot
        const res = await fetch(`${API_BASE_URL}/pacientes`);

        if (!res.ok) {
            throw new Error(`Erro HTTP: ${res.status}`);
        }

        pacientes = await res.json();
        

        // Limpa a tabela
        tbody.innerHTML = '';

        if (!Array.isArray(pacientes) || pacientes.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.setAttribute('colspan', '5');
            td.textContent = 'Nenhum paciente cadastrado';
            td.style.textAlign = 'center';
            tr.appendChild(td);
            tbody.appendChild(tr);
            atualizarContador(0);
            return;
        }

        //Para cada paciente, buscar a ultima sessão
        for (let p of pacientes) {
            try {
                p.ultimaSessao = await buscarUltimaSessao(p.id);
            } catch (error) {
                // Se a busca por sessão falhar, o paciente ainda será listado,
                // mas sua sessão será nula (p.ultimaSessao = null)
                console.error(`Erro ao buscar última sessão do paciente ${p.nome} (ID: ${p.id}):`, error);
                p.ultimaSessao = null;
            }
            console.log('Paciente:', p.nome, 'Última sessão:', p.ultimaSessao);
        }



        // Preenche a tabela com os pacientes da API
        pacientes.forEach(p => {
            const tr = document.createElement('tr');

            // NOME CLICÁVEL
            const tdNome = document.createElement('td');
            const nomeSpan = document.createElement('span');
            nomeSpan.className = 'nome-clicavel';
            nomeSpan.textContent = p.nome || '-';
            nomeSpan.style.cursor = 'pointer';
            nomeSpan.style.color = '#591636';
            nomeSpan.style.textDecoration = 'underline';
            nomeSpan.addEventListener('click', () => abrirDadosPaciente(p.id));
            tdNome.appendChild(nomeSpan);
            tdNome.setAttribute('data-label', 'Paciente');

            // Define a condição para "Não Agendada"
            const isNaoAgendada = !p.ultimaSessao || !p.ultimaSessao.proximaSessao;

            // PRÓXIMA SESSÃO (com dados reais E CLICÁVEL)
            const tdProx = document.createElement('td');
            if (p.ultimaSessao && p.ultimaSessao.proximaSessao && !isNaoAgendada) {
                const dataSessao = new Date(p.ultimaSessao.proximaSessao);
                const proxSpan = document.createElement('span');
                proxSpan.className = 'sessao-clicavel';
                proxSpan.textContent = formatDateDDMMHHMM(dataSessao);
                proxSpan.style.cursor = 'pointer';
                proxSpan.style.color = '#591636';
                proxSpan.style.textDecoration = 'underline';
                proxSpan.addEventListener('click', () => {
                    pacienteSelecionadoId = p.id;
                    abrirGestaoSessao(p.id);
                });
                tdProx.appendChild(proxSpan);
            } else {
                const proxSpan = document.createElement('span');
                proxSpan.className = 'sessao-clicavel';
                proxSpan.textContent = 'Não agendada';
                proxSpan.style.cursor = 'pointer';
                proxSpan.style.color = '#591636';
                proxSpan.style.textDecoration = 'underline';
                proxSpan.addEventListener('click', () => {
                    pacienteSelecionadoId = p.id;
                    abrirGestaoSessao(p.id);
                });
                tdProx.appendChild(proxSpan);
            }

            // SESSÕES RESTANTES (com dados reais E CLICÁVEL)
            const tdSessoes = document.createElement('td');
            if (!isNaoAgendada && p.ultimaSessao && p.ultimaSessao.sessoesRestantes !== null) {
                const sessoesSpan = document.createElement('span');
                sessoesSpan.className = 'sessao-clicavel';
                sessoesSpan.textContent = p.ultimaSessao.sessoesRestantes;
                sessoesSpan.style.cursor = 'pointer';
                sessoesSpan.style.color = '#591636';
                sessoesSpan.style.textDecoration = 'underline';
                sessoesSpan.addEventListener('click', () => {
                    pacienteSelecionadoId = p.id;
                    abrirGestaoSessao(p.id);
                });
                tdSessoes.appendChild(sessoesSpan);
            } else {
                const sessoesSpan = document.createElement('span');
                sessoesSpan.className = 'sessao-clicavel';
                sessoesSpan.textContent = 'Não agendada';
                sessoesSpan.style.cursor = 'pointer';
                sessoesSpan.style.color = '#591636';
                sessoesSpan.style.textDecoration = 'underline';
                sessoesSpan.addEventListener('click', () => {
                    pacienteSelecionadoId = p.id;
                    abrirGestaoSessao(p.id);
                });
                tdSessoes.appendChild(sessoesSpan);
            }

            // PAGAMENTO (com dados reais E CLICÁVEL)
            const tdPagamento = document.createElement('td');
            if (!isNaoAgendada && p.ultimaSessao && p.ultimaSessao.statusPagamento) {
                const status = p.ultimaSessao.statusPagamento;
                let badgeClass = 'badge-pendente';
                if (status === 'PAGO') badgeClass = 'badge-pago';
                if (status === 'CANCELADO') badgeClass = 'badge-cancelado';

                const pagamentoSpan = document.createElement('span');
                pagamentoSpan.className = `badge ${badgeClass} sessao-clicavel`;
                pagamentoSpan.textContent = status;
                pagamentoSpan.style.cursor = 'pointer';
                pagamentoSpan.addEventListener('click', () => {
                    pacienteSelecionadoId = p.id;
                    abrirGestaoSessao(p.id);
                });
                tdPagamento.appendChild(pagamentoSpan);
            } else {
                const pagamentoSpan = document.createElement('span');
                pagamentoSpan.className = 'sessao-clicavel';
                pagamentoSpan.textContent = 'Não agendada';
                pagamentoSpan.style.cursor = 'pointer';
                pagamentoSpan.style.color = '#591636';
                pagamentoSpan.style.textDecoration = 'underline';
                pagamentoSpan.addEventListener('click', () => {
                    pacienteSelecionadoId = p.id;
                    abrirGestaoSessao(p.id);
                });
                tdPagamento.appendChild(pagamentoSpan);
            }
            // PRONTUÁRIO
            const tdPront = document.createElement('td');
            const btn = document.createElement('button');
            btn.className = 'prontuaria';
            btn.textContent = 'Abrir';
            btn.addEventListener('click', () => abrirProntuario(p.id));
            tdPront.appendChild(btn);
            tdPront.setAttribute('data-label', 'Prontuário');



            tr.append(tdNome, tdProx, tdSessoes, tdPagamento, tdPront);
            tbody.appendChild(tr);
        });

        atualizarContador(pacientes.length);

    } catch (err) {
        console.error('Erro ao carregar pacientes:', err);
        const tbody = document.getElementById('pacientes');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#900">Erro ao carregar pacientes da API</td></tr>';
        }
    }
}

function formatDateDDMMHHMM(d) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month} - ${hours}:${mins}`;
}

function atualizarValorSessaoHidden() {
    const vf = document.getElementById('valorSessaoDisplay');
    const vh = document.getElementById('valorSessao');
    if (vf && vh) {
        // Remove tudo que não for número ou ponto
        const raw = vf.value.replace(/[^0-9,\.]/g, '').replace(',', '.');
        let num = parseFloat(raw);
        if (isNaN(num)) num = 0;
        // GUARDA valor no hidden como número com ponto
        vh.value = num;
        console.log('Hidden atualizado com valor:', vh.value);
    }
}

function converterSessaoParaAgendamento(sessao) {
    if (!sessao || !sessao.paciente || !sessao.proximaSessao) {
        console.error('Sessão inválida ou incompleta');
        return null;
    }

    const dataHora = new Date(sessao.proximaSessao);

    const agendamento = {
        usuCodigo: sessao.paciente.id,
        data: dataHora.toISOString().split('T')[0], // yyyy-MM-dd
        horario: dataHora.toTimeString().split(' ')[0], // HH:mm:ss
        isOnline: sessao.modalidade === 'ONLINE',
        valorSessao: sessao.valorSessao,
        quantidadePacote: null,
        quantidadeRestante: null
    };

    return agendamento;
}


async function salvarSessao(e) {
    e.preventDefault();

    atualizarValorSessaoHidden();

    const sessaoId = document.getElementById('sessaoId').value;
    const pacienteId = document.getElementById('sessaoPacienteId').value;

    if (!pacienteId) {
        alert('Erro: ID do paciente não encontrado');
        return;
    }

    // Coletar valores dos radio buttons
    const modalidade = document.querySelector('input[name="modalidade"]:checked');
    const frequencia = document.querySelector('input[name="frequencia"]:checked');
    const statusPagamento = document.querySelector('input[name="statusPagamento"]:checked');

    // Validar campos obrigatórios
    if (!modalidade || !frequencia || !statusPagamento) {
        alert('Por favor, preencha todos os campos obrigatórios (Modalidade, Frequência e Status do Pagamento)');
        return;
    }

    // Coletar outros valores
    const valorSessao = parseFloat(document.getElementById('valorSessao').value) || 0;
    const quantidadeSessoes = parseInt(document.getElementById('quantidadeSessoes').value) || 1;
    const proximaSessaoInput = document.getElementById('proximaSessao').value;

    try {
        const response = await fetch(`/api/sessoes/paciente/${pacienteId}/ultima`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const sessao = await response.json();
        if (sessao.quantidade_sessoes > quantidadeSessoes){
            const agendamento = converterSessaoParaAgendamento(sessao);

            await fetch('/agendamentos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(agendamento)
            });    
        }
    } catch (error) {
        alert('Erro inesperado ao salvar sessão');
    }

    // DEBUG: Verificar o valor do campo de data
    // console.log('=== DEBUG SESSÃO ===');
    // console.log('proximaSessaoInput:', proximaSessaoInput);
    // console.log('Tipo de proximaSessaoInput:', typeof proximaSessaoInput);

    const dadosSessao = {
        paciente: { id: parseInt(pacienteId) },
        valorSessao,
        quantidadeSessoes,
        modalidade: modalidade.value,
        frequencia: frequencia.value,
        statusPagamento: statusPagamento.value,
        sessoesRestantes: quantidadeSessoes
    };

    // Tratar data da próxima sessão
    if (proximaSessaoInput) {
        // Usar a string diretamente do input e adicionar segundos
        dadosSessao.proximaSessao = proximaSessaoInput + ':00';
        console.log('Data formatada (alternativa):', dadosSessao.proximaSessao);
    } else {
        dadosSessao.proximaSessao = null;
    }

    console.log('Dados da sessão a serem enviados:', dadosSessao);

    try {
        let response;
        let url;

        if (sessaoId) {
            // Atualizar sessão existente
            url = `${API_BASE_URL}/sessoes/${sessaoId}`;
            console.log('Atualizando sessão:', url);
            response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosSessao)
            });
        } else {
            // Criar nova sessão
            url = `${API_BASE_URL}/sessoes`;
            console.log('Criando nova sessão:', url);
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosSessao)
            });
        }

        console.log('Resposta da API:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        const sessaoSalva = await response.json();
        console.log('Sessão salva com sucesso:', sessaoSalva);

        alert(sessaoId ? 'Sessão atualizada com sucesso!' : 'Sessão criada com sucesso!');
        fecharModal();

        // Atualiza a tabela de pacientes para refletir as mudanças
        carregarPacientes();

    } catch (error) {
        console.error('Erro ao salvar sessão:', error);
        alert('Erro ao salvar sessão: ' + error.message);
    }
}

function abrirModalAlertaExclusao(nome) {
    // Fecha qualquer modal que esteja aberto
    fecharModal(); 

    // Obtém o elemento do modal
    const modalAlerta = document.getElementById('modalAlertaExclusao');
    if (!modalAlerta) {
        // Fallback simples caso o HTML não tenha sido adicionado
        alert(`O paciente "${nome}" não pode ser excluído pois possui uma SESSÃO AGENDADA. Por favor, cancele ou remova o agendamento futuro antes de tentar a exclusão.`);
        return;
    }

    // Preenche o conteúdo do modal de alerta
    document.getElementById('modalTituloAlerta').textContent = 'Atenção';
    document.getElementById('mensagemAlerta').innerHTML = 
        `O paciente ${nome} não pode ser excluído pois possui uma sessão agendada. Por favor, remova o agendamento futuro antes de tentar a exclusão.`;

    modalAlerta.style.display = 'block';
}

// Abre o formulário de prontuário para o paciente selecionado 
// Função para abrir prontuário - VERIFICA SE JÁ EXISTE
async function abrirProntuario(id) {
    pacienteSelecionadoId = id;
    const paciente = pacientes.find(p => p.id === id);
    if (!paciente) return;

    try {
        // Verifica se o paciente já tem um prontuário
        const response = await fetch(`${API_BASE_URL}/prontuarios/paciente/${id}`);

        if (response.ok) {
            // Paciente já tem prontuário - redireciona diretamente
            const prontuario = await response.json();
            console.log('Prontuário encontrado:', prontuario);

            // Salva os dados no localStorage
            const dadosPaciente = {
                id: paciente.id,
                prontuarioId: prontuario.id,
                tipo: prontuario.tipoPaciente?.toLowerCase() || 'adulto',
                nome: paciente.nome || 'Paciente',
                telefone: paciente.telefone || '(xx) xxxxx-xxxx'
            };

            localStorage.setItem('pacienteAtual', JSON.stringify(dadosPaciente));
            console.log('Redirecionando para prontuário existente');

            // Redireciona diretamente para o prontuário
            window.location.href = 'prontuario.html';

        } else if (response.status === 404) {
            // Paciente não tem prontuário - mostra modal de seleção
            console.log('Paciente não tem prontuário, mostrando modal de seleção');
            document.getElementById('modalTipoAnamnese').style.display = 'block';
        } else {
            throw new Error(`Erro ${response.status}`);
        }
    } catch (error) {
        console.error('Erro ao verificar prontuário:', error);
        // Em caso de erro, mostra o modal de seleção por segurança
        document.getElementById('modalTipoAnamnese').style.display = 'block';
    }
}

// Abre o modal com os dados detalhados do paciente
function abrirDadosPaciente(id) {
    console.log('Abrindo dados do paciente ID:', id);

    const paciente = pacientes.find(p => p.id === id);
    if (!paciente) {
        console.log('Paciente não encontrado');
        return;
    }

    // Preencher os dados no modal
    document.getElementById('dadosNomeCompleto').textContent = paciente.nome || '-';
    document.getElementById('dadosTelefone').textContent = paciente.telefone || '-';
    document.getElementById('dadosEmail').textContent = paciente.email || '-';

    // Configurar o botão de editar
    const btnEditar = document.getElementById('btnEditarPaciente');
    if (btnEditar) {
        btnEditar.onclick = function () {
            fecharModal();
            editarPaciente(id);
        };
    }

    // Configurar o botão de excluir
    const btnExcluir = document.getElementById('btnExcluirPaciente');
    if (btnExcluir) {
        btnExcluir.onclick = function () {
            // Fechar o modal de dados e abrir o modal de confirmação
            fecharModal();
            abrirModalConfirmacaoExclusao(id);
        };
    }

    // Exibir o modal
    const modal = document.getElementById('modalDadosPaciente');
    if (modal) {
        modal.style.display = 'block';
        console.log('Modal aberto com sucesso');
    } else {
        console.log('Modal não encontrado');
    }
}

function adicionarPaciente() {
    document.getElementById('modalTitulo').textContent = 'Adicionar Paciente';
    document.getElementById('formPaciente').reset();
    document.getElementById('pacienteId').value = '';
    document.getElementById('modalPaciente').style.display = 'block';
}

function editarPaciente(id) {
    console.log('Editando paciente ID:', id);

    const paciente = pacientes.find(p => p.id === id);
    if (!paciente) {
        console.log('Paciente não encontrado para edição');
        return;
    }

    // Preenche o formulário de edição
    document.getElementById('modalTitulo').textContent = 'Editar Paciente';
    document.getElementById('pacienteId').value = paciente.id;
    document.getElementById('nome').value = paciente.nome || '';
    document.getElementById('telefone').value = paciente.telefone || '';
    document.getElementById('email').value = paciente.email || '';

    // Abre o modal de edição
    document.getElementById('modalPaciente').style.display = 'block';
}


function abrirModalConfirmacaoExclusao(id) {
    const paciente = pacientes.find(p => p.id === id);
    if (!paciente) return;

    // Verifica se o paciente possui dados de sessão e se a próxima sessão não é null/undefined
    const temProximaSessao = paciente.ultimaSessao && paciente.ultimaSessao.proximaSessao;

    if (temProximaSessao) {
        // Se houver próxima sessão agendada, ABRE O ALERTA e impede a exclusão
        abrirModalAlertaExclusao(paciente.nome);
        return; // Sai da função, não abre o modal de confirmação de exclusão.
    }

    // Configurar a mensagem de confirmação
    document.getElementById('mensagemConfirmacao').textContent = 
        `Tem certeza que deseja excluir o paciente "${paciente.nome}"? Esta ação não pode ser desfeita.`;

    // Configurar o botão de confirmar para excluir o paciente
    const btnConfirmar = document.getElementById('btnConfirmarAcao');
    if (btnConfirmar) {
        btnConfirmar.onclick = function() {
            excluirPaciente(id);
        };
    }

    // Abrir o modal de confirmação
    document.getElementById('modalConfirmacao').style.display = 'block';
}

async function salvarPaciente(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const pacienteId = document.getElementById('pacienteId').value;

    const dados = {
        nome: formData.get('nome'),
        email: formData.get('email'),
        telefone: formData.get('telefone')
    };

    try {
        let response;
        let url;

        if (pacienteId) {
            // ATUALIZAR paciente existente
            url = `${API_BASE_URL}/pacientes/${pacienteId}`;
            response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados)
            });
        } else {
            // CRIAR novo paciente
            url = `${API_BASE_URL}/pacientes`;
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados)
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        const pacienteSalvo = await response.json();

        alert(pacienteId ? 'Paciente atualizado com sucesso!' : 'Paciente adicionado com sucesso!');
        fecharModal();
        carregarPacientes(); // Recarrega a lista da API

    } catch (error) {
        console.error('Erro ao salvar paciente:', error);
        alert('Erro ao salvar paciente: ' + error.message);
    }
}

async function excluirPaciente(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/pacientes/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        alert('Paciente excluído com sucesso!');
        fecharModal(); // Fecha o modal de confirmação
        carregarPacientes(); // Recarrega a lista da API

    } catch (error) {
        console.error('Erro ao excluir paciente:', error);
        alert('Erro ao excluir paciente: ' + error.message);
    }
}

// Função para abrir o formulário de anamnese específico
function abrirFormularioAnamnese(tipo) {
    console.log(`Abrindo anamnese ${tipo} para paciente ${pacienteSelecionadoId}`);

    // Fecha o modal de seleção
    fecharModal();

    // Aqui você pode redirecionar para diferentes formulários
    // ou abrir diferentes modais baseado no tipo
    switch (tipo) {
        case 'crianca':
            abrirAnamneseCrianca();
            break;
        case 'adulto':
            abrirAnamneseAdulto();
            break;


    }
}

// Funções para cada tipo de anamnese - CORRIGIDAS
async function abrirAnamneseCrianca() {
    console.log('=== INICIANDO ABRIR ANAMNESE CRIANCA ===');
    console.log('pacienteSelecionadoId:', pacienteSelecionadoId);

    if (!pacienteSelecionadoId) {
        alert('Por favor, selecione um paciente primeiro.');
        return;
    }

    try {
        // Busca os dados completos do paciente
        const paciente = pacientes.find(p => p.id === pacienteSelecionadoId);
        if (!paciente) {
            throw new Error('Paciente não encontrado');
        }

        const url = `historical-pepi-puc-tis-d0d4bf2c.koyeb.app/api/prontuarios/paciente/${pacienteSelecionadoId}?tipoPaciente=crianca`;
        console.log('URL da requisição:', url);

        // Cria o prontuário no backend
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log('Status da resposta:', response.status);
        console.log('Response OK?', response.ok);

        if (response.ok) {
            const prontuario = await response.json();
            console.log('Prontuário criado:', prontuario);

            // Salva os dados no localStorage
            const dadosPaciente = {
                id: pacienteSelecionadoId,
                prontuarioId: prontuario.id,
                tipo: 'crianca',
                nome: paciente.nome || 'Paciente',
                telefone: paciente.telefone || '(xx) xxxxx-xxxx'
            };

            localStorage.setItem('pacienteAtual', JSON.stringify(dadosPaciente));
            console.log('Dados salvos no localStorage:', dadosPaciente);

            // Redireciona para prontuario.html
            window.location.href = 'prontuario.html';
        } else {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('Erro completo:', error);
        alert('Erro ao abrir prontuário: ' + error.message);
    }
}

async function abrirAnamneseAdulto() {
    console.log('=== INICIANDO ABRIR ANAMNESE ADULTO ===');
    console.log('pacienteSelecionadoId:', pacienteSelecionadoId);

    if (!pacienteSelecionadoId) {
        alert('Por favor, selecione um paciente primeiro.');
        return;
    }

    try {
        // Busca os dados completos do paciente
        const paciente = pacientes.find(p => p.id === pacienteSelecionadoId);
        if (!paciente) {
            throw new Error('Paciente não encontrado');
        }

        const url = `historical-pepi-puc-tis-d0d4bf2c.koyeb.app/api/prontuarios/paciente/${pacienteSelecionadoId}?tipoPaciente=adulto`;
        console.log('URL da requisição:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log('Status da resposta:', response.status);

        if (response.ok) {
            const prontuario = await response.json();
            console.log('Prontuário criado:', prontuario);

            // Salva os dados no localStorage
            const dadosPaciente = {
                id: pacienteSelecionadoId,
                prontuarioId: prontuario.id,
                tipo: 'adulto',
                nome: paciente.nome || 'Paciente',
                telefone: paciente.telefone || '(xx) xxxxx-xxxx'
            };

            localStorage.setItem('pacienteAtual', JSON.stringify(dadosPaciente));
            console.log('Dados salvos no localStorage:', dadosPaciente);

            window.location.href = 'prontuario.html';
        } else {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('Erro completo:', error);
        alert('Erro ao abrir prontuário: ' + error.message);
    }
}



// Função para configurar os eventos dos cards
function configurarEventosAnamnese() {
    const optionCards = document.querySelectorAll('.option-card'); // CORRIGIDO: era 'querySelectorAlgit'

    optionCards.forEach(card => {
        card.addEventListener('click', function () {
            // Remove seleção de todos os cards
            optionCards.forEach(c => c.classList.remove('selected'));

            // Adiciona seleção ao card clicado
            this.classList.add('selected');

            // Pega o tipo do data attribute
            const tipo = this.getAttribute('data-tipo');

            // Abre o formulário após um breve delay para ver a seleção
            setTimeout(() => {
                abrirFormularioAnamnese(tipo);
            }, 300);
        });
    });
}

function pesquisarPacientes() {
    const termo = document.getElementById('campoPesquisa').value.toLowerCase();
    const tbody = document.getElementById('pacientes');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Filtra pacientes pelo nome ou email
    const pacientesFiltrados = pacientes.filter(p =>
        p.nome.toLowerCase().includes(termo) ||
        (p.email && p.email.toLowerCase().includes(termo))
    );

    if (pacientesFiltrados.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.setAttribute('colspan', '5');
        td.textContent = 'Nenhum paciente encontrado';
        td.style.textAlign = 'center';
        tr.appendChild(td);
        tbody.appendChild(tr);
        atualizarContador(0);
        return;
    }

    pacientesFiltrados.forEach(p => {
        const sessao = p.ultimaSessao || {}; 
        const prox = sessao.proximaSessao ? new Date(sessao.proximaSessao) : null;
        
        // Define a condição para "Não Agendada"
        const isNaoAgendada = !p.ultimaSessao || !p.ultimaSessao.proximaSessao;

        // Próxima Sessão
        const proxStr = prox ? formatDateDDMMHHMM(prox) : 'Não agendada';
        
        // Sessões Restantes: usa a condição combinada
        const sessoesRestantes = (!isNaoAgendada && sessao.sessoesRestantes != null) ? sessao.sessoesRestantes : 'Não agendada';
        
        // Pagamento: usa a condição combinada
        const pagamentoStatus = (!isNaoAgendada && sessao.statusPagamento) ? sessao.statusPagamento : 'Não agendada';

        const tr = document.createElement('tr');

        // Nome clicável
        const tdNome = document.createElement('td');
        const nomeSpan = document.createElement('span');
        nomeSpan.className = 'nome-clicavel';
        nomeSpan.textContent = p.nome || '-';
        nomeSpan.style.cursor = 'pointer';
        nomeSpan.style.color = '#591636';
        nomeSpan.style.textDecoration = 'underline';
        nomeSpan.addEventListener('click', () => abrirDadosPaciente(p.id));
        tdNome.appendChild(nomeSpan);
        tdNome.setAttribute('data-label', 'Paciente');

        // Próxima sessão
        const tdProx = document.createElement('td');
        tdProx.textContent = proxStr;
        tdProx.setAttribute('data-label', 'Próxima Sessão');

        // Sessões restantes
        const tdSessoes = document.createElement('td');
        tdSessoes.textContent = sessoesRestantes;
        tdSessoes.setAttribute('data-label', 'Sessões Restantes');

        // Pagamento
        const tdPagamento = document.createElement('td');
        tdPagamento.textContent = pagamentoStatus;
        tdPagamento.setAttribute('data-label', 'Pagamento');

        // PRONTUÁRIO
        const tdPront = document.createElement('td');
        const btn = document.createElement('button');
        btn.className = 'prontuaria';
        btn.textContent = 'Abrir';
        btn.addEventListener('click', () => abrirProntuario(p.id));
        tdPront.appendChild(btn);
        tdPront.setAttribute('data-label', 'Prontuário');

        tr.append(tdNome, tdProx, tdSessoes, tdPagamento, tdPront);
        tbody.appendChild(tr);
    });

    atualizarContador(pacientesFiltrados.length);
}


function atualizarContador(total) {
    const contador = document.getElementById('contadorPacientes');
    if (contador) {
        contador.textContent = total;
    }
}

function fecharModal() {
    document.getElementById('modalPaciente').style.display = 'none';
    document.getElementById('modalAlertaExclusao').style.display = 'none';
    document.getElementById('modalProntuario').style.display = 'none';
    document.getElementById('modalDadosPaciente').style.display = 'none';
    document.getElementById('modalConfirmacao').style.display = 'none';
    document.getElementById('modalTipoAnamnese').style.display = 'none';
    // Fecha também o modal de gestão de sessões (adicionado para que X/Cancelar funcionem nesse modal)
    const modalGestao = document.getElementById('modalGestaoSessao');
    if (modalGestao) modalGestao.style.display = 'none';

    const modalAlerta = document.getElementById('modalAlertaExclusao');
    if (modalAlerta) {
        modalAlerta.style.display = 'none';
    }
}

// Configura eventos quando a página carrega
document.addEventListener('DOMContentLoaded', function () {
    carregarPacientes();

    // Adiciona event listeners para as novas funcionalidades
    const btnAdicionar = document.getElementById('btnAdicionarPaciente');
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', adicionarPaciente);
    }

    const btnPesquisa = document.getElementById('btnPesquisa');
    if (btnPesquisa) {
        btnPesquisa.addEventListener('click', pesquisarPacientes);
    }

    const formPaciente = document.getElementById('formPaciente');
    if (formPaciente) {
        formPaciente.addEventListener('submit', salvarPaciente);
    }

    const formSessao = document.getElementById('formSessao');
    if (formSessao) {
        formSessao.addEventListener('submit', salvarSessao);
    }

    // Sincroniza os campos separados de data/hora com o hidden proximaSessao
    const proximaDate = document.getElementById('proximaSessaoDate');
    const proximaTime = document.getElementById('horaInicio');
    if (proximaDate) proximaDate.addEventListener('change', updateHiddenProximaSessao);
    if (proximaTime) proximaTime.addEventListener('input', updateHiddenProximaSessao);

    // Botão para abrir o modal de Gestão de Sessões (visível para testes mesmo sem pacientes)
    const btnGestao = document.getElementById('btnGestaoSessao');
    if (btnGestao) {
        btnGestao.addEventListener('click', function () {
            abrirGestaoSessaoParaTeste();
        });
    }

    // Formatação do campo Valor por Sessão
    // Permite digitar números, vírgula ou ponto livremente; atualiza o hidden em tempo real;
    // aplica a máscara de moeda (R$ ...) somente no blur para não atrapalhar a digitação.
    const valorFormatado = document.getElementById('valorSessaoFormatado');
    const valorHidden = document.getElementById('valorSessao');
    if (valorFormatado) {
        // Ao digitar: remove caracteres inválidos e atualiza hidden (numérico com ponto)
        valorFormatado.addEventListener('input', function (e) {
            // Mantém apenas dígitos, vírgula ou ponto
            const cleaned = e.target.value.replace(/[^0-9,\.]/g, '');
            // Não reescreve o campo com formatação completa aqui para não atrapalhar o usuário
            if (e.target.value !== cleaned) e.target.value = cleaned;


            const num = parseFloat(cleaned.replace(',', '.')) || 0;
            if (valorHidden) valorHidden.value = num;
            console.log('Input digitado, hidden atualizado:', valorHidden.value);
        });

        // Ao perder o foco: formata exibindo 'R$ XX.XXX,YY' usando Intl
        valorFormatado.addEventListener('blur', function (e) {
            const raw = e.target.value.replace(/[^0-9,\.]/g, '').replace(/,/g, '.');
            let num = parseFloat(raw);
            if (isNaN(num)) num = 0;
            if (valorHidden) valorHidden.value = num.toFixed(2);

            // Formata para BRL
            try {
                const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
                e.target.value = formatted;
            } catch (err) {
                // Fallback simples
                const parts = num.toFixed(2).split('.');
                e.target.value = `R$ ${parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ,${parts[1]}`.replace(' ,', ',');
            }
        });

        // Se o usuário focar novamente, remove a formatação para facilitar edição
        valorFormatado.addEventListener('focus', function (e) {
            // Converte o hidden para formato de edição (com ponto)
            if (valorHidden && valorHidden.value) {
                e.target.value = valorHidden.value.replace('.', ',');
            } else {
                e.target.value = '';
            }
        });
    }

    // Configura eventos do modal de anamnese
    configurarEventosAnamnese();

    // Fecha modais ao clicar no X ou cancelar
    document.querySelectorAll('.fechar-modal, .btn-cancelar').forEach(btn => {
        btn.addEventListener('click', fecharModal);
    });

    // Pesquisa em tempo real
    const campoPesquisa = document.getElementById('campoPesquisa');
    if (campoPesquisa) {
        campoPesquisa.addEventListener('input', pesquisarPacientes);
    }

    // Fecha modal ao clicar fora dele
    window.addEventListener('click', function (event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                fecharModal();
            }
        });
    });
});

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Atualiza o campo hidden `proximaSessao` com base nos campos separados de data e hora
function updateHiddenProximaSessao() {
    const dateEl = document.getElementById('proximaSessaoDate');
    const timeEl = document.getElementById('horaInicio');
    const hidden = document.getElementById('proximaSessao');
    if (!hidden) return;

    const dateVal = dateEl ? dateEl.value : '';
    const timeVal = timeEl ? timeEl.value : '';

    if (dateVal && timeVal) {
        hidden.value = `${dateVal}T${timeVal}`; // ex: 2025-11-10T11:00
    } else if (dateVal) {
        hidden.value = `${dateVal}T00:00`;
    } else {
        hidden.value = '';
    }
}

// Função para limpar o formulário de sessão
function limparFormularioSessao() {
    // Campos básicos
    const sessaoIdEl = document.getElementById('sessaoId');
    if (sessaoIdEl) sessaoIdEl.value = '';
    const pacienteField = document.getElementById('sessaoPacienteId');
    if (pacienteField) pacienteField.value = pacienteSelecionadoId || '';
    const valorDisplay = document.getElementById('valorSessaoDisplay');
    if (valorDisplay) valorDisplay.value = '';
    const valorHidden = document.getElementById('valorSessao');
    if (valorHidden) valorHidden.value = '';
    const quantidade = document.getElementById('quantidadeSessoes');
    if (quantidade) quantidade.value = '1';

    // Limpa os campos de data/hora (date + time) e o hidden proximaSessao
    const dateEl = document.getElementById('proximaSessaoDate');
    const timeEl = document.getElementById('horaInicio');
    const hidden = document.getElementById('proximaSessao');
    if (dateEl) dateEl.value = '';
    if (timeEl) timeEl.value = '';
    if (hidden) hidden.value = '';

    // Desmarcar todos os radios
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
    });

    // Setar valores padrão
    const modalidadeDefault = document.querySelector('input[name="modalidade"][value="ONLINE"]');
    const frequenciaDefault = document.querySelector('input[name="frequencia"][value="SEMANAL"]');
    const statusDefault = document.querySelector('input[name="statusPagamento"][value="PENDENTE"]');

    if (modalidadeDefault) modalidadeDefault.checked = true;
    if (frequenciaDefault) frequenciaDefault.checked = true;
    if (statusDefault) statusDefault.checked = true;
    // atualiza hidden caso necessário
    updateHiddenProximaSessao();
}

// Função para preencher o formulário de sessão com os dados existentes
function preencherFormularioSessao(sessao) {
    console.log('Preenchendo formulário com sessão:', sessao);

    document.getElementById('sessaoId').value = sessao.id;
    document.getElementById('sessaoPacienteId').value = sessao.paciente.id;

    // Valor da sessão
    document.getElementById('valorSessao').value = sessao.valorSessao || 0; // sempre garante número
    if (sessao.valorSessao) {
        document.getElementById('valorSessaoDisplay').value = formatarMoeda(sessao.valorSessao);
    } else {
        document.getElementById('valorSessaoDisplay').value = '';
    }


    // Quantidade de sessões
    document.getElementById('quantidadeSessoes').value = sessao.quantidadeSessoes || '';

    // Modalidade
    if (sessao.modalidade) {
        const modalidadeRadio = document.querySelector(`input[name="modalidade"][value="${sessao.modalidade}"]`);
        if (modalidadeRadio) modalidadeRadio.checked = true;
    }

    // Frequência
    if (sessao.frequencia) {
        const frequenciaRadio = document.querySelector(`input[name="frequencia"][value="${sessao.frequencia}"]`);
        if (frequenciaRadio) frequenciaRadio.checked = true;
    }

    // Próxima Sessão
    if (sessao.proximaSessao) {
        const dt = new Date(sessao.proximaSessao);
        // Formatar para o input datetime-local (YYYY-MM-DDTHH:MM)
        const year = dt.getFullYear();
        const month = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        const hours = String(dt.getHours()).padStart(2, '0');
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        // Preenche os campos separados (date + time) e o hidden
        const dateEl = document.getElementById('proximaSessaoDate');
        const timeEl = document.getElementById('horaInicio');
        const hidden = document.getElementById('proximaSessao');
        if (dateEl) dateEl.value = `${year}-${month}-${day}`;
        if (timeEl) timeEl.value = `${hours}:${minutes}`;
        if (hidden) hidden.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        // garante sincronia
        updateHiddenProximaSessao();
    } else {
        const dateEl = document.getElementById('proximaSessaoDate');
        const timeEl = document.getElementById('horaInicio');
        const hidden = document.getElementById('proximaSessao');
        if (dateEl) dateEl.value = '';
        if (timeEl) timeEl.value = '';
        if (hidden) hidden.value = '';
    }

    // Status do pagamento
    if (sessao.statusPagamento) {
        const statusRadio = document.querySelector(`input[name="statusPagamento"][value="${sessao.statusPagamento}"]`);
        if (statusRadio) statusRadio.checked = true;
    }
}

async function buscarUltimaSessao(pacienteId) {
    try {
        const response = await fetch(`${API_BASE_URL}/sessoes/paciente/${pacienteId}/ultima`);
        if (response.ok) {
            return await response.json();
        } else if (response.status === 404) {
            return null;
        } else {
            throw new Error(`Erro ${response.status}`);
        }
    } catch (error) {
        console.error('Erro ao buscar sessão:', error);
        return null;
    }
}

// Abre o modal de gestão de sessões para testes — mantém funcionamento mesmo sem paciente selecionado
function abrirGestaoSessaoParaTeste() {

    const pacienteIdField = document.getElementById('sessaoPacienteId');
    if (pacienteIdField) pacienteIdField.value = pacienteSelecionadoId;

    // Limpa possíveis campos de sessão
    try {
        const modal = document.getElementById('modalGestaoSessao');
        if (!modal) return;

        // Garante que o campo de paciente esteja vazio (ou com valor de teste)
        const pacienteIdField = document.getElementById('sessaoPacienteId');
        if (pacienteIdField) pacienteIdField.value = pacienteSelecionadoId || '';

        // Reseta valores do formulário
        const form = document.getElementById('formSessao');
        if (form) form.reset();
    // atualiza hidden proximaSessao após reset
    updateHiddenProximaSessao();

        modal.style.display = 'block';
    } catch (err) {
        console.error('Erro ao abrir modal de gestão de sessões para teste:', err);
    }
}



async function abrirGestaoSessao(pacienteId) {
    pacienteSelecionadoId = pacienteId;

    const pacienteIdField = document.getElementById('sessaoPacienteId');
    if (pacienteIdField) pacienteIdField.value = pacienteSelecionadoId;

    try {
        // Busca sessões existentes do paciente
        const response = await fetch(`${API_BASE_URL}/sessoes/paciente/${pacienteId}`);


        if (response.ok) {
            const sessoes = await response.json();
            console.log('Sessões encontradas:', sessoes);

            if (sessoes.length > 0) {
                // Vamos usar a primeira sessão (ou você pode implementar lógica para múltiplas sessões)
                // Aqui, estamos assumindo que o paciente tem apenas uma sessão ativa
                const sessao = sessoes[0];
                preencherFormularioSessao(sessao);
            } else {
                // Limpa o formulário para nova sessão
                limparFormularioSessao();
            }

            document.getElementById('modalGestaoSessao').style.display = 'block';

        } else if (response.status === 404) {
            // Nenhuma sessão encontrada - formulário limpo para nova
            console.log('Nenhuma sessão encontrada, criando nova');
            limparFormularioSessao();
            document.getElementById('modalGestaoSessao').style.display = 'block';
        } else {
            const errorText = await response.text();
            console.error('Erro na resposta:', response.status, errorText);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }

    } catch (error) {
        console.error('Erro ao carregar sessões:', error);
        alert('Erro ao carregar dados da sessão: ' + error.message);
    }
}

// Função para mostrar toast simples
function showToast(message, duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    // força reflow para ativar a transição
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => container.removeChild(toast), 250);
    }, duration);
}




