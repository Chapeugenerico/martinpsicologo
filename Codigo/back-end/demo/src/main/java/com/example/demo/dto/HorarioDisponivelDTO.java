package com.example.demo.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class HorarioDisponivelDTO {
    private LocalDate data;
    private LocalTime horarioInicio;
    private LocalTime horarioFim;
    private boolean disponivel;

    public HorarioDisponivelDTO() {
    }

    public HorarioDisponivelDTO(LocalDate data, LocalTime horarioInicio, LocalTime horarioFim, boolean disponivel) {
        this.data = data;
        this.horarioInicio = horarioInicio;
        this.horarioFim = horarioFim;
        this.disponivel = disponivel;
    }

    // Getters e Setters
    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public LocalTime getHorarioInicio() {
        return horarioInicio;
    }

    public void setHorarioInicio(LocalTime horarioInicio) {
        this.horarioInicio = horarioInicio;
    }

    public LocalTime getHorarioFim() {
        return horarioFim;
    }

    public void setHorarioFim(LocalTime horarioFim) {
        this.horarioFim = horarioFim;
    }

    public boolean isDisponivel() {
        return disponivel;
    }

    public void setDisponivel(boolean disponivel) {
        this.disponivel = disponivel;
    }
}