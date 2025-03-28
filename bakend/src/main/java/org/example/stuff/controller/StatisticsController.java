package org.example.stuff.controller;

import org.example.stuff.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.example.stuff.annotation.RequireRole;
import org.example.stuff.entity.UserRole;

import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class StatisticsController {
    
    @Autowired
    private StatisticsService statisticsService;
    
    @GetMapping("/dashboard")
    @RequireRole(UserRole.ADMIN)
    public Map<String, Object> getDashboardStatistics() {
        return statisticsService.getDashboardStatistics();
    }
} 