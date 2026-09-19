from .models import APIMonitor


def detect_degradation(monitor_id, recent_count=3, threshold=0.50):
    monitor = APIMonitor.objects.get(id=monitor_id)

    results = monitor.results.all().order_by('-checked_at')

    response_times = [
        result.response_time
        for result in results
        if result.response_time is not None
    ]

    if len(response_times) < recent_count + 1:
        return {
            "is_degraded": False,
            "message": "Not enough data to detect degradation."
        }

    recent_times = response_times[:recent_count]
    historical_times = response_times[recent_count:]

    recent_average = sum(recent_times) / len(recent_times)
    historical_average = sum(historical_times) / len(historical_times)

    if historical_average == 0:
        return {
            "is_degraded": False,
            "message": "Historical response time is zero."
        }

    increase = (
        (recent_average - historical_average)
        / historical_average
    )

    is_degraded = increase > threshold

    return {
        "is_degraded": is_degraded,
        "recent_average": round(recent_average, 2),
        "historical_average": round(historical_average, 2),
        "increase_percentage": round(increase * 100, 2),
    }