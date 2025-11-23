package com.example.demo.service;

import com.example.demo.model.TipoUsuario;
import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public List<Usuario> listarTodos() {
        return repository.findAll();
    }

    public Usuario salvar(Usuario usuario) {
        return repository.save(usuario);
    }

    public void deletar(Integer id) {
        repository.deleteById(id);
    }

    public Optional<Usuario> login(String email, String senha) {
        Optional<Usuario> usuarioOpt = repository.findByUsuemail(email);

        // Verifica se o usuário existe e se a senha corresponde
        if (usuarioOpt.isPresent() && usuarioOpt.get().getUsusenha().equals(senha)) {
            return usuarioOpt;
        }
        return Optional.empty();
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return repository.findByUsuemail(email);
    }

    public Optional<Usuario> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    // Método alternativo se você quiser retornar o Usuario diretamente ou lançar
    // uma exceção
    public Usuario buscarPorEmailOuFalhar(String email) {
        return repository.findByUsuemail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com email: " + email));
    }

    // Método para verificar se email já existe
    public boolean emailExiste(String email) {
        return repository.existsByUsuemail(email);
    }

    // Métodos específicos para psicólogos
    public Optional<Usuario> buscarPsicologoPorId(Integer id) {
        Optional<Usuario> usuario = repository.findById(id);
        return usuario.filter(u -> u.getUsutipo() == TipoUsuario.PSICOLOGO);
    }

    public Optional<Usuario> buscarPsicologoPorEmail(String email) {
        Optional<Usuario> usuario = repository.findByUsuemail(email);
        return usuario.filter(u -> u.getUsutipo() == TipoUsuario.PSICOLOGO);
    }

    public List<Usuario> listarTodosPsicologos() {
        // USANDO O MÉTODO CORRETO - findByUsutipo (nome do campo na entidade)
        return repository.findByUsutipo(TipoUsuario.PSICOLOGO);
    }

    public Usuario atualizarPsicologo(Integer id, Usuario usuarioDetails) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Psicólogo não encontrado"));

        if (usuario.getUsutipo() != TipoUsuario.PSICOLOGO) {
            throw new RuntimeException("Usuário não é um psicólogo");
        }

        // Atualiza apenas campos permitidos para psicólogo
        usuario.setUsunome(usuarioDetails.getUsunome());
        usuario.setUsuemail(usuarioDetails.getUsuemail());
        usuario.setTelefone(usuarioDetails.getTelefone());
        usuario.setInstagram(usuarioDetails.getInstagram());
        usuario.setCrp(usuarioDetails.getCrp());

        return repository.save(usuario);
    }
}