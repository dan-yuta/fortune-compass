"""
Bedrock Agent → Fortune Compass Backend API bridge Lambda.
Receives action group invocations from Bedrock Agent and forwards to the app API.
"""

import json
import logging
import os
import urllib.request
import urllib.error
import urllib.parse

logger = logging.getLogger()
logger.setLevel(logging.INFO)

API_BASE_URL = os.environ["API_BASE_URL"]


def call_api(path, params=None):
    """Call the Fortune Compass backend API."""
    url = f"{API_BASE_URL}{path}"
    if params:
        query = urllib.parse.urlencode({k: v for k, v in params.items() if v})
        url = f"{url}?{query}"

    logger.info("Calling API: %s", url)

    req = urllib.request.Request(url, method="GET")
    req.add_header("Accept", "application/json")

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body)
    except urllib.error.HTTPError as e:
        logger.error("API error: %s %s", e.code, e.reason)
        return {"error": f"API returned {e.code}: {e.reason}"}
    except Exception as e:
        logger.error("Request failed: %s", str(e))
        return {"error": str(e)}


def extract_params(parameters):
    """Extract parameters from Bedrock Agent action group invocation."""
    params = {}
    if parameters:
        for param in parameters:
            params[param["name"]] = param.get("value", "")
    return params


def handler(event, context):
    """
    Bedrock Agent action group Lambda handler.
    Event format: https://docs.aws.amazon.com/bedrock/latest/userguide/agents-lambda.html
    """
    logger.info("Event: %s", json.dumps(event))

    api_path = event.get("apiPath", "")
    http_method = event.get("httpMethod", "GET")
    parameters = event.get("parameters", [])
    action_group = event.get("actionGroup", "")
    message_version = event.get("messageVersion", "1.0")

    params = extract_params(parameters)

    # Map API path to backend endpoint
    path_mapping = {
        "/api/fortune/dashboard": "/api/fortune/dashboard",
        "/api/fortune/zodiac": "/api/fortune/zodiac",
        "/api/fortune/tarot": "/api/fortune/tarot",
        "/api/fortune/omikuji": "/api/fortune/omikuji",
        "/api/fortune/dream": "/api/fortune/dream",
        "/api/fortune/blood-type": "/api/fortune/blood-type",
        "/api/fortune/fengshui": "/api/fortune/fengshui",
    }

    backend_path = path_mapping.get(api_path, api_path)
    result = call_api(backend_path, params)

    response_body = {
        "application/json": {
            "body": json.dumps(result, ensure_ascii=False)
        }
    }

    action_response = {
        "actionGroup": action_group,
        "apiPath": api_path,
        "httpMethod": http_method,
        "httpStatusCode": 200,
        "responseBody": response_body,
    }

    api_response = {
        "messageVersion": message_version,
        "response": action_response,
    }

    logger.info("Response: %s", json.dumps(api_response, ensure_ascii=False))
    return api_response
