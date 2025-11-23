package com.example.demo.controller;


import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.AgendamentoRequest;
import com.example.demo.model.Agendamento;
import com.example.demo.service.AgendamentoService;

@RestController
@RequestMapping("/agendamentos")
public class AgendamentoController {

    @Autowired
    private AgendamentoService service;
    

    @GetMapping
    public List<Agendamento> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/rendaData")
    public BigDecimal rendaPorData(@RequestParam LocalDate dataInicio, LocalDate dataFim){
        List<Agendamento> lista = service.listarTodos();
        BigDecimal rendaPeriodo = new BigDecimal(0);
        for (int i=0; i<lista.size(); i++){
            if (lista.get(i).getData().isAfter(dataInicio) && lista.get(i).getData().isBefore(dataFim)){
                rendaPeriodo = rendaPeriodo.add(lista.get(i).getValorSessao());
            }
        }
        return rendaPeriodo;
    }

    @GetMapping("/rendaMediaData")
    public BigDecimal precoMedioData(@RequestParam LocalDate dataInicio, @RequestParam LocalDate dataFim) {
        List<Agendamento> lista = service.listarTodos();
        BigDecimal rendaPeriodo = BigDecimal.ZERO;
        int contador = 0;

        for (Agendamento ag : lista) {
            LocalDate data = ag.getData();
            if (!data.isBefore(dataInicio) && !data.isAfter(dataFim)) {
                rendaPeriodo = rendaPeriodo.add(ag.getValorSessao());
                contador++;
            }
        }

        if (contador == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal divisor = new BigDecimal(contador);
        BigDecimal media = rendaPeriodo.divide(divisor, 2, RoundingMode.HALF_UP);
        return media;
    }

    @GetMapping("/sessoesData")
    public int sessoesData(@RequestParam LocalDate dataInicio, LocalDate dataFim){
        List<Agendamento> lista = service.listarTodos();
        for (int i=0; i<lista.size(); i++){
            if (lista.get(i).getData().isAfter(dataFim) && lista.get(i).getData().isBefore(dataInicio)){
                lista.remove(i);
            }
        }
        return lista.size();
    }

    @PostMapping
public ResponseEntity<Agendamento> criar(@RequestBody AgendamentoRequest dto) {
    try {
        System.out.println("Recebendo agendamento DTO: " + dto);

        Agendamento ag = new Agendamento();
        ag.setData(LocalDate.parse(dto.getData()));

        // Convertendo String → LocalTime
        ag.setHorario(LocalTime.parse(dto.getHorario()));

        ag.setPaciente(dto.getPaciente());

        /* 
        // Só seta se existir
        if (dto.getEmail() != null) {
            ag.setEmail(dto.getEmail());
        }
        if (dto.getTelefone() != null) {
            ag.setTelefone(dto.getTelefone());
        }*/

        // Removido porque sua entidade NÃO tem este campo
        // ag.setObservacoes(dto.getObservacoes());

        ag.setIsOnline(dto.getIsOnline());
        ag.setValorSessao(dto.getValorSessao());
        ag.setQuantidadePacote(dto.getQuantidadePacote());
        ag.setQuantidadeRestante(dto.getQuantidadeRestante());

        
        ag.setUsuCodigo(dto.getUsuCodigo());

        Agendamento salvo = service.salvar(ag);
        return ResponseEntity.ok(salvo);

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.badRequest().build();
    }
}



    @GetMapping("/{id}")
    public Optional<Agendamento> buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
public ResponseEntity<?> deletar(
        @PathVariable Integer id,
        @RequestHeader("usuCodigo") Integer usuCodigo) {

    Optional<Agendamento> agOpt = service.buscarPorId(id);
    if (!agOpt.isPresent()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Agendamento não encontrado");
    }

    Agendamento ag = agOpt.get();

    // Verifica se o agendamento pertence ao usuário logado
    if (!ag.getUsuCodigo().equals(usuCodigo)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Você não tem permissão para excluir este agendamento");
    }

    // Regra das 12 horas
    LocalDateTime sessao = LocalDateTime.of(ag.getData(), ag.getHorario());
    LocalDateTime limite = LocalDateTime.now().plusHours(12);

    if (sessao.isBefore(limite)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Cancelamento permitido somente até 12 horas antes da sessão.");
    }

    service.deletar(id);
    return ResponseEntity.ok("Agendamento cancelado com sucesso");
}



    @GetMapping("/usuario/{usuCodigo}")
    public List<Agendamento> listarPorUsuario(@PathVariable Integer usuCodigo) {
        return service.listarPorUsuario(usuCodigo);
    }

    @GetMapping("/psicologo")
    public ResponseEntity<List<Agendamento>> getAgendamentosPsicologo() {
        List<Agendamento> agendamentos = service.listarTodos();
        return ResponseEntity.ok(agendamentos);
    }


    
}