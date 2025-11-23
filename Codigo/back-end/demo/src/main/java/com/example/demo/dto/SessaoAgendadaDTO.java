package com.example.demo.dto;

import com.example.demo.model.Sessao;
import java.time.format.DateTimeFormatter;

public class SessaoAgendadaDTO {
    private Long id;
    private String data;
    private String horarioInicio;
    private String horarioFim;
    private String status;
    private String psicologoNome;
    private String modalidade;
    
    // Construtor a partir da entidade Sessao
    public SessaoAgendadaDTO(Sessao sessao) {
        this.id = sessao.getId();
        
        if (sessao.getProximaSessao() != null) {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
            
            this.data = sessao.getProximaSessao().toLocalDate().format(dateFormatter);
            this.horarioInicio = sessao.getProximaSessao().toLocalTime().format(timeFormatter);
            // Calcular horário fim (exemplo: +50 minutos)
            this.horarioFim = sessao.getProximaSessao().toLocalTime().plusMinutes(50).format(timeFormatter);
        }
        
        this.status = "AGENDADA"; // Ou você pode mapear de statusPagamento
        this.psicologoNome = "Dr. Martin"; // Placeholder - ajuste conforme seu modelo
        this.modalidade = sessao.getModalidade();
    }
    
    // Getters e Setters COMPLETOS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
    
    public String getHorarioInicio() { return horarioInicio; }
    public void setHorarioInicio(String horarioInicio) { this.horarioInicio = horarioInicio; }
    
    public String getHorarioFim() { return horarioFim; }
    public void setHorarioFim(String horarioFim) { this.horarioFim = horarioFim; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getPsicologoNome() { return psicologoNome; }
    public void setPsicologoNome(String psicologoNome) { this.psicologoNome = psicologoNome; }
    
    public String getModalidade() { return modalidade; }
    public void setModalidade(String modalidade) { this.modalidade = modalidade; }
}