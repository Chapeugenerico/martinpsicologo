package com.example.demo.dto;

//Recebe dados de cadastro do front-end

public class UsuarioRequest {
    private String email;
    private String senha;
    private String nome;
    private String telefone;
    private String cpf;
    private String cep;
    private Boolean nomeSocial;
    private String tipo;
    private String crp; // Apenas para psicólogos

    // Getters e Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getCrp() {
        return crp;
    }

    public void setCrp(String crp) {
        this.crp = crp;
    }
}