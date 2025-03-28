package org.example.stuff.interceptor;

import org.example.stuff.annotation.RequireRole;
import org.example.stuff.entity.User;
import org.example.stuff.entity.UserRole;
import org.example.stuff.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@Component
public class RoleInterceptor implements HandlerInterceptor {
    
    @Autowired
    private UserService userService;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        
        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
        
        if (requireRole == null) {
            return true;
        }
        
        // 获取请求头中的用户ID
        String userId = request.getHeader("X-User-Id");
        
        // 如果请求头中没有用户ID，尝试从请求参数中获取
        if (userId == null) {
            userId = request.getParameter("userId");
        }
        
        // 如果是POST/PUT请求，不在这里验证用户ID
        String method = request.getMethod();
        if (userId == null && (method.equals("POST") || method.equals("PUT"))) {
            return true;  // 让Controller去处理
        }
        
        if (userId == null || userId.isEmpty()) {
            throw new RuntimeException("需要用户ID");
        }
        
        // 将用户ID添加到请求属性中
        request.setAttribute("userId", Long.parseLong(userId));
        
        User user = userService.getUserById(Long.parseLong(userId));
        
        // 检查用户角色是否满足要求
//        boolean hasRole = Arrays.asList(requireRole.value()).contains(user.getRole());
//        if (!hasRole) {
//            throw new RuntimeException("权限不足");
//        }
        
        return true;
    }
} 