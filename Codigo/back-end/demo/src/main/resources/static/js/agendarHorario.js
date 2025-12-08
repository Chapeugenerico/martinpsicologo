// =======================================================
// === FUNÇÕES DE UTILIDADE E AUTENTICAÇÃO (COPIADAS) ===
// =======================================================

function obterInfoUsuarioLogado() {
    // TENTA LER A CHAVE PRINCIPAL USADA PELO FLUXO DE LOGIN/PERFIL
    try {
        const usuarioLogadoJson = localStorage.getItem('usuarioLogado');
        if (usuarioLogadoJson) {
            const usuario = JSON.parse(usuarioLogadoJson);
            
            let tipo = usuario.usutipo || usuario.tipoUsuario || usuario.tipo || usuario.role;
            if (tipo) {
                tipo = String(tipo).toUpperCase();
            } else if (usuario.crp || usuario.especialidade) {
                tipo = 'PSICOLOGO';
            } else {
                tipo = 'PACIENTE'; 
            }
            
            const id = usuario.usucodigo || usuario.id || usuario.idUsuario;
            
            if (id && tipo) {
                return { id: parseInt(id), tipo: tipo, dados: usuario };
            }
        }
    } catch (err) {
        console.warn('Erro ao parsear localStorage.usuarioLogado:', err);
    }
    return null;
}


function fazerLogout() {
    // Limpeza completa das chaves de autenticação
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('pacienteLogado');
    localStorage.removeItem('psicologoLogado');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    
    window.location.href = 'login.html';
}


// =======================================================
// === LÓGICA DE MONTAGEM DA NAVBAR (COPIADA) ===
// =======================================================

function atualizarNavbar(userInfo) {
    const navLinksContainer = document.getElementById('navLinks');
    const userInfoEl = document.getElementById('userInfo');
    if (!navLinksContainer) return;

    navLinksContainer.innerHTML = '';
    if (userInfoEl) userInfoEl.textContent = '';

    if (userInfo) {
        // Usuário AUTENTICADO
        
        // 1. Exibir a saudação
        const nome = userInfo.dados.nome || userInfo.dados.usunome || userInfo.dados.pacinome || userInfo.dados.psinome || 'Usuário';
        if (userInfoEl) userInfoEl.textContent = `Olá, ${nome}`;

        // 2. Renderiza os links específicos do tipo de usuário
        if (userInfo.tipo === 'PACIENTE') {
            // Links de PACIENTE
            navLinksContainer.innerHTML = `
                <a href="homePage.html">Inicio</a>
                <a href="perfilPaciente.html">Perfil</a>
                <a href="pacienteGerenciaHorarios.html">Agenda</a>
                <a href="agendarHorario.html" class="active" aria-current="page">Agendar Horário</a>
                <button id="logoutBtn" class="logout-btn" type="button" aria-label="Sair">Logout</button>
            `;
        } else if (userInfo.tipo === 'PSICOLOGO') {
            // Links de PSICÓLOGO
            navLinksContainer.innerHTML = `
                <a href="homePage.html">Início</a>
                <a href="perfilPsicologo.html">Perfil</a>
                <a href="gerenciarPaciente.html">Pacientes</a>
                <a href="gerenciaHorario.html">Horários</a>
                <a href="relatorio.html">Relatório</a>
                <button id="logoutBtn" class="logout-btn" type="button" aria-label="Sair">Logout</button>
            `;
        }
        
        // 3. Adiciona o listener de evento de Logout
        const btnLogout = document.getElementById('logoutBtn');
        if (btnLogout) {
            btnLogout.addEventListener('click', fazerLogout);
        }
        
    } else {
        // Usuário NÃO AUTENTICADO
        navLinksContainer.innerHTML = `
            <a href="agendarHorario.html" class="active" aria-current="page">Agendar Horário</a>
            <a href="cadastro.html">Cadastrar</a>
            <a href="login.html">Entrar</a>
        `;
    }
}

// =======================================================
// === INICIALIZAÇÃO DA NAVBAR ANTES DE AppointmentSystem ===
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    // Carrega a navbar
    const userInfo = obterInfoUsuarioLogado();
    atualizarNavbar(userInfo);
    
    // O AppointmentSystem já é inicializado no final do seu agendarHorario.js
});

// Sistema de Agendamento com Integração Backend - VERSÃO CORRIGIDA
class AppointmentSystem {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedHorario = null;
        this.horariosDisponiveis = [];
        
