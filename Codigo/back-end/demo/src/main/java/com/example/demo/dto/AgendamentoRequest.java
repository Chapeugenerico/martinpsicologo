package com.example.demo.dto;

import java.math.BigDecimal;

public class AgendamentoRequest {
    private String data;
    private String horario;
    private String paciente;
    private String email;
    private String telefone;
    private String observacoes;
    private Boolean isOnline;
    private BigDecimal valorSessao;
    private Integer quantidadePacote;
    private Integer quantidadeRestante;
    private Integer usuCodigo;
    
    // Getters e Setters
    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
    
    public String getHorario() { return horario; }
    public void setHorario(String horario) { this.horario = horario; }
    
    public String getPaciente() { return paciente; }
    public void setPaciente(String paciente) { this.paciente = paciente; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    
    public Boolean getIsOnline() { return isOnline; }
    public void setIsOnline(Boolean isOnline) { this.isOnline = isOnline; }
    
    public BigDecimal getValorSessao() { return valorSessao; }
    public void setValorSessao(BigDecimal valorSessao) { this.valorSessao = valorSessao; }
    
    public Integer getQuantidadePacote() { return quantidadePacote; }
    public void setQuantidadePacote(Integer quantidadePacote) { this.quantidadePacote = quantidadePacote; }
    
    public Integer getQuantidadeRestante() { return quantidadeRestante; }
    public void setQuantidadeRestante(Integer quantidadeRestante) { this.quantidadeRestante = quantidadeRestante; }
    
    public Integer getUsuCodigo() { return usuCodigo; }
    public void setUsuCodigo(Integer usuCodigo) { this.usuCodigo = usuCodigo; }
    
    // toString para debug
    @Override
    public String toString() {
        return "AgendamentoRequest{" +
                "data='" + data + '\'' +
                ", horario='" + horario + '\'' +
                ", paciente='" + paciente + '\'' +
                ", email='" + email + '\'' +
                ", telefone='" + telefone + '\'' +
                ", observacoes='" + observacoes + '\'' +
                ", isOnline=" + isOnline +
                ", valorSessao=" + valorSessao +
                ", quantidadePacote=" + quantidadePacote +
                ", quantidadeRestante=" + quantidadeRestante +
                ", usuCodigo=" + usuCodigo +
                '}';
    }
}