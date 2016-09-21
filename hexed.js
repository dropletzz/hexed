(function() {
  'use strict';

  var Hexed = (function() {

    var instanceId = 0;

    function Hexed(element, settings) {

      var _ = this;

      _.options = {
        perspective: true,
        borders: false,
        bordersColor: '#000',
        bordersThickness: 1,
        transitionTime: 0.5,
        transparentify: true,
        transparentOpacity: 0.45,
        startChoice: 0,
        currentChoiceModifiable: false,
        lazyUpdate: false
      };

      $.extend(_.options, settings);

      //if (_.options.borders) _.roundFun = function(n) { return n };
      //else                   _.roundFun = Math.floor;
      _.roundFun = function(n) { return n };

      _.instanceId = instanceId++;
      _.$hexed = $(element);
      _.$main = null;
      _.height = _.$hexed.height();

      _.choices = null;
      _.choicesNum = 0;
      _.currentChoice = _.options.startChoice;

      _.$sides = null;
      _.currentSide = null;
      _.previousSide = null;
      _.rotation = 0;
      _.mainTransform = '';

      _.swiping = false;
      _.touching = false;
      _.clickThreshold = 5;
      _.startX = null;
      _.startY = null;
      _.touchData = {};

      _.init();
    }

    return Hexed;
  }());


  Hexed.prototype.init = function() {

    var _ = this;

    if (! _.$hexed.hasClass('hexed-initialized')) {
      _.$hexed.addClass('hexed-initialized');

      _.choices = _.$hexed.children();
      _.choices.wrapAll($('<div class="hexed-choices">'));
      _.choicesContainer = $(_.choices[0]).parent();
      _.choicesNum = _.choices.length;
      if (_.choicesNum < 5) _.options.lazyUpdate = true;

      _.createHexagon();
      _.$main = _.$hexed.children('.hexed-main');
      _.sides = _.$main.children('.hexed-side');
      _.currentSide = 1;

      for (var i=0; i<3; i++) {
        _.setSide(i, _.currentChoice+i-1);
      }
      if (! _.options.lazyUpdate) {
        _.setSide(3, _.currentChoice+2);
        _.setSide(5, _.currentChoice-2);
      }

      _.sidesStyle(true);

      _.swipeHandler = $.proxy(_.swipeHandler, _);
      _.events();
    }
  }

  Hexed.prototype.createHexagon = function() {

    var _ = this,
        main = $('<div class="hexed-main">').appendTo(_.$hexed),
        height = _.$hexed.height(),
        w =  _.roundFun(height / 2.0),
        w2 = _.roundFun(w / 2.0),
        xd = 0.0,
        yd = _.roundFun(0.75 * w),
        zd = _.roundFun(0.433013 * w),
        zdPlus = 0.0,
        persp = 0.0;

    if (_.options.perspective) {
      persp = height*5;
      zdPlus = height/5*1.2;
    }
    if (_.options.borders) {
      xd = _.options.bordersThickness;
      _.$hexed.css({ margin: xd+'px' });
    }
    _.$hexed.cssPrefix({ perspective: persp+'px' });
    _.mainTransform = 'translateX('+(-xd)+'px) translateY('+(w2-xd)+'px) translateZ('+(-zd-zdPlus)+'px)';
    main.cssPrefix({
      'transform': _.mainTransform,
      'transform-origin': 'center '+(w/2.0 + xd)+'px 0px'
    });
    setTimeout( function() {
      main.cssPrefix({
        transition: 'transform '+_.options.transitionTime+'s'
      });
    }, 60);

    $('<div class="hexed-side">').appendTo(main).css(sideCSS(w, -yd,    zd,   60));
    $('<div class="hexed-side">').appendTo(main).css(sideCSS(w,   0,  2*zd,    0));
    $('<div class="hexed-side">').appendTo(main).css(sideCSS(w,  yd,    zd,  -60));
    $('<div class="hexed-side">').appendTo(main).css(sideCSS(w,  yd,   -zd, -120));
    $('<div class="hexed-side">').appendTo(main).css(sideCSS(w,   0, -2*zd,  180));
    $('<div class="hexed-side">').appendTo(main).css(sideCSS(w, -yd,   -zd,  120));
  }


  function sideCSS(h, ty, tz, rx) {
    return {
      'height': h+'px',
      'transform': 'translateX(0px) translateY('+ty+'px) translateZ('+tz+'px) rotateX('+rx+'deg)'
    };
  }



  Hexed.prototype.setSide = function (sideIndex, choiceIndex) {

    var _ = this,
      side = $(_.sides[mod(sideIndex, 6)]);

    side.children().appendTo(_.choicesContainer);
    $(_.choices[mod(choiceIndex, _.choicesNum)]).appendTo(side);
  }


  Hexed.prototype.sidesStyle = function() {

    var _ = this, first = arguments[0];

    if (first) {
      if (_.options.transparentify) {
        _.sides.cssPrefix({ transition: 'opacity ' + _.options.transitionTime + 's' });
        _.sides.css({ opacity: _.options.transparentOpacity, });
        $(_.sides[_.currentSide]).css({ opacity: 1.0 });
      }
      if (_.options.borders)
        _.sides.css({ border: _.options.bordersThickness+'px solid ' + _.options.bordersColor });

      _.sides.addClass('hexed-no-interaction');
      if (_.options.currentChoiceModifiable)
        $(_.sides[_.currentSide]).removeClass('hexed-no-interaction');
    }
    else {
      if (_.options.transparentify) {
        $(_.sides[_.previousSide]).css({ opacity: _.options.transparentOpacity });
        $(_.sides[_.currentSide]).css({ opacity: 1.0 });
      }
      if (_.options.currentChoiceModifiable) {
        $(_.sides[_.previousSide]).addClass('hexed-no-interaction');
        $(_.sides[_.currentSide]).removeClass('hexed-no-interaction');
      }
    }
  }


  Hexed.prototype.events = function () {

    var _ = this;

    _.$hexed.on('mousedown touchstart',   { action: 'start' }, _.swipeHandler);
    _.$hexed.on('mouseup touchend',       { action: 'end' },   _.swipeHandler);
    _.$hexed.on('mouseleave touchcancel', { action: 'end' },   _.swipeHandler);
    _.$hexed.on('touchmove', $.proxy(_.storeTouchPosition, _));
  }


  Hexed.prototype.swipeHandler = function(event) {

    var _ = this,
        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null,
        posX = touches && touches.length === 1 ? touches[0].pageX : event.pageX || _.touchData.pageX,
        posY = touches && touches.length === 1 ? touches[0].pageY : event.pageY || _.touchData.pageY;

    if (touches && touches.length > 1) return false;

    if (event.data.action === 'start') {
      _.startX = posX;
      _.startY = posY;
      _.swiping = true;
    }
    else if (_.swiping) {
      var distX = posX - _.startX,
          distY = posY - _.startY,
          dist = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));

      if (dist <= _.clickThreshold && !touches) {
        var y = _.startY - _.$hexed.fixedOffset().top;

        if      (y < _.height * 0.25) _.rotate('down')
        else if (y > _.height * 0.75) _.rotate('up');
      }
      else if (Math.abs(distY) > Math.abs(distX)) {
        if (distY > 0) _.rotate('down');
        else           _.rotate('up');
      }

      _.touchData = {};
      _.swiping = false;
    }
  }


  Hexed.prototype.storeTouchPosition = function(event) {
    var _ = this,
        touches = event.originalEvent.touches;

    if (touches && touches.length == 1) {
      event.preventDefault();
      _.touchData.pageX = touches[0].pageX;
      _.touchData.pageY = touches[0].pageY;
    }
  }


  Hexed.prototype.rotate = function(direction) {

    var _ = this, rotation;

    if (direction === 'up')        rotation = 1;
    else if (direction === 'down') rotation = -1;
    else return false;

    if (_.options.lazyUpdate)
      _.setSide(_.currentSide + rotation*2, _.currentChoice + rotation*2);

    _.rotation += rotation;
    _.previousSide = _.currentSide;
    _.currentSide = mod(_.currentSide + rotation, 6);
    _.currentChoice = mod(_.currentChoice + rotation, _.choicesNum);

    if (! _.options.lazyUpdate)
      _.setSide(_.currentSide + rotation*2, _.currentChoice + rotation*2);

    _.updateHexagon();
  }


  Hexed.prototype.updateHexagon = function() {

    var _ = this;

    _.sidesStyle();

    _.$main.cssPrefix({
      'transform': _.mainTransform + ' rotateX('+(60*_.rotation)+'deg)'
    });

    _.$hexed.trigger('selected', [ _.currentChoice, _.choices[_.currentChoice].id ]);
  }


  function mod(x, n) {
    return (((x%n)+n) % n);
  }

  $.fn.fixedOffset = function() {
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    if (isChrome)
      return { top: this.get(0).offsetTop, left: this.get(0).offsetLeft };
    return this.offset();
  }

  $.fn.cssPrefix = function(obj) {
    var _ = this, style;

    for (var prop in obj)
      if (obj.hasOwnProperty(prop)) {
        style = {};
        style['-webkit-'+prop] = obj[prop];
        style['-moz-'+prop] = obj[prop];
        style['-o-'+prop] =  obj[prop];
        style[prop] = obj[prop];
        _.css(style);
      }

    return _;
  }

  $.fn.hexed = function() {
    var _ = this,
      opt = arguments[0],
      args = Array.prototype.slice.call(arguments, 1),
      l = _.length,
      i,
      ret;

    for (i = 0; i < l; i++) {
      if (typeof opt == 'object' || typeof opt == 'undefined')
        _[i].hexed = new Hexed(_[i], opt);
    }
    return _;
  };

})();