        this.initialize();
    }
    
    async initialize() {
        this.setupEventListeners();
        this.renderCalendarSkeleton(); // Renderizar esqueleto primeiro
        await this.carregarHorariosDisponiveis();
        this.renderCalendar(); // Renderizar completo após carregar dados
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
        
        // Botão de agendamento (opcional, já chamado automaticamente ao clicar no dia)
        const btnAgendar = document.getElementById('btnAgendar');
        if (btnAgendar) {
            btnAgendar.addEventListener('click', () => {
                this.showTimeSlots();
            });
        }
        
        // Formulário de agendamento
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.bookAppointment();
        });
        
        document.getElementById('cancelBooking').addEventListener('click', () => {
            this.hideAppointmentForm();
        });
    }
    
    // NOVO: Renderizar esqueleto do calendário enquanto carrega dados
    renderCalendarSkeleton() {
        const calendarGrid = document.getElementById('calendarGrid');
        const monthYear = document.getElementById('currentMonthYear');
        
        // Atualizar título do mês/ano
        const monthNames = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        monthYear.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        // Mostrar loading
        calendarGrid.innerHTML = '<div class="loading">Carregando calendário...</div>';
    }
    
    // Carregar horários disponíveis do backend
    async carregarHorariosDisponiveis() {
        try {
            console.log('Carregando horários disponíveis...');
            const mes = this.currentDate.getMonth() + 1;
            const ano = this.currentDate.getFullYear();
            const dataConsulta = `${ano}-${String(mes).padStart(2, '0')}-01`;
            
            const response = await fetch(`https://historical-pepi-puc-tis-d0d4bf2c.koyeb.app/api/horarios/disponiveis?data=${dataConsulta}`);
            
            if (response.ok) {
                this.horariosDisponiveis = await response.json();
                console.log('Horários disponíveis carregados:', this.horariosDisponiveis.length);
            } else {
                console.error('Erro ao carregar horários disponíveis. Status:', response.status);
                this.horariosDisponiveis = [];
                // Mostrar mensagem de erro
                this.showError('Erro ao carregar horários. Verifique a conexão.');
            }
        } catch (error) {
            console.error('Erro ao carregar horários:', error);
            this.horariosDisponiveis = [];
            this.showError('Erro de conexão. Verifique se o servidor está rodando.');
        }
    }
    
    // NOVO: Mostrar mensagem de erro
    showError(message) {
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = `<div class="error-message">${message}</div>`;
    }
    
    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const monthYear = document.getElementById('currentMonthYear');
        
        // Atualizar título do mês/ano
        const monthNames = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        monthYear.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        // Limpar calendário
        calendarGrid.innerHTML = '';
        
        // Calcular dias do mês
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const firstDayOfWeek = firstDay.getDay();
        const prevMonthLastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 0).getDate();
        
        // Gerar dias do calendário
        let calendarHTML = '';
        
        // Dias do mês anterior
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            calendarHTML += `<div class="calendar-day other-month">${day}</div>`;
        }
        
        // Dias do mês atual
        const today = new Date();
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateObj = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            const dateStr = this.formatDate(dateObj);
            const isToday = this.isToday(dateObj);
            const isSelected = this.selectedDate === dateStr;
            const hasAvailableSlots = this.hasAvailableSlotsForDate(dateStr);
            const isPastDate = this.isPastDate(dateObj);
            
            const dayClasses = [
                'calendar-day',
                isToday ? 'today' : '',
                isSelected ? 'selected' : '',
                isPastDate ? 'past-date' : '',
                hasAvailableSlots ? 'has-slots' : ''
            ].filter(Boolean).join(' ');
            
            calendarHTML += `
                <div class="${dayClasses}" data-date="${dateStr}">
                    <div class="day-number">${day}</div>
                    ${hasAvailableSlots ? `<div class="available-indicator">✓</div>` : ''}
                </div>
            `;
        }
        
        // Dias do próximo mês
        const totalCells = 42;
        const daysInCalendar = firstDayOfWeek + lastDay.getDate();
        const nextMonthDays = totalCells - daysInCalendar;
        
        for (let day = 1; day <= nextMonthDays; day++) {
            calendarHTML += `<div class="calendar-day other-month">${day}</div>`;
        }
        
        calendarGrid.innerHTML = calendarHTML;
        
        // Adicionar event listeners aos dias
        this.attachDayEventListeners();
    }
    
    // NOVO: Separar a lógica de event listeners
    attachDayEventListeners() {
        document.querySelectorAll('.calendar-day:not(.other-month)').forEach(dayElement => {
            const dateStr = dayElement.getAttribute('data-date');
            const dateParts = dateStr.split('-');
            const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
            
            const isPastDate = this.isPastDate(dateObj);
            const hasAvailableSlots = this.hasAvailableSlotsForDate(dateStr);
            
            if (!isPastDate && hasAvailableSlots) {
                dayElement.addEventListener('click', () => {
                    this.selectDate(dateStr);
                });
                dayElement.style.cursor = 'pointer';
            } else {
                dayElement.style.cursor = 'not-allowed';
                dayElement.style.opacity = '0.6';
            }
        });
    }
    
    // Verificar se há horários disponíveis para uma data específica
    hasAvailableSlotsForDate(dateStr) {
        return this.horariosDisponiveis.some(horario => 
            horario.data === dateStr && horario.disponivel
        );
    }
    
    formatDate(date) {
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
        
        // Mostrar container de horários
        timeSlotsContainer.style.display = 'block';
        
        // Formatando a data para exibição
        const dateParts = this.selectedDate.split('-');
        const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        selectedDateElement.textContent = dateObj.toLocaleDateString('pt-BR', options);
        
        // Gerar horários disponíveis do backend
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
            
            // Formatar o horário para exibição
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
        
        // Esconder formulário inicialmente
        this.hideAppointmentForm();
    }
    
    // NOVO: Formatador de tempo
    formatTime(timeString) {
        if (!timeString) return '';
        // Se já estiver no formato HH:mm, retorna como está
        if (timeString.length === 5) return timeString;
        // Se estiver no formato HH:mm:ss, remove os segundos
        if (timeString.length === 8) return timeString.substring(0, 5);
        return timeString;
    }
    
    selectTime(horario) {
        // Verificação adicional de segurança
        if (this.isPastTime(this.selectedDate, horario.horarioInicio)) {
            alert('Não é possível agendar para horários que já passaram.');
            return;
        }
        
        this.selectedTime = horario.horarioInicio;
        this.selectedHorario = horario;
        
        // Atualizar seleção visual
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Encontrar o slot correto
        const slots = document.querySelectorAll('.time-slot');
        for (let slot of slots) {
            const slotHorario = JSON.parse(slot.getAttribute('data-horario'));
            if (slotHorario.data === horario.data && 
                slotHorario.horarioInicio === horario.horarioInicio) {
                slot.classList.add('selected');
                break;
            }
        }
        
        // Mostrar formulário de agendamento
        this.showAppointmentForm();
    }
    
    showAppointmentForm() {
        document.getElementById('appointmentForm').style.display = 'block';
    }
    
    hideAppointmentForm() {
        document.getElementById('appointmentForm').style.display = 'none';
        this.selectedTime = null;
        this.selectedHorario = null;
        
        // Limpar seleções
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
    }
    
    async bookAppointment() {
        // NOVO: Verificar se o usuário está autenticado
        const usuario = this.verificarAutenticacao();
        if (!usuario) {
            this.mostrarModalLoginObrigatorio();
            return;
        }

        // Verificação final de segurança
        const dateParts = this.selectedDate.split('-');
        const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        
        if (this.isPastDate(dateObj) || this.isPastTime(this.selectedDate, this.selectedHorario.horarioInicio)) {
            alert('Não é possível agendar para datas ou horários passados.');
            return;
        }
        
        const patientName = document.getElementById('patientName').value;
        //const patientEmail = document.getElementById('patientEmail').value;
        //const patientPhone = document.getElementById('patientPhone').value;
        const notes = document.getElementById('appointmentNotes').value;
        
        if (!patientName) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        try {
            
            const agendamentoData = {
                data: this.selectedDate, 
                horario: this.selectedHorario.horarioInicio, 
                paciente: patientName,
                //email: patientEmail,
                //telefone: patientPhone,
                observacoes: notes,
                isOnline: false,
                valorSessao: 100,
                quantidadePacote: 1,
                quantidadeRestante: 1,
                usuCodigo: usuario.usucodigo 
            };

            console.log('Dados enviados:', agendamentoData);
            
            const response = await fetch('https://historical-pepi-puc-tis-d0d4bf2c.koyeb.app/agendamentos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(agendamentoData)
            });
            
            if (response.ok) {
                const agendamentoCriado = await response.json();
                
                alert(`Consulta agendada com sucesso!\n\nData: ${this.selectedDate}\nHorário: ${this.formatTime(this.selectedHorario.horarioInicio)} - ${this.formatTime(this.selectedHorario.horarioFim)}\nPaciente: ${patientName}`);
                
                // Limpar formulário
                document.getElementById('bookingForm').reset();
                this.hideAppointmentForm();
                
                // Recarregar horários para atualizar disponibilidade
                await this.carregarHorariosDisponiveis();
                this.renderCalendar();

                // Redirecionar para página de gerenciamento de horários do paciente
                window.location.href = "pacienteGerenciaHorarios.html";

                
                // Resetar seleções
                this.selectedDate = null;
                this.selectedTime = null;
                this.selectedHorario = null;
                document.getElementById('btnAgendar').disabled = true;
                document.getElementById('timeSlotsContainer').style.display = 'none';
                
            } else {
                const errorText = await response.text();
                console.error('Erro detalhado:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });
                alert(`Erro ao agendar consulta: ${errorText}`);
            }
            
        } catch (error) {
            console.error('Erro ao agendar:', error);
            alert('Erro ao conectar com o servidor. Tente novamente.');
        }

if (response.ok) {
    const agendamentoCriado = await response.json();

    alert(`Consulta agendada com sucesso!\n\nData: ${this.selectedDate}\nHorário: ${this.formatTime(this.selectedHorario.horarioInicio)} - ${this.formatTime(this.selectedHorario.horarioFim)}\nPaciente: ${patientName}`);

    // Verificar se há reagendamento pendente no localStorage
    const reagendamentoJSON = localStorage.getItem('reagendamento');
    if (reagendamentoJSON) {
        const antigo = JSON.parse(reagendamentoJSON);
        try {
            // Deletar agendamento antigo
            const deleteResponse = await fetch(`https://historical-pepi-puc-tis-d0d4bf2c.koyeb.app/agendamentos/${antigo.agendamentoID}`, {
                method: 'DELETE'
            });
            if (!deleteResponse.ok) {
                console.error('Erro ao deletar agendamento antigo', deleteResponse.statusText);
            }
        } catch (err) {
            console.error('Erro ao tentar deletar agendamento antigo:', err);
        }
        // Limpar o localStorage do reagendamento
        localStorage.removeItem('reagendamento');
    }

    // Limpar formulário
    document.getElementById('bookingForm').reset();
    this.hideAppointmentForm();

    // Recarregar horários para atualizar disponibilidade
    await this.carregarHorariosDisponiveis();
    this.renderCalendar();

    // Redirecionar para página de gerenciamento de horários do paciente
    window.location.href = "pacienteGerenciaHorarios.html";

    // Resetar seleções
    this.selectedDate = null;
    this.selectedTime = null;
    this.selectedHorario = null;
    document.getElementById('btnAgendar').disabled = true;
    document.getElementById('timeSlotsContainer').style.display = 'none';
}


    }

    // NOVO: Verificar se o usuário está autenticado
    verificarAutenticacao() {
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

    // NOVO: Mostrar modal informando que o login é obrigatório
    mostrarModalLoginObrigatorio() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
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
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        conteudo.innerHTML = `
            <h2 style="color: #73022C; margin-bottom: 15px;">Login Obrigatório</h2>
            <p style="color: #555; margin-bottom: 25px; font-size: 16px;">
                Para agendar uma consulta, você precisa estar logado em sua conta.
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="btnLoginModal" style="
                    background-color: #73022C;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 16px;
                    transition: all 0.3s;
                ">Ir para Login</button>
                <button id="btnFecharModal" style="
                    background-color: #ddd;
                    color: #333;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 16px;
                    transition: all 0.3s;
                ">Cancelar</button>
            </div>
        `;

        // Adicionar animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);

        modal.appendChild(conteudo);
        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('btnLoginModal').addEventListener('click', () => {
            window.location.href = 'login.html';
        });

        document.getElementById('btnFecharModal').addEventListener('click', () => {
            modal.remove();
            style.remove();
        });

        // Fechar ao clicar fora do modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                style.remove();
            }
        });
    }
    
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    // Função para reagendar sessão
    reagendarSessao(agendamento) {
    const { id, data, horarioInicio, paciente } = agendamento;

    const agora = new Date();
    const sessaoDataHora = new Date(`${data}T${horarioInicio}`);
    const limite = new Date(agora.getTime() + 12 * 60 * 60 * 1000); // 12h antes da sessão

    if (sessaoDataHora < limite) {
        alert('Reagendamento permitido somente até 12 horas antes da sessão.');
        return;
    }

    // Salvar no localStorage para preencher o formulário automaticamente
    localStorage.setItem('reagendamento', JSON.stringify({
        agendamentoID: id,
        data,
        horarioInicio,
        paciente
    }));


    

    

    // Redireciona para a tela de agendamento
    window.location.href = 'agendarHorario.html';
}




}

// Inicializar o sistema quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new AppointmentSystem();
});