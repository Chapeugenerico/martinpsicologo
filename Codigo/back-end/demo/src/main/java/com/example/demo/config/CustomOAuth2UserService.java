/* *

package com.example.demo.config;

import com.example.demo.model.Usuario;
import com.example.demo.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UsuarioService usuarioService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        
        // Extrair informações do usuário Google
        Map<String, Object> attributes = oauth2User.getAttributes();
        String email = (String) attributes.get("email");
        String nome = (String) attributes.get("name");
        
        System.out.println("=== GOOGLE OAUTH2 LOGIN ===");
        System.out.println("Email: " + email);
        System.out.println("Nome: " + nome);
        
        try {
            // Verificar se usuário já existe no banco
            Usuario usuarioExistente = usuarioService.buscarPorEmail(email);
            
            if (usuarioExistente == null) {
                // Criar novo usuário no banco de dados
                Usuario novoUsuario = new Usuario();
                novoUsuario.setUsunome(nome);
                novoUsuario.setUsuemail(email);
                novoUsuario.setUsusenha("OAUTH2_GOOGLE"); // Senha especial para OAuth2
                
                Usuario usuarioSalvo = usuarioService.salvar(novoUsuario);
                System.out.println("Novo usuário criado com ID: " + usuarioSalvo.getUsucodigo());
            } else {
                System.out.println("Usuário existente encontrado: " + usuarioExistente.getUsucodigo());
            }
        } catch (Exception e) {
            System.err.println("Erro ao processar usuário OAuth2: " + e.getMessage());
            e.printStackTrace();
        }
        
        return oauth2User;
    }
}
*/