package com.example.demo.controller;

import com.example.demo.model.Despesa;
import com.example.demo.repository.DespesaRepository;
import com.example.demo.service.DespesaService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/despesas")
@CrossOrigin(origins = "*")
public class DespesaController {
    
    @Autowired
    private DespesaRepository despesaRepository;

    @Autowired
    private DespesaService despesaService;
    
    @PostMapping("/salvar-mes")
    public ResponseEntity<List<Despesa>> salvarDespesasDoMes(@RequestBody List<Despesa> despesas) {
    List<Despesa> salvas = despesaService.salvarDespesasDoMes(despesas);
    return ResponseEntity.ok(salvas);
}

    // Listar todas as despesas
    @GetMapping
    public List<Despesa> getAllDespesas() {
        return despesaRepository.findAll();
    }

    // Listar despesas agrupadas por mês e ano
    @GetMapping("/agrupado")
public ResponseEntity<List<Map<String, Object>>> getDespesasAgrupadas() {
    return ResponseEntity.ok(despesaService.listarAgrupadoPorMes());
}

    
    // Buscar despesa por ID
    @GetMapping("/{id}")
    public ResponseEntity<Despesa> getDespesaById(@PathVariable Long id) {
        Optional<Despesa> despesa = despesaRepository.findById(id);
        if (despesa.isPresent()) {
            return ResponseEntity.ok(despesa.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    
    
    // Criar nova despesa
    @PostMapping
    public Despesa createDespesa(@RequestBody Despesa despesa) {
        return despesaRepository.save(despesa);
    }
    
    // Atualizar despesa existente
    @PutMapping("/{id}")
    public ResponseEntity<Despesa> updateDespesa(@PathVariable Long id, @RequestBody Despesa despesaDetails) {
        Optional<Despesa> despesaOptional = despesaRepository.findById(id);
        if (despesaOptional.isPresent()) {
            Despesa despesa = despesaOptional.get();
            despesa.setMes(despesaDetails.getMes());
            despesa.setAno(despesaDetails.getAno());
            despesa.setCategoria(despesaDetails.getCategoria());
            despesa.setValor(despesaDetails.getValor());
            despesa.setTaxaDespesa(despesaDetails.getTaxaDespesa());
            
            Despesa updatedDespesa = despesaRepository.save(despesa);
            return ResponseEntity.ok(updatedDespesa);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Deletar despesa
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDespesa(@PathVariable Long id) {
        if (despesaRepository.existsById(id)) {
            despesaRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Buscar despesas por mês e ano
    @GetMapping("/filtro")
    public List<Despesa> getDespesasByMesAno(@RequestParam String mes, @RequestParam Integer ano) {
        return despesaRepository.findByMesAndAno(mes, ano);
    }

    // Salvar uma lista de despesas
    @PostMapping("/lista")
    public List<Despesa> createDespesas(@RequestBody List<Despesa> despesas) {
        return despesaRepository.saveAll(despesas);
    }

    // Deletar despesas por mês e ano
    @DeleteMapping
    public ResponseEntity<?> deleteDespesasByMesAno(@RequestParam String mes, @RequestParam Integer ano) {
    List<Despesa> despesas = despesaRepository.findByMesAndAno(mes, ano);
    despesaRepository.deleteAll(despesas);
        return ResponseEntity.ok().build();
}





}