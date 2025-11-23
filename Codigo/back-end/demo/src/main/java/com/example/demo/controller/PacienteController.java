package com.example.demo.controller;

import com.example.demo.model.Paciente;
import com.example.demo.model.Prontuario;
import com.example.demo.model.Sessao;
import com.example.demo.repository.PacienteRepository;
import com.example.demo.repository.ProntuarioRepository;
import com.example.demo.repository.SessaoRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pacientes")
@CrossOrigin(origins = "http://localhost:3000") // Ajuste para a porta do seu frontend
public class PacienteController {

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private SessaoRepository sessaoRepository;

    @Autowired
    private ProntuarioRepository prontuarioRepository;

    @GetMapping
    public List<Paciente> getAllPacientes() {
        return pacienteRepository.findAll();
    }

    @PostMapping
    public Paciente createPaciente(@RequestBody Paciente paciente) {
        return pacienteRepository.save(paciente);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Paciente> updatePaciente(@PathVariable Long id, @RequestBody Paciente pacienteDetails) {
        Optional<Paciente> optionalPaciente = pacienteRepository.findById(id);

        if (optionalPaciente.isPresent()) {
            Paciente paciente = optionalPaciente.get();
            paciente.setNome(pacienteDetails.getNome());
            paciente.setEmail(pacienteDetails.getEmail());
            paciente.setTelefone(pacienteDetails.getTelefone());

            Paciente updatedPaciente = pacienteRepository.save(paciente);
            return ResponseEntity.ok(updatedPaciente);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deletePaciente(@PathVariable Long id) {
        try {
            if (!pacienteRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            // Exclui todas as sessões associadas ao paciente
            List<Sessao> sessoes = sessaoRepository.findByPacienteId(id);
            for (Sessao sessao : sessoes) {
                sessaoRepository.delete(sessao);
            }

            // Exclui todos os prontuários associados ao paciente
            List<Prontuario> prontuarios = prontuarioRepository.findByPacienteId(id);
            for (Prontuario prontuario : prontuarios) {
                prontuarioRepository.delete(prontuario);
            }

            // Agora exclui o paciente
            pacienteRepository.deleteById(id);
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body("Erro ao excluir paciente: " + e.getMessage());
        }
    }

}