package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DirectPingController {

    @GetMapping("/direct-ping")
    public String ping() {
        System.out.println("=== DirectPingController carregado ===");
        return "pong direto";
    }
}
