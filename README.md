# Sokoban

倉庫番 - Sokoban solitaire logic puzzle game

The term _Sokoban_ means _warehouse keeper_. The player controls a warehouse keeper. He has to push boxes onto marked storage locations to solve each level.

The original game of Sokoban was created back in the early 1980s Home Computer era by Hiroyuki Imabayashi then distributed by Thinking Rabbit, a Japanese software house.

## Usage of Browser Javascript Version

Simply start a session of the [Sokoban game](https://omerkel.github.io/Sokoban/html5/src) in your browser window. 

## Usage of Dart Version

You can find a version written in Dart programming language in this repository. This is a ASCII graphics version played on the command line console (STDIN/STDOUT). A Dart SDK is ne
eded to run it ( https://dart.dev ).

```
$ dart --version
Dart VM version: 2.4.0 (Unknown timestamp) on "linux_x64"
$ cd dart
$ dart sokoban.dart ../3rdParty/Levels/Microban.txt 3
Found 155 levels in Microban.txt.
Level 3:
  ####
###  ####
#     $ #
# #  #$ #
# . .#@ #
#########
```

What the symbols represent in the level files and on screen while playing the game:

```Dart
var symbol = {
  'floor':            " ",
  'wall':             "#",
  'box':              "\$",
  'sokoban':          "@",
  'storage':          ".",
  'boxOnStorage':     "*",
  'sokobanOnStorage': "+"
};
```

Use the following keys to control the Sokoban

```Dart
var key = {
  'left':  'h',
  'down':  'j',
  'up':    'k',
  'right': 'l'
};
```

__Ctrl+D__ exits the current game

## Links and Third Party

* https://en.wikipedia.org/wiki/Sokoban

Due to its popularity there are free level collections available in the community. A huge and widely spread level collection has been created by David W. Skinner named Microban and Sasquatch.

* http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm

Various level formats have been defined that are used in the community. These simplify to use the same level files in different Sokoban implementations.

* http://www.sokobano.de/wiki/index.php?title=Level_format

More Sokoban resources, links and information...

* http://www.sokobano.de

Dart programming language

* https://dart.dev
* https://dart.dev/tools/sdk

## Contributors / Authors

Oliver Merkel

_All logos, brands and trademarks mentioned belong to their respective owners._
