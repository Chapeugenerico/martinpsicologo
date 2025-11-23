package com.example.demo.repository;

import com.example.demo.model.Prontuario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ProntuarioRepository extends JpaRepository<Prontuario, Long> {
    
    List<Prontuario> findByPacienteId(Long pacienteId);
    
    Optional<Prontuario> findFirstByPacienteIdOrderByCreatedAtDesc(Long pacienteId);
    
    @Query("SELECT p FROM Prontuario p WHERE p.paciente.id = :pacienteId ORDER BY p.createdAt DESC")
    List<Prontuario> findHistoricoByPacienteId(@Param("pacienteId") Long pacienteId);
    
    boolean existsByPacienteId(Long pacienteId);
}