from unittest.mock import patch
import requests
from .health_checker import check_api


@patch("monitors.health_checker.requests.get")
def test_check_api_success(mock_get):
    mock_get.return_value.status_code = 200

    result = check_api(
        "https://example.com",
        expected_status=200,
        timeout=5
    )

    assert result["status_code"] == 200
    assert result["is_healthy"] is True
    
@patch("monitors.health_checker.requests.get")
def test_check_api_failure(mock_get):
    mock_get.return_value.status_code = 500

    result = check_api(
        "https://example.com",
        expected_status=200,
        timeout=5
    )

    assert result["status_code"] == 500
    assert result["is_healthy"] is False
@patch("monitors.health_checker.requests.get")
def test_check_api_network_error(mock_get):
    mock_get.side_effect = requests.RequestException()

    result = check_api(
        "https://example.com",
        expected_status=200,
        timeout=5
    )

    assert result["status_code"] is None
    assert result["response_time"] is None
    assert result["is_healthy"] is False