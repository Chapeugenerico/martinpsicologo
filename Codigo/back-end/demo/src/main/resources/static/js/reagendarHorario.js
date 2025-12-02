// Sistema de Reagendamento - Versão com Dois Agendamentos Simultâneos
class ReagendamentoSystem {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedHorario = null;
        this.horariosDisponiveis = [];
        this.agendamentoOriginal = null;
        this.novoAgendamentoID = null;
        
        this.initialize();
    }
    
    async initialize() {
        // Verificar se veio de um reagendamento
        const reagendamento = localStorage.getItem('reagendamento');
        if (!reagendamento) {
            alert('Acesso inválido. Retornando para horários.');
            window.location.href = 'pacienteGerenciaHorarios.html';
            return;
        }
        
        this.agendamentoOriginal = JSON.parse(reagendamento);
        console.log('Agendamento original:', this.agendamentoOriginal);
        
        // Preencher o campo de nome do paciente com o nome original
        const patientNameField = document.getElementById('patientName');
        if (patientNameField) {
            patientNameField.value = this.agendamentoOriginal.paciente || 'Paciente';
        }
        
        // Carregar número do psicólogo
        await this.carregarNumeroPsicologo();
        
        this.setupEventListeners();
        this.renderCalendarSkeleton();
        await this.carregarHorariosDisponiveis();
        this.renderCalendar();
    }
    
    setupEventListeners() {
        // Navegação do calendário
        document.getElementById('prevMonth').addEventListener('click', async () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            await this.carregarHorariosDisponiveis();
            this.renderCalendar();
        });
        
        document.getElementById('nextMonth').addEventListener('click', async () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            await this.carregarHorariosDisponiveis();
            this.renderCalendar();
        });
        
        // Botão de seleção de horário
        const btnAgendar = document.getElementById('btnAgendar');
        if (btnAgendar) {
            btnAgendar.addEventListener('click', () => {
                this.showTimeSlots();
            });
        }
        
        // Formulário de confirmação
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.confirmarNovoAgendamento();
        });
        
        document.getElementById('cancelBooking').addEventListener('click', () => {
            if (confirm('Cancelar reagendamento e voltar?')) {
                localStorage.removeItem('reagendamento');
                window.location.href = 'pacienteGerenciaHorarios.html';
            }
        });
    }
    
    renderCalendarSkeleton() {
        const calendarGrid = document.getElementById('calendarGrid');
        const monthYear = document.getElementById('currentMonthYear');
        
        const monthNames = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        monthYear.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        calendarGrid.innerHTML = '<div class="loading">Carregando calendário...</div>';
    }
    
    async carregarHorariosDisponiveis() {
        try {
            console.log('Carregando horários disponíveis...');
            const mes = this.currentDate.getMonth() + 1;
            const ano = this.currentDate.getFullYear();
            const dataConsulta = `${ano}-${String(mes).padStart(2, '0')}-01`;
            
            const response = await fetch(`historical-pepi-puc-tis-d0d4bf2c.koyeb.app/api/horarios/disponiveis?data=${dataConsulta}`);
            
            if (response.ok) {
                this.horariosDisponiveis = await response.json();
                console.log('Horários disponíveis carregados:', this.horariosDisponiveis.length);
            } else {
                console.error('Erro ao carregar horários disponíveis. Status:', response.status);
                this.horariosDisponiveis = [];
                this.showError('Erro ao carregar horários. Verifique a conexão.');
            }
        } catch (error) {
            console.error('Erro ao carregar horários:', error);
            this.horariosDisponiveis = [];
            this.showError('Erro de conexão. Verifique se o servidor está rodando.');
        }
    }
    
    showError(message) {
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = `<div class="error-message">${message}</div>`;
    }
    
    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const monthYear = document.getElementById('currentMonthYear');
        
        const monthNames = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        monthYear.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);
        
        const firstDayIndex = firstDay.getDay();
        const lastDayDate = lastDay.getDate();
        const prevLastDayDate = prevLastDay.getDate();
        
        let html = '';
        
        // Dias do mês anterior
        for (let i = firstDayIndex; i > 0; i--) {
            html += `<div class="calendar-day other-month">${prevLastDayDate - i + 1}</div>`;
        }
        
        // Dias do mês atual
        for (let day = 1; day <= lastDayDate; day++) {
            const dateStr = this.formatDateForAPI(new Date(year, month, day));
            const dayObj = new Date(year, month, day);
            const isToday = this.isToday(dayObj);
            const isPast = this.isPastDate(dayObj);
            const isSelected = dateStr === this.selectedDate;
            
            // Verificar se tem horários disponíveis neste dia
            const temHorarioDisponivel = this.horariosDisponiveis.some(h => 
                h.data === dateStr && h.disponivel
            );
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (isPast) classes += ' past-date';
            if (isSelected) classes += ' selected';
            if (temHorarioDisponivel) classes += ' has-slots';
            
            let disabledStr = isPast ? 'disabled' : '';
            let onClickStr = !isPast ? `onclick="reagendamento.selectDate('${dateStr}')"` : '';
            
            html += `<div class="${classes}" ${onClickStr} ${disabledStr}><div class="day-number">${day}</div>${temHorarioDisponivel ? '<div class="available-indicator">✓</div>' : ''}</div>`;
        }
        
        // Dias do próximo mês
        const remainingCells = 42 - (firstDayIndex + lastDayDate);
        for (let day = 1; day <= remainingCells; day++) {
            html += `<div class="calendar-day other-month">${day}</div>`;
        }
        
        calendarGrid.innerHTML = html;
    }
    
    formatDateForAPI(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    isPastDate(date) {
        const today = new Date();
        const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const compareToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return compareDate < compareToday;
    }
    
    isPastTime(dateStr, timeStr) {
        const now = new Date();
        const dateParts = dateStr.split('-');
        const timeParts = timeStr.split(':');
        
        const selectedDateTime = new Date(
            parseInt(dateParts[0]), 
            parseInt(dateParts[1]) - 1, 
            parseInt(dateParts[2]),
            parseInt(timeParts[0]),
            parseInt(timeParts[1])
        );
        
        return selectedDateTime < now;
    }
    
    async selectDate(dateStr) {
        const dateParts = dateStr.split('-');
        const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        
        if (this.isPastDate(dateObj)) {
            alert('Não é possível agendar para datas passadas.');
            return;
        }
        
        this.selectedDate = dateStr;
        this.selectedTime = null;
        this.selectedHorario = null;
        this.renderCalendar();
        
        console.log('Data selecionada:', dateStr);
        
        // Carregar horários automaticamente
        this.showTimeSlots();
    }
    
    showTimeSlots() {
        if (!this.selectedDate) return;
        
        const timeSlotsContainer = document.getElementById('timeSlotsContainer');
        const selectedDateElement = document.getElementById('selectedDate');
        const timeSlotsGrid = document.getElementById('timeSlotsGrid');
        
        timeSlotsContainer.style.display = 'block';
        
        const dateParts = this.selectedDate.split('-');
        const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        selectedDateElement.textContent = dateObj.toLocaleDateString('pt-BR', options);
        
        timeSlotsGrid.innerHTML = '';
        
        const horariosDoDia = this.horariosDisponiveis.filter(horario => 
            horario.data === this.selectedDate && horario.disponivel
        );
        
        if (horariosDoDia.length === 0) {
            timeSlotsGrid.innerHTML = '<div class="no-slots">Nenhum horário disponível para esta data</div>';
            return;
        }
        
        horariosDoDia.forEach(horario => {
            const isPastTime = this.isPastTime(this.selectedDate, horario.horarioInicio);
            const isAvailable = !isPastTime;
            
            let slotClass = 'time-slot';
            if (!isAvailable) slotClass += ' past-time';
            
            const slotElement = document.createElement('div');
            slotElement.className = slotClass;
            
            const horaInicio = this.formatTime(horario.horarioInicio);
            const horaFim = this.formatTime(horario.horarioFim);
            slotElement.textContent = `${horaInicio} - ${horaFim}`;
            slotElement.setAttribute('data-horario', JSON.stringify(horario));
            
            if (isPastTime) {
                slotElement.title = 'Horário já passou';
                slotElement.style.cursor = 'not-allowed';
            } else {
                slotElement.addEventListener('click', () => {
                    this.selectTime(horario);
                });
            }
            
            timeSlotsGrid.appendChild(slotElement);
        });
    }
    
    selectTime(horario) {
        // Validar que não é o mesmo horário do mesmo dia
        if (this.selectedDate === this.agendamentoOriginal.data && 
            horario.horarioInicio === this.agendamentoOriginal.horario) {
            alert('Escolha um horário diferente da sessão original.');
            return;
        }
        
        this.selectedHorario = horario;
        this.selectedTime = `${horario.horarioInicio} - ${horario.horarioFim}`;
        
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        event.target.classList.add('selected');
        
        this.showAppointmentForm();
    }
    
    formatTime(timeStr) {
        if (!timeStr) return '';
        const parts = timeStr.split(':');
        return `${parts[0]}:${parts[1]}`;
    }
    
    showAppointmentForm() {
        document.getElementById('appointmentForm').style.display = 'block';
    }
    
    hideAppointmentForm() {
        document.getElementById('appointmentForm').style.display = 'none';
    }
    
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
    
    async confirmarNovoAgendamento() {
        if (!this.selectedDate || !this.selectedHorario) {
            alert('Selecione data e horário.');
            return;
        }
        
        const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuario) {
            alert('Usuário não autenticado.');
            return;
        }
        
        const appointmentNotes = document.getElementById('appointmentNotes').value;
        
        try {
            // PASSO 1: Criar novo agendamento
            const novoAgendamento = {
                data: this.selectedDate,
                horario: this.selectedHorario.horarioInicio,
                paciente: this.agendamentoOriginal.paciente,
                observacoes: appointmentNotes,
                isOnline: false,
                valorSessao: 100,
                quantidadePacote: 1,
                quantidadeRestante: 1,
                usuCodigo: usuario.usucodigo
            };
            
            console.log('Criando novo agendamento:', novoAgendamento);
            
            const responseNovo = await fetch('historical-pepi-puc-tis-d0d4bf2c.koyeb.app/agendamentos', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(novoAgendamento)
            });
            
            if (!responseNovo.ok) {
                const error = await responseNovo.text();
                throw new Error(`Erro ao criar novo agendamento (HTTP ${responseNovo.status}): ${error}`);
            }
            
            const novoCriado = await responseNovo.json();
            this.novoAgendamentoID = novoCriado.agendamentoID || novoCriado.id;
            
            console.log('Novo agendamento criado com ID:', this.novoAgendamentoID);
            console.log('Agendamento completo:', novoCriado);
            
            // PASSO 2: Mostrar modal de decisão
            this.mostrarModalDecisao();
            
        } catch (error) {
            console.error('Erro:', error);
            alert(`Erro ao criar novo agendamento: ${error.message}`);
        }
    }
    
    mostrarModalDecisao() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const conteudo = document.createElement('div');
        conteudo.style.cssText = `
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 500px;
        `;
        
        conteudo.innerHTML = `
            <h2 style="color: #73022C; margin-bottom: 20px;">Confirmação de Reagendamento</h2>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button id="deletarAntigoBtn" style="
                    background-color: #28a745;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 14px;
                ">✓ Confirmar Reagendamento</button>
                <button id="deletarNovoBtn" style="
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 14px;
                ">✕ Cancelar (Mantem sessão original)</button>
            </div>
        `;
        
        modal.appendChild(conteudo);
        document.body.appendChild(modal);
        
        document.getElementById('deletarAntigoBtn').addEventListener('click', () => {
            this.finalizarComDeletarAntigo(modal);
        });
        
        document.getElementById('deletarNovoBtn').addEventListener('click', () => {
            this.finalizarComDeletarNovo(modal);
        });
    }
    
    async finalizarComDeletarAntigo(modal) {
        try {
            // Deletar agendamento antigo
            const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
            
            console.log('Deletando agendamento original com ID:', this.agendamentoOriginal.agendamentoID);
            console.log('usuCodigo:', usuario?.usucodigo);
            
            const response = await fetch(`historical-pepi-puc-tis-d0d4bf2c.koyeb.app/agendamentos/${this.agendamentoOriginal.agendamentoID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'usuCodigo': usuario?.usucodigo || ''
                }
            });
            
            console.log('Resposta do DELETE:', response.status);
            
            if (response.ok) {
                alert('Reagendamento confirmado!');
                localStorage.removeItem('reagendamento');
                window.location.href = 'pacienteGerenciaHorarios.html';
            } else {
                const errorText = await response.text();
                throw new Error(`Erro ao deletar agendamento antigo (HTTP ${response.status}): ${errorText}`);
            }
        } catch (error) {
            console.error('Erro ao deletar:', error);
            alert(`Erro ao finalizar: ${error.message}`);
        } finally {
            modal.remove();
        }
    }
    
    async finalizarComDeletarNovo(modal) {
        try {
            // Deletar novo agendamento
            const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
            
            console.log('Deletando novo agendamento com ID:', this.novoAgendamentoID);
            
            const response = await fetch(`historical-pepi-puc-tis-d0d4bf2c.koyeb.app/agendamentos/${this.novoAgendamentoID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'usuCodigo': usuario?.usucodigo || ''
                }
            });
            
            console.log('Resposta do DELETE:', response.status);
            
            if (response.ok) {
                alert('Reagendamento cancelado.');
                localStorage.removeItem('reagendamento');
                window.location.href = 'pacienteGerenciaHorarios.html';
            } else {
                const errorText = await response.text();
                throw new Error(`Erro ao deletar novo agendamento (HTTP ${response.status}): ${errorText}`);
            }
        } catch (error) {
            console.error('Erro ao deletar:', error);
            alert(`Erro ao finalizar: ${error.message}`);
        } finally {
            modal.remove();
        }
    }
    
    async carregarNumeroPsicologo() {
        // Obter informações do usuário logado (usando a função externa que será adicionada)
        const userInfo = obterInfoUsuarioLogado();
        let psicologoId = userInfo && userInfo.tipo === 'PSICOLOGO' ? userInfo.id : null;
        
        // 1. Fallback: Se não for um psicólogo logado (i.e., é um paciente), tenta buscar o ID público do psicólogo
        if (!psicologoId) {
             try {
                // Tenta buscar o primeiro usuário com usutipo = 'PSICOLOGO' (como no homePage.js)
                const res = await fetch('/api/usuarios');
                if (res.ok) {
                    const list = await res.json();
                    const psi = list.find(u => (u.usutipo && String(u.usutipo).toUpperCase() === 'PSICOLOGO'));
                    if (psi) {
                        psicologoId = psi.usucodigo;
                    }
                }
            } catch (err) {
                console.error('Erro ao buscar usuários para encontrar psicólogo público:', err);
            }
        }

        if (!psicologoId) {
            console.warn('Não foi possível identificar o ID do psicólogo. O telefone não será preenchido.');
            return;
        }

        // 2. Busca os dados do psicólogo usando o ID encontrado
        try {
            const response = await fetch(`/api/psicologos/${psicologoId}`); 
            if (response.ok) {
                const psicologo = await response.json();
                this.preencherTelefonePsicologo(psicologo);
            } else {
                console.error('Erro ao carregar dados do psicólogo para o telefone.');
            }
        } catch (error) {
            console.error('Erro de conexão ao carregar dados do psicólogo:', error);
        }
    }

    preencherTelefonePsicologo(psicologo) {
        const telefonePlaceholder = document.getElementById('psicologo-telefone');
        if (telefonePlaceholder && psicologo.telefone) { 
            const numeroFormatado = psicologo.telefone;
            const numeroLimpo = numeroFormatado.replace(/\D/g, '');
            // Link para WhatsApp no formato internacional com o código 55 (Brasil)
            const whatsappLink = `https://wa.me/55${numeroLimpo}`;
            telefonePlaceholder.innerHTML = `<a href="${whatsappLink}" target="_blank" style="color: #73022C; text-decoration: none; font-weight: bold;">${numeroFormatado}</a>`;
            console.log('Número do psicólogo carregado:', numeroFormatado);
        }
    }
}

