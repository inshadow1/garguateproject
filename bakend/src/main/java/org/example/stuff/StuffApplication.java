package org.example.stuff;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.beans.factory.annotation.Value;

@SpringBootApplication
public class StuffApplication {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUsername;

    public static void main(String[] args) {
        SpringApplication.run(StuffApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void printConnectionInfo() {
        System.out.println("----------------------------------------");
        System.out.println("数据库连接信息：");
        System.out.println("URL: " + dbUrl);
        System.out.println("用户名: " + dbUsername);
        System.out.println("----------------------------------------");
    }
}
