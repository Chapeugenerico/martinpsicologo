package com.example.demo.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.math.BigDecimal;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.SessaoAgendadaDTO;
import com.example.demo.model.Sessao;
import com.example.demo.repository.SessaoRepository;

@CrossOrigin(origins = "http://localhost:8080")
@RestController
@RequestMapping("/api/sessoes")

public class SessaoController {

    @Autowired
    private SessaoRepository sessaoRepository;

    // Buscar todas as sessões de um paciente
    @GetMapping("/paciente/{pacienteId}")
    public List<Sessao> getSessoesByPaciente(@PathVariable Long pacienteId) {
        return sessaoRepository.findByPacienteId(pacienteId);
    }

    // Buscar uma sessão específica
    @GetMapping("/{id}")
    public ResponseEntity<Sessao> getSessao(@PathVariable Long id) {
        Optional<Sessao> sessao = sessaoRepository.findById(id);
        return sessao.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Sessao> getAllSessoes() {
        return sessaoRepository.findAll();
    }

    @GetMapping("/paciente/{pacienteId}/ultima")
    public ResponseEntity<Sessao> getUltimaSessao(@PathVariable Long pacienteId) {
        Optional<Sessao> sessao = sessaoRepository.findFirstByPacienteIdOrderByProximaSessaoDesc(pacienteId);
        return sessao.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Criar uma nova sessão
    @PostMapping
    public Sessao createSessao(@RequestBody Sessao sessao) {
        return sessaoRepository.save(sessao);
    }

    // Atualizar uma sessão existente
    @PutMapping("/{id}")
    public ResponseEntity<Sessao> updateSessao(@PathVariable Long id, @RequestBody Sessao sessaoDetails) {
        Optional<Sessao> optionalSessao = sessaoRepository.findById(id);
        if (optionalSessao.isPresent()) {
            Sessao sessao = optionalSessao.get();
            sessao.setValorSessao(sessaoDetails.getValorSessao());
            sessao.setQuantidadeSessoes(sessaoDetails.getQuantidadeSessoes());
            sessao.setSessoesRestantes(sessaoDetails.getSessoesRestantes());
            sessao.setModalidade(sessaoDetails.getModalidade());
            sessao.setFrequencia(sessaoDetails.getFrequencia());
            sessao.setProximaSessao(sessaoDetails.getProximaSessao());
            sessao.setStatusPagamento(sessaoDetails.getStatusPagamento());
            Sessao updatedSessao = sessaoRepository.save(sessao);
            return ResponseEntity.ok(updatedSessao);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/status")
    public String atualizarStatus(@PathVariable long id, @RequestBody String status) {
        Optional<Sessao> sessao = sessaoRepository.findById(id);
        if (sessao.isPresent()){
            sessao.get().setStatusPagamento(status);
            sessaoRepository.save(sessao.get());
            return "Status atualizado para: "+status;
        }     
        return "Sessão nao encontrada";
    }

    @PutMapping("/{id}/preco")
    public String atualizarPreço(@PathVariable long id, @RequestBody BigDecimal preco){
        Optional<Sessao> sessao = sessaoRepository.findById(id);
        if (sessao.isPresent()){
            sessao.get().setValorSessao(preco);
            sessaoRepository.save(sessao.get());
            return "Preço atualizado para: "+preco;
        }     
        return "Sessão nao encontrada";
    }

    // Deletar uma sessão
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSessao(@PathVariable Long id) {
        if (sessaoRepository.existsById(id)) {
            sessaoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Obter sessões agendadas como DTOs
    @GetMapping("/paciente/{pacienteId}/agendadas")
    public List<SessaoAgendadaDTO> getSessoesAgendadas(@PathVariable Long pacienteId) {
        List<Sessao> sessoes = sessaoRepository.findByPacienteId(pacienteId);
        
        return sessoes.stream()
                .filter(sessao -> sessao.getProximaSessao() != null) // Só as com data
                .map(SessaoAgendadaDTO::new)
                .collect(Collectors.toList());
    }

}