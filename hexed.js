(function() {
    'use strict';
    var Hexed = (function() {

      var instanceId = 0;

      function Hexed(element, settings) {

        var _ = this;

        _.options = {
          perspective: true,
          borders: false, //!
          bordersColor: '#000', //!
          transitionTime: 0.5,
          opacify: false, //!
          unchosenOpacity: 0.6,
          startChoice: 0
        };

        $.extend(_.options, settings);

        _.instanceId = instanceId++;
        _.$hexed = $(element);
        _.height = _.$hexed.height();
        _.rotation = 0;
        _.currentChoice = _.options.startChoice;

        _.swiping = false;
        _.clickThreshold = 5;
        _.startX = null;
        _.startY = null;

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
        _.choices = _.choices.toArray();
        _.choicesNum = _.choices.length;

        _.createHexagon();
        _.$main = _.$hexed.children('.hexed-main');
        _.sides = _.$main.children('.hexed-side').toArray();
        _.currentSide = 1;

        for (var i=0; i<=3; i++) {
          _.setSide(i, _.currentChoice+i-1);
        }
        _.setSide(3, _.currentChoice+2);
        _.setSide(5, _.currentChoice-2);

        //_.$main.children('.hexed-side1').html(_.$choices[0].outerHTML);
        //_.$sides[1].innerHTML = _.$choices[0].outerHTML;

        _.events();
      }
    }

    Hexed.prototype.createHexagon = function() {

      var _ = this,
          main = $('<div class="hexed-main">').appendTo(_.$hexed),
          height = _.$hexed.height(),
          w =  height / 2.0,
          w2 = w / 2.0,
          yd = 0.75 * w,
          zd = 0.433013 * w,
          zdPlus = 0,
          persp = 0;

      if (_.options.perspective) {
        persp = height*5;
        zdPlus = height/5*1.2;
      }
      _.$hexed.css({ 'perspective': persp+'px' });
      _.mainTransform = 'translateX(-1px) translateY('+w2+'px) translateZ('+(-zd-zdPlus)+'px)';
      main.css({
        'transform': _.mainTransform,
        'transform-origin': 'center '+w2+'px 0px'
      });
      setTimeout( function() {
        main.css({
          'transition': 'transform '+_.options.transitionTime+'s'
        });
      }, 60);

      $('<div class="hexed-side hexed-side0">').appendTo(main).css(sideAttr(w, -yd,    zd,   60));
      $('<div class="hexed-side hexed-side1">').appendTo(main).css(sideAttr(w,   0,  2*zd,    0));
      $('<div class="hexed-side hexed-side2">').appendTo(main).css(sideAttr(w,  yd,    zd,  -60));
      $('<div class="hexed-side hexed-side3">').appendTo(main).css(sideAttr(w,  yd,   -zd, -120));
      $('<div class="hexed-side hexed-side4">').appendTo(main).css(sideAttr(w,   0, -2*zd,  180));
      $('<div class="hexed-side hexed-side5">').appendTo(main).css(sideAttr(w, -yd,   -zd,  120));
    }


    Hexed.prototype.setSide = function (sideIndex, choiceIndex) {

      var _ = this;

      _.sides[mod(sideIndex, 6)].innerHTML = _.choices[mod(choiceIndex, _.choicesNum)].outerHTML;
    }


    Hexed.prototype.events = function () {

      var _ = this;

      _.$hexed.on('mousedown', function(event) {
        _.startX = event.pageX;
        _.startY = event.pageY;
        _.swiping = true;
      });

      _.$hexed.on('mouseup', function(event) {
        if (_.swiping) {
          var posX = event.pageX,
              posY = event.pageY,
              distX = posX - _.startX,
              distY = posY - _.startY,
              dist = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));

          if (dist <= _.clickThreshold) {
            var y = _.startY - _.$hexed.offset().top;
            if      (y < _.height * 0.25) _.rotateDown()
            else if (y > _.height * 0.75) _.rotateUp();
          }
          else if (Math.abs(distY) > Math.abs(distX)) {
            if (distY > 0) _.rotateDown();
            else           _.rotateUp();
          }

          _.swiping = false;
        }
      });

      _.$hexed.on('mouseleave', function() {
        if (_.swiping) {
          var posX = event.pageX,
              posY = event.pageY,
              distX = posX - _.startX,
              distY = posY - _.startY;

          if (Math.abs(distY) > Math.abs(distX)) {
            if (distY > 0) _.rotateDown();
            else           _.rotateUp();
          }

          _.swiping = false;
        }
      });
    }


    Hexed.prototype.rotateDown = function() {

      var _ = this;

      _.rotation--;
      _.currentSide = mod(_.currentSide-1, 6);
      _.currentChoice = mod(_.currentChoice-1, _.choicesNum);
      _.setSide(_.currentSide-2, _.currentChoice-2);

      _.$main.css({
        'transform': _.mainTransform + ' rotateX('+(60*_.rotation)+'deg)'
      });
    }


    Hexed.prototype.rotateUp = function() {

      var _ = this;

      _.rotation++;
      _.currentSide = mod(_.currentSide+1, 6);
      _.currentChoice = mod(_.currentChoice+1, _.choicesNum);
      _.setSide(_.currentSide+2, _.currentChoice+2);

      _.$main.css({
        'transform': _.mainTransform + ' rotateX('+(60*_.rotation)+'deg)'
      });
    }


    function sideAttr(h, ty, tz, rx) {
      return {
        'height': h+'px',
        'transform': 'translateX(0px) translateY('+ty+'px) translateZ('+tz+'px) rotateX('+rx+'deg)'
      }
    }


    function mod(x, n) {
      return (((x%n)+n) % n);
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
          /*
          else
              ret = _[i].slick[opt].apply(_[i].slick, args);
          if (typeof ret != 'undefined') return ret;
         */
      }
      return _;
    };

})();
