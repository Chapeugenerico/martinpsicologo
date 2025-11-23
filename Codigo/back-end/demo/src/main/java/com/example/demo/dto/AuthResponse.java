package com.example.demo.dto;

// Envia respostas padronizadas para o frontend

public class AuthResponse {
    private boolean success;
    private String message;
    private String nome;
    private String email;
    private String tipo;
    private Integer codigo;

    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public AuthResponse(boolean success, String message, String nome, String email, String tipo, Integer codigo) {
        this.success = success;
        this.message = message;
        this.nome = nome;
        this.email = email;
        this.tipo = tipo;
        this.codigo = codigo;
    }

    // Getters e Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Integer getCodigo() {
        return codigo;
    }

    public void setCodigo(Integer codigo) {
        this.codigo = codigo;
    }
}