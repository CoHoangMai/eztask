package com.eztask.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.util.UUID;

@Component
@Slf4j
public class RequestLoggingFilter implements GlobalFilter, Ordered {

    private static final String START_TIME_ATTR = "startTime";
    private static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        long startTime = System.currentTimeMillis();
        exchange.getAttributes().put(START_TIME_ATTR, startTime);

        String correlationId = request.getHeaders().getFirst(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        ServerHttpRequest mutatedRequest = request.mutate()
                .header(CORRELATION_ID_HEADER, correlationId)
                .build();

        final String finalCorrelationId = correlationId;
        HttpMethod methodObj = request.getMethod();
        String method = methodObj != null ? methodObj.name() : "UNKNOWN";
        String path = request.getURI().getPath();
        InetSocketAddress remoteSocketAddress = request.getRemoteAddress();
        String remoteAddress = remoteSocketAddress != null ? remoteSocketAddress.toString() : "unknown";

        log.info("[GATEWAY-IN] [{}] {} {} from {}", finalCorrelationId, method, path, remoteAddress);

        return chain.filter(exchange.mutate().request(mutatedRequest).build()).then(Mono.fromRunnable(() -> {
            Long start = exchange.getAttribute(START_TIME_ATTR);
            long duration = start != null ? (System.currentTimeMillis() - start) : 0;
            ServerHttpResponse response = exchange.getResponse();
            HttpStatusCode statusCodeObj = response.getStatusCode();
            int statusCode = statusCodeObj != null ? statusCodeObj.value() : 500;

            log.info("[GATEWAY-OUT] [{}] {} {} -> Status: {} (took {}ms)",
                    finalCorrelationId, method, path, statusCode, duration);
        }));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
