import pytest

from .models import APIMonitor, MonitorResult
from .metrics import calculate_metrics


@pytest.mark.django_db
def test_calculate_metrics():
    monitor = APIMonitor.objects.create(
        name="Test API",
        url="https://example.com",
        method="GET",
        expected_status=200,
        timeout=5,
        is_active=True
    )

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

    result = calculate_metrics(monitor.id)

    assert result["total_checks"] == 3
    assert result["successful_checks"] == 2
    assert result["failed_checks"] == 1
    assert result["availability"] == 66.67
    assert result["average_response_time"] == 2.0
    assert result["minimum_response_time"] == 1.0
    assert result["maximum_response_time"] == 3.0
    assert result["reliability_score"] == 66.67