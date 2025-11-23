async function carregarSessoesAgendadas() {
    try {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

        if (!usuarioLogado) {
            alert('Você precisa estar logado para acessar esta página.');
            window.location.href = 'login.html';
            return;
        }

        const pacienteId = usuarioLogado.usucodigo;

        if (usuarioLogado) {
            const userName = usuarioLogado.usunome || 'Usuário';
            document.getElementById('userInfo').textContent = `Olá, ${userName}`;
        }

        if (!usuarioLogado.usucodigo) {
            console.error('ID do usuário não encontrado');
            document.getElementById('horariosList').innerHTML = 
                '<p class="error">Erro: ID do usuário não encontrado</p>';
            return;
        }

        console.log('Buscando agendamentos para usuário:', pacienteId);

        const response = await fetch(`http://localhost:8080/agendamentos/usuario/${pacienteId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const agendamentos = await response.json();
            console.log('Agendamentos carregados:', agendamentos);
            exibirAgendamentos(agendamentos, usuarioLogado);
        } else {
            console.error('Erro ao carregar agendamentos:', response.status);
            document.getElementById('horariosList').innerHTML = 
                '<p class="error">Erro ao carregar agendamentos. Tente novamente.</p>';
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('horariosList').innerHTML = 
            '<p class="error">Erro de conexão com o servidor</p>';
    }
}

function exibirAgendamentos(agendamentos, usuarioLogado) {
    const container = document.getElementById('horariosList');

    if (!agendamentos || agendamentos.length === 0) {
        container.innerHTML = `
            <div class="no-sessions">
                <p>📅 Nenhuma sessão agendada no momento</p>
                <a href="agendarHorario.html" class="btn-agendar">Agendar Primeira Sessão</a>
            </div>
        `;
        return;
    }

    container.innerHTML = agendamentos.map(agendamento => {
        
        const rawData = agendamento.data 
                     || agendamento.dataSessao 
                     || agendamento.horarioData
                     || agendamento.startDate
                     || agendamento.date;

        const dataFormatada = formatarDataBrasileira(rawData);

        // Extrai telefone e email de múltiplas fontes
        const telefone = agendamento.telefone 
                      || agendamento.paciente?.telefone 
                      || agendamento.usuario?.telefone 
                      || usuarioLogado?.telefone 
                      || '—';

        const email = agendamento.email 
                   || agendamento.paciente?.usuemail
                   || agendamento.usuario?.usuemail 
                   || usuarioLogado?.usuemail
                   || '—';

        console.log('DEBUG - Agendamento completo:', agendamento);
        console.log('Telefone extraído:', telefone);
        console.log('Email extraído:', email);

        return `
            <div class="sessao-item">
                <div class="sessao-header">
                    <span class="sessao-data">${dataFormatada}</span>
                    <span class="sessao-status agendada">AGENDADA</span>
                </div>

                <div class="sessao-details">
                    <p><strong>Horário:</strong> ${agendamento.horario || '—'}</p>

                    <p><strong>Paciente:</strong> ${agendamento.paciente || agendamento.pacienteNome || '—'}</p>

                    <p><strong>Contato:</strong> 
                        ${telefone} - ${email}
                    </p>

                    ${agendamento.observacoes ? `
                        <p><strong>Observações:</strong> ${agendamento.observacoes}</p>
                    ` : ''}

                    <p><strong>Valor:</strong> 
                        R$ ${agendamento.valorSessao !== null && agendamento.valorSessao !== undefined 
                            ? agendamento.valorSessao 
                            : '—'}
                    </p>
                </div>

                <div class="sessao-actions">
                    <button class="btn-cancelar" 
                        onclick="cancelarAgendamento(${agendamento.agendamentoID})">
                        Cancelar
                    </button>
                    <button class="btn-reagendar" data-id="${agendamento.agendamentoID}" 
                        data-data="${agendamento.data}" data-horario="${agendamento.horarioInicio}"
                        data-paciente="${agendamento.paciente || 'Paciente'}">
                        Reagendar
                    </button>
                </div>
            </div>
        `;
    }).join('');

    document.querySelectorAll('.btn-reagendar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const data = btn.dataset.data;
            const horario = btn.dataset.horario;
            const paciente = btn.dataset.paciente;
            reagendarSessao(id, data, horario, paciente);
        });
    });
}

function formatarDataBrasileira(dataInput) {
    if (dataInput === null || dataInput === undefined) return 'Data indisponível';

    if (dataInput instanceof Date) {
        if (isNaN(dataInput)) return 'Data inválida';
        return dataInput.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    if (typeof dataInput === 'string') {
        const parsed = new Date(dataInput);
        if (!isNaN(parsed)) {
            return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }

        const datePart = dataInput.split('T')[0];
        if (datePart) {
            const parts = datePart.split('-');
            if (parts.length >= 3) {
                const [year, month, day] = parts;
                return `${day}/${month}/${year}`;
            }
        }
    }

    return 'Data inválida';
}

async function cancelarAgendamento(id) {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
        return;
    }

    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));

    try {
        const response = await fetch(`http://localhost:8080/agendamentos/${id}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "usuCodigo": usuario.usucodigo
            }
        });

        if (response.ok) {
            alert('Agendamento cancelado com sucesso!');
            carregarSessoesAgendadas();
        } else {
            const errorText = await response.text();
            alert('Erro ao cancelar: ' + errorText);
        }
    } catch (error) {
        console.error('Erro ao cancelar:', error);
        alert('Erro ao conectar com o servidor.');
    }
}

function reagendarSessao(id, data, horario, paciente) {
    const confirmar = confirm('Tem certeza que deseja reagendar esta sessão?');
    if (!confirmar) return;

    const sessao = new Date(`${data}T${horario}`);
    const agora = new Date();
    const limite = new Date(agora.getTime() + 12 * 60 * 60 * 1000);

    if (sessao < limite) {
        alert("Reagendamento permitido somente até 12 horas antes da sessão.");
        return;
    }
    
    localStorage.setItem('reagendamento', JSON.stringify({
        agendamentoID: id,
        data: data,
        horario: horario,
        paciente: paciente
    }));

    window.location.href = 'reagendarHorario.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = 'login.html';
        return;
    }

    if (usuarioLogado) {
        const userName = usuarioLogado.usunome || 'Usuário';
        document.getElementById('userInfo').textContent = `Olá, ${userName}`;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Deseja realmente sair?')) {
                localStorage.removeItem('usuarioLogado');
                localStorage.removeItem('userId');
                localStorage.removeItem('usuCodigo');
                localStorage.removeItem('userNome');
                localStorage.removeItem('userType');
                window.location.href = 'login.html';
            }
        });
    }

    carregarSessoesAgendadas();
});
