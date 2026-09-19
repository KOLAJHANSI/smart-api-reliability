# Smart API Reliability Platform

A full-stack API monitoring and reliability platform that helps development teams detect API failures, monitor performance, identify degradation, and analyze incidents.

## 🚀 Live Demo

- **Frontend:** `https://smart-api-reliability-frontend.onrender.com/`
- **Backend API:** `https://smart-api-reliability-backend.onrender.com/api/monitors/`


> Replace these placeholders with the actual deployment URLs after deployment.

## 📌 Project Overview

The Smart API Reliability Platform automatically monitors APIs for availability, response time, and failures.

It stores historical monitoring data, calculates reliability metrics, detects performance degradation, creates incidents, and provides an AI-powered incident analysis layer to help understand potential causes.

## ✨ Key Features

- API monitor creation and management
- Automated API health checks
- Response-time monitoring
- Availability and reliability metrics
- Historical response-time tracking
- Performance degradation detection
- Automatic incident tracking
- Incident resolution workflow
- AI-powered incident analysis
- React monitoring dashboard
- Dockerized application
- Automated testing with pytest
- GitHub Actions CI

## 🏗️ Architecture

```text
React Dashboard
       ↓
Django REST API
       ↓
     MySQL
       ↑
Monitoring Results
       ↑
Celery + Redis
       ↑
   API Checker
       ↓
 External APIs

**🛠️ Tech Stack **

Backend
Python
Django
Django REST Framework
MySQL
Celery
Redis
Requests
Frontend
React
Vite
Recharts
CSS
Testing
pytest
Django testing
API testing
Mocking
DevOps
Docker
Docker Compose
GitHub Actions

**🔌 API Endpoints **
Monitor APIs
GET     /api/monitors/
POST    /api/monitors/
GET     /api/monitors/{id}/
PUT     /api/monitors/{id}/
PATCH   /api/monitors/{id}/
DELETE  /api/monitors/{id}/
## Health Check
POST    /api/monitors/{id}/check/
## Historical Results
GET     /api/monitors/{id}/results/
## Metrics
GET     /api/monitors/{id}/metrics/
## Degradation Detection
GET     /api/monitors/{id}/degradation/
## Incidents
GET     /api/incidents/
POST    /api/incidents/{id}/resolve/
## 🧪 Testing
The project includes automated tests covering:
Monitor CRUD operations
API health checks
Metrics calculation
Historical results
Degradation detection
Incident APIs
Incident resolution
AI incident analysis
## Current test suite:
15 tests passed
## Run the tests with:
cd config
pytest -v
## 🐳 Running with Docker
The application can be started using Docker Compose.
docker compose build
docker compose up -d
Services:
Frontend  → http://localhost:5173
Backend   → http://localhost:8000
Redis     → localhost:6379
## Check running containers:
docker compose ps
Stop the services:
docker compose down

**🎯 Why I Built This**
Real applications depend on many APIs and services. When an API becomes slow or unavailable, developers need to quickly understand:
Is the API currently healthy?
When did the problem start?
How frequently is it failing?
Has response time increased?
Is the problem temporary or persistent?
What evidence is available for investigating the incident?
This project was built to explore how a monitoring and reliability platform can answer these questions through automated checks,
 historical data, metrics, incident management, and AI-assisted analysis.

**🔮 Future Improvements**
Possible future enhancements include:
Scheduled monitoring through Celery Beat
Email/Slack notifications
Authentication and user accounts
Role-based access control
More advanced reliability scoring
Uptime/SLA reporting
Rate-limit monitoring
API response validation
POST/PUT/PATCH/DELETE health checks
Advanced anomaly detection
Production deployment
Kubernetes support
More comprehensive observability metrics

** 👩‍💻 Author **
** KOLA JHANSI **
Built as a full-stack backend engineering project using Python, Django, React, MySQL, Redis, Celery, Docker, pytest, and GitHub Actions.
