package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Sessao;

@Repository
public interface SessaoRepository extends JpaRepository<Sessao, Long> {
    List<Sessao> findByPacienteId(Long pacienteId);
    Optional<Sessao> findByIdAndPacienteId(Long id, Long pacienteId);
    Optional<Sessao> findFirstByPacienteIdOrderByProximaSessaoDesc(Long pacienteId);
}