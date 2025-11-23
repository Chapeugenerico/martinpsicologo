/* 
package com.example.demo.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/oauth2")
public class OAuth2Controller {

    @GetMapping("/success")
    public String loginSuccess(@AuthenticationPrincipal OAuth2User oauth2User) {
        // Log do usuário autenticado
        System.out.println("=== LOGIN OAUTH2 SUCESSO ===");
        System.out.println("Usuário: " + oauth2User.getAttribute("name"));
        System.out.println("Email: " + oauth2User.getAttribute("email"));
        
        // Redirecionar para o perfil do psicólogo
        return "redirect:/perfilPsicologo.html";
    }

    @GetMapping("/failure")
    public String loginFailure() {
        System.out.println("=== LOGIN OAUTH2 FALHOU ===");
        return "redirect:/login.html?error=oauth2";
    }

    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }

    @GetMapping("/user-info")
    @ResponseBody
    public Map<String, Object> getUserInfo(@AuthenticationPrincipal OAuth2User oauth2User) {
        Map<String, Object> userInfo = new HashMap<>();
        
        if (oauth2User != null) {
            userInfo.put("name", oauth2User.getAttribute("name"));
            userInfo.put("email", oauth2User.getAttribute("email"));
            userInfo.put("picture", oauth2User.getAttribute("picture"));
            userInfo.put("authenticated", true);
        } else {
            userInfo.put("authenticated", false);
        }
        
        return userInfo;
    }
}*/