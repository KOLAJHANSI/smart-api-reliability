import pytest
from datetime import timedelta

from django.utils import timezone

from .models import APIMonitor, MonitorResult
from .degradation import detect_degradation


@pytest.mark.django_db
def test_detect_degradation():
    monitor = APIMonitor.objects.create(
        name="Test API",
        url="https://example.com",
        method="GET",
        expected_status=200,
        timeout=5,
        is_active=True
    )

    historical = MonitorResult.objects.create(
        monitor=monitor,
        status_code=200,
        response_time=1.0,
        is_healthy=True
    )

    recent_1 = MonitorResult.objects.create(
        monitor=monitor,
        status_code=200,
        response_time=2.0,
        is_healthy=True
    )

    recent_2 = MonitorResult.objects.create(
        monitor=monitor,
        status_code=200,
        response_time=2.0,
        is_healthy=True
    )

    recent_3 = MonitorResult.objects.create(
        monitor=monitor,
        status_code=200,
        response_time=2.0,
        is_healthy=True
    )

    now = timezone.now()

    historical.checked_at = now - timedelta(minutes=10)
    historical.save(update_fields=["checked_at"])

    recent_1.checked_at = now - timedelta(minutes=3)
    recent_1.save(update_fields=["checked_at"])

    recent_2.checked_at = now - timedelta(minutes=2)
    recent_2.save(update_fields=["checked_at"])

    recent_3.checked_at = now - timedelta(minutes=1)
    recent_3.save(update_fields=["checked_at"])

    result = detect_degradation(monitor.id)

    assert result["is_degraded"] is True
    assert result["increase_percentage"] > 50
    
@pytest.mark.django_db
def test_detect_degradation_not_enough_data():
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

    result = detect_degradation(monitor.id)

    assert result["is_degraded"] is False
    assert result["message"] == "Not enough data to detect degradation."