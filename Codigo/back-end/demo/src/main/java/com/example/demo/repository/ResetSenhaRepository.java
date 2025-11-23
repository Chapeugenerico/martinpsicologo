package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.ResetSenha;

public interface ResetSenhaRepository extends JpaRepository<ResetSenha, Integer> {
    Optional<ResetSenha> findByUserIdAndTokenAndUsedFalse(int userId, String token);
}
