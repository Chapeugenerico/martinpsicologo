package com.example.demo.service;

import com.example.demo.dto.GerenciaHorarioRequest;
import com.example.demo.dto.HorarioDisponivelDTO;
import com.example.demo.model.Agendamento;
import com.example.demo.model.Alcance;
import com.example.demo.model.DiaSemana;
import com.example.demo.model.GerenciaHorario;
import com.example.demo.repository.AgendamentoRepository;
import com.example.demo.repository.GerenciaHorarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import com.example.demo.model.Repeticao;
import com.example.demo.model.Status;

@Service
public class GerenciaHorarioService {

    private final GerenciaHorarioRepository repository;

    @Autowired
    private final AgendamentoRepository agendamentoRepository; //me

    public GerenciaHorarioService(GerenciaHorarioRepository repository, AgendamentoRepository agendamentoRepository) {
        this.repository = repository;
        this.agendamentoRepository = agendamentoRepository; // me
    }

    public List<Agendamento> getAgendamentos() {
    return agendamentoRepository.findAll();
}


    @Transactional
    public GerenciaHorario createGerenciaHorario(GerenciaHorarioRequest request) {
        GerenciaHorario entity = new GerenciaHorario();

        // Mapear dia da semana (aceita valores como "segunda-feira" ou "SEGUNDA_FEIRA")
        String dia = request.getDiaSemana();
        if (dia == null) {
            throw new IllegalArgumentException("diaSemana é obrigatório");
        }

        DiaSemana diaSemana = parseDiaSemana(dia);
        entity.setDiaSemana(diaSemana);

        // Parse horas
        try {
            LocalTime inicio = LocalTime.parse(request.getHoraInicio());
            LocalTime fim = LocalTime.parse(request.getHoraFim());
            entity.setHoraInicio(inicio);
            entity.setHoraFim(fim);
        } catch (Exception e) {
            throw new IllegalArgumentException("Formato de hora inválido. Use HH:mm");
        }

        // Mapear repetição (opcional)
        String rep = request.getRepeticao();
        if (rep == null || rep.isBlank()) {
            entity.setRepeticao(Repeticao.ONCE);
        } else {
            switch (rep.trim().toLowerCase()) {
                case "weekly":
                case "semanal":
                    entity.setRepeticao(Repeticao.WEEKLY);
                    break;
                case "biweekly":
                case "quinzenal":
                case "quinzenal (a cada 15 dias)":
                    entity.setRepeticao(Repeticao.BIWEEKLY);
                    break;
                default:
                    // tenta converter se foi enviada a constante em maiúsculas
                    try {
                        entity.setRepeticao(Repeticao.valueOf(rep.toUpperCase()));
                    } catch (Exception ex) {
                        entity.setRepeticao(Repeticao.ONCE);
                    }
            }

            // Mapear alcance (mensal/anual) - compatibilidade com diferentes strings
            String alc = request.getAlcance();
            if (alc == null || alc.isBlank()) {
                entity.setAlcance(com.example.demo.model.Alcance.ANUAL);
            } else {
                String normalized = alc.trim().toLowerCase();
                switch (normalized) {
                    case "mensal":
                    case "monthly":
                        entity.setAlcance(com.example.demo.model.Alcance.MENSAL);
                        break;
                    case "anual":
                    case "annual":
                    default:
                        entity.setAlcance(com.example.demo.model.Alcance.ANUAL);
                }
            }
        }

        // Verificar duplicidade: não permite adicionar se já existir mesmo dia e mesmo horário
        boolean exists = repository.existsByDiaSemanaAndHoraInicioAndHoraFim(entity.getDiaSemana(), entity.getHoraInicio(), entity.getHoraFim());
        if (exists) {
            throw new IllegalArgumentException("Já existe um horário cadastrado nesse dia e horário.");
        }

        return repository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<GerenciaHorario> findAll() {
        return repository.findAll();
    }

    @Transactional
    public void deleteById(Integer id) {
        Optional<GerenciaHorario> opt = repository.findById(id);
        if (opt.isPresent()) {
            repository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Horário não encontrado: " + id);
        }
    }

    private DiaSemana parseDiaSemana(String dia) {
        String normalized = dia.trim().toLowerCase();
        switch (normalized) {
            case "domingo":
                return DiaSemana.DOMINGO;
            case "segunda-feira":
            case "segunda":
                return DiaSemana.SEGUNDA_FEIRA;
            case "terca-feira":
            case "terça-feira":
            case "terca":
            case "terça":
                return DiaSemana.TERCA_FEIRA;
            case "quarta-feira":
            case "quarta":
                return DiaSemana.QUARTA_FEIRA;
            case "quinta-feira":
            case "quinta":
                return DiaSemana.QUINTA_FEIRA;
            case "sexta-feira":
            case "sexta":
                return DiaSemana.SEXTA_FEIRA;
            case "sabado":
            case "sábado":
                return DiaSemana.SABADO;
            default:
                // Tenta corresponder caso o cliente envie o enum já em maiúsculas
                try {
                    return DiaSemana.valueOf(dia.toUpperCase());
                } catch (Exception ex) {
                    throw new IllegalArgumentException("Dia da semana inválido: " + dia);
                }
        }
    }
    public List<HorarioDisponivelDTO> getHorariosDisponiveis(String dataParam) {
    List<HorarioDisponivelDTO> horariosDisponiveis = new ArrayList<>();
    List<GerenciaHorario> todosHorarios = findAll();
    
    // Buscar todos os agendamentos existentes
    List<Agendamento> todosAgendamentos = agendamentoRepository.findAll();
    
    LocalDate dataConsulta = dataParam != null ? 
        LocalDate.parse(dataParam) : 
        LocalDate.now();
    
    for (GerenciaHorario horario : todosHorarios) {
        List<LocalDate> datasOcorrencias = calcularOcorrencias(horario, dataConsulta);
        
        for (LocalDate dataOcorrencia : datasOcorrencias) {
            // Verificar se existe agendamento para esta data e horário
            boolean temAgendamento = todosAgendamentos.stream()
                .anyMatch(ag -> 
                    ag.getData() != null &&                      // solução 1: proteger null
        ag.getHorario() != null &&                   // importante: proteger horário também
        ag.getData().equals(dataOcorrencia) &&
        !ag.getHorario().isBefore(horario.getHoraInicio()) &&
        !ag.getHorario().isAfter(horario.getHoraFim().minusMinutes(1))
                    );
            
            boolean disponivel = !temAgendamento;
            
            horariosDisponiveis.add(new HorarioDisponivelDTO(
                dataOcorrencia,
                horario.getHoraInicio(),
                horario.getHoraFim(),
                disponivel
            ));
        }
    }
    
    return horariosDisponiveis;
}

    private List<LocalDate> calcularOcorrencias(GerenciaHorario horario, LocalDate dataBase) {
        List<LocalDate> ocorrencias = new ArrayList<>();
        DayOfWeek diaSemanaHorario = mapDiaSemanaToDayOfWeek(horario.getDiaSemana());
        
        LocalDate dataInicio = dataBase.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate dataFim = dataBase.with(TemporalAdjusters.lastDayOfMonth());
        
        if (horario.getAlcance() == Alcance.ANUAL) {
            dataFim = dataBase.plusMonths(12).with(TemporalAdjusters.lastDayOfMonth());
        }
        
        LocalDate dataAtual = dataInicio;
        while (!dataAtual.isAfter(dataFim)) {
            if (dataAtual.getDayOfWeek() == diaSemanaHorario) {
                if (horario.getRepeticao() == Repeticao.WEEKLY) {
                    ocorrencias.add(dataAtual);
                } else if (horario.getRepeticao() == Repeticao.BIWEEKLY) {
                    long semanasDesdeInicio = ChronoUnit.WEEKS.between(dataInicio, dataAtual);
                    if (semanasDesdeInicio % 2 == 0) {
                        ocorrencias.add(dataAtual);
                    }
                } else { // ONCE
                    if (!dataAtual.isBefore(dataBase) && dataAtual.isBefore(dataBase.plusDays(7))) {
                        ocorrencias.add(dataAtual);
                    }
                }
            }
            dataAtual = dataAtual.plusDays(1);
        }
        
        return ocorrencias;
    }

    private boolean existeAgendamento(LocalDate data, LocalTime horaInicio, LocalTime horaFim) {
        List<Agendamento> agendamentosExistentes = agendamentoRepository.findByDataAndHorarioBetween(data, horaInicio, horaFim);
        return !agendamentosExistentes.isEmpty();
    }

    private DayOfWeek mapDiaSemanaToDayOfWeek(DiaSemana diaSemana) {
        switch (diaSemana) {
            case SEGUNDA_FEIRA: return DayOfWeek.MONDAY;
            case TERCA_FEIRA: return DayOfWeek.TUESDAY;
            case QUARTA_FEIRA: return DayOfWeek.WEDNESDAY;
            case QUINTA_FEIRA: return DayOfWeek.THURSDAY;
            case SEXTA_FEIRA: return DayOfWeek.FRIDAY;
            case SABADO: return DayOfWeek.SATURDAY;
            case DOMINGO: return DayOfWeek.SUNDAY;
            default: return DayOfWeek.MONDAY;
        }
    }
    public void cancelarAgendamento(Integer id) {
        if (!agendamentoRepository.existsById(id)) {
            throw new RuntimeException("Agendamento não encontrado");
        }
        agendamentoRepository.deleteById(id);
    }

    public Agendamento reagendarAgendamento(Integer id, String data, String horario) {
        Agendamento ag = agendamentoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        LocalDate novaData = LocalDate.parse(data);
        LocalTime novoHorario = LocalTime.parse(horario);

        ag.setData(novaData);
        ag.setHorario(novoHorario);
        ag.setStatus(Status.REAGENDADO);

        return agendamentoRepository.save(ag);
    }

    





    
}