// =======================================================
// === FUNÇÃO DE UTILIDADE obterInfoUsuarioLogado (COPIADA DE homePage.js) ===
// =======================================================

function obterInfoUsuarioLogado() {
    // TENTA LER A CHAVE PRINCIPAL USADA PELO FLUXO DE LOGIN/PERFIL
    try {
        const usuarioLogadoJson = localStorage.getItem('usuarioLogado');
        if (usuarioLogadoJson) {
            const usuario = JSON.parse(usuarioLogadoJson);
            
            // Lógica similar à de auth.js para determinar o tipo
            let tipo = usuario.usutipo || usuario.tipoUsuario || usuario.tipo || usuario.role;
            if (tipo) {
                tipo = String(tipo).toUpperCase();
            } else if (usuario.crp || usuario.especialidade) {
                tipo = 'PSICOLOGO';
            } else {
                tipo = 'PACIENTE'; // Padrão se não houver tipo explícito
            }
            
            const id = usuario.usucodigo || usuario.id || usuario.idUsuario;
            
            if (id && tipo) {
                return { id: parseInt(id), tipo: tipo };
            }
        }
    } catch (err) {
        console.warn('Erro ao parsear localStorage.usuarioLogado:', err);
    }

    // Fallback para chaves mais antigas ou chaves individuais
    const id = sessionStorage.getItem('usuarioId') || localStorage.getItem('usuarioId');
    const tipo = sessionStorage.getItem('usuarioTipo') || localStorage.getItem('usuarioTipo'); 

    if (id && tipo) {
        return {
            id: parseInt(id),
            tipo: String(tipo).toUpperCase()
        };
    }

    return null;
}

// Variável global para acessar de onclick
let reagendamento;

document.addEventListener('DOMContentLoaded', () => {
    reagendamento = new ReagendamentoSystem();
});
