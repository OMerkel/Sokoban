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

function Hmi() {}

Hmi.prototype.resize = function () {
  var offsetHeight = 64,
    availableWidth = window.innerWidth - 32,
    availableHeight = window.innerHeight - offsetHeight;
  var size = Math.max( Math.min(availableWidth, availableHeight), 32 );
  this.paper.setSize( size, size );
  var dim = this.getChallengeDimension();
  var d = dim.x > dim.y ? dim.x : dim.y;
  this.boardSize = 30*d;
  this.paper.setViewBox(-10,-10,20+this.boardSize,20+this.boardSize, false );
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
  var backAttributes = {
    'width': size+'px', 'height': size+'px',
    'background-size': size+'px ' + size+'px',
  };
  $('#customBackRules').css(backAttributes);
  $('#customBackStatistics').css(backAttributes);
  $('#customBackOptions').css(backAttributes);
  $('#customBackAbout').css(backAttributes);
};

Hmi.prototype.getChallengeDimension = function () {
  var plan = levels.setup[this.challenge].plan;
  var b = 0;
  for (var a=0; a<plan.length; ++a) {
    var c = plan[a].length;
    b = c > b ? c : b;
  }
  return { x: b, y: plan.length };
};

Hmi.prototype.setupChallenge = function () {
  var plan = levels.setup[this.challenge].plan;
  var dim = this.getChallengeDimension();
  this.model = [];
  for (var y=0; y<dim.y; ++y) {
    this.model.push( [] );
    var l = plan[y];
    for (var x=0; x<dim.x; ++x) {
      this.model[y].push(x<l.length ? l[x] : levels.symbol.floor);
    }
  }
  this.resize();
  this.moves = '';
  this.pushes = 0;
  this.completed = false;
  this.sokoban = { orientation: this.orientation.up, pushing: false };
};

Hmi.prototype.controlDirection = function ( p, t, orientation, handler ) {
  var st = this.paper.set();
  st.push(
    this.paper.path('m ' + (0.04*this.boardSize) + ',0 ' + (-0.08*this.boardSize) + ',0 ' + 0.04*this.boardSize + ',' + (0.04*this.boardSize) + ' z').translate(p.x,p.y).rotate( orientation.angle,t.x,t.y ).attr({fill: "black", "stroke-width": this.boardSize*0.03, 'stroke-linejoin': "round", stroke: "black", opacity: 0.4 }),
    // this.paper.circle(p.x, p.y,0.03*this.boardSize).attr({fill: "black", "stroke-width": this.boardSize*0.005, stroke: "black", opacity: 0.4 }),
    this.paper.circle(p.x, p.y,0.1*this.boardSize).attr({fill: "black", "stroke-width": this.boardSize*0.005, stroke: "black", opacity: 0.01, })
  );
  st.attr({ cursor: 'pointer', });
  st.click( handler.bind(this) );
  st.translate( t.x, t.y );
  return st;
};

Hmi.prototype.initBoard = function () {
  this.paper = Raphael( 'board', 400, 400);
  this.paper.setViewBox(0, 0, 400, 400, false );
  this.challenge = 0;
  this.setupChallenge();
};

Hmi.prototype.init = function () {
  this.orientation = {
    down:  { angle:   0, move: 'd', push: 'D', neighbour: this.below , counterdirection: this.above },
    left:  { angle:  90, move: 'l', push: 'L', neighbour: this.leftOf, counterdirection: this.rightOf },
    up:    { angle: 180, move: 'u', push: 'U', neighbour: this.above, counterdirection: this.below },
    right: { angle: 270, move: 'r', push: 'R', neighbour: this.rightOf, counterdirection: this.leftOf }
  };
  this.initBoard();
  var $window = $(window);
  $window.resize( this.resize.bind( this ) );
  $window.resize();
  this.updateChallenge();
  $('#restart').on( 'click', this.startChallenge.bind(this) );
  $('#next').on( 'click', this.next.bind(this) );
  $('#previous').on( 'click', this.previous.bind(this) );
  $('#random').on( 'click', this.random.bind(this) );
  $('#undo').on( 'click', this.undo.bind(this) );
  $('#customBackOptions').on( 'click', this.updateChallenge.bind(this) );
  $('#customOkOptions').on( 'click', this.updateChallenge.bind(this) );
};

Hmi.prototype.startChallenge = function() {
  this.setupChallenge();
  this.updateChallenge();
  $('#left-panel').panel('close');
};

Hmi.prototype.next = function() {
  this.challenge = (this.challenge + 1) % levels.setup.length;
  this.startChallenge();
};

Hmi.prototype.previous = function() {
  this.challenge = (this.challenge - 1 + levels.setup.length ) % levels.setup.length;
  this.startChallenge();
};

Hmi.prototype.random = function() {
  this.challenge = Math.floor(Math.random() * levels.setup.length );
  this.startChallenge();
};

Hmi.prototype.undo = function() {
  if (this.moves.length > 0) {
    var m = this.moves[this.moves.length-1];
    var d = Object.keys(this.orientation);
    var last = {};
    for (var a = 0; a<d.length; ++a) {
      var o = this.orientation[d[a]];
      if (o.move == m || o.push == m) {
        last = {
          orientation : o,
          type : o.move == m ? 'move' : 'push',
        }
      }
    }
    this.moves = this.moves.substring(0, this.moves.length-1);
    this.sokobanUndoAction(last);
  }
  this.updateChallenge();
  $('#left-panel').panel('close');
};

Hmi.prototype.sokobanUndoAction = function ( last ) {
  var origin = this.getSokoban();
  var target = last.orientation.counterdirection(origin);
  this.setSokoban(target);
  this.sokoban.pushing = last.type == 'push';
  if (this.sokoban.pushing) {
    this.removeBox(last.orientation.neighbour(origin));
    this.setBox(origin);
    --this.pushes;
  }
  this.sokoban.orientation = last.orientation;
};

Hmi.prototype.isPos = function (pos, sym ) {
  return this.model[pos.y][pos.x] == levels.symbol[sym];
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
    levels.symbol.floor:levels.symbol.storage;
};

Hmi.prototype.setSokoban = function ( pos ) {
  this.removeSokoban();
  this.model[pos.y][pos.x] = this.isPosEither(pos, 'storage', 'boxOnStorage') ?
    levels.symbol.sokobanOnStorage:levels.symbol.sokoban;
};

Hmi.prototype.isCompleted = function () {
  var result = true;
  var dim = this.getChallengeDimension();
  for (var y=0; y<dim.y && result; ++y) {
    for (var x=0; x<dim.x && result; ++x) {
      var pos = { x: x, y: y };
      if (this.isPosEither( pos, 'storage', 'box' )) {
        result = false;
      }
    }
  }
  return result;
};

Hmi.prototype.removeBox = function( pos ) {
  this.model[pos.y][pos.x] = this.isPos(pos, 'box') ?
    levels.symbol.floor:levels.symbol.storage;
};

Hmi.prototype.setBox = function( pos ) {
  this.model[pos.y][pos.x] = this.isPos(pos, 'floor') ?
    levels.symbol.box:levels.symbol.boxOnStorage;
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

Hmi.prototype.sokobanAction = function ( orientation ) {
  var target = orientation.neighbour(this.getSokoban());
  this.sokoban.pushing = false;
  if (this.isPosEither(target, 'floor', 'storage')) {
    this.setSokoban(target);
    this.moves += orientation.move;
  } else if (this.isPosEither(target, 'box', 'boxOnStorage') &&
    this.isPosEither(orientation.neighbour(target), 'floor', 'storage')) {
    this.setSokoban(target);
    this.setBox(orientation.neighbour(target));
    this.moves += orientation.push;
    ++this.pushes;
    this.sokoban.pushing = true;
  }
  this.sokoban.orientation = orientation;
  this.updateChallenge();
};

Hmi.prototype.moveDown = function () {
  this.sokobanAction( this.orientation.down );
};

Hmi.prototype.moveLeft = function () {
  this.sokobanAction( this.orientation.left );
};

Hmi.prototype.moveUp = function () {
  this.sokobanAction( this.orientation.up );
};

Hmi.prototype.moveRight = function () {
  this.sokobanAction( this.orientation.right );
};

Hmi.prototype.drawBox = function( x, y, attr ) {
  this.paper.rect(30*x,30*y,29,29,5).attr(attr);
  this.paper.rect(30*x+3,30*y+3,23,23,3).attr(attr);
  this.paper.path('M ' + (30*x) + ',' + (30*y) + ' m 5,2 22,22 -3,3 -22,-22 z').attr(attr);
  this.paper.path('M ' + (30*x) + ',' + (30*y) + ' m 27,5 -22,22 -3,-3 22,-22 z').attr(attr);
};

Hmi.prototype.drawSokoban = function( x, y ) {
  if ($('#warehousekeeper').is(':checked')) {
    var shoe = this.paper.path('M -5,-11 m -3,0 c 0,-4 7,-4 7,0').attr({ fill:'black',stroke:'black','stroke-width':0.6 });
    var leg1 = this.paper.rect( -8, -11, 7, 10 ).attr({ fill:'#aaa',stroke:'black','stroke-width':0.6 });
    var leg2 = this.paper.path('M 4,10 m -3,-7 0,7 c 0,4 7,4 7,0 l 0,-7').attr({ fill:'#aaa',stroke:'black','stroke-width':0.6 });
    var hand1 = (this.sokoban.pushing ? this.paper.path('M -7,15 m -3,0 c 0,-5 6,-5 6,0'):
      this.paper.circle(-7,9,3)).attr({ fill:'#fb8',stroke:'#f95','stroke-width':0.6 });
    var hand2 = (this.sokoban.pushing ? this.paper.path('M 7,15 m -3,0 c 0,-5 6,-5 6,0'):
      this.paper.circle(7,-10,3)).attr({ fill:'#fb8',stroke:'#f95','stroke-width':0.6 });
    var torso = (this.sokoban.pushing ? this.paper.path('m -4,0 0,10 c 0,3 -6,3 -6,0 ' +
      'l 0,-10 c 0,-11 20,-11 20,0 l 0,10 c 0,3 -6,3 -6,0 l 0,-10'):
      this.paper.path('m -4,1 0,4 c 0,4 -6,4 -6,0 l 0,-4 c 0,-10 11,-10 14,-8 ' +
      'c 0,-4 6,-4 6,0 l 0,7 c 0,4 -6,4 -6,0')).attr({ fill:'#444',stroke:'black','stroke-width':0.6 });
    var capshield = this.paper.path('m -6,0 c 0,12 12,12 12,0').attr({ fill:'red',stroke:'black','stroke-width':0.6 });
    var cap = this.paper.circle(0,0,6).attr({ fill:'red',stroke:'black','stroke-width':0.6 });
    var sokoban = this.paper.set();
    sokoban.push( shoe, leg1, leg2, hand1, hand2, torso, capshield, cap );
    sokoban.translate( 30*x+15,30*y+15 );
    sokoban.rotate( this.sokoban.orientation.angle, 0, 0 );
    sokoban.scale(((x+y)%2)*2-1,1,0,0);
  }
  else {
    this.paper.circle(30*x+15,30*y+15,15).attr({ fill: 'red', stroke: 'black' });
  }
};

Hmi.prototype.updateStatistics = function() {
  $('#history').html(this.moves.length > 0 ? this.moves : 'Warehouse keeper did not move yet.');
  $('#moves').html(this.moves.length > 0 ? this.moves.length : 'No');
  $('#pushes').html(this.pushes > 0 ? this.pushes : 'zero');
  $('#completed').html(this.completed ? 'Congratulation! This level has been successfully completed.' +
    ( this.isCompleted() ? '' : ' But it got messed up again.' ) : 'You are still solving this level.');
};

Hmi.prototype.updateChallenge = function() {
  this.paper.clear();
  this.paper.path( 'm-1000,-1000 4000,0 0,4000 -4000,0 z').attr({
    stroke: '#444', 'stroke-width': 0.2, 'stroke-linecap': 'round', fill: 'darkslategrey'
  });
  var dim = this.getChallengeDimension();
  for (var y=0; y<dim.y; ++y) {
    for (var x=0; x<dim.x; ++x) {
      var pos = { x: x, y: y };
      if (this.isPos(pos, 'wall')) {
        this.paper.rect(30*x,30*y,29,29,1).attr({ fill: 'maroon', stroke: 'black' });
      }
      else if (this.isPos(pos, 'storage')) {
        this.paper.rect(30*x,30*y,29,29,5).attr({ fill: 'grey', stroke: 'orange' });
      }
      else if (this.isPos(pos, 'sokoban')) {
        this.drawSokoban( x, y );
      }
      else if (this.isPos(pos, 'sokobanOnStorage')) {
        this.paper.rect(30*x,30*y,29,29,5).attr({ fill: 'grey', stroke: 'orange' });
        this.drawSokoban( x, y );
      }
      else if (this.isPos(pos, 'box')) {
        this.drawBox( x, y, { fill: 'peru', stroke: 'black' } );
      }
      else if (this.isPos(pos, 'boxOnStorage')) {
        this.drawBox( x, y, { fill: 'brown', stroke: 'black' } );
      }
    }
  }
  var controlTranslate = { x: 0.8*this.boardSize, y: 0.8*this.boardSize };
  this.paper.circle(0,0,0.2*this.boardSize).attr({ fill: "#000", 'fill-opacity': 0.3,
    "stroke-width": this.boardSize*0.005, stroke: "black",
    opacity: 0.5 }).translate( controlTranslate.x, controlTranslate.y );
  this.controlDirection({x:-0.134*this.boardSize, y: 0}, controlTranslate, this.orientation.left, this.moveLeft );
  this.controlDirection({x: 0.134*this.boardSize, y: 0}, controlTranslate, this.orientation.right, this.moveRight );
  this.controlDirection({x: 0, y:-0.134*this.boardSize}, controlTranslate, this.orientation.up, this.moveUp );
  this.controlDirection({x: 0, y: 0.134*this.boardSize}, controlTranslate, this.orientation.down, this.moveDown );
  this.completed = this.completed ? true : this.isCompleted();
  var info = levels.setup[this.challenge].hasOwnProperty('info') &&
    $('#fullinfo').is(':checked') ? (levels.setup[this.challenge].info + '\n'):'';
  var completed = this.completed ? ('Level has been completed!' +
    ( this.isCompleted() ? '' : '\nBut it got messed up again.' )) : '';
  this.paper.text(0,7, info + completed ).attr({
    'text-anchor': 'start',
    'font-size' : 10,
    fill: 'lightgray',
  });
  this.setHeader();
  this.updateStatistics();
};

Hmi.prototype.setHeader = function() {
  $('#myheader').html(
    "Sokoban : l" +
    this.challenge + ' : m' + this.moves.length + ' : p' + this.pushes
  );
}

var g_Hmi = new Hmi();
$(document).ready( function () { g_Hmi.init(); });
