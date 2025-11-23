package com.example.demo.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

@Entity
@Table(name = "Agendamento")
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer agendamentoID;

    @Column(name = "USUCODIGO")
    private Integer usuCodigo;


    
    @Column(name = "Paciente")
    private String paciente;

    @Column(name = "Email")
    private String email;

    @Column(name = "Telefone")
    private String telefone;

    @Column(name = "Observacoes", length = 1000)
    private String observacoes;

    @Column(name = "Data")
    private LocalDate data;

    @Column(name = "Horario")
    private LocalTime horario;

    @Column(name = "isOnline")
    private Boolean isOnline;

    @Column(name = "ValorSessao")
    private BigDecimal valorSessao;

    @Column(name = "QuantidadePacote")
    private Integer quantidadePacote;

    @Column(name = "QuantidadeRestante")
    private Integer quantidadeRestante;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status")
    private Status status;

    // Getters e Setters

    public String getPaciente() {
        return this.paciente;
    }
    public void setPaciente(String paciente) {
        this.paciente = paciente;
    }
    public String getEmail() {
        return this.email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getTelefone() {
        return this.telefone;
    }
    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }
    public String getObservacoes() {
        return this.observacoes;
    }

    public Integer getAgendamentoID() {
        return this.agendamentoID;
    }

    public void setAgendamentoID(Integer agendamentoID) {
        this.agendamentoID = agendamentoID;
    }

    public Integer getUsuCodigo() {
        return this.usuCodigo;
    }

    public void setUsuCodigo(Integer usuCodigo) {
        this.usuCodigo = usuCodigo;
    }

    public LocalDate getData() {
        return this.data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public LocalTime getHorario() {
        return this.horario;
    }

    public void setHorario(LocalTime horario) {
        this.horario = horario;
    }

    public Boolean getIsOnline() {
        return this.isOnline;
    }

    public void setIsOnline(Boolean isOnline) {
        this.isOnline = isOnline;
    }

    public BigDecimal getValorSessao() {
        return this.valorSessao;
    }

    public void setValorSessao(BigDecimal valorSessao) {
        this.valorSessao = valorSessao;
    }

    public Integer getQuantidadePacote() {
        return this.quantidadePacote;
    }

    public void setQuantidadePacote(Integer quantidadePacote) {
        this.quantidadePacote = quantidadePacote;
    }

    public Integer getQuantidadeRestante() {
        return this.quantidadeRestante;
    }

    public void setQuantidadeRestante(Integer quantidadeRestante) {
        this.quantidadeRestante = quantidadeRestante;
    }
    public Status getStatus() {
        return this.status;
    }
    public void setStatus(Status status) {
        this.status = status;
    }
}