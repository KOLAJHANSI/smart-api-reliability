from celery import shared_task
from .health_checker import check_monitor
from .models import APIMonitor


@shared_task
def monitor_api(monitor_id):
    from .models import Incident

    result = check_monitor(monitor_id)

    if not result.is_healthy:
        existing_incident = Incident.objects.filter(
            monitor_id=monitor_id,
            status="OPEN"
        ).first()

        if not existing_incident:
            Incident.objects.create(
                monitor_id=monitor_id,
                incident_type="API_FAILURE",
                message="API check failed."
            )

    return {
        "monitor_id": monitor_id,
        "status_code": result.status_code,
        "response_time": result.response_time,
        "is_healthy": result.is_healthy,
    }
@shared_task
def monitor_active_apis():
    monitors = APIMonitor.objects.filter(is_active=True)

    for monitor in monitors:
        monitor_api.delay(monitor.id)

    return f"Queued {monitors.count()} active monitors."