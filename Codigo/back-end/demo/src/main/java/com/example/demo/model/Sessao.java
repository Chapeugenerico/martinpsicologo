package com.example.demo.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "sessoes")
public class Sessao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;
    
    @Column(name = "valor_sessao", precision = 10, scale = 2)
    private BigDecimal valorSessao;
    
    @Column(name = "quantidade_sessoes")
    private Integer quantidadeSessoes;
    
    @Column(name = "sessoes_restantes")
    private Integer sessoesRestantes;
    
    @Column(name = "modalidade")
    private String modalidade; // ONLINE, PRESENCIAL
    
    @Column(name = "frequencia")
    private String frequencia; // SEMANAL, BIOSEMANAL, ESPORADICA
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "proxima_sessao")
    private LocalDateTime proximaSessao;
    
    @Column(name = "status_pagamento")
    private String statusPagamento; // PAGO, PENDENTE, CANCELADO
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Construtores
    public Sessao() {}
    
    public Sessao(Paciente paciente) {
        this.paciente = paciente;
    }
    
    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Paciente getPaciente() { return paciente; }
    public void setPaciente(Paciente paciente) { this.paciente = paciente; }
    
    public BigDecimal getValorSessao() { return valorSessao; }
    public void setValorSessao(BigDecimal valorSessao) { this.valorSessao = valorSessao; }
    
    public Integer getQuantidadeSessoes() { return quantidadeSessoes; }
    public void setQuantidadeSessoes(Integer quantidadeSessoes) { this.quantidadeSessoes = quantidadeSessoes; }
    
    public Integer getSessoesRestantes() { return sessoesRestantes; }
    public void setSessoesRestantes(Integer sessoesRestantes) { this.sessoesRestantes = sessoesRestantes; }
    
    public String getModalidade() { return modalidade; }
    public void setModalidade(String modalidade) { this.modalidade = modalidade; }
    
    public String getFrequencia() { return frequencia; }
    public void setFrequencia(String frequencia) { this.frequencia = frequencia; }
    
    public LocalDateTime getProximaSessao() { return proximaSessao; }
    public void setProximaSessao(LocalDateTime proximaSessao) { this.proximaSessao = proximaSessao; }
    
    public String getStatusPagamento() { return statusPagamento; }
    public void setStatusPagamento(String statusPagamento) { this.statusPagamento = statusPagamento; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}