#!/usr/bin/env python
# -*-coding:utf-8-*-

'''
// Copyright (c) 2019-2026, Oliver Merkel.
// Please see the AUTHORS file for details.
// All rights reserved.
//
// Use of this code is governed by a
// MIT license that can be found in the LICENSE file.
'''

from typing import Any, Dict, Set

from sokoban_base import SYMBOL, SokobanBase, run


class Sokoban(SokobanBase):
    """Solver with corner-pruning and a visited-state cache."""

    def is_pushing_to_corner(
            self, pos: Dict[str, int], direction_name: str) -> bool:
        """Return True if pushing a box towards pos in
        direction_name would wedge it into a corner of walls
        and/or other boxes."""
        test_positions = {
            'down': [[[0, 1], [1, 0], [1, 1]],
                     [[0, 1], [-1, 0], [-1, 1]]],
            'left': [[[-1, 0], [0, 1], [-1, 1]],
                     [[-1, 0], [0, -1], [-1, -1]]],
            'up': [[[0, -1], [1, 0], [1, -1]],
                   [[0, -1], [-1, 0], [-1, -1]]],
            'right': [[[1, 0], [0, 1], [1, 1]],
                      [[1, 0], [0, -1], [1, -1]]],
        }
        for offsets in test_positions[direction_name]:
            if all(self.level[pos['y'] + dy][pos['x'] + dx] in '#$*'
                   for dx, dy in offsets):
                return True
        return False

    def can_push(self, direction_name: str) -> bool:
        """Return True if a box can be pushed without wedging it
        permanently into a corner."""
        if not super().can_push(direction_name):
            return False
        target = self._target(direction_name)
        (bx, by) = target['box']
        behind_neighbor = self.level[by][bx]
        wedged = self.is_pushing_to_corner(
            {'y': by, 'x': bx}, direction_name)
        return not (wedged and behind_neighbor == SYMBOL['floor'])

    def initial_visited(self) -> Set[Any]:
        """Seed the visited cache with a hash of the starting state."""
        return {hash(''.join(self.get_level()))}

    def visit(self, solver: SokobanBase, visited: Set[Any]) -> bool:
        """Expand solver's state only the first time its hash is seen."""
        state_hash = hash(''.join(solver.get_level()))
        if state_hash in visited:
            return False
        visited.add(state_hash)
        return True


if __name__ == '__main__':
    run(Sokoban)
