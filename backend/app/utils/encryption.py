import base64


def encrypt_tier_zero(value: str) -> str:
    return base64.b64encode(value.encode("utf-8")).decode("utf-8")


def decrypt_tier_zero(value: str) -> str:
    return base64.b64decode(value.encode("utf-8")).decode("utf-8")

