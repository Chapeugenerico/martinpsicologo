package com.example.demo.controller;

import com.example.demo.model.Prontuario;
import com.example.demo.service.ProntuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/prontuarios")
@CrossOrigin(origins = "http://localhost:3000") // Ajuste para a URL do seu frontend
public class ProntuarioController {
    
    @Autowired
    private ProntuarioService prontuarioService;
    
    @GetMapping
    public List<Prontuario> getAllProntuarios() {
        return prontuarioService.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Prontuario> getProntuarioById(@PathVariable Long id) {
        Optional<Prontuario> prontuario = prontuarioService.findById(id);
        return prontuario.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<Prontuario> getProntuarioByPacienteId(@PathVariable Long pacienteId) {
    Optional<Prontuario> prontuario = prontuarioService.findLatestByPacienteId(pacienteId);
    return prontuario.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());

    }
    
    @GetMapping("/paciente/{pacienteId}/latest")
    public ResponseEntity<Prontuario> getLatestProntuarioByPaciente(@PathVariable Long pacienteId) {
        Optional<Prontuario> prontuario = prontuarioService.findLatestByPacienteId(pacienteId);
        return prontuario.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public Prontuario createProntuario(@RequestBody Prontuario prontuario) {
        return prontuarioService.save(prontuario);
    }
    
    @PostMapping("/paciente/{pacienteId}")
    public ResponseEntity<Prontuario> createProntuarioForPaciente(
            @PathVariable Long pacienteId,
            @RequestParam String tipoPaciente) {
        try {
            Prontuario prontuario = prontuarioService.createProntuario(pacienteId, tipoPaciente);
            return ResponseEntity.ok(prontuario);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Prontuario> updateProntuario(@PathVariable Long id, @RequestBody Prontuario prontuarioDetails) {
        Optional<Prontuario> prontuarioOpt = prontuarioService.findById(id);
        
        if (prontuarioOpt.isPresent()) {
            Prontuario prontuario = prontuarioOpt.get();
            
            // Atualiza os campos
            prontuario.setIdade(prontuarioDetails.getIdade());
            prontuario.setDataNascimento(prontuarioDetails.getDataNascimento());
            prontuario.setEstadoCivil(prontuarioDetails.getEstadoCivil());
            prontuario.setProfissao(prontuarioDetails.getProfissao());
            prontuario.setReligiao(prontuarioDetails.getReligiao());
            prontuario.setFilhos(prontuarioDetails.getFilhos());
            prontuario.setResideCom(prontuarioDetails.getResideCom());
            prontuario.setTabagismo(prontuarioDetails.getTabagismo());
            prontuario.setUsoSubstancias(prontuarioDetails.getUsoSubstancias());
            prontuario.setQueixaPrincipal(prontuarioDetails.getQueixaPrincipal());
            prontuario.setHistoricoFamiliar(prontuarioDetails.getHistoricoFamiliar());
            prontuario.setNotas(prontuarioDetails.getNotas());
            
            Prontuario updatedProntuario = prontuarioService.save(prontuario);
            return ResponseEntity.ok(updatedProntuario);
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProntuario(@PathVariable Long id) {
        prontuarioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}