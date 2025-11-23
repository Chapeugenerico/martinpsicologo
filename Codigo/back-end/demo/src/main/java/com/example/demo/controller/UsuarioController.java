package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Usuario;
import com.example.demo.service.ResetSenhaService;
import com.example.demo.service.UsuarioService;
import com.example.demo.service.EmailService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    @Autowired
    private ResetSenhaService Resetservice;

    @Autowired
    private EmailService Emailservice;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping
    public List<Usuario> listar() {
        return service.listarTodos();
    }

    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Usuario usuario) {
        try {
            System.out.println("=== CADASTRO DEBUG ===");
            System.out.println("Usuario recebido: " + usuario.getUsunome());
            System.out.println("Email: " + usuario.getUsuemail());
            System.out.println("Telefone: " + usuario.getTelefone());
            System.out.println("CPF: " + usuario.getCpf());
            System.out.println("CEP: " + usuario.getCep());
            System.out.println("Nome Social: " + usuario.getNomeSocial());

            Usuario usuarioSalvo = service.salvar(usuario);

            System.out.println("Usuario salvo com ID: " + usuarioSalvo.getUsucodigo());
            System.out.println("=== FIM DEBUG ===");

            return ResponseEntity.ok(usuarioSalvo);
        } catch (Exception e) {
            System.err.println("ERRO ao cadastrar: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erro ao cadastrar usuário: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario usuario) {
        try {
            // CORREÇÃO: Use Optional corretamente
            Optional<Usuario> userOpt = service.login(usuario.getUsuemail(), usuario.getUsusenha());

            if (userOpt.isPresent()) {
                Usuario user = userOpt.get();
                // Remove a senha da resposta por segurança
                user.setUsusenha(null);
                return ResponseEntity.ok(user);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email ou senha inválidos.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erro no servidor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/esqueceu-senha")
    public ResponseEntity<?> esqueceuSenha(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            System.out.println("=== ESQUECI SENHA DEBUG ===");
            System.out.println("Email solicitado: " + email);

            Optional<Usuario> usuarioOpt = service.buscarPorEmail(email);

            if (usuarioOpt.isPresent()) {
                // Em produção, você enviaria um email com código de verificação
                // Por enquanto, vamos apenas retornar sucesso
                System.out.println("Usuário encontrado: " + usuarioOpt.get().getUsunome());

                Map<String, String> response = new HashMap<>();
                response.put("message", "Email encontrado. Você pode redefinir sua senha.");
                response.put("email", email);

                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email não encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

        } catch (Exception e) {
            System.err.println("ERRO em esqueceu-senha: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erro ao processar solicitação: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<?> redefinirSenha(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String novaSenha = request.get("novaSenha");

            System.out.println("=== REDEFINIR SENHA DEBUG ===");
            System.out.println("Email: " + email);
            System.out.println("Nova senha: " + novaSenha);

            Optional<Usuario> usuarioOpt = service.buscarPorEmail(email);

            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();

                // Atualizar a senha
                usuario.setUsusenha(novaSenha);
                Usuario usuarioAtualizado = service.salvar(usuario);
                usuarioAtualizado.setUsusenha(null); // Remove senha da resposta

                System.out.println("Senha atualizada para usuário: " + usuario.getUsunome());

                Map<String, String> response = new HashMap<>();
                response.put("message", "Senha redefinida com sucesso");

                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email não encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

        } catch (Exception e) {
            System.err.println("ERRO em redefinir-senha: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erro ao redefinir senha: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Integer id, @RequestBody Usuario usuarioAtualizado) {
        try {
            System.out.println("=== ATUALIZAÇÃO DEBUG ===");
            System.out.println("ID: " + id);
            System.out.println("Dados recebidos: " + usuarioAtualizado);

            Optional<Usuario> usuarioExistente = service.buscarPorId(id);

            if (usuarioExistente.isPresent()) {
                Usuario usuario = usuarioExistente.get();

                // Atualizar apenas os campos permitidos
                if (usuarioAtualizado.getUsunome() != null) {
                    usuario.setUsunome(usuarioAtualizado.getUsunome());
                }
                if (usuarioAtualizado.getUsuemail() != null) {
                    usuario.setUsuemail(usuarioAtualizado.getUsuemail());
                }
                if (usuarioAtualizado.getTelefone() != null) {
                    usuario.setTelefone(usuarioAtualizado.getTelefone());
                }
                if (usuarioAtualizado.getCep() != null) {
                    usuario.setCep(usuarioAtualizado.getCep());
                }
                if (usuarioAtualizado.getInstagram() != null) {
                    usuario.setInstagram(usuarioAtualizado.getInstagram());
                }

                Usuario usuarioSalvo = service.salvar(usuario);
                usuarioSalvo.setUsusenha(null); // Remove senha da resposta

                System.out.println("Usuario atualizado: " + usuarioSalvo.getUsunome());
                System.out.println("=== FIM DEBUG ===");

                return ResponseEntity.ok(usuarioSalvo);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Usuário não encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            System.err.println("ERRO ao atualizar: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erro ao atualizar usuário: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/test-db")
    public ResponseEntity<?> testDatabase() {
        try {
            List<Usuario> usuarios = service.listarTodos();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Conexão com banco OK");
            response.put("total_usuarios", usuarios.size());
            response.put("usuarios", usuarios);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erro na conexão com banco: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Integer id) {
        service.deletar(id);
    }

    @PostMapping("/solicitar")
public ResponseEntity<?> solicitarToken(@RequestParam String userEmail) {
    Optional<Usuario> usuarioOpt = service.buscarPorEmail(userEmail);
    if (usuarioOpt.isPresent()) {
        int userId = usuarioOpt.get().getUsucodigo();
        String token = Resetservice.gerarToken(userId);
        
        String assunto = "Recuperação de Senha - Código de Verificação";
        String corpo =  "Olá,\nRecebemos uma solicitação para redefinir a senha da sua conta.\nPara continuar com o processo, utilize o código de verificação abaixo:\nCódigo:"+token+"\nEste código é válido por 15 minutos. Se você não solicitou essa alteração, por favor ignore este e-mail.\nAtenciosamente,\nEquipe Martin Psicologo\n";
        Emailservice.enviarEmail(userEmail, assunto, corpo);
        return ResponseEntity.ok("Token enviado para o e-mail do usuário.");
    } else {
        return ResponseEntity.badRequest().body("E-mail não encontrado.");
    }
}

    @PostMapping("/validar")
public ResponseEntity<?> validarToken(@RequestParam String userEmail, @RequestParam String token) {
    Optional<Usuario> usuarioOpt = service.buscarPorEmail(userEmail);
    if (usuarioOpt.isPresent()) {
        int userId = usuarioOpt.get().getUsucodigo();
        boolean valido = Resetservice.validarToken(userId, token);
        return valido ? ResponseEntity.ok("Token válido.") : ResponseEntity.badRequest().body("Token inválido ou expirado.");
    } else {
        return ResponseEntity.badRequest().body("E-mail não encontrado.");
    }
}
}