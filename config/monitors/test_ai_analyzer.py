from .ai_analyzer import analyze_incident


def test_analyze_degradation_incident():
    incident_data = {
        "incident_type": "DEGRADATION",
        "status_code": 200,
        "response_time": 2.0,
        "historical_response_time": 1.0,
        "availability": 99.0,
    }

    result = analyze_incident(incident_data)

    assert result["possible_cause"] == "API performance degradation"
    assert "Recent response time: 2.0s." in result["evidence"]
    assert "Historical response time: 1.0s." in result["evidence"]
    assert "Response time increased by 100.0%." in result["evidence"]
    assert "Current availability: 99.0%." in result["evidence"]
    assert result["recommendation"] != ""
    
def test_analyze_failure_incident():
    incident_data = {
        "incident_type": "FAILURE",
        "status_code": 500,
        "response_time": 3.0,
        "availability": 95.0,
    }

    result = analyze_incident(incident_data)

    assert result["possible_cause"] == "API request failure"
    assert "API returned status code 500." in result["evidence"]
    assert "Current availability: 95.0%." in result["evidence"]
    assert result["recommendation"] != ""