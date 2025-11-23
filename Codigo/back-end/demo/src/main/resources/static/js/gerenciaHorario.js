// Função para converter string de tempo (HH:MM ou HH:MM:SS) em minutos
function timeStringToMinutes(timeString) {
    if (!timeString) return 0;
    const time = timeString.length === 8 ? timeString.substring(0, 5) : timeString;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// JavaScript para a página de Gerenciar Horários - Unifica inicialização da UI e do FullCalendar
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const btnAdicionar = document.getElementById('btnAdicionar');
    const btnRemover = document.getElementById('btnRemover');
    const diaSemana = document.getElementById('diaSemana');
    const horaInicio = document.getElementById('horaInicio');
    const horaFim = document.getElementById('horaFim');
    const alcanceSelect = document.getElementById('alcance');
    const selectRemover = document.getElementById('horarioSelecionado');

    // Inicializa FullCalendar
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'pt-br',
        slotMinTime: '07:00:00',
        slotMaxTime: '22:00:00',
        allDaySlot: false,
        height: 650,
        events: [],
        eventClick: function(info) {
            const event = info.event;
            const extendedProps = event.extendedProps;

            if (extendedProps.type === 'agendamento') {
                showCancelModal({
                    agendamentoId: extendedProps.agendamentoId,
                    paciente: extendedProps.paciente,
                    email: extendedProps.email,
                    telefone: extendedProps.telefone,
                    data: event.start.toLocaleDateString('pt-BR'),
                    horario: event.start.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})
                }, event);
            } else if (extendedProps.type === 'disponivel') {
                alert('Horário disponível para agendamento');
            }
        }
    });
    calendar.render();

    // Expor função de recarregar horários para uso externo
    window.carregarHorariosDoServidor = carregarHorariosDoServidor;

    // Setup do modal de cancelamento
    let modal = document.getElementById('modalCancelamento');
    let modalBody = document.getElementById('modalBody');
    let modalClose = document.getElementById('modalClose');
    let confirmCancel = document.getElementById('confirmCancel');
    let rescheduleBtn = document.getElementById('rescheduleBtn');
    let modalActions = null;
    let _modalListenersBound = false;
    let _rescheduleState = { previousHtml: null, saveBtn: null, backBtn: null };

    function ensureModalElements() {
        if (!modal) modal = document.getElementById('modalCancelamento');
        if (!modalBody) modalBody = document.getElementById('modalBody');
        if (!modalClose) modalClose = document.getElementById('modalClose');
        if (!confirmCancel) confirmCancel = document.getElementById('confirmCancel');
        if (!rescheduleBtn) rescheduleBtn = document.getElementById('rescheduleBtn');
        if (modal && !modalActions) modalActions = modal.querySelector('.modal-actions');
    }

    let _modalState = { agendamentoId: null, eventRef: null };

    function showCancelModal(data, eventRef) {
        ensureModalElements();
        if (!modal) return;
        _modalState.agendamentoId = data.agendamentoId;
        _modalState.eventRef = eventRef;

        modalBody.innerHTML = `
            <p><strong>Paciente:</strong> ${data.paciente || 'Não informado'}</p>
            <p><strong>Email:</strong> ${data.email || 'Não informado'}</p>
            <p><strong>Telefone:</strong> ${data.telefone || 'Não informado'}</p>
            <p><strong>Data:</strong> ${data.data}</p>
            <p><strong>Horário:</strong> ${data.horario}</p>
            <br>
            <p><strong>O que deseja fazer com este agendamento?</strong></p>
        `;

        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');

        // Controle de permissão: somente psicólogo pode ver botões de ação
        const ehPsicologo = isPsicologo();
        if (confirmCancel) confirmCancel.style.display = ehPsicologo ? '' : 'none';
        if (rescheduleBtn) rescheduleBtn.style.display = ehPsicologo ? '' : 'none';
        if (!ehPsicologo && modalBody) {
            const aviso = document.createElement('p');
            aviso.style.color = '#b71c1c';
            aviso.style.marginTop = '12px';
            aviso.innerHTML = '<strong>Você não tem permissão para cancelar ou reagendar este agendamento.</strong>';
            modalBody.appendChild(aviso);
        }

        // Bind listeners lazy
        if (!_modalListenersBound) {
            if (modalClose) modalClose.addEventListener('click', closeCancelModal);
            if (modal) modal.addEventListener('click', function(e) { if (e.target === modal) closeCancelModal(); });
            if (confirmCancel) confirmCancel.addEventListener('click', async function() {
                const id = _modalState.agendamentoId;
                const ev = _modalState.eventRef;
                if (!id) return;
                if (!isPsicologo()) { alert('Sem permissão para cancelar.'); return; }
                await cancelarAgendamento(id, ev);
                closeCancelModal();
            });
            if (rescheduleBtn) rescheduleBtn.addEventListener('click', function() {
                if (!isPsicologo()) { alert('Sem permissão para reagendar.'); return; }
                enterRescheduleMode();
            });
            _modalListenersBound = true;
        }
    }

    function enterRescheduleMode() {
        ensureModalElements();
        if (!modal || !_modalState.eventRef) return;

        _rescheduleState.previousHtml = modalBody ? modalBody.innerHTML : '';

        const ev = _modalState.eventRef;
        const start = ev && ev.start ? new Date(ev.start) : null;
        const defaultDate = start ? start.toISOString().split('T')[0] : '';
        const defaultTime = start ? start.toTimeString().substring(0,5) : '';

        if (modalBody) {
            modalBody.innerHTML = `
                <div class="reschedule-form">
                    <label for="newDate"><strong>Nova data</strong></label>
                    <input type="date" id="newDate" value="${defaultDate}" />
                    <label for="newTime"><strong>Novo horário</strong></label>
                    <input type="time" id="newTime" value="${defaultTime}" />
                    <p style="margin-top:8px; font-size:0.9em; color:#444;">Preencha a nova data e horário desejados e clique em "Salvar Reagendamento".</p>
                </div>
            `;
        }

        if (modalActions) {
            if (confirmCancel) confirmCancel.style.display = 'none';
            if (rescheduleBtn) rescheduleBtn.style.display = 'none';

            const save = document.createElement('button');
            save.id = 'saveReschedule';
            save.className = 'btn-adicionar';
            save.textContent = 'Salvar Reagendamento';
            
            const back = document.createElement('button');
            back.id = 'backFromReschedule';
            back.className = 'btn-remover';
            back.textContent = 'Voltar';

            modalActions.appendChild(save);
            modalActions.appendChild(back);

            _rescheduleState.saveBtn = save;
            _rescheduleState.backBtn = back;

            save.addEventListener('click', saveReschedule);
            back.addEventListener('click', exitRescheduleMode);
        }
    }

    function exitRescheduleMode() {
        ensureModalElements();
        if (!modalBody || !modalActions) return;

        if (_rescheduleState.saveBtn) {
            _rescheduleState.saveBtn.removeEventListener('click', saveReschedule);
            modalActions.removeChild(_rescheduleState.saveBtn);
        }
        if (_rescheduleState.backBtn) {
            _rescheduleState.backBtn.removeEventListener('click', exitRescheduleMode);
            modalActions.removeChild(_rescheduleState.backBtn);
        }

        if (confirmCancel) confirmCancel.style.display = '';
        if (rescheduleBtn) rescheduleBtn.style.display = '';

        modalBody.innerHTML = _rescheduleState.previousHtml || '';
        _rescheduleState.previousHtml = null;
        _rescheduleState.saveBtn = null;
        _rescheduleState.backBtn = null;
    }

    async function saveReschedule() {
        ensureModalElements();
        if (!_modalState.agendamentoId) {
            alert('ID do agendamento ausente. Não é possível reagendar.');
            return;
        }
        if (!isPsicologo()) { alert('Sem permissão para reagendar.'); return; }

        const newDateEl = document.getElementById('newDate');
        const newTimeEl = document.getElementById('newTime');
        if (!newDateEl || !newTimeEl) {
            alert('Formulário de reagendamento inválido.');
            return;
        }

        const newDate = newDateEl.value;
        const newTime = newTimeEl.value;

        if (!newDate || !newTime) {
            alert('Preencha nova data e horário.');
            return;
        }

        const payload = { data: newDate, horario: newTime };

        try {
            const headers = { 'Content-Type': 'application/json' };
            const usuCodigo = localStorage.getItem('usuCodigo');
            if (usuCodigo) headers['usuCodigo'] = usuCodigo;

            const res = await fetch(`/api/horarios/agendamentos/${_modalState.agendamentoId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Agendamento reagendado com sucesso.');
                exitRescheduleMode();
                closeCancelModal();
                if (window.carregarHorariosDoServidor) await window.carregarHorariosDoServidor();
            } else {
                const text = await res.text();
                console.error('Erro ao reagendar:', res.status, text);
                alert('Erro ao reagendar. Verifique o console para detalhes.');
            }
        } catch (err) {
            console.error('Erro ao reagendar (fetch):', err);
            alert('Erro ao conectar com o servidor ao tentar reagendar.');
        }
    }

    function closeCancelModal() {
        ensureModalElements();
        if (!modal) return;
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        _modalState = { agendamentoId: null, eventRef: null };
        if (modalBody) modalBody.innerHTML = '';
    }

    function addMonths(dt, months) {
        const d = new Date(dt);
        const targetMonth = d.getMonth() + months;
        d.setMonth(targetMonth);
        if (d.getMonth() !== ((targetMonth) % 12)) {
            d.setDate(0);
        }
        return d;
    }

    async function carregarHorariosDoServidor() {
        try {
            if (calendar) {
                const eventosExistentes = calendar.getEvents();
                eventosExistentes.forEach(ev => ev.remove());
            }
            if (selectRemover) {
                selectRemover.innerHTML = '<option value="">Selecione um horário</option>';
            }

            const [resHorarios, resAgendamentos] = await Promise.all([
                fetch('/api/horarios'),
                fetch('/agendamentos/psicologo')
            ]);

            if (!resHorarios.ok) return;
            const listHorarios = await resHorarios.json();
            let agendamentos = [];
            if (resAgendamentos.ok) {
                agendamentos = await resAgendamentos.json();
            }

            const horariosOcupadosMap = new Map();
            agendamentos.forEach(ag => {
                const dataKey = ag.data;
                const horarioKey = ag.horario.substring(0, 5);
                
                if (!horariosOcupadosMap.has(dataKey)) {
                    horariosOcupadosMap.set(dataKey, new Set());
                }
                horariosOcupadosMap.get(dataKey).add(horarioKey);
            });

            listHorarios.forEach(item => {
                const diasSemana = {
                    'DOMINGO': 0, 'SEGUNDA_FEIRA': 1, 'TERCA_FEIRA': 2, 
                    'QUARTA_FEIRA': 3, 'QUINTA_FEIRA': 4, 'SEXTA_FEIRA': 5, 'SABADO': 6
                };
                const diaNumero = diasSemana[item.diaSemana];

                const [hIni, mIni] = item.horaInicio.split(':');
                const [hFim, mFim] = item.horaFim.split(':');

                const repeticao = (item.repeticao || 'ONCE').toUpperCase();
                const alcance = (item.alcance || 'ANUAL').toString().toUpperCase();

                const hoje = new Date();
                const primeiro = new Date(hoje);
                primeiro.setDate(hoje.getDate() - hoje.getDay() + diaNumero);

                function horarioEstaOcupado(dataObj, horaInicio) {
                    const dataStr = dataObj.toISOString().split('T')[0];
                    const horaStr = horaInicio.substring(0, 5);
                    
                    return horariosOcupadosMap.has(dataStr) && 
                           horariosOcupadosMap.get(dataStr).has(horaStr);
                }

                function gerarEventoDisponivel(dataOcorr) {
                    if (!horarioEstaOcupado(dataOcorr, item.horaInicio)) {
                        const start = new Date(dataOcorr);
                        start.setHours(parseInt(hIni), parseInt(mIni), 0, 0);
                        const end = new Date(dataOcorr);
                        end.setHours(parseInt(hFim), parseInt(mFim), 0, 0);
                        
                        calendar.addEvent({ 
                            title: 'Disponível', 
                            start, 
                            end, 
                            backgroundColor: '#4caf50',
                            borderColor: '#388e3c',
                            extendedProps: { 
                                scheduleId: item.id,
                                type: 'disponivel'
                            } 
                        });
                    }
                }

                if (repeticao === 'WEEKLY') {
                    const limiteSemanas = (alcance === 'ANUAL' || alcance === 'ANNUAL') ? 52 : 4;
                    for (let i = 0; i < limiteSemanas; i++) {
                        const dataOcorr = new Date(primeiro);
                        dataOcorr.setDate(primeiro.getDate() + i * 7);
                        gerarEventoDisponivel(dataOcorr);
                    }
                } else if (repeticao === 'BIWEEKLY' || repeticao === 'BIWEEK') {
                    const limiteSemanas = (alcance === 'ANUAL' || alcance === 'ANNUAL') ? 26 : 2;
                    for (let i = 0; i < limiteSemanas; i++) {
                        const dataOcorr = new Date(primeiro);
                        dataOcorr.setDate(primeiro.getDate() + i * 14);
                        gerarEventoDisponivel(dataOcorr);
                    }
                } else {
                    gerarEventoDisponivel(primeiro);
                }

                if (selectRemover) {
                    const opt = document.createElement('option');
                    opt.value = item.id;
                    opt.textContent = `${item.diaSemana} ${item.horaInicio} - ${item.horaFim}`;
                    selectRemover.appendChild(opt);
                }
            });

            agendamentos.forEach(ag => {
                // Só exibe agendamentos que não estão cancelados
                if (ag.status && ag.status.toUpperCase() === 'CANCELADO') return;
                const start = new Date(ag.data + 'T' + ag.horario);
                const end = new Date(start.getTime() + 60 * 60 * 1000);

                calendar.addEvent({
                    title: `Agendado: ${ag.paciente}`,
                    start: start,
                    end: end,
                    backgroundColor: '#ff9800',
                    borderColor: '#f57c00',
                    extendedProps: {
                        agendamentoId: ag.agendamentoID,
                        type: 'agendamento',
                        paciente: ag.paciente,
                        telefone: ag.telefone,
                        email: ag.email
                    }
                });
            });

        } catch (err) {
            console.error('Erro ao carregar horários do servidor:', err);
        }
    }

    carregarHorariosDoServidor();

    function adicionarOptionRemover(dia, inicio, fim) {
        if (!selectRemover) return;
        const option = document.createElement('option');
        option.value = `${dia} ${inicio}-${fim}`;
        option.textContent = `${dia} ${inicio} - ${fim}`;
        selectRemover.appendChild(option);
    }

    async function handleAdicionar() {
        const dia = diaSemana.value;
        const inicio = horaInicio.value;
        const fim = horaFim.value;
        const repeticao = document.getElementById('repeticao') ? document.getElementById('repeticao').value : 'once';
        const alcance = alcanceSelect ? alcanceSelect.value : 'anual';

        if (!dia || !inicio || !fim) {
            alert('Preencha todos os campos!');
            return;
        }

        if (inicio >= fim) {
            alert('Horário de início deve ser anterior ao de fim.');
            return;
        }

        const diasSemana = {
            'domingo': 0,
            'segunda-feira': 1,
            'terca-feira': 2,
            'quarta-feira': 3,
            'quinta-feira': 4,
            'sexta-feira': 5,
            'sabado': 6
        };

        const hoje = new Date();
        const dataReferencia = new Date(hoje);
        const diaNumero = diasSemana[dia];
        dataReferencia.setDate(hoje.getDate() - hoje.getDay() + diaNumero);

        const [hIni, mIni] = inicio.split(':');
        const [hFim, mFim] = fim.split(':');
        const start = new Date(dataReferencia);
        start.setHours(parseInt(hIni), parseInt(mIni));
        const end = new Date(dataReferencia);
        end.setHours(parseInt(hFim), parseInt(mFim));

        function adicionarEventoCliente(startDate) {
            const ev = {
                title: 'Atendimento',
                start: new Date(startDate),
                end: new Date(new Date(startDate).getTime() + (end.getTime() - start.getTime())),
                backgroundColor: '#4caf50',
                borderColor: '#388e3c'
            };
            calendar.addEvent(ev);
        }

        function hasOverlap(candidateStart, candidateEnd) {
            const eventos = calendar.getEvents();
            for (const ev of eventos) {
                if (!ev.start || !ev.end) continue;
                const es = ev.start;
                const ee = ev.end;
                if (es.getTime() < candidateEnd.getTime() && candidateStart.getTime() < ee.getTime()) {
                    return true;
                }
            }
            return false;
        }

        function formatDateTime(d) {
            return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
        }

        const candidateStarts = [];
        if (repeticao === 'once') {
            candidateStarts.push(new Date(start));
        } else if (repeticao === 'weekly') {
            if (alcance === 'anual') {
                for (let i = 0; i < 52; i++) {
                    const d = new Date(start);
                    d.setDate(d.getDate() + i * 7);
                    candidateStarts.push(d);
                }
            } else {
                const limite = addMonths(start, 1);
                let curr = new Date(start);
                while (curr <= limite) {
                    candidateStarts.push(new Date(curr));
                    curr = new Date(curr);
                    curr.setDate(curr.getDate() + 7);
                }
            }
        } else if (repeticao === 'biweekly') {
            if (alcance === 'anual') {
                for (let i = 0; i < 26; i++) {
                    const d = new Date(start);
                    d.setDate(d.getDate() + i * 14);
                    candidateStarts.push(d);
                }
            } else {
                const limite = addMonths(start, 1);
                let curr = new Date(start);
                while (curr <= limite) {
                    candidateStarts.push(new Date(curr));
                    curr = new Date(curr);
                    curr.setDate(curr.getDate() + 14);
                }
            }
        }

        const durationMs = end.getTime() - start.getTime();

        for (const cs of candidateStarts) {
            const candidateStart = new Date(cs);
            const candidateEnd = new Date(candidateStart.getTime() + durationMs);
            if (hasOverlap(candidateStart, candidateEnd)) {
                alert(`Conflito: o horário ${formatDateTime(candidateStart)} - ${formatDateTime(candidateEnd)} sobrepõe um horário já existente. Cancelando operação.`);
                return;
            }
        }

        for (const cs of candidateStarts) {
            adicionarEventoCliente(cs);
        }

        adicionarOptionRemover(dia, inicio, fim);

        try {
            const payload = {
                diaSemana: dia,
                horaInicio: inicio,
                horaFim: fim,
                repeticao: repeticao,
                alcance: alcance
            };

            const res = await fetch('/api/horarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const text = await res.text();
                console.error('Erro ao salvar no backend:', res.status, text);
                alert('Erro ao salvar horário no servidor. Veja console para detalhes.');
            } else {
                const saved = await res.json();
                console.log('Salvo no backend:', saved);
                await carregarHorariosDoServidor();
                alert('Horário salvo com sucesso.');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            alert('Erro ao conectar com o servidor.');
        }

        diaSemana.value = '';
        horaInicio.value = '';
        horaFim.value = '';
    }

    function handleRemover() {
        const valor = selectRemover ? selectRemover.value : '';
        if (!valor) {
            alert('Selecione o horário para remover!');
            return;
        }

        if (/^\d+$/.test(valor)) {
            const id = valor;
            fetch(`/api/horarios/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.status === 204) {
                        const eventos = calendar.getEvents();
                        eventos.forEach(ev => {
                            try {
                                const sid = ev.extendedProps && ev.extendedProps.scheduleId;
                                if (sid && String(sid) === String(id)) {
                                    ev.remove();
                                }
                            } catch (e) {
                                if (ev.title === 'Atendimento') ev.remove();
                            }
                        });
                        const opcao = selectRemover.querySelector(`option[value="${valor}"]`);
                        if (opcao) opcao.remove();
                        carregarHorariosDoServidor();
                        alert('Horário removido do servidor e da agenda.');
                    } else {
                        return res.text().then(t => { throw new Error(t || res.status); });
                    }
                })
                .catch(err => {
                    console.error('Erro ao remover:', err);
                    alert('Erro ao remover no servidor. Veja console.');
                });
        } else {
            const opcaoSelecionada = selectRemover ? selectRemover.querySelector(`option[value="${valor}"]`) : null;
            if (opcaoSelecionada) opcaoSelecionada.remove();
            const eventos = calendar.getEvents();
            eventos.forEach(ev => { if (ev.title === 'Atendimento') ev.remove(); });
            carregarHorariosDoServidor();
            alert('Horário removido (apenas UI).');
        }
    }

    if (btnAdicionar) btnAdicionar.addEventListener('click', handleAdicionar);
    if (btnRemover) btnRemover.addEventListener('click', handleRemover);

    // Atualização automática a cada 30 segundos
    setInterval(() => {
        carregarHorariosDoServidor().catch(err => console.error('Erro ao atualizar horários automaticamente:', err));
    }, 30000);
});

// Função auxiliar (pode ser copiada do agendarHorario.js)
function verificarAutenticacao() {
    const usuarioJSON = localStorage.getItem('usuarioLogado');
    if (!usuarioJSON) {
        return null;
    }
    try {
        return JSON.parse(usuarioJSON);
    } catch (error) {
        console.error('Erro ao fazer parse do usuário:', error);
        return null;
    }
}

// Verifica se o usuário logado é PSICOLOGO pelo campo usutipo
function isPsicologo() {
    const u = verificarAutenticacao();
    return u && u.usutipo === 'PSICOLOGO';
}

// Função para cancelar agendamento
async function cancelarAgendamento(agendamentoId, event) {
    try {
        const headers = { 'Content-Type': 'application/json' };
        const usuCodigo = localStorage.getItem('usuCodigo');
        const usuario = verificarAutenticacao();
        if (usuCodigo) headers['usuCodigo'] = usuCodigo;
        if (usuario && usuario.usutipo) headers['usutipo'] = usuario.usutipo;

        const response = await fetch(`/api/horarios/agendamentos/${agendamentoId}`, {
            method: 'DELETE',
            headers
        });
        
        if (response.ok) {
            try { if (event && typeof event.remove === 'function') event.remove(); } catch (e) { /* ignore */ }
            alert('Agendamento cancelado com sucesso!');
            if (window.carregarHorariosDoServidor && typeof window.carregarHorariosDoServidor === 'function') {
                await window.carregarHorariosDoServidor();
            } else {
                window.location.reload();
            }
        } else {
            const errorText = await response.text();
            alert(`Erro ao cancelar agendamento: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        alert('Erro ao conectar com o servidor: ' + error.message);
    }
}


// Função para redirecionar para outras páginas
function redirecionarPara(pagina) {
    window.location.href = pagina;
}
