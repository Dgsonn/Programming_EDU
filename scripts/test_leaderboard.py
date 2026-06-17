#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Test logic leaderboard (không cần DB)."""
import sys
sys.path.insert(0, r'D:\newcty\Programming_EDU')

from routes.leaderboard import _attach_medal, _avatar_for, _build_friends, MOCK_FRIENDS, MEDALS

# Test medal
entries = [{'rank': 1}, {'rank': 2}, {'rank': 3}, {'rank': 4}]
result = _attach_medal(entries)
assert result[0]['medal'] == '🥇', result[0]
assert result[1]['medal'] == '🥈', result[1]
assert result[2]['medal'] == '🥉', result[2]
assert result[3]['medal'] == '', result[3]
print('[OK] _attach_medal')

# Test avatar
assert _avatar_for('Alice') == '🧑\u200d💻'
assert _avatar_for('Bình') == '👩\u200d🎓'
assert _avatar_for('') == '🧑'
print('[OK] _avatar_for')

# Test friends build (user XP cao)
entries, me = _build_friends(uid=999, user_name='Test User', user_xp=5000)
assert me['rank'] == 1, me
assert entries[0]['name'] == 'Test User', entries[0]
print(f'[OK] _build_friends (high XP) — user rank={me["rank"]}, top1={entries[0]["name"]}')

# Test friends với user XP thấp
entries2, me2 = _build_friends(uid=999, user_name='Test User', user_xp=100)
print(f'[OK] _build_friends (low XP) — user rank={me2["rank"]}, top1={entries2[0]["name"]}={entries2[0]["value"]}')

# Test friends user ở giữa
entries3, me3 = _build_friends(uid=999, user_name='Test User', user_xp=1100)
in_top = any(e['name'] == 'Test User' for e in entries3)
print(f'[OK] _build_friends (mid XP=1100) — user rank={me3["rank"]}, inTop={in_top}')

print()
print(f'Mock friends count: {len(MOCK_FRIENDS)}')
print('All tests passed!')
