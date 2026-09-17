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

from typing import Any, Set

from sokoban_base import SokobanBase, run


class Sokoban(SokobanBase):
    """Breadth-first solver with a visited-state cache."""

    def initial_visited(self) -> Set[Any]:
        """Seed the visited cache with the starting level state."""
        return {''.join(self.get_level())}

    def visit(self, solver: SokobanBase, visited: Set[Any]) -> bool:
        """Expand solver's state only the first time it is seen."""
        joined = ''.join(solver.get_level())
        if joined in visited:
            return False
        visited.add(joined)
        return True


if __name__ == '__main__':
    run(Sokoban)
