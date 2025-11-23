package com.example.demo.repository;

import com.example.demo.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Integer> {
    List<Agendamento> findByUsuCodigo(Integer usuCodigo);
    
    //me
    List<Agendamento> findByDataAndHorarioBetween(LocalDate data, LocalTime startTime, LocalTime endTime);
}