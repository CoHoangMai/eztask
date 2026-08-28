package com.eztask.gateway;

import com.eztask.gateway.config.RouterValidator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;  
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiGatewayApplicationTests {

    @Autowired
    private RouterValidator routerValidator;

    @Test
    @DisplayName("Application Context Loads Successfully")
    void contextLoads() {
    }

    @Test
    @DisplayName("Public Whitelisted Endpoints Should Bypass Authentication")
    void testPublicEndpointsAreNotSecured() {
        MockServerHttpRequest loginReq = MockServerHttpRequest.post("/api/auth/login").build();
        MockServerHttpRequest registerReq = MockServerHttpRequest.post("/api/auth/register").build();
        MockServerHttpRequest healthReq = MockServerHttpRequest.get("/actuator/health").build();
        MockServerHttpRequest wsReq = MockServerHttpRequest.get("/ws").build();

        assertFalse(routerValidator.isSecured.test(loginReq), "/api/auth/login should be public");
        assertFalse(routerValidator.isSecured.test(registerReq), "/api/auth/register should be public");
        assertFalse(routerValidator.isSecured.test(healthReq), "/actuator/health should be public");
        assertFalse(routerValidator.isSecured.test(wsReq), "/ws should be public");
    }

    @Test
    @DisplayName("Protected Endpoints Should Require Authentication")
    void testProtectedEndpointsAreSecured() {
        MockServerHttpRequest createTaskReq = MockServerHttpRequest.post("/api/tasks").build();
        MockServerHttpRequest getTasksReq = MockServerHttpRequest.get("/api/tasks").build();
        MockServerHttpRequest boardsReq = MockServerHttpRequest.get("/api/boards").build();
        MockServerHttpRequest notifReq = MockServerHttpRequest.get("/api/notifications").build();

        assertTrue(routerValidator.isSecured.test(createTaskReq), "/api/tasks must be secured");
        assertTrue(routerValidator.isSecured.test(getTasksReq), "/api/tasks must be secured");
        assertTrue(routerValidator.isSecured.test(boardsReq), "/api/boards must be secured");
        assertTrue(routerValidator.isSecured.test(notifReq), "/api/notifications must be secured");
    }
}
