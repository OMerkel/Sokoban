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

from sokoban_base import SokobanBase, run


class Sokoban(SokobanBase):
    """Naive breadth-first Sokoban solver without pruning."""


if __name__ == '__main__':
    run(Sokoban)
