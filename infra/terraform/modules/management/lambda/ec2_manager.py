"""
EC2 Management Lambda — Start / Stop / Status for k3s instance.

Used by Step Functions to orchestrate EC2 start/stop workflows
and by API Gateway for direct status queries.
"""

import json
import logging
import os
import urllib.request
import urllib.error

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

ec2 = boto3.client("ec2", region_name=os.environ.get("AWS_REGION", "ap-northeast-1"))
ssm = boto3.client("ssm", region_name=os.environ.get("AWS_REGION", "ap-northeast-1"))

INSTANCE_ID = os.environ["INSTANCE_ID"]
HEALTH_CHECK_URL = os.environ.get("HEALTH_CHECK_URL", "")


def get_instance_state() -> dict:
    """Get current EC2 instance state and details."""
    resp = ec2.describe_instances(InstanceIds=[INSTANCE_ID])
    instance = resp["Reservations"][0]["Instances"][0]
    state = instance["State"]["Name"]

    result = {
        "instanceId": INSTANCE_ID,
        "state": state,
    }

    if state == "running":
        result["publicIp"] = instance.get("PublicIpAddress", "")

    return result


def start_instance() -> dict:
    """Start the EC2 instance."""
    current = get_instance_state()
    if current["state"] == "running":
        return {**current, "message": "Instance is already running"}

    if current["state"] != "stopped":
        return {
            **current,
            "message": f"Cannot start: instance is in '{current['state']}' state",
            "error": True,
        }

    ec2.start_instances(InstanceIds=[INSTANCE_ID])
    logger.info("Start command sent for %s", INSTANCE_ID)
    return {**get_instance_state(), "message": "Start command sent"}


def stop_instance() -> dict:
    """Stop the EC2 instance."""
    current = get_instance_state()
    if current["state"] == "stopped":
        return {**current, "message": "Instance is already stopped"}

    if current["state"] != "running":
        return {
            **current,
            "message": f"Cannot stop: instance is in '{current['state']}' state",
            "error": True,
        }

    ec2.stop_instances(InstanceIds=[INSTANCE_ID])
    logger.info("Stop command sent for %s", INSTANCE_ID)
    return {**get_instance_state(), "message": "Stop command sent"}


def check_health() -> dict:
    """Check application health via HTTP."""
    if not HEALTH_CHECK_URL:
        return {"healthy": False, "message": "HEALTH_CHECK_URL not configured"}

    try:
        req = urllib.request.Request(HEALTH_CHECK_URL, method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode())
            return {"healthy": True, "status": body}
    except (urllib.error.URLError, urllib.error.HTTPError, Exception) as e:
        logger.warning("Health check failed: %s", str(e))
        return {"healthy": False, "message": str(e)}


def refresh_ecr_token() -> dict:
    """Refresh ECR pull secret on EC2 via SSM Run Command."""
    try:
        resp = ssm.send_command(
            InstanceIds=[INSTANCE_ID],
            DocumentName="AWS-RunShellScript",
            Parameters={
                "commands": ["/usr/local/bin/refresh-ecr-secret.sh"],
                "executionTimeout": ["60"],
            },
            TimeoutSeconds=120,
        )
        command_id = resp["Command"]["CommandId"]
        logger.info("ECR refresh command sent: %s", command_id)
        return {"success": True, "commandId": command_id}
    except Exception as e:
        logger.error("ECR refresh failed: %s", str(e))
        return {"success": False, "message": str(e)}


def handler(event, context):
    """
    Lambda entry point.

    Expects event with "action" field:
      - "status"       : Get instance state
      - "start"        : Start instance
      - "stop"         : Stop instance
      - "check_health" : HTTP health check
      - "refresh_ecr"  : Refresh ECR token via SSM
    """
    logger.info("Event: %s", json.dumps(event))

    # Support both direct invocation and API Gateway proxy
    if "body" in event and event.get("httpMethod"):
        # API Gateway proxy integration
        try:
            body = json.loads(event["body"]) if event["body"] else {}
        except (json.JSONDecodeError, TypeError):
            body = {}
        qs = event.get("queryStringParameters") or {}
        action = body.get("action", qs.get("action", "status"))
    else:
        # Direct invocation (Step Functions)
        action = event.get("action", "status")

    actions = {
        "status": get_instance_state,
        "start": start_instance,
        "stop": stop_instance,
        "check_health": check_health,
        "refresh_ecr": refresh_ecr_token,
    }

    if action not in actions:
        result = {"error": True, "message": f"Unknown action: {action}"}
    else:
        result = actions[action]()

    # For API Gateway, return proper response format
    if "httpMethod" in event:
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,X-Api-Key",
                "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
            },
            "body": json.dumps(result),
        }

    return result
