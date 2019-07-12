<img alt="Sokoban icon" width="64" src="html5/src/img/icons/sokoban64.png" /> Sokoban
=============================================

倉庫番 - Sokoban solitaire logic puzzle game

The term _Sokoban_ means _warehouse keeper_. The player controls a warehouse keeper.
He has to push boxes onto marked storage locations to solve each level.

The original game of Sokoban was created back in the early 1980s Home Computer era by
Hiroyuki Imabayashi then distributed by Thinking Rabbit, a Japanese software house.

## Usage of Browser Javascript Version

Simply start a session of the [Sokoban game](https://omerkel.github.io/Sokoban/html5/src)
in your browser window. 

## Usage of Dart Version

You can find a version written in Dart programming language in this repository, too.
This is a ASCII graphics version played on the command line console (STDIN/STDOUT).
A Dart SDK is needed to run it ( https://dart.dev ).

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

## Solving Sokoban Levels

```
$ python --version
Python 3.5.2
$ cd python
$ python sokoban_solver_1.py 0
###
#.#
# #
#$#
#@#
###
UU
0.000347137451171875 seconds
```

The selected level or challenge indexed by '0' on the command line is shown with following symbols.

```python
levels = {
  'symbol' : {
    'floor':            " ",
    'wall':             "#",
    'box':              "$",
    'sokoban':          "@",
    'storage':          ".",
    'boxOnStorage':     "*",
    'sokobanOnStorage': "+",
  },
...
```

The solution found is shown below this output of the challenge.

```python
  orientation = {
    'down':  { 'move': 'd', 'push': 'D', 'dx':  0, 'dy':  1 },
    'left':  { 'move': 'l', 'push': 'L', 'dx': -1, 'dy':  0 },
    'up':    { 'move': 'u', 'push': 'U', 'dx':  0, 'dy': -1 },
    'right': { 'move': 'r', 'push': 'R', 'dx':  1, 'dy':  0 }
  }
```

The two uppercase 'UU' in the output indicate that two pushes have to be performed to solve the challenge.

__sokoban_solver_1.py__ works for simple levels in very low time.

Solving challenge 3 by UUluRR and 5 using the moves and pushes llDurrdL:

```
$ python sokoban_solver_1.py 3
######
#   .#
#  ###
##$#
 #@#
 ###
UUluRR
0.003311634063720703 seconds
$ python sokoban_solver_1.py 5
#####
#  @#
#*$ #
#.###
###
llDurrdL
0.016065359115600586 seconds
```

As soon as the warehouse keeper gets more liberties or freedom to move the time to solve the challenges
increases enormously. This is since the _brute-force-attack_ to find the solution traverses situations
over and over again even if the same situation has been _visited_ and thus has been analysed before.
Most likely then the computer runs _out of memory_ or you get a _memory error_ or _couldn't allocate_
more memory after a while.

```
$ python sokoban_solver_1.py 4
  ######
  #.   #
### ##$###
#@ $   . #
#    ####*
######
```

Time to wait or give up...

__sokoban_solver_2.py__ avoids traversing already visited situations while searching for the solution.
This is done by storing each level situation in a set named _visited_ in the python code.

```
$ python sokoban_solver_2.py 4
  ######
  #.   #
### ##$###
#@ $   . #
#    ####*
######
rdrruLuurrrDullldddlluRdrUUdrrR
0.09712076187133789 seconds
$ python3 sokoban_solver_2.py 6
#######
#.@ # #
#$* $ #
#   $ #
# ..  #
#  *  #
#######
DDrdrruLruLLDllU
3.3833835124969482 seconds
python3 sokoban_solver_2.py 7
 #####
##   #
#@$  #
#. $##
#.  #
#####
RurrdLulDlddrrULuurrdLulDDrdL
0.0918741226196289 seconds
```

Still the Sokoban solver has limitations to find solutions for levels like the following one.

```
$ python sokoban_solver_2.py 8
    #####
    #   #
    #$  #
  ###  $###
  #  $  $ #
### # # # #*#####
#   # ### ##  ..#
# $  $      @ ..#
##### #### #  ..#
    #      *#####
    ########
```

Again memory consumption is high. And it continous to search for solutions even if it is
clear that a specific solution is already unsolveable. E.g. if a box gets pushed into
a corner and can not be pushed out of the corner anymore. Like this:

```
    #####
    #$  #
    #   #
...
```

To be continued...

## Links and Third Party

* https://en.wikipedia.org/wiki/Sokoban

Due to its popularity there are free level collections available in the community.
A huge and widely spread level collection has been created by David W. Skinner
named Microban and Sasquatch.

* http://www.abelmartin.com/rj/sokobanJS/Skinner/David%20W.%20Skinner%20-%20Sokoban.htm

Various level formats have been defined that are used in the community.
These simplify to use the same level files in different Sokoban implementations.

* http://www.sokobano.de/wiki/index.php?title=Level_format

More Sokoban resources, links and information...

* http://www.sokobano.de

Dart programming language

* https://dart.dev
* https://dart.dev/tools/sdk

## Contributors / Authors

Oliver Merkel

_All logos, brands and trademarks mentioned belong to their respective owners._
