import pytest
from unittest.mock import patch

from rest_framework.test import APIClient

from .models import APIMonitor, MonitorResult, Incident


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def monitor():
    return APIMonitor.objects.create(
        name="Test API",
        url="https://example.com",
        method="GET",
        expected_status=200,
        timeout=5,
        is_active=True
    )


# 1. Monitor CRUD API
@pytest.mark.django_db
def test_monitor_crud_api(api_client):
    # CREATE
    data = {
        "name": "CRUD Test API",
        "url": "https://example.com",
        "method": "GET",
        "expected_status": 200,
        "timeout": 5,
        "is_active": True
    }

    response = api_client.post("/api/monitors/", data, format="json")

    assert response.status_code == 201

    monitor_id = response.data["id"]

    # READ
    response = api_client.get(f"/api/monitors/{monitor_id}/")

    assert response.status_code == 200
    assert response.data["name"] == "CRUD Test API"

    # UPDATE
    response = api_client.patch(
        f"/api/monitors/{monitor_id}/",
        {"name": "Updated API"},
        format="json"
    )

    assert response.status_code == 200
    assert response.data["name"] == "Updated API"

    # DELETE
    response = api_client.delete(
        f"/api/monitors/{monitor_id}/"
    )

    assert response.status_code == 204


# 2. Health-check endpoint
@pytest.mark.django_db
@patch("monitors.views.check_monitor")
def test_health_check_endpoint(mock_check_monitor, api_client, monitor):

    mock_check_monitor.return_value = {
        "status_code": 200,
        "response_time": 0.5,
        "is_healthy": True
    }

    response = api_client.post(
        f"/api/monitors/{monitor.id}/check/"
    )

    assert response.status_code == 200
    assert response.data["status_code"] == 200
    assert response.data["is_healthy"] is True


# 3. Metrics endpoint
@pytest.mark.django_db
def test_metrics_endpoint(api_client, monitor):

    MonitorResult.objects.create(
        monitor=monitor,
        status_code=200,
        response_time=1.0,
        is_healthy=True
    )

    MonitorResult.objects.create(
        monitor=monitor,
        status_code=200,
        response_time=2.0,
        is_healthy=True
    )

    MonitorResult.objects.create(
        monitor=monitor,
        status_code=500,
        response_time=3.0,
        is_healthy=False
    )

    response = api_client.get(
        f"/api/monitors/{monitor.id}/metrics/"
    )

    assert response.status_code == 200
    assert response.data["total_checks"] == 3
    assert response.data["successful_checks"] == 2
    assert response.data["failed_checks"] == 1
    assert response.data["availability"] == 66.67


# 4. Results endpoint
@pytest.mark.django_db
def test_results_endpoint(api_client, monitor):

    MonitorResult.objects.create(
        monitor=monitor,
        status_code=200,
        response_time=1.5,
        is_healthy=True
    )

    response = api_client.get(
        f"/api/monitors/{monitor.id}/results/"
    )

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["status_code"] == 200


# 5. Degradation endpoint
@pytest.mark.django_db
@patch("monitors.views.detect_degradation")
def test_degradation_endpoint(
    mock_detect_degradation,
    api_client,
    monitor
):

    mock_detect_degradation.return_value = {
        "is_degraded": True,
        "recent_average": 2.0,
        "historical_average": 1.0,
        "increase_percentage": 100.0
    }

    response = api_client.get(
        f"/api/monitors/{monitor.id}/degradation/"
    )

    assert response.status_code == 200
    assert response.data["is_degraded"] is True
    assert response.data["increase_percentage"] == 100.0


# 6. Incident listing
@pytest.mark.django_db
def test_incident_listing(api_client, monitor):

    Incident.objects.create(
        monitor=monitor,
        incident_type="DEGRADATION",
        status="OPEN",
        message="API response time increased."
    )

    response = api_client.get("/api/incidents/")

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["status"] == "OPEN"


# 7. Resolve incident
@pytest.mark.django_db
def test_resolve_incident(api_client, monitor):

    incident = Incident.objects.create(
        monitor=monitor,
        incident_type="FAILURE",
        status="OPEN",
        message="API returned an error."
    )

    response = api_client.post(
        f"/api/incidents/{incident.id}/resolve/"
    )

    assert response.status_code == 200
    assert response.data["status"] == "RESOLVED"
    assert response.data["resolved_at"] is not None