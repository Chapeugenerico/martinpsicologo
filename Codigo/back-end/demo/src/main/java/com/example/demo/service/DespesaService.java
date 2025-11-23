package com.example.demo.service;

import com.example.demo.model.Despesa;
import com.example.demo.repository.DespesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DespesaService {

    @Autowired
    private DespesaRepository despesaRepository;

    public List<Despesa> salvarDespesasDoMes(List<Despesa> despesas) {
        return despesaRepository.saveAll(despesas);
    }

    public List<Map<String, Object>> listarAgrupadoPorMes() {
    List<Despesa> despesas = despesaRepository.findAll();

    Map<String, Map<String, Object>> agrupado = new HashMap<>();

    for (Despesa d : despesas) {
        String chave = d.getMes() + "-" + d.getAno();

        Map<String, Object> mesInfo = agrupado.computeIfAbsent(chave, k -> {
            Map<String, Object> novo = new HashMap<>();
            novo.put("mes", d.getMes());
            novo.put("ano", d.getAno());
            novo.put("total", 0.0);
            novo.put("categorias", new ArrayList<Map<String, Object>>());
            return novo;
        });

        List<Map<String, Object>> categorias = (List<Map<String, Object>>) mesInfo.get("categorias");
        categorias.add(Map.of("categoria", d.getCategoria(), "valor", d.getValor()));

        double totalAtual = (double) mesInfo.get("total");
        mesInfo.put("total", totalAtual + d.getValor());
    }

    return new ArrayList<>(agrupado.values());
}

}
