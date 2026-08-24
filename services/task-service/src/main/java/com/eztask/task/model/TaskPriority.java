package com.eztask.task.model;

public enum TaskPriority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT;

    public static TaskPriority fromString(String value) {
        if (value == null) return MEDIUM;
        try {
            return TaskPriority.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return MEDIUM;
        }
    }
}
