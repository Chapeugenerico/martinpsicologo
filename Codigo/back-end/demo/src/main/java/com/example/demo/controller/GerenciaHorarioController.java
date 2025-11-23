package com.example.demo.controller;

import com.example.demo.dto.GerenciaHorarioRequest;
import com.example.demo.dto.HorarioDisponivelDTO;
import com.example.demo.model.Agendamento;
import com.example.demo.model.GerenciaHorario;
import com.example.demo.service.GerenciaHorarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/horarios") // Base URL para horários de disponibilidade
@CrossOrigin(origins = "*")
public class GerenciaHorarioController {

    private final GerenciaHorarioService gerenciaHorarioService;

    public GerenciaHorarioController(GerenciaHorarioService gerenciaHorarioService) {
        this.gerenciaHorarioService = gerenciaHorarioService;
    }

    @PostMapping
    public ResponseEntity<GerenciaHorario> createGerenciaHorario(@RequestBody GerenciaHorarioRequest request) {
        GerenciaHorario gerenciaHorario = gerenciaHorarioService.createGerenciaHorario(request);
        return ResponseEntity.ok(gerenciaHorario);
    }

    @GetMapping
    public ResponseEntity<List<GerenciaHorario>> listAll() {
        return ResponseEntity.ok(gerenciaHorarioService.findAll());
    }

    // CORREÇÃO: ID alterado de Long para Integer
    // Rota: DELETE /api/horarios/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        // OBS: Você deve adaptar o Service e Repositório para usar Integer
        gerenciaHorarioService.deleteById(id); 
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/disponiveis")
    public ResponseEntity<List<HorarioDisponivelDTO>> getHorariosDisponiveis(
            @RequestParam(required = false) String data) {
        List<HorarioDisponivelDTO> horariosDisponiveis = gerenciaHorarioService.getHorariosDisponiveis(data);
        return ResponseEntity.ok(horariosDisponiveis);
    }

    // CORREÇÃO: ID alterado de Long para Integer
    // Rota: DELETE /api/horarios/agendamentos/{id} (Usado pelo JS para cancelar)
    @DeleteMapping("/agendamentos/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Integer id) {
        // OBS: Você deve adaptar o Service e Repositório para usar Integer
        gerenciaHorarioService.cancelarAgendamento(id);
        return ResponseEntity.noContent().build();
    }

    // CORREÇÃO: ID alterado de Long para Integer, e alteração do payload para aceitar 
    // "data" e "horario" em vez de "novaDataHora", refletindo a chamada do JavaScript.
    // Rota: PATCH /api/horarios/agendamentos/{id} (Caso o JS seja corrigido para chamar esta rota)
    @PatchMapping("/agendamentos/{id}")
    public ResponseEntity<Agendamento> reagendar(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {

        // O JS estava enviando { data: newDate, horario: newTime }
        String data = body.get("data");
        String horario = body.get("horario");
        
        // OBS: Você deve adaptar a assinatura do Service
        Agendamento atualizado = gerenciaHorarioService.reagendarAgendamento(id, data, horario); 
        return ResponseEntity.ok(atualizado);
    }
}