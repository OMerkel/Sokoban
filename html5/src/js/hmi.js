/**
 * @file hmi.js
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
 * @brief Class Hmi.
 *
 * Class representing the view or Hmi of Sokoban.
 * Sokoban game is a solitaire puzzle game.
 *
 */

Hmi.levels = {
  symbol : {
    floor:            " ",
    wall:             "#",
    box:              "$",
    sokoban:          "@",
    storage:          ".",
    boxOnStorage:     "*",
    sokobanOnStorage: "+",
  },
  setup : [[
    "#########",
    "#. $@$ .#",
    "#########",
  ],[
    "#######",
    "#.@ # #",
    "#$* $ #",
    "#   $ #",
    "# ..  #",
    "#  *  #",
    "#######",
  ],[
    "###",
    "#.###",
    "#*$ #",
    "#  @#",
    "#####",
  ]],
};

function Hmi() {}

Hmi.prototype.resize = function () {
  var offsetHeight = 64,
    availableWidth = window.innerWidth - 32,
    availableHeight = window.innerHeight - offsetHeight;
  var size = Math.max( Math.min(availableWidth, availableHeight), 32 );
  this.paper.setSize( size, size );
  var boardMarginTop = (availableHeight - size) / 2;
  $('#board').css({ 'margin-top': boardMarginTop + 'px' });
  $('#selectmenu').css({ 'margin-top': boardMarginTop + 'px' });
  $('#game-page').css({
    'background-size': 'auto ' + (size/6) + 'px',
  });
  var size = size / 10;
  var minSize = 60;
  size = size < minSize ? minSize : size;
  var maxSize = 120;
  size = maxSize < size ? maxSize : size;
  $('#customMenu').css({
    'width': size+'px', 'height': size+'px',
    'background-size': size+'px ' + size+'px',
  });
  $('#customBackSelect').css({
    'width': size+'px', 'height': size+'px',
    'background-size': size+'px ' + size+'px',
  });
  $('#customBackRules').css({
    'width': size+'px', 'height': size+'px',
    'background-size': size+'px ' + size+'px',
  });
  $('#customBackOptions').css({
    'width': size+'px', 'height': size+'px',
    'background-size': size+'px ' + size+'px',
  });
  $('#customBackAbout').css({
    'width': size+'px', 'height': size+'px',
    'background-size': size+'px ' + size+'px',
  });
};

Hmi.prototype.getChallengeDimension = function () {
  var setup = Hmi.levels.setup[this.challenge];
  var b = 0;
  for (var a=0; a<setup.length; ++a) {
    var c = setup[a].length;
    b = c > b ? c : b;
  }
  return { x: b, y: setup.length };
};

Hmi.prototype.setupChallenge = function () {
  var setup = Hmi.levels.setup[this.challenge];
  var dim = this.getChallengeDimension();
  this.model = [];
  for (var y=0; y<dim.y; ++y) {
    this.model.push( [] );
    var l = setup[y];
    for (var x=0; x<dim.x; ++x) {
      this.model[y].push(x<l.length ? l[x] : Hmi.levels.symbol.floor);
    }
  }
};

Hmi.prototype.controlDirection = function ( p, t, handler ) {
  var st = this.paper.set();
  st.push(
    this.paper.circle(p.x, p.y,10).attr({fill: "r(0.75, 0.25)#fff-#000", "stroke-width": 2, stroke: "black"}),
    this.paper.circle(p.x, p.y,42).attr({fill: "black", "stroke-width": 2, stroke: "black", opacity: 0.01, })
  );
  st.attr({ cursor: 'pointer', });
  st.click( handler );
  st.translate( t.x, t.y );
  return st;
};

Hmi.prototype.initBoard = function () {
  this.paper = Raphael( 'board', 400, 400);
  this.paper.setViewBox(0, 0, 400, 400, false );
  this.challenge = 1;
  this.setupChallenge();
  this.updateChallenge();
};

Hmi.prototype.init = function () {
  this.initBoard();
  // this.initOverview();
  var $window = $(window);
  $window.resize( this.resize.bind( this ) );
  $window.resize();
  $('#next').on( 'click', this.next.bind(this) );
  $('#previous').on( 'click', this.previous.bind(this) );
  $('#random').on( 'click', this.random.bind(this) );
  $('#customBackOptions').on( 'click', this.updateChallenge.bind(this) );
  $('#customOkOptions').on( 'click', this.updateChallenge.bind(this) );
};

Hmi.prototype.next = function() {
  this.challenge = (this.challenge + 1) % Hmi.levels.setup.length;
  this.setupChallenge();
  this.updateChallenge();
  $('#left-panel').panel('close');
};

Hmi.prototype.previous = function() {
  this.challenge = (this.challenge - 1 + Hmi.levels.setup.length ) % Hmi.levels.setup.length;
  this.setupChallenge();
  this.updateChallenge();
  $('#left-panel').panel('close');
};

Hmi.prototype.random = function() {
  this.challenge = Math.floor(Math.random() * Hmi.levels.setup.length );
  this.setupChallenge();
  this.updateChallenge();
  $('#left-panel').panel('close');
};

Hmi.prototype.isPos = function (pos, sym ) {
  return this.model[pos.y][pos.x] == Hmi.levels.symbol[sym];
};

Hmi.prototype.isPosEither = function ( pos, sym1, sym2 ) {
  return this.isPos(pos, sym1) || this.isPos(pos, sym2);
};

Hmi.prototype.getSokoban = function () {
  var result = { x: -1, y: -1 };
  var dim = this.getChallengeDimension();
  for (var y=0; y<dim.y; ++y) {
    for (var x=0; x<dim.x; ++x) {
      var pos = { x: x, y: y };
      if (this.isPosEither( pos, 'sokoban', 'sokobanOnStorage' )) {
        result = pos;
      }
    }
  }
  return result;
};

Hmi.prototype.removeSokoban = function () {
  var sokoban = this.getSokoban();
  this.model[sokoban.y][sokoban.x] = this.isPos(sokoban, 'sokoban') ?
    Hmi.levels.symbol.floor:Hmi.levels.symbol.storage;
};

Hmi.prototype.setSokoban = function ( pos ) {
  this.removeSokoban();
  this.model[pos.y][pos.x] = this.isPosEither(pos, 'storage', 'boxOnStorage') ?
    Hmi.levels.symbol.sokobanOnStorage:Hmi.levels.symbol.sokoban;
};

Hmi.prototype.setBox = function( pos ) {
  this.model[pos.y][pos.x] = this.isPos(pos, 'floor') ?
    Hmi.levels.symbol.box:Hmi.levels.symbol.boxOnStorage;
};

Hmi.prototype.leftOf = function ( pos ) {
  return { x: pos.x-1, y: pos.y };
};

Hmi.prototype.rightOf = function ( pos ) {
  return { x: pos.x+1, y: pos.y };
};

Hmi.prototype.above = function ( pos ) {
  return { x: pos.x, y: pos.y-1 };
};

Hmi.prototype.below = function ( pos ) {
  return { x: pos.x, y: pos.y+1 };
};

Hmi.prototype.moveLeft = function () {
  var target = this.leftOf(this.getSokoban());
  if (this.isPosEither(target, 'floor', 'storage')) {
    this.setSokoban(target);
  } else if (this.isPosEither(target, 'box', 'boxOnStorage') &&
    this.isPosEither(this.leftOf(target), 'floor', 'storage')) {
    this.setSokoban(target);
    this.setBox(this.leftOf(target));
  }
  this.updateChallenge();
};

Hmi.prototype.moveRight = function () {
  var target = this.rightOf(this.getSokoban());
  if (this.isPosEither(target, 'floor', 'storage')) {
    this.setSokoban(target);
  } else if (this.isPosEither(target, 'box', 'boxOnStorage') &&
    this.isPosEither(this.rightOf(target), 'floor', 'storage')) {
    this.setSokoban(target);
    this.setBox(this.rightOf(target));
  }
  this.updateChallenge();
};

Hmi.prototype.moveUp = function () {
  var target = this.above(this.getSokoban());
  if (this.isPosEither(target, 'floor', 'storage')) {
    this.setSokoban(target);
  } else if (this.isPosEither(target, 'box', 'boxOnStorage') &&
    this.isPosEither(this.above(target), 'floor', 'storage')) {
    this.setSokoban(target);
    this.setBox(this.above(target));
  }
  this.updateChallenge();
};

Hmi.prototype.moveDown = function () {
  var target = this.below(this.getSokoban());
  if (this.isPosEither(target, 'floor', 'storage')) {
    this.setSokoban(target);
  } else if (this.isPosEither(target, 'box', 'boxOnStorage') &&
    this.isPosEither(this.below(target), 'floor', 'storage')) {
    this.setSokoban(target);
    this.setBox(this.below(target));
  }
  this.updateChallenge();
};

Hmi.prototype.updateChallenge = function() {
  this.paper.clear();
  this.paper.path( 'm-1000,-1000 4000,0 0,4000 -4000,0 z').attr({
    stroke: '#444', 'stroke-width': 0.2, 'stroke-linecap': 'round', fill: '#555'
  });
  var dim = this.getChallengeDimension();
  for (var y=0; y<dim.y; ++y) {
    for (var x=0; x<dim.x; ++x) {
      var pos = { x: x, y: y };
      if (this.isPos(pos, 'wall')) {
        this.paper.rect(30*x,30*y,29,29,1).attr({ fill: "#088", stroke: 'orange' });
      }
      else if (this.isPos(pos, 'storage')) {
        this.paper.rect(30*x,30*y,29,29,5).attr({ fill: "grey", stroke: 'orange' });
      }
      else if (this.isPos(pos, 'sokoban')) {
        this.paper.circle(30*x+15,30*y+15,15).attr({ fill: '#444', stroke: "black" });
      }
      else if (this.isPos(pos, 'sokobanOnStorage')) {
        this.paper.rect(30*x,30*y,29,29,5).attr({ fill: "grey", stroke: 'orange' });
        this.paper.circle(30*x+15,30*y+15,15).attr({ fill: '#444', stroke: "black" });
      }
      else if (this.isPos(pos, 'box')) {
        this.paper.rect(30*x,30*y,29,29,5).attr({ fill: 'brown', stroke: "black" });
      }
      else if (this.isPos(pos, 'boxOnStorage')) {
        this.paper.rect(30*x,30*y,29,29,5).attr({ fill: 'red', stroke: "black" });
      }
    }
  }
  this.paper.setViewBox(-10,-10,520,520, false );
  controlTranslate = { x: 400, y: 400 };
  this.paper.circle(0,0,100).attr({ fill: "#000", 'fill-opacity': 0.3, "stroke-width": 4, stroke: "black", opacity: 0.5 }).translate( controlTranslate.x, controlTranslate.y );
  this.controlDirection({x:-60, y:  0}, controlTranslate, this.moveLeft.bind(this));
  this.controlDirection({x: 60, y:  0}, controlTranslate, this.moveRight.bind(this));
  this.controlDirection({x:  0, y:-60}, controlTranslate, this.moveUp.bind(this));
  this.controlDirection({x:  0, y: 60}, controlTranslate, this.moveDown.bind(this));
  this.setHeader();
};

Hmi.prototype.setHeader = function() {
  $('#myheader').html(
    "Sokoban : " +
    this.challenge
  );
}

var g_Hmi = new Hmi();
$(document).ready( function () { g_Hmi.init(); });
