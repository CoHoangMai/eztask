package com.eztask.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Global Request Correlation & Distributed Tracing Filter.
 * Ensures every incoming HTTP request entering the API Gateway carries a unique
 * X-Correlation-ID header, propagating it across downstream microservices and into logs.
 */
@Component
@Slf4j
public class GlobalLoggingFilter implements GlobalFilter, Ordered {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        HttpHeaders headers = request.getHeaders();

        // 1. Extract existing correlation ID or generate a new UUID
        String correlationId = headers.getFirst(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.trim().isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }

        final String finalCorrelationId = correlationId;

        // 2. Inject correlation ID into downstream request headers
        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header(CORRELATION_ID_HEADER, finalCorrelationId)
                .build();

        long startTime = System.currentTimeMillis();
        String method = request.getMethod() != null ? request.getMethod().name() : "UNKNOWN";
        String path = request.getURI().getPath();

        log.info("[REQ START] [{}] {} {} - Client IP: {}",
                finalCorrelationId, method, path, request.getRemoteAddress());

        // 3. Inject correlation ID into response headers and log latency on completion
        return chain.filter(exchange.mutate().request(mutatedRequest).build())
                .doFinally(signalType -> {
                    long duration = System.currentTimeMillis() - startTime;
                    ServerHttpResponse response = exchange.getResponse();
                    HttpStatusCode status = response.getStatusCode();
                    int statusCode = (status != null) ? status.value() : 200;

                    HttpHeaders responseHeaders = response.getHeaders();
                    if (!responseHeaders.containsKey(CORRELATION_ID_HEADER)) {
                        responseHeaders.add(CORRELATION_ID_HEADER, finalCorrelationId);
                    }

                    log.info("[REQ END] [{}] {} {} - Status: {} - Duration: {}ms",
                            finalCorrelationId, method, path, statusCode, duration);
                });
    }

    @Override
    public int getOrder() {
        // Run first before authentication and routing filters
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
