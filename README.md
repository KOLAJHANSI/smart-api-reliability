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

text
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



## 🛠️ Tech Stack

- **Backend:** Python, Django, Django REST Framework
- **Database:** MySQL
- **Background Processing:** Celery, Redis
- **Frontend:** React, Vite, Recharts
- **Testing:** pytest
- **AI:** AI-powered Incident Analysis
- **DevOps:** Docker, Docker Compose, GitHub Actions
- **API Communication:** Requests

## 🔌 API Endpoints

### Monitor Management

```text
GET     /api/monitors/
POST    /api/monitors/
GET     /api/monitors/{id}/
PUT     /api/monitors/{id}/
PATCH   /api/monitors/{id}/
DELETE  /api/monitors/{id}/
More comprehensive observability metrics

## 🤔 Why I Built This

Modern applications depend on multiple APIs and external services. When an API becomes slow or unavailable, developers need to quickly understand what happened and how it affects the system.

I built this project to create a practical API reliability platform that monitors API health, tracks performance, detects degradation, manages incidents, and provides AI-powered analysis to help developers investigate potential causes.

The project also gave me hands-on experience with backend development, REST APIs, databases, asynchronous processing, automated testing, Docker, and CI/CD.

## 🚀 Future Improvements

The platform can be extended with scheduled monitoring using Celery Beat, real-time notifications through email or Slack, user authentication and role-based access control, advanced anomaly detection, SLA and uptime reporting, API response validation, and support for additional HTTP methods.

Future versions could also include production deployment, Kubernetes-based scaling, advanced observability, and more intelligent incident analysis.

** 👩‍💻 Author **
** KOLA JHANSI **
Built as a full-stack backend engineering project using Python, Django, React, MySQL, Redis, Celery, Docker, pytest, and GitHub Actions.
