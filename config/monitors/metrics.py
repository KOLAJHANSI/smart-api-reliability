from .models import APIMonitor


def calculate_metrics(monitor_id):
    monitor = APIMonitor.objects.get(id=monitor_id)

    results = monitor.results.all()

    total_checks = results.count()

    successful_checks = results.filter(is_healthy=True).count()

    failed_checks = results.filter(is_healthy=False).count()

    if total_checks > 0:
        availability = round(
            (successful_checks / total_checks) * 100,
            2
        )
    else:
        availability = 0

    response_times = [
        result.response_time
        for result in results
        if result.response_time is not None
    ]

    if response_times:
        average_response_time = sum(response_times) / len(response_times)
        minimum_response_time = min(response_times)
        maximum_response_time = max(response_times)
    else:
        average_response_time = 0
        minimum_response_time = 0
        maximum_response_time = 0

    reliability_score = round(availability, 2)

    return {
        "total_checks": total_checks,
        "successful_checks": successful_checks,
        "failed_checks": failed_checks,
        "availability": availability,
        "average_response_time": average_response_time,
        "minimum_response_time": minimum_response_time,
        "maximum_response_time": maximum_response_time,
        "reliability_score": reliability_score,
    }