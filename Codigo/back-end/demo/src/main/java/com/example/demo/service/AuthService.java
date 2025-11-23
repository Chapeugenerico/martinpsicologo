package com.example.demo.service;

import com.example.demo.model.Usuario;
import com.example.demo.model.TipoUsuario;
import com.example.demo.dto.UsuarioRequest;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.AuthResponse;
import com.example.demo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder; // DESCOMENTE ESTA LINHA
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public AuthResponse registrar(UsuarioRequest request) {
        try {
            if (usuarioRepository.existsByUsuemail(request.getEmail())) {
                return new AuthResponse(false, "Email já cadastrado");
            }
            
            Usuario usuario = new Usuario();
            usuario.setUsuemail(request.getEmail());
            usuario.setUsusenha(passwordEncoder.encode(request.getSenha()));
            usuario.setUsunome(request.getNome());
            usuario.setTelefone(request.getTelefone());
            usuario.setCpf(request.getCpf());
            usuario.setCep(request.getCep());
            usuario.setNomeSocial(request.getNomeSocial());
            usuario.setUsutipo(TipoUsuario.valueOf(request.getTipo()));
            
            if (TipoUsuario.PSICOLOGO.name().equals(request.getTipo())) {
                usuario.setCrp(request.getCrp());
            }
            
            usuarioRepository.save(usuario);
            
            return new AuthResponse(true, "Usuário cadastrado com sucesso", 
                                  usuario.getUsunome(), usuario.getUsuemail(), 
                                  usuario.getUsutipo().name(), usuario.getUsucodigo());
            
        } catch (Exception e) {
            return new AuthResponse(false, "Erro ao cadastrar usuário: " + e.getMessage());
        }
    }
    
    public AuthResponse login(LoginRequest request) {
        try {
            Usuario usuario = usuarioRepository.findByUsuemail(request.getEmail())
                    .orElse(null);
            
            if (usuario == null) {
                return new AuthResponse(false, "Usuário não encontrado");
            }
            
            if (!passwordEncoder.matches(request.getSenha(), usuario.getUsusenha())) {
                return new AuthResponse(false, "Senha incorreta");
            }
            
            return new AuthResponse(true, "Login realizado com sucesso", 
                                  usuario.getUsunome(), usuario.getUsuemail(), 
                                  usuario.getUsutipo().name(), usuario.getUsucodigo());
            
        } catch (Exception e) {
            return new AuthResponse(false, "Erro ao fazer login: " + e.getMessage());
        }
    }
}