package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.ResetSenha;
import com.example.demo.repository.ResetSenhaRepository;
@Service
public class ResetSenhaService {

    @Autowired
    private ResetSenhaRepository repository;

    public String gerarToken(int userId) {
        String token = String.format("%06d", (int)(Math.random() * 1_000_000));
        ResetSenha reset = new ResetSenha();
        reset.setUserId(userId);
        reset.setToken(token);
        reset.setExpiration(LocalDateTime.now().plusMinutes(15));
        reset.setUsed(false);
        repository.save(reset);
        return token;
    }

    public boolean validarToken(int userId, String token) {
        Optional<ResetSenha> reset = repository.findByUserIdAndTokenAndUsedFalse(userId, token);
        if (reset.isPresent() && reset.get().getExpiration().isAfter(LocalDateTime.now())) {
            reset.get().setUsed(true);
            repository.save(reset.get());
            return true;
        }
        return false;
    }
}