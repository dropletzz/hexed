(function() {
    'use strict';
    var Hexed = (function() {

        var instanceId = 0;

        function Hexed(element, settings) {

            var _ = this;

            _.instanceId = instanceId++;
            _.$hexed = $(element);
            _.rotation = 0;

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
        _.currentChoice = 0;

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

        _.$hexed.click( function(e) {
          var y = e.pageY - _.$hexed.offset().top;
          if (y < _.sideHeightDiv2) {
            _.rotation--;
            _.currentSide = mod(_.currentSide-1, 6);
            _.currentChoice = mod(_.currentChoice-1, _.choicesNum);
            _.setSide(_.currentSide-2, _.currentChoice-2);
          }
          else if (y > _.sideHeightDiv2 * 3) {
            _.rotation++;
            _.currentSide = mod(_.currentSide+1, 6);
            _.currentChoice = mod(_.currentChoice+1, _.choicesNum);
            _.setSide(_.currentSide+2, _.currentChoice+2);
          }
          _.$main.css({
            'transform': 'translateY('+_.sideHeightDiv2+'px) translateZ('+(-_.translateZ)+'px) rotateX('+(60*_.rotation)+'deg)'
          });
        });
      }
    }

    Hexed.prototype.createHexagon = function() {
      var _ = this,
          main = $('<div class="hexed-main">').appendTo(_.$hexed),
          height = _.$hexed.height(),
          w =  Math.round(height / 2.0),
          w2 = Math.round(w / 2.0),
          yd = Math.round(0.75 * w),
          zd = Math.round(0.433013 * w);

      main.css({
        'transform': 'translateY('+w2+'px) translateZ('+(-zd)+'px)',
        'transform-origin': 'center '+w2+'px 0px'
      });
      setTimeout( function() {
        main.css({
          'transition': 'transform 0.5s'
        });
      }, 60);

      $('<div class="hexed-side hexed-side0">').appendTo(main).css(sideAttr(w, -yd,    zd,   60));
      $('<div class="hexed-side hexed-side1">').appendTo(main).css(sideAttr(w,   0,  2*zd,    0));
      $('<div class="hexed-side hexed-side2">').appendTo(main).css(sideAttr(w,  yd,    zd,  -60));
      $('<div class="hexed-side hexed-side3">').appendTo(main).css(sideAttr(w,  yd,   -zd, -120));
      $('<div class="hexed-side hexed-side4">').appendTo(main).css(sideAttr(w,   0, -2*zd,  180));
      $('<div class="hexed-side hexed-side5">').appendTo(main).css(sideAttr(w, -yd,   -zd,  120));

      _.sideHeight = w;
      _.sideHeightDiv2 = w2;
      _.translateY = yd;
      _.translateZ = zd;
    }

    Hexed.prototype.setSide = function (sideIndex, choiceIndex) {
      var _ = this;
      _.sides[mod(sideIndex, 6)].innerHTML = _.choices[mod(choiceIndex, _.choicesNum)].outerHTML;
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
