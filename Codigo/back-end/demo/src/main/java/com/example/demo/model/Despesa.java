package com.example.demo.model;

import jakarta.persistence.*; 

@Entity
@Table(name = "despesas")

public class Despesa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String mes;

    @Column(nullable = false)
    private Integer ano;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Categoria categoria;

    @Column(nullable = false)
    private Double valor;

    @Column(name = "psicologo_id")
    private Long psicologoId;

    private Double taxaDespesa;

    // Construtores
    public Despesa() {
    }

    public Despesa(String mes, Integer ano, Categoria categoria, Double valor, Double taxaDespesa) {
        this.mes = mes;
        this.ano = ano;
        this.categoria = categoria;
        this.valor = valor;
        this.taxaDespesa = taxaDespesa;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMes() {
        return mes;
    }

    public void setMes(String mes) {
        this.mes = mes;
    }

    public Integer getAno() {
        return ano;
    }

    public void setAno(Integer ano) {
        this.ano = ano;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public Double getTaxaDespesa() {
        return taxaDespesa;
    }

    public void setTaxaDespesa(Double taxaDespesa) {
        this.taxaDespesa = taxaDespesa;
    }

    public Long getPsicologoId() {
        return psicologoId;
    }
}
