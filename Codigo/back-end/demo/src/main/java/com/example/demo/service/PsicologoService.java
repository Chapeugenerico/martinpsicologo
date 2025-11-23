/*
 src/main/java/com/example/demo/service/PsicologoService.java
package com.example.demo.service;

import com.example.demo.entity.Psicologo;
import com.example.demo.repository.PsicologoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PsicologoService {
    
    @Autowired
    private PsicologoRepository psicologoRepository;
    
    public List<Psicologo> findAll() {
        return psicologoRepository.findAll();
    }
    
    public Optional<Psicologo> findById(Long id) {
        return psicologoRepository.findById(id);
    }
    
    public Optional<Psicologo> findByEmail(String email) {
        return psicologoRepository.findByEmail(email);
    }
    
    public Psicologo save(Psicologo psicologo) {
        return psicologoRepository.save(psicologo);
    }
    
    public Psicologo update(Long id, Psicologo psicologoDetails) {
        Psicologo psicologo = psicologoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Psicólogo não encontrado"));
        
        psicologo.setNome(psicologoDetails.getNome());
        psicologo.setEmail(psicologoDetails.getEmail());
        psicologo.setTelefone(psicologoDetails.getTelefone());
        psicologo.setInstagram(psicologoDetails.getInstagram());
        
        return psicologoRepository.save(psicologo);
    }
    
    public void delete(Long id) {
        psicologoRepository.deleteById(id);
    }
}


    */