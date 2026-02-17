"""
S3 event → MediaConvert job creation Lambda.
Triggered when .mp4 is uploaded to input bucket.
Creates MP4 (H.264) + HLS outputs.
"""

import json
import logging
import os
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

OUTPUT_BUCKET = os.environ["OUTPUT_BUCKET"]
MEDIACONVERT_ROLE = os.environ["MEDIACONVERT_ROLE"]
REGION = os.environ.get("AWS_REGION_NAME", "ap-northeast-1")


def get_mediaconvert_endpoint():
    """Discover the account-specific MediaConvert endpoint."""
    client = boto3.client("mediaconvert", region_name=REGION)
    response = client.describe_endpoints(MaxResults=1)
    return response["Endpoints"][0]["Url"]


def create_job(endpoint_url, input_s3_uri, base_name):
    """Create a MediaConvert job with MP4 + HLS outputs."""
    client = boto3.client("mediaconvert", region_name=REGION, endpoint_url=endpoint_url)

    job_settings = {
        "Inputs": [
            {
                "FileInput": input_s3_uri,
                "AudioSelectors": {
                    "Audio Selector 1": {"DefaultSelection": "DEFAULT"}
                },
                "VideoSelector": {},
            }
        ],
        "OutputGroups": [
            # Output Group 1: MP4 file
            {
                "Name": "MP4 Output",
                "OutputGroupSettings": {
                    "Type": "FILE_GROUP_SETTINGS",
                    "FileGroupSettings": {
                        "Destination": f"s3://{OUTPUT_BUCKET}/mp4/{base_name}"
                    },
                },
                "Outputs": [
                    {
                        "ContainerSettings": {"Container": "MP4"},
                        "VideoDescription": {
                            "CodecSettings": {
                                "Codec": "H_264",
                                "H264Settings": {
                                    "RateControlMode": "QVBR",
                                    "QvbrSettings": {"QvbrQualityLevel": 7},
                                    "MaxBitrate": 5000000,
                                    "CodecProfile": "HIGH",
                                    "CodecLevel": "AUTO",
                                },
                            },
                            "Width": 1280,
                            "Height": 720,
                        },
                        "AudioDescriptions": [
                            {
                                "CodecSettings": {
                                    "Codec": "AAC",
                                    "AacSettings": {
                                        "Bitrate": 128000,
                                        "CodingMode": "CODING_MODE_2_0",
                                        "SampleRate": 48000,
                                    },
                                },
                                "AudioSourceName": "Audio Selector 1",
                            }
                        ],
                    }
                ],
            },
            # Output Group 2: HLS (Apple HTTP Live Streaming)
            {
                "Name": "HLS Output",
                "OutputGroupSettings": {
                    "Type": "HLS_GROUP_SETTINGS",
                    "HlsGroupSettings": {
                        "Destination": f"s3://{OUTPUT_BUCKET}/hls/{base_name}",
                        "SegmentLength": 6,
                        "MinSegmentLength": 0,
                    },
                },
                "Outputs": [
                    {
                        "VideoDescription": {
                            "CodecSettings": {
                                "Codec": "H_264",
                                "H264Settings": {
                                    "RateControlMode": "QVBR",
                                    "QvbrSettings": {"QvbrQualityLevel": 7},
                                    "MaxBitrate": 5000000,
                                    "CodecProfile": "HIGH",
                                    "CodecLevel": "AUTO",
                                },
                            },
                            "Width": 1280,
                            "Height": 720,
                        },
                        "AudioDescriptions": [
                            {
                                "CodecSettings": {
                                    "Codec": "AAC",
                                    "AacSettings": {
                                        "Bitrate": 128000,
                                        "CodingMode": "CODING_MODE_2_0",
                                        "SampleRate": 48000,
                                    },
                                },
                                "AudioSourceName": "Audio Selector 1",
                            }
                        ],
                        "NameModifier": "_hls",
                    }
                ],
            },
        ],
    }

    response = client.create_job(
        Role=MEDIACONVERT_ROLE,
        Settings=job_settings,
        StatusUpdateInterval="SECONDS_30",
    )

    return response["Job"]["Id"]


def handler(event, context):
    """Lambda handler: S3 event → MediaConvert job."""
    logger.info("Event: %s", json.dumps(event))

    for record in event.get("Records", []):
        bucket = record["s3"]["bucket"]["name"]
        key = record["s3"]["object"]["key"]

        if not key.lower().endswith(".mp4"):
            logger.info("Skipping non-mp4 file: %s", key)
            continue

        input_s3_uri = f"s3://{bucket}/{key}"
        base_name = key.rsplit("/", 1)[-1].rsplit(".", 1)[0]

        logger.info("Processing: %s", input_s3_uri)

        endpoint_url = get_mediaconvert_endpoint()
        job_id = create_job(endpoint_url, input_s3_uri, base_name)

        logger.info("MediaConvert job created: %s", job_id)

    return {"statusCode": 200, "body": "OK"}
