document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const appointmentsContainer = document.getElementById('patient-appointments');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    locale: 'pt-br',
    slotMinTime: '07:00:00',
    slotMaxTime: '22:00:00',
    allDaySlot: false,
    height: 650,
    events: []
  });
  calendar.render();

  async function tryFetch(url) {
    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return null;
      const json = await res.json();
      return json;
    } catch (e) {
      return null;
    }
  }

  function mapToEvent(item) {
    // Supporta várias formas de retorno do servidor
    const ev = {};
    ev.id = item.id || item._id || item.appointmentId || undefined;
    // tenta campos diferentes para início/fim
    const start = item.start || item.startDate || item.dataHoraInicio || item.data_inicio || item.inicio || item.horaInicio;
    const end = item.end || item.endDate || item.dataHoraFim || item.data_fim || item.fim || item.horaFim;
    const title = item.title || item.titulo || item.summary || (item.paciente ? `Consulta: ${item.paciente}` : 'Consulta');

    ev.title = title;
    if (start) ev.start = (new Date(start)).toISOString();
    if (end) ev.end = (new Date(end)).toISOString();
    ev.extendedProps = Object.assign({}, item);
    return ev;
  }

  function renderList(events) {
    appointmentsContainer.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'appointments-header';
    header.innerHTML = `<h4>Seus próximos horários</h4>`;
    appointmentsContainer.appendChild(header);

    if (!events || events.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'appointments-empty';
      empty.textContent = 'Nenhum horário encontrado.';
      appointmentsContainer.appendChild(empty);
      return;
    }

    const list = document.createElement('div');
    list.className = 'appointments-list';
    events.sort((a,b)=> new Date(a.start) - new Date(b.start));
    events.forEach(ev => {
      const item = document.createElement('div');
      item.className = 'appointment-item';
      const start = ev.start ? new Date(ev.start) : null;
      const end = ev.end ? new Date(ev.end) : null;
      const when = start ? start.toLocaleDateString('pt-BR') + ' ' + start.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) : '';
      const whenEnd = end ? ' - ' + end.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) : '';
      item.innerHTML = `
        <div class="appointment-info">
          <div class="appointment-title">${ev.title}</div>
          <div class="appointment-time">${when}${whenEnd}</div>
        </div>
        <div class="appointment-actions">
          <button class="btn-details" data-id="${ev.id || ''}">Ver detalhes</button>
          <button class="btn-delete" data-id="${ev.id || ''}">Excluir</button>
        </div>
      `;
      list.appendChild(item);
    });
    appointmentsContainer.appendChild(list);

    // attach handlers
    appointmentsContainer.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        alert('Abrir detalhes do agendamento: ' + (id || 'sem id'));
      });
    });

    // attach delete handlers
    appointmentsContainer.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteAppointment(id);
      });
    });
  }

  async function deleteAppointment(id) {
    if (!id) {
      alert('Erro: ID do agendamento não encontrado');
      return;
    }

    const confirmDelete = confirm('Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.');
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`/agendamentos/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Sessão excluída com sucesso!');
        loadPatientAppointments(); // Recarrega a lista
      } else {
        alert('Erro ao excluir a sessão. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      alert('Erro ao comunicar com o servidor.');
    }
  }

  async function loadPatientAppointments() {
    // Primeiro tente obter o ID do usuário logado (armazenado no login.js em localStorage)
    let data = null;
    try {
      const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
      if (usuario && (usuario.usucodigo || usuario.usucodigo === 0 || usuario.usucodigo === null)) {
        const id = usuario.usucodigo;
        // endpoint que implementamos no backend: /agendamentos/usuario/{usuCodigo}
        data = await tryFetch(`/agendamentos/usuario/${id}`);
        // pode retornar objeto com items ou lista direta
        if (data && data.items && Array.isArray(data.items)) data = data.items;
        if (data && Array.isArray(data)) {
          // ok, encontramos dados específicos do paciente
        } else {
          data = null; // não é array -> continuar com fallbacks
        }
      }
    } catch (e) {
      data = null;
    }

    // Se não encontrou com user id, tenta endpoints comuns do backend (ordem de tentativa)
    if (!data) {
      const endpoints = [
        '/api/pacientes/me/consultas',
        '/api/consultas/mine',
        '/api/consultas/paciente',
        '/api/atendimentos/mine',
        '/api/appointments/mine',
        '/api/appointments?mine=true',
        '/api/appointments',
        '/agendamentos'
      ];

      for (const url of endpoints) {
        data = await tryFetch(url);
        if (data && Array.isArray(data)) {
          break;
        }
        // caso o endpoint retorne um objeto com results
        if (data && data.items && Array.isArray(data.items)) {
          data = data.items; break;
        }
      }
    }

    if (!data) {
    }

    // map to calendar events
    const events = data.map(mapToEvent);
    // clear previous
    calendar.getEvents().forEach(e=>e.remove());
    events.forEach(e=> calendar.addEvent(e));
    renderList(events);
  }

  loadPatientAppointments();

  // atualiza periodicamente
  setInterval(loadPatientAppointments, 30000);
});

/* Estilos mínimos via JS para não editar CSS grande existente - o ideal é mover para css/agendaPaciente.css */
const style = document.createElement('style');
style.textContent = `
.appointments-header h4{ color:#591636; margin:0 0 8px 0}
.appointments-empty{ color:#591636; padding:12px; background:#f5a4c2; border-radius:8px}
.appointments-list{ display:flex; flex-direction:column; gap:8px}
.appointment-item{ display:flex; justify-content:space-between; align-items:center; padding:10px; background:#fff; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.06)}
.appointment-title{ font-weight:600; color:#591636}
.appointment-time{ color:#444}
.appointment-actions{ display:flex; gap:8px; align-items:center}
.btn-details{ background:#591636; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer}
.btn-details:hover{ background:#73022C }
.btn-delete{ background:#dc3545; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer}
.btn-delete:hover{ background:#c82333 }
`;
document.head.appendChild(style);
