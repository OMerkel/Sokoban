#!/usr/bin/env python
# -*-coding:utf-8-*-

'''
// Copyright (c) 2019, Oliver Merkel.
// Please see the AUTHORS file for details.
// All rights reserved.
//
// Use of this code is governed by a
// MIT license that can be found in the LICENSE file.
'''

from collections import deque
import time
import sys
from levels import *

class Sokoban:

  orientation = {
    'down':  { 'move': 'd', 'push': 'D', 'dx':  0, 'dy':  1 },
    'left':  { 'move': 'l', 'push': 'L', 'dx': -1, 'dy':  0 },
    'up':    { 'move': 'u', 'push': 'U', 'dx':  0, 'dy': -1 },
    'right': { 'move': 'r', 'push': 'R', 'dx':  1, 'dy':  0 }
  }

  def __init__(self, level):
    '''
    level: list of strings containing the Sokoban level
    '''
    self.level = []
    for r in level:
      self.level.append(r)

  def getLevel(self):
    level = []
    for r in self.level:
      level.append(r)
    return level

  def getSokoban(self):
    '''
    returns the position of the warehouse keeper as ( x, y )
    '''
    result = None
    for y,r in enumerate(self.level):
      for x,c in enumerate(r):
        if c == levels['symbol']['sokoban'] or c == levels['symbol']['sokobanOnStorage']:
          result = ( x, y )
          break
      if result:
        break
    return result

  def canPush(self, o):
    result = False
    ( x, y ) = self.getSokoban()
    target = { 'sokoban': ( x + self.orientation[o]['dx'], y + self.orientation[o]['dy'] ),
      'box' : ( x + 2*self.orientation[o]['dx'], y + 2*self.orientation[o]['dy'] ) }
    neighbor = self.level[ target['sokoban'][1] ][ target['sokoban'][0] ]
    if neighbor == levels['symbol']['box'] or neighbor == levels['symbol']['boxOnStorage']:
      behindNeighbor = self.level[ target['box'][1] ][ target['box'][0] ]
      result = behindNeighbor == levels['symbol']['floor'] or behindNeighbor == levels['symbol']['storage']
    return result

  def push(self, o):
    ( x, y ) = self.getSokoban()
    target = { 'sokoban': ( x + self.orientation[o]['dx'], y + self.orientation[o]['dy'] ),
      'box' : ( x + 2*self.orientation[o]['dx'], y + 2*self.orientation[o]['dy'] ) }
    self.level[ y ] = self.level[ y ][:x] + (levels['symbol']['floor'] if self.level[ y ][ x ] == levels['symbol']['sokoban'] else levels['symbol']['storage']) + self.level[ y ][x+1:]
    ( x, y ) = target['sokoban']
    self.level[ y ] = self.level[ y ][:x] + (levels['symbol']['sokoban'] if self.level[ y ][ x ] == levels['symbol']['box'] else levels['symbol']['sokobanOnStorage']) + self.level[ y ][x+1:]
    ( x, y ) = target['box']
    self.level[ y ] = self.level[ y ][:x] + (levels['symbol']['box'] if self.level[ y ][ x ] == levels['symbol']['floor'] else levels['symbol']['boxOnStorage']) + self.level[ y ][x+1:]

  def canMove(self, o):
    ( x, y ) = self.getSokoban()
    target = ( x + self.orientation[o]['dx'], y + self.orientation[o]['dy'] )
    neighbor = self.level[ target[1] ][ target[0] ]
    return neighbor == levels['symbol']['floor'] or neighbor == levels['symbol']['storage']

  def move(self, o):
    ( x, y ) = self.getSokoban()
    target = ( x + self.orientation[o]['dx'], y + self.orientation[o]['dy'] )
    self.level[ y ] = self.level[ y ][:x] + (levels['symbol']['floor'] if self.level[ y ][ x ] == levels['symbol']['sokoban'] else levels['symbol']['storage']) + self.level[ y ][x+1:]
    ( x, y ) = target
    self.level[ y ] = self.level[ y ][:x] + (levels['symbol']['sokoban'] if self.level[ y ][ x ] == levels['symbol']['floor'] else levels['symbol']['sokobanOnStorage']) + self.level[ y ][x+1:]

  def isSolved(self):
    '''
    returns True if level is solved
    '''
    result = True
    for r in self.level:
      for c in r:
        if c == levels['symbol']['storage'] or \
           c == levels['symbol']['box'] or \
           c == levels['symbol']['sokobanOnStorage']:
          result = False
          break
      if not result:
        break
    return result

  def solve(self):
    path = ''
    toBeAnalyzed = deque([[self.getLevel(), path]])
    while toBeAnalyzed:
      level, path = toBeAnalyzed.popleft()
      for o in self.orientation:
        s = Sokoban(level)
        if s.canPush(o):
          s.push(o)
          if s.isSolved():
            return path + self.orientation[o]['push']
          toBeAnalyzed.append([s.getLevel(), path + self.orientation[o]['push']])
        elif s.canMove(o):
          s.move(o)
          toBeAnalyzed.append([s.getLevel(), path + self.orientation[o]['move']])
    return None

if __name__ == '__main__':
  levelsTotal = len(levels['setup'])
  level = levels['setup'][int(sys.argv[1])]
  start = time.time()
  s = Sokoban(level['plan'])
  print('\n'.join(s.level))
  print(level['info'])
  print(s.solve())
  end = time.time()
  print(end - start, 'seconds')
