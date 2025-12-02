package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "USUARIOS")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USUCODIGO")
    private Integer usucodigo;

    @Column(name = "USUNOME", length = 100)
    private String usunome;

    @Column(name = "USUEMAIL", length = 100, unique = true)
    private String usuemail;

    @Column(name = "USUSENHA", length = 100)
    private String ususenha;

    @Column(name = "USUTELEFONE", length = 20)
    private String telefone;

    @Column(name = "USECPF", length = 20)
    private String cpf;

    @Column(name = "USECEP", length = 20)
    private String cep;

    @Column(name = "USUNOMESOCIAL")
    private Boolean nomeSocial;

    @Column(name = "PSIINSTAGRAM")
    private String instagram;

    // Campo para tipo de usuário
    @Enumerated(EnumType.STRING)
    @Column(name = "USUTIPO", length = 20)
    private TipoUsuario usutipo;

    // Campo específico para psicólogos
    @Column(name = "USUCRP", length = 20)
    private String crp;

    // Getters e Setters
    public Integer getUsucodigo() {
        return usucodigo;
    }

    public void setUsucodigo(Integer usucodigo) {
        this.usucodigo = usucodigo;
    }

    public String getUsunome() {
        return usunome;
    }

    public void setUsunome(String usunome) {
        this.usunome = usunome;
    }

    public String getUsuemail() {
        return usuemail;
    }

    public void setUsuemail(String usuemail) {
        this.usuemail = usuemail;
    }

    public String getUsusenha() {
        return ususenha;
    }

    public void setUsusenha(String ususenha) {
        this.ususenha = ususenha;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public Boolean getNomeSocial() {
        return nomeSocial;
    }

    public void setNomeSocial(Boolean nomeSocial) {
        this.nomeSocial = nomeSocial;
    }

    public String getInstagram() {
        return instagram;
    }

    public void setInstagram(String instagram) {
        this.instagram = instagram;
    }

    public TipoUsuario getUsutipo() {
        return usutipo;
    }

    public void setUsutipo(TipoUsuario usutipo) {
        this.usutipo = usutipo;
    }

    public String getCrp() {
        return crp;
    }

    public void setCrp(String crp) {
        this.crp = crp;
    }
}