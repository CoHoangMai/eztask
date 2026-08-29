package com.eztask.gateway.controller;

import com.eztask.gateway.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;

@RestController
@RequestMapping("/fallback")
@Slf4j
public class FallbackController {

    @RequestMapping("/identity")
    public Mono<ResponseEntity<ErrorResponse>> identityServiceFallback(ServerWebExchange exchange) {
        log.warn("Fallback triggered: Identity Service is currently unavailable or timed out. Path: {}",
                exchange.getRequest().getURI().getPath());

        ErrorResponse response = ErrorResponse.builder()
                .timestamp(Instant.now().toString())
                .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                .error("Service Unavailable")
                .message("Identity & Authentication Service is currently degraded or unavailable. Please try again shortly.")
                .path(exchange.getRequest().getURI().getPath())
                .build();

        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response));
    }

    @RequestMapping("/task")
    public Mono<ResponseEntity<ErrorResponse>> taskServiceFallback(ServerWebExchange exchange) {
        log.warn("Fallback triggered: Task Management Service is currently unavailable or timed out. Path: {}",
                exchange.getRequest().getURI().getPath());

        ErrorResponse response = ErrorResponse.builder()
                .timestamp(Instant.now().toString())
                .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                .error("Service Unavailable")
                .message("Task Management Service is currently experiencing high load or is temporarily unreachable. Please retry in a few moments.")
                .path(exchange.getRequest().getURI().getPath())
                .build();

        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response));
    }

    @RequestMapping("/notification")
    public Mono<ResponseEntity<ErrorResponse>> notificationServiceFallback(ServerWebExchange exchange) {
        log.warn("Fallback triggered: Notification Service is currently unavailable or timed out. Path: {}",
                exchange.getRequest().getURI().getPath());

        ErrorResponse response = ErrorResponse.builder()
                .timestamp(Instant.now().toString())
                .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                .error("Service Unavailable")
                .message("Notification Service is temporarily unavailable. Real-time alerts may be queued.")
                .path(exchange.getRequest().getURI().getPath())
                .build();

        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response));
    }
}
