package com.eztask.identity.dto;

import lombok.Data;

public class AuthDto {

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String role; // e.g. "Lead Architect"
        private String avatar;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private UserResponse user;

        public AuthResponse(String token, UserResponse user) {
            this.token = token;
            this.user = user;
        }
    }

    @Data
    public static class UserResponse {
        private String id;
        private String name;
        private String email;
        private String avatar;
        private String role;

        public UserResponse(Long id, String name, String email, String avatar, String role) {
            this.id = String.valueOf(id);
            this.name = name;
            this.email = email;
            this.avatar = avatar != null ? avatar : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
            this.role = role;
        }
    }
}
