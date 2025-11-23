package com.example.demo.repository;

import com.example.demo.model.TipoUsuario;
import com.example.demo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;


@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    // Método para encontrar um usuário pelo email
    Optional<Usuario> findByUsuemail(String email);
    boolean existsByUsuemail(String email);

    // Método para encontrar todos os usuários de um determinado tipo
    List<Usuario> findByUsutipo(TipoUsuario usutipo);

    


}