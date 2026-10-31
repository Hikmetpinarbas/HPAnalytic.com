"""Canonical model — tüm pipeline'ın ortak dili."""
from dataclasses import dataclass, field
from typing import Optional, Iterator

@dataclass
class Event:
    id: int
    t: float
    t_raw: float
    half: int
    team_id: str
    team_name: str
    player_id: Optional[str]
    player_name: Optional[str]
    action: str
    kind: str
    x: Optional[float]
    y: Optional[float]
    xt: Optional[float] = None
    xg: Optional[float] = None

    def team_code(self) -> str:
        n = self.team_name.lower()
        if 'galatasaray' in n: return 'GS'
        if 'lille' in n: return 'LIL'
        if 'fenerbahce' in n or 'fenerbahçe' in n: return 'FB'
        if 'besiktas' in n or 'beşiktaş' in n: return 'BJK'
        return 'UNK'

@dataclass
class Match:
    id: str
    home: str
    away: str
    date: str
    events: list = field(default_factory=list)
    players: dict = field(default_factory=dict)
    metadata: dict = field(default_factory=dict)

    def goals(self):
        return [e for e in self.events if e.kind == 'goal']

    def shots(self):
        return [e for e in self.events if e.kind in ('shot', 'goal')]
