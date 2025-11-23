/* 

package com.example.demo.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class FrontendController {

    private final String FRONTEND_PATH = "C:/Users/maria/OneDrive/Documentos/pmg-es-2025-2-ti3-9545100-psicologo-1/Codigo/front-end/src/";

    @GetMapping("/home")
    public String home() {
        return "redirect:/login.html";
    }

    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }

    @GetMapping("/home/{filename:.+}")
    public ResponseEntity<Resource> getStaticFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(FRONTEND_PATH + filename);
            if (Files.exists(filePath) && Files.isRegularFile(filePath)) {
                Resource resource = new FileSystemResource(filePath);
                
                String contentType = getContentType(filename);
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Erro ao servir arquivo: " + filename + " - " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    private String getContentType(String filename) {
        if (filename.endsWith(".html")) return "text/html; charset=UTF-8";
        if (filename.endsWith(".css")) return "text/css; charset=UTF-8";
        if (filename.endsWith(".js")) return "application/javascript; charset=UTF-8";
        if (filename.endsWith(".png")) return "image/png";
        if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
        if (filename.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }
}*/