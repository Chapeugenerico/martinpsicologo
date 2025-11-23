package com.example.demo.controller;

import com.example.demo.model.Usuario;
import com.example.demo.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/psicologos")
@CrossOrigin(origins = "http://localhost:8080")
public class PsicologoController {

    private final UsuarioService usuarioService;

    public PsicologoController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getPsicologoById(@PathVariable Integer id) {
        Optional<Usuario> psicologo = usuarioService.buscarPsicologoPorId(id);
        return psicologo.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> updatePsicologo(@PathVariable Integer id, 
                                                  @RequestBody Usuario usuarioDetails) {
        try {
            Usuario updatedPsicologo = usuarioService.atualizarPsicologo(id, usuarioDetails);
            return ResponseEntity.ok(updatedPsicologo);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}