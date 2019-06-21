#!/usr/bin/env dart

// Copyright (c) 2019, Oliver Merkel.
// Please see the AUTHORS file for details.
// All rights reserved.
//
// Use of this code is governed by a
// MIT license that can be found in the LICENSE file.

import 'dart:convert';
import 'dart:io';

List<List<List<String>>> levels = [];
List<List<String>> level = [];

getLevelsFromFile(levelFile) {
  var result = 0;
  var file = File(levelFile);
  var lines = file.readAsStringSync(encoding: ascii).split('\n');
  var a = 0;
  List<List<String>> l = [];

  while (a<lines.length) {
    while (a<lines.length && (lines[a].startsWith(';') || lines[a].trim().length == 0)) {
      ++a;
    }
    if (a<lines.length) {
      ++result;
      l = [];
    }
    while (a<lines.length && lines[a].trim().length > 0 && !lines[a].startsWith(';')) {
      l.add(lines[a].split(''));
      ++a;
    }
    if (l.length > 0) {
      levels.add(l);
    }
  }
  stdout.write('Found $result levels in $levelFile.\n');
  return result;
}

getLevel(n) {
  stdout.write('Level $n:\n');
  return levels[n-1];
}

var symbol = {
  'floor':            " ",
  'wall':             "#",
  'box':              "\$",
  'sokoban':          "@",
  'storage':          ".",
  'boxOnStorage':     "*",
  'sokobanOnStorage': "+"
};

var key = {
  'left':  'h',
  'down':  'j',
  'up':    'k',
  'right': 'l'
};

getSokoban() {
  var result = { 'x': -1, 'y': -1 };
  for( var y = 0; y<level.length; ++y ) {
    for( var x = 0; x<level[y].length; ++x ) {
      var pos = { 'x': x, 'y': y };
      if (isPosEither(pos, 'sokoban', 'sokobanOnStorage')) {
        result = pos;
      }
    }
  }
  return result;
}

isSolved() {
  var result = true;
  for( var y = 0; y<level.length; ++y ) {
    for( var x = 0; x<level[y].length; ++x ) {
      var pos = { 'x': x, 'y': y };
      result &= ! isPosEither(pos, 'storage', 'sokobanOnStorage');
    }
  }
  return result;
}

update() {
  level.forEach( (l) => (l+["\n"]).forEach( (x) => stdout.write( x ) ) );
  stdout.write('\n');
}

isPos( pos, sym ) {
  return level[pos['y']][pos['x']] == symbol[sym];
}

isPosEither( pos, sym1, sym2 ) {
  return isPos(pos, sym1) || isPos(pos, sym2);
}

leftOf( pos ) {
  return { 'x': pos['x']-1, 'y': pos['y'] };
}

rightOf( pos ) {
  return { 'x': pos['x']+1, 'y': pos['y'] };
}

above( pos ) {
  return { 'x': pos['x'], 'y': pos['y']-1 };
}

below( pos ) {
  return { 'x': pos['x'], 'y': pos['y']+1 };
}

removeSokoban() {
  var sokoban = getSokoban();
  level[sokoban['y']][sokoban['x']] = isPos(sokoban, 'sokoban') ?
    symbol['floor'] : symbol['storage'];
}

setSokoban( pos ) {
  removeSokoban();
  level[pos['y']][pos['x']] = isPosEither(pos, 'storage', 'boxOnStorage') ?
    symbol['sokobanOnStorage']:symbol['sokoban'];
}

setBox( pos ) {
  level[pos['y']][pos['x']] = isPos(pos, 'floor') ?
    symbol['box'] : symbol['boxOnStorage'];
}

usage() {
  var executable = Platform.executable;
  var script = Platform.script.toFilePath().split(Platform.pathSeparator).last;
  stdout.write('$executable $script [levelFile] [levelNumber]\n');
}

main(List<String> arguments) {
  var levelCount = getLevelsFromFile(arguments[0]);
  var selected = int.parse(arguments[1]);
  if (selected > 0 && selected <= levelCount) {
    level = getLevel(selected);
    stdin.echoMode = false;
    stdin.lineMode = false;

    var sokoban = getSokoban();
    update();
    var subscription;
    subscription = stdin.listen((List<int> data) {
      // Ctrl-D is EOT (End Of Transmission) char #04
      if (data.contains(4)) {
        stdout.write('Challenge not solved! Exiting...\n');
        stdin.lineMode = true;
        stdin.echoMode = true;
        subscription.cancel();
      } else {
        var k = utf8.decode(data);
        sokoban = getSokoban();
        if (k==key['left']) {
          var target = leftOf(sokoban);
          if (isPosEither(target, 'floor', 'storage')) {
            setSokoban(target);
          } else if (isPosEither(target, 'box', 'boxOnStorage') &&
            isPosEither(leftOf(target), 'floor', 'storage')) {
            setSokoban(target);
            setBox(leftOf(target));
          }
        } else if (k==key['right']) {
          var target = rightOf(sokoban);
          if (isPosEither(target, 'floor', 'storage')) {
            setSokoban(target);
          } else if (isPosEither(target, 'box', 'boxOnStorage') &&
            isPosEither(rightOf(target), 'floor', 'storage')) {
            setSokoban(target);
            setBox(rightOf(target));
          }
        } else if (k==key['up']) {
          var target = above(sokoban);
          if (isPosEither(target, 'floor', 'storage')) {
            setSokoban(target);
          } else if (isPosEither(target, 'box', 'boxOnStorage') &&
            isPosEither(above(target), 'floor', 'storage')) {
            setSokoban(target);
            setBox(above(target));
          }
        } else if (k==key['down']) {
          var target = below(sokoban);
          if (isPosEither(target, 'floor', 'storage')) {
            setSokoban(target);
          } else if (isPosEither(target, 'box', 'boxOnStorage') &&
            isPosEither(below(target), 'floor', 'storage')) {
            setSokoban(target);
            setBox(below(target));
          }
        }
        update();
        if (isSolved()) {
          stdout.write('Great job! Challenge solved!\n');
          stdin.lineMode = true;
          stdin.echoMode = true;
          subscription.cancel();
        }
      }
    });
  }
  else {
    usage();
  }
}
