package org.example.stuff.controller;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin
public class AiController {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
    private static final String API_KEY = "17ad51f3-2241-4a9e-8dfb-307d6e20f045";

    @PostMapping("/chat")
    public Map<String, Object> chat(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            String userContent = request.get("content");
            if (userContent == null || userContent.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "内容不能为空");
                return response;
            }

            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("Authorization", "Bearer " + API_KEY);

            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "deepseek-v3-250324");

            // 构建消息数组
            ArrayList<Map<String, String>> messages = new ArrayList<>();

            // 系统消息
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", "你是物品管理系统的AI助手，可以帮助用户解答物品管理、物品摆放、收纳整理等方面的问题。");
            messages.add(systemMessage);

            // 用户消息
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", userContent);
            messages.add(userMessage);

            requestBody.put("messages", messages);

            // 发送请求
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> aiResponse = restTemplate.exchange(
                    API_URL,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class);

            // 处理AI响应
            Map<String, Object> aiResponseBody = aiResponse.getBody();
            if (aiResponseBody != null && aiResponseBody.containsKey("choices")) {
                ArrayList<Map<String, Object>> choices = (ArrayList<Map<String, Object>>) aiResponseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, String> message = (Map<String, String>) choice.get("message");
                    String aiContent = message.get("content");

                    response.put("success", true);
                    response.put("content", aiContent);
                    return response;
                }
            }

            // 如果处理失败
            response.put("success", false);
            response.put("message", "无法获取AI响应");
            return response;

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "处理请求时发生错误: " + e.getMessage());
            return response;
        }
    }
}