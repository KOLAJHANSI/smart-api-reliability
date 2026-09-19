import requests
import time

from .models import APIMonitor, MonitorResult


def check_api(url, expected_status=200, timeout=5):
    start_time = time.time()

    try:
        response = requests.get(url, timeout=timeout)

        response_time = time.time() - start_time

        is_healthy = response.status_code == expected_status

        return {
            "status_code": response.status_code,
            "response_time": response_time,
            "is_healthy": is_healthy,
        }

    except requests.RequestException as e:
        print("ERROR:", e)

        return {
            "status_code": None,
            "response_time": None,
            "is_healthy": False,
        }


def check_monitor(monitor_id):
    monitor = APIMonitor.objects.get(id=monitor_id)

    result = check_api(
        monitor.url,
        monitor.expected_status,
        monitor.timeout
    )

    monitor_result = MonitorResult.objects.create(
        monitor=monitor,
        status_code=result["status_code"],
        response_time=result["response_time"],
        is_healthy=result["is_healthy"],
    )

    return monitor_result