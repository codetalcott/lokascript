"""Pytest configuration and fixtures for hyperfixi tests."""

import pytest

from lokascript.behaviors import BehaviorRegistry


@pytest.fixture(autouse=True)
def clear_behavior_registry():
    """Clear the behavior registry before each test."""
    BehaviorRegistry.clear()
    yield
    BehaviorRegistry.clear()
