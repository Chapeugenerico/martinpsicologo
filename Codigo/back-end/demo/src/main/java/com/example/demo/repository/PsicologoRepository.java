/* 

// src/main/java/com/example/demo/repository/PsicologoRepository.java
package com.example.demo.repository;

import com.example.demo.entity.Psicologo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PsicologoRepository extends JpaRepository<Psicologo, Long> {
    Optional<Psicologo> findByEmail(String email);
}
    */