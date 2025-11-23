package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "prontuarios")
public class Prontuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;
    
    @Column(name = "tipo_paciente")
    private String tipoPaciente; 
    
    // Identificação
    private Integer idade;
    
    @Column(name = "data_nascimento")
    private String dataNascimento;
    
    @Column(name = "estado_civil")
    private String estadoCivil;
    
    private String profissao;
    private String religiao;
    private String filhos;
    
    @Column(name = "reside_com")
    private String resideCom;
    
    private String tabagismo;
    
    @Column(name = "uso_substancias")
    private String usoSubstancias;
    
    // Histórico
    @Column(name = "queixa_principal", length = 1000)
    private String queixaPrincipal;
    
    @Column(name = "historico_familiar", length = 1000)
    private String historicoFamiliar;
    
    // Notas
    @Column(length = 4000)
    private String notas;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // CONSTRUTORES
    public Prontuario() {
    }
    
    public Prontuario(Paciente paciente, String tipoPaciente) {
        this.paciente = paciente;
        this.tipoPaciente = tipoPaciente;
    }
    
    // GETTERS E SETTERS
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Paciente getPaciente() {
        return paciente;
    }
    
    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }
    
    public String getTipoPaciente() {
        return tipoPaciente;
    }
    
    public void setTipoPaciente(String tipoPaciente) {
        this.tipoPaciente = tipoPaciente;
    }
    
    public Integer getIdade() {
        return idade;
    }
    
    public void setIdade(Integer idade) {
        this.idade = idade;
    }
    
    public String getDataNascimento() {
        return dataNascimento;
    }
    
    public void setDataNascimento(String dataNascimento) {
        this.dataNascimento = dataNascimento;
    }
    
    public String getEstadoCivil() {
        return estadoCivil;
    }
    
    public void setEstadoCivil(String estadoCivil) {
        this.estadoCivil = estadoCivil;
    }
    
    public String getProfissao() {
        return profissao;
    }
    
    public void setProfissao(String profissao) {
        this.profissao = profissao;
    }
    
    public String getReligiao() {
        return religiao;
    }
    
    public void setReligiao(String religiao) {
        this.religiao = religiao;
    }
    
    public String getFilhos() {
        return filhos;
    }
    
    public void setFilhos(String filhos) {
        this.filhos = filhos;
    }
    
    public String getResideCom() {
        return resideCom;
    }
    
    public void setResideCom(String resideCom) {
        this.resideCom = resideCom;
    }
    
    public String getTabagismo() {
        return tabagismo;
    }
    
    public void setTabagismo(String tabagismo) {
        this.tabagismo = tabagismo;
    }
    
    public String getUsoSubstancias() {
        return usoSubstancias;
    }
    
    public void setUsoSubstancias(String usoSubstancias) {
        this.usoSubstancias = usoSubstancias;
    }
    
    public String getQueixaPrincipal() {
        return queixaPrincipal;
    }
    
    public void setQueixaPrincipal(String queixaPrincipal) {
        this.queixaPrincipal = queixaPrincipal;
    }
    
    public String getHistoricoFamiliar() {
        return historicoFamiliar;
    }
    
    public void setHistoricoFamiliar(String historicoFamiliar) {
        this.historicoFamiliar = historicoFamiliar;
    }
    
    public String getNotas() {
        return notas;
    }
    
    public void setNotas(String notas) {
        this.notas = notas;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @PreUpdate
    public void setUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }
}