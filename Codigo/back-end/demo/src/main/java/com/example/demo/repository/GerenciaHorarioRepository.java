package com.example.demo.repository;

import com.example.demo.model.GerenciaHorario;
import com.example.demo.model.DiaSemana;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.Optional;

@Repository
public interface GerenciaHorarioRepository extends JpaRepository<GerenciaHorario, Integer> {

	// Verifica se já existe um horário com mesmo dia e mesmo intervalo
	boolean existsByDiaSemanaAndHoraInicioAndHoraFim(DiaSemana diaSemana, LocalTime horaInicio, LocalTime horaFim);


}
