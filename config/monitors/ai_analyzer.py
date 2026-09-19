def analyze_incident(incident_data):
    incident_type = str(
        incident_data.get("incident_type", "")
    ).strip().upper()

    incident_type = incident_type.replace("_", " ")
    incident_type = incident_type.replace("-", " ")

    status_code = incident_data.get("status_code")
    response_time = incident_data.get("response_time")
    historical_response_time = incident_data.get(
        "historical_response_time"
    )
    availability = incident_data.get("availability")

    possible_cause = "Unknown"
    evidence = []
    recommendation = (
        "Investigate the API and review recent logs."
    )

    if incident_type in ["FAILURE", "API FAILURE"]:
        possible_cause = "API request failure"

        if status_code is not None:
            evidence.append(
                f"API returned status code {status_code}."
            )

        if response_time is not None:
            evidence.append(
                f"Response time: {response_time}s."
            )

        recommendation = (
            "Check API server logs, dependencies, "
            "and recent deployments."
        )

    elif incident_type in ["DEGRADATION", "API DEGRADATION"]:
        possible_cause = "API performance degradation"

        if response_time is not None:
            evidence.append(
                f"Recent response time: {response_time}s."
            )

        if historical_response_time is not None:
            evidence.append(
                f"Historical response time: "
                f"{historical_response_time}s."
            )

            if (
                historical_response_time > 0
                and response_time is not None
            ):
                increase = (
                    (
                        response_time
                        - historical_response_time
                    )
                    / historical_response_time
                ) * 100

                evidence.append(
                    f"Response time increased by "
                    f"{round(increase, 2)}%."
                )

        recommendation = (
            "Check server load, database queries, "
            "and downstream services."
        )

    if availability is not None:
        evidence.append(
            f"Current availability: {availability}%."
        )

    return {
        "possible_cause": possible_cause,
        "evidence": evidence,
        "recommendation": recommendation,
    }