#!/bin/bash

# ==============================================================================
# EzTask Microservices Cluster Health & Status Probe
# ==============================================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}        EzTask Microservices - Cluster Health Inspector       ${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""

check_http() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    printf "Checking %-28s " "[$name]"
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 "$url" 2>/dev/null)
    
    if [ "$response" -eq "$expected_status" ] || [ "$response" -eq 200 ]; then
        echo -e "${GREEN}[OK] (HTTP $response)${NC}"
    else
        echo -e "${RED}[FAIL] (HTTP ${response:-UNREACHABLE})${NC} -> $url"
    fi
}

echo -e "${YELLOW}1. Core Microservices & API Gateway (Actuator Probes):${NC}"
check_http "API Gateway" "http://localhost:8080/actuator/health"
check_http "Identity Service" "http://localhost:8081/actuator/health"
check_http "Task Service" "http://localhost:8082/actuator/health"
check_http "Notification Service" "http://localhost:8083/actuator/health"

echo ""
echo -e "${YELLOW}2. Observability & Monitoring Infrastructure:${NC}"
check_http "Zipkin Tracing UI" "http://localhost:9411/zipkin/"
check_http "Prometheus Metrics" "http://localhost:9090/-/healthy"
check_http "Grafana Dashboards" "http://localhost:3001/api/health"
check_http "Kafka UI Dashboard" "http://localhost:8085"

echo ""
echo -e "${BLUE}================================================================${NC}"
echo -e "Quick Access URLs:"
echo -e "  - API Gateway:          http://localhost:8080"
echo -e "  - Grafana (admin/admin):http://localhost:3001"
echo -e "  - Zipkin Tracing:       http://localhost:9411"
echo -e "  - Kafka UI:             http://localhost:8085"
echo -e "  - Prometheus:           http://localhost:9090"
echo -e "${BLUE}================================================================${NC}"
