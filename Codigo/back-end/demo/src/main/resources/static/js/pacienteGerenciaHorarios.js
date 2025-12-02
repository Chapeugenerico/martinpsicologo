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

    // Filtrar agendamentos que não estão cancelados (assumindo que o status é 'CANCELADO')
    const agendamentosValidos = agendamentos.filter(agendamento => 
        !agendamento.status || agendamento.status.toUpperCase() !== 'CANCELADO'
    );
    
    if (!agendamentosValidos || agendamentosValidos.length === 0) {
        container.innerHTML = `
            <div class="no-sessions">
                <p>📅 Nenhuma sessão agendada no momento</p>
                <a href="agendarHorario.html" class="btn-agendar">Agendar Primeira Sessão</a>
            </div>
        `;
        return;
    }

    container.innerHTML = agendamentosValidos.map(agendamento => {
    
    // NOVO: Determinar a classe e o texto do status com base no campo 'status'
        const statusText = agendamento.status ? agendamento.status.toUpperCase() : 'AGENDADA';
        const statusClass = statusText === 'AGENDADA' ? 'agendada' : 
                            statusText === 'CANCELADO' ? 'cancelada' : 'pendente'; // Ajustar conforme status do backend

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
                    <span class="sessao-status ${statusClass}">${statusText}</span>
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
        // Ajuste: Apenas data, formatar no fuso horário local
        return dataInput.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    if (typeof dataInput === 'string') {
        
        // 1. Tenta tratar como ISO string completa (com horário)
        const parsedWithTime = new Date(dataInput);
        if (!isNaN(parsedWithTime) && dataInput.includes('T')) {
            // Se for uma data/hora completa, usa o parse normal
            return parsedWithTime.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
        
        // 2. Tenta tratar como string de data pura (YYYY-MM-DD), comum em bancos
        const datePart = dataInput.split('T')[0];
        if (datePart) {
            const parts = datePart.split('-');
            if (parts.length >= 3) {
                const [year, month, day] = parts;
                
                // Cria a data explicitamente no fuso horário local 
                // para evitar que 00:00:00Z caia no dia anterior.
                // O mês é 0-based no construtor Date()
                const dateLocal = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                
                if (!isNaN(dateLocal)) {
                     // Verifica se o JavaScript converteu para o dia anterior devido ao fuso
                    const diaDoMes = dateLocal.getDate().toString().padStart(2, '0');
                    const mesDoAno = (dateLocal.getMonth() + 1).toString().padStart(2, '0');
                    const anoCompleto = dateLocal.getFullYear();
                    
                    // Retorna a data no formato YYYY/MM/DD, ignorando a conversão de fuso
                    return `${diaDoMes}/${mesDoAno}/${anoCompleto}`;
                }
            }
        }
    }

    // Código original para fallback em caso de data "YYYY-MM-DD" pura
    if (typeof dataInput === 'string') {
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
