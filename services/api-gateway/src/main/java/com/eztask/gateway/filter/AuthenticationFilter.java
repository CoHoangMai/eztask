package com.eztask.gateway.filter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.eztask.gateway.config.RouterValidator;
import com.eztask.gateway.dto.ErrorResponse;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final RouterValidator routerValidator;
    private final ObjectMapper objectMapper;

    @Value("${jwt.secret:TaskFlowEnterpriseJwtSecretKeyForSpringCloudGatewayVerification2026!}")
    private String jwtSecret;

    public AuthenticationFilter(RouterValidator routerValidator, ObjectMapper objectMapper) {
        super(Config.class);
        this.routerValidator = routerValidator;
        this.objectMapper = objectMapper;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // 1. If the route is an open endpoint (e.g. /api/auth/login), bypass verification
            if (!routerValidator.isSecured.test(request)) {
                return chain.filter(exchange);
            }

            // 2. Check for Authorization header
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, HttpStatus.UNAUTHORIZED, "Missing Authorization header in request");
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, HttpStatus.UNAUTHORIZED, "Invalid Authorization header format. Expected 'Bearer <token>'");
            }

            String token = authHeader.substring(7).trim();

            try {
                // 3. Verify JWT Signature and Claims using JJWT
                SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
                Claims claims = Jwts.parser()
                        .verifyWith(key)
                        .clockSkewSeconds(3600)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                String email = claims.getSubject();
                Object rawUserId = claims.get("userId");
                String userId = rawUserId != null ? rawUserId.toString() : "";
                String role = claims.get("role", String.class);

                // 4. Downstream Header Propagation (Edge Authentication Pattern)
                ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                        .header("X-User-Email", email != null ? email : "")
                        .header("X-User-Id", userId)
                        .header("X-User-Role", role != null ? role : "ROLE_USER")
                        .build();

                log.debug("Gateway authenticated user [{}] id [{}] forwarding to downstream service", email, userId);
                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (Exception ex) {
                log.warn("JWT validation failed on API Gateway: {}", ex.getMessage());
                return onError(exchange, HttpStatus.UNAUTHORIZED, "JWT verification failed: " + ex.getMessage());
            }
        };
    }

    @SuppressWarnings("null")
    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus httpStatus, String errorMessage) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(httpStatus.value())
                .error(httpStatus.getReasonPhrase())
                .message(errorMessage)
                .path(exchange.getRequest().getURI().getPath())
                .build();

        byte[] bytes;
        try {
            bytes = objectMapper.writeValueAsBytes(errorResponse);
        } catch (JsonProcessingException e) {
            bytes = ("{\"status\":" + httpStatus.value() + ",\"error\":\"" + errorMessage + "\"}").getBytes(StandardCharsets.UTF_8);
        }

        if (bytes == null) {
            bytes = new byte[0];
        }

        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }

    @Data
    public static class Config {
        // Configuration properties if needed
    }
}
