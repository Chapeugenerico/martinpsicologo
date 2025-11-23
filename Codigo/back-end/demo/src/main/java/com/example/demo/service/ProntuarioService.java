package com.example.demo.service;

import com.example.demo.model.Prontuario;
import com.example.demo.model.Paciente;
import com.example.demo.repository.ProntuarioRepository;
import com.example.demo.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProntuarioService {
    
    @Autowired
    private ProntuarioRepository prontuarioRepository;
    
    @Autowired
    private PacienteRepository pacienteRepository;
    
    public List<Prontuario> findAll() {
        return prontuarioRepository.findAll();
    }
    
    public Optional<Prontuario> findById(Long id) {
        return prontuarioRepository.findById(id);
    }
    
    public List<Prontuario> findByPacienteId(Long pacienteId) {
        return prontuarioRepository.findByPacienteId(pacienteId);
    }
    
    public Optional<Prontuario> findLatestByPacienteId(Long pacienteId) {
        return prontuarioRepository.findFirstByPacienteIdOrderByCreatedAtDesc(pacienteId);
    }
    
    public Prontuario save(Prontuario prontuario) {
        return prontuarioRepository.save(prontuario);
    }
    
    public Prontuario createProntuario(Long pacienteId, String tipoPaciente) {
        Optional<Paciente> pacienteOpt = pacienteRepository.findById(pacienteId);
        if (pacienteOpt.isPresent()) {
            Prontuario prontuario = new Prontuario(pacienteOpt.get(), tipoPaciente);
            return prontuarioRepository.save(prontuario);
        }
        throw new RuntimeException("Paciente não encontrado com ID: " + pacienteId);
    }
    
    public void delete(Long id) {
        prontuarioRepository.deleteById(id);
    }
    
    public boolean existsByPacienteId(Long pacienteId) {
        return prontuarioRepository.existsByPacienteId(pacienteId);
    }
}