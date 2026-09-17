#!/usr/bin/env python
# -*-coding:utf-8-*-

'''
// Copyright (c) 2019-2026, Oliver Merkel.
// Please see the AUTHORS file for details.
// All rights reserved.
//
// Use of this code is governed by a
// MIT license that can be found in the LICENSE file.
//
// Shared Sokoban board mechanics reused by every solver variant.
'''

import sys
import time
from collections import deque
from typing import (
    Any, Deque, Dict, List, Optional, Set, Tuple, Type, TypedDict,
)

from levels import levels

SYMBOL: Dict[str, str] = levels['symbol']


class Direction(TypedDict):
    """A single movement direction: letters and (dx, dy) deltas."""

    move: str
    push: str
    dx: int
    dy: int


def replace_char(row: str, x: int, ch: str) -> str:
    """Return row with the character at index x replaced by ch."""
    return row[:x] + ch + row[x + 1:]


class SokobanBase:
    """Mutable Sokoban board state with move/push mechanics."""

    orientation: Dict[str, Direction] = {
        'down': {'move': 'd', 'push': 'D', 'dx': 0, 'dy': 1},
        'left': {'move': 'l', 'push': 'L', 'dx': -1, 'dy': 0},
        'up': {'move': 'u', 'push': 'U', 'dx': 0, 'dy': -1},
        'right': {'move': 'r', 'push': 'R', 'dx': 1, 'dy': 0},
    }

    def __init__(self, level: List[str]):
        """level: list of strings containing the Sokoban level."""
        self.level: List[str] = list(level)

    def get_level(self) -> List[str]:
        """Return a shallow copy of the current level rows."""
        return list(self.level)

    def get_sokoban(self) -> Optional[Tuple[int, int]]:
        """Return the position of the warehouse keeper as (x, y)."""
        for y, row in enumerate(self.level):
            for x, cell in enumerate(row):
                if cell in (SYMBOL['sokoban'], SYMBOL['sokobanOnStorage']):
                    return (x, y)
        return None

    def _require_sokoban(self) -> Tuple[int, int]:
        pos = self.get_sokoban()
        assert pos is not None, 'sokoban not found on board'
        return pos

    def _target(self, direction_name: str) -> Dict[str, Tuple[int, int]]:
        (x, y) = self._require_sokoban()
        direction = self.orientation[direction_name]
        dx, dy = direction['dx'], direction['dy']
        return {
            'sokoban': (x + dx, y + dy),
            'box': (x + 2 * dx, y + 2 * dy),
        }

    def can_push(self, direction_name: str) -> bool:
        """Return True if a box can be pushed in direction_name."""
        target = self._target(direction_name)
        (nx, ny) = target['sokoban']
        neighbor = self.level[ny][nx]
        if neighbor not in (SYMBOL['box'], SYMBOL['boxOnStorage']):
            return False
        (bx, by) = target['box']
        behind_neighbor = self.level[by][bx]
        return behind_neighbor in (SYMBOL['floor'], SYMBOL['storage'])

    def push(self, direction_name: str) -> None:
        """Push a box one cell in direction_name."""
        target = self._target(direction_name)
        (x, y) = self._require_sokoban()
        vacated = SYMBOL['floor'] if self.level[y][x] == SYMBOL['sokoban'] \
            else SYMBOL['storage']
        self.level[y] = replace_char(self.level[y], x, vacated)
        (x, y) = target['sokoban']
        arrived = SYMBOL['sokoban'] if self.level[y][x] == SYMBOL['box'] \
            else SYMBOL['sokobanOnStorage']
        self.level[y] = replace_char(self.level[y], x, arrived)
        (x, y) = target['box']
        pushed = SYMBOL['box'] if self.level[y][x] == SYMBOL['floor'] \
            else SYMBOL['boxOnStorage']
        self.level[y] = replace_char(self.level[y], x, pushed)

    def can_move(self, direction_name: str) -> bool:
        """Return True if the keeper can step in direction_name."""
        (x, y) = self._require_sokoban()
        direction = self.orientation[direction_name]
        neighbor = self.level[y + direction['dy']][x + direction['dx']]
        return neighbor in (SYMBOL['floor'], SYMBOL['storage'])

    def move(self, direction_name: str) -> None:
        """Move the keeper one cell in direction_name."""
        (x, y) = self._require_sokoban()
        direction = self.orientation[direction_name]
        vacated = SYMBOL['floor'] if self.level[y][x] == SYMBOL['sokoban'] \
            else SYMBOL['storage']
        self.level[y] = replace_char(self.level[y], x, vacated)
        (x, y) = (x + direction['dx'], y + direction['dy'])
        arrived = SYMBOL['sokoban'] if self.level[y][x] == SYMBOL['floor'] \
            else SYMBOL['sokobanOnStorage']
        self.level[y] = replace_char(self.level[y], x, arrived)

    def is_solved(self) -> bool:
        """Return True once every storage cell holds a box."""
        blocking = (SYMBOL['storage'], SYMBOL['box'],
                    SYMBOL['sokobanOnStorage'])
        return not any(cell in blocking
                       for row in self.level for cell in row)

    def initial_visited(self) -> Set[Any]:
        """Return the initial visited-state cache (empty by default)."""
        return set()

    def visit(self, _solver: 'SokobanBase', _visited: Set[Any]) -> bool:
        """Return True if solver's state should be explored/queued."""
        return True

    def solve(self) -> Optional[str]:
        """Return a move/push string solving the level, or None."""
        path = ''
        to_be_analyzed: Deque[Tuple[List[str], str]] = deque(
            [(self.get_level(), path)])
        visited = self.initial_visited()
        while to_be_analyzed:
            level, path = to_be_analyzed.popleft()
            for name, direction in self.orientation.items():
                solver = type(self)(level)
                if solver.can_push(name):
                    solver.push(name)
                    if self.visit(solver, visited):
                        if solver.is_solved():
                            return path + direction['push']
                        to_be_analyzed.append(
                            (solver.get_level(), path + direction['push']))
                elif solver.can_move(name):
                    solver.move(name)
                    if self.visit(solver, visited):
                        to_be_analyzed.append(
                            (solver.get_level(), path + direction['move']))
        return None


def run(solver_cls: Type[SokobanBase]) -> None:
    """Shared CLI entry point for every solver variant."""
    selected_level = levels['setup'][int(sys.argv[1])]
    start = time.time()
    solver = solver_cls(selected_level['plan'])
    print('\n'.join(solver.level))
    print(selected_level['info'])
    print(solver.solve())
    print(time.time() - start, 'seconds')
