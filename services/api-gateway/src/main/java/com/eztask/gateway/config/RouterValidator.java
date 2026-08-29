package com.eztask.gateway.config;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouterValidator {

    public static final List<String> OPEN_API_ENDPOINTS = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/fallback",
            "/fallback/",
            "/actuator",
            "/actuator/health",
            "/actuator/info",
            "/ws",
            "/ws/",
            "/v3/api-docs",
            "/swagger-ui"
    );

    public Predicate<ServerHttpRequest> isSecured = request -> {
        String path = request.getURI().getPath();
        return OPEN_API_ENDPOINTS.stream().noneMatch(path::startsWith);
    };
}
