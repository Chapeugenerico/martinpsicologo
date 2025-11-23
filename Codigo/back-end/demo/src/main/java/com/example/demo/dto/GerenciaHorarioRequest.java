
package com.example.demo.dto;

public class GerenciaHorarioRequest {
    private String diaSemana;
    private String horaInicio;
    private String horaFim;
    private String repeticao;
    private String alcance;

    // Getters and Setters
    public String getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(String diaSemana) {
        this.diaSemana = diaSemana;
    }

    public String getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(String horaInicio) {
        this.horaInicio = horaInicio;
    }

    public String getHoraFim() {
        return horaFim;
    }

    public void setHoraFim(String horaFim) {
        this.horaFim = horaFim;
    }

    public String getRepeticao() {
        return repeticao;
    }

    public void setRepeticao(String repeticao) {
        this.repeticao = repeticao;
    }
    
    public String getAlcance() {
        return alcance;
    }
    
    public void setAlcance(String alcance) {
        this.alcance = alcance;
    }
}
