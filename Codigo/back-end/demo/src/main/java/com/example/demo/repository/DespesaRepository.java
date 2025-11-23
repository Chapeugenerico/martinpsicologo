package com.example.demo.repository;

import com.example.demo.model.Despesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DespesaRepository extends JpaRepository<Despesa, Long> {
    List<Despesa> findByMesAndAno(String mes, Integer ano);

    List<Despesa> findByMesAndAnoAndPsicologoId(String mes, Integer ano, Long psicologoId);
}

