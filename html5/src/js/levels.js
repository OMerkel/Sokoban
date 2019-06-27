/**
 * @file levels.js
 * @author Oliver Merkel <Merkel(dot)Oliver(at)web(dot)de>
 * @date 2019 June 23
 *
 * @section LICENSE
 *
 * Copyright 2019, Oliver Merkel <Merkel(dot)Oliver(at)web(dot)de>
 * All rights reserved.
 *
 * Released under the MIT license.
 *
 * @section DESCRIPTION
 *
 * @brief Some Sokoban challenges.
 *
 * Sokoban game is a solitaire puzzle game. The challenges and used
 * symbols for the representation are defined in here.
 *
 */

levels = {
  symbol : {
    floor:            " ",
    wall:             "#",
    box:              "$",
    sokoban:          "@",
    storage:          ".",
    boxOnStorage:     "*",
    sokobanOnStorage: "+",
  },
  setup : [ {
    plan: [
    "###",
    "#.#",
    "# #",
    "#$#",
    "#@#",
    "###",
    ],
    info: 'Push box onto storage!',
  }, {
    plan: [
    "#########",
    "#. $@$ .#",
    "#########",
    ],
    info: 'Multiple boxes...',
  }, {
    plan: [
    "#########",
    "# .$@$. #",
    "#########",
    ],
    info: 'Don´t push too far!',
  }, {
    plan: [
    "######",
    "#   .#",
    "#  ###",
    "##$#",
    " #@#",
    " ###",
    ],
    info: 'Around the corner.',
  }, {
    plan: [
    "  ######",
    "  #.   #",
    "### ##$###",
    "#@ $   . #",
    "#    ####*",
    "######",
    ],
  }, {
    plan: [
    "#####",
    "#  @#",
    "#*$ #",
    "#.###",
    "###",
    ],
    info: 'Easy going!',
  }, {
    plan: [
    "#######",
    "#.@ # #",
    "#$* $ #",
    "#   $ #",
    "# ..  #",
    "#  *  #",
    "#######",
    ],
    info: 'Not so easy...',
  }, {
    plan: [
    " #####",
    "##   #",
    "#@$  #",
    "#. $##",
    "#.  #",
    "#####",
    ],
    info: 'On the other side',
  }, {
    plan: [
    "    #####",
    "    #   #",
    "    #$  #",
    "  ###  $###",
    "  #  $  $ #",
    "### # # # #*#####",
    "#   # ### ##  ..#",
    "# $  $      @ ..#",
    "##### #### #  ..#",
    "    #      *#####",
    "    ########",
    ],
    info: 'Moderate challenge',
  }, {
    plan: [
    "*####        ####*",
    "##  ##########  ##",
    "#                #",
    "#  *###########  #",
    "## #*  #  #   # ##",
    " # #      #   # #",
    " # #  ##$ #  ## #",
    " # ## #  $#$ #  #",
    " # *# #      ## #",
    " # ## #  ##   # ##",
    "##*#  #########  #",
    "# .#             #",
    "#@..#  #######  ##",
    "*#######     ####*",
    ],
    info: 'A long way...',
  }],
};
