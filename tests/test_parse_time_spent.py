import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from routes.stats import parse_time_spent


def test_happy_path():
    assert parse_time_spent('2h')   == 2.0
    assert parse_time_spent('0.5h') == 0.5
    assert parse_time_spent('24h')  == 24.0
    assert parse_time_spent('0')    == 0.0


def test_none_and_empty():
    assert parse_time_spent(None)  == 0.0
    assert parse_time_spent('')    == 0.0
    assert parse_time_spent('   ') == 0.0


def test_negative():
    assert parse_time_spent('-2h')   == 0.0
    assert parse_time_spent('-0.1h') == 0.0


def test_overflow():
    assert parse_time_spent('25h')   == 24.0
    assert parse_time_spent('9999h') == 24.0


def test_invalid_format():
    assert parse_time_spent('abc')   == 0.0
    assert parse_time_spent('2.5.1h') == 0.0


def test_boundary():
    assert parse_time_spent('24.0h') == 24.0
