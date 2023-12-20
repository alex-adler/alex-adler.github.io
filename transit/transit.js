(() => {
  // transit/board.ts
  var LETTERS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,':()&!?+-";
  var DepartureBoard = class {
    constructor(element, rowCount = 1, letterCount = 25) {
      this._element = element;
      this._letters = [];
      element.className += " departure-board";
      for (var r = 0; r < rowCount; r++) {
        this._letters.push([]);
        let rowElement = document.createElement("div");
        rowElement.className = "row";
        element.appendChild(rowElement);
        for (var l = 0; l < letterCount; l++) {
          let letter = new Letter();
          this._letters[r].push(letter);
          rowElement.appendChild(letter.getElement());
        }
      }
    }
    spin() {
      var me = this;
      for (var i = 0, l = this._letters.length; i < l; i++) {
        (function(i2) {
          window.setTimeout(function() {
            me._letters[i2].forEach(this.spin());
          }, 20 * i2 + Math.random() * 400);
        })(i);
      }
    }
    setValue(row, value_in) {
      let me = this;
      let value = value_in.toUpperCase();
      for (let i = 0, l = this._letters[row].length; i < l; i++) {
        (function(row2, i2) {
          window.setTimeout(function() {
            me._letters[row2][i2].setValue(value[i2]);
          }, 25 * i2 + Math.random() * 400);
        })(row, i);
      }
    }
  };
  var Letter = class {
    constructor() {
      this.spin = function(clear) {
        if (clear !== false)
          this._stopAt = null;
        var me = this;
        this._interval = window.setInterval(function() {
          me._tick();
        }, this.DROP_TIME * 1.1);
      };
      this.setValue = function(value) {
        this._stopAt = LETTERS.indexOf(value);
        if (this._stopAt < 0)
          this._stopAt = 0;
        if (!this._interval && this._index != this._stopAt)
          this.spin(false);
      };
      this._tick = function() {
        var me = this, oldValue = LETTERS.charAt(this._index), fallingStyle = this._falling.style, fallingTextStyle = this._fallingText.style;
        this._index = (this._index + 1) % LETTERS.length;
        let newValue = LETTERS.charAt(this._index);
        this._fallingText.innerHTML = oldValue;
        fallingStyle.display = "block";
        this._topText.innerHTML = newValue;
        window.setTimeout(function() {
          fallingTextStyle.WebkitTransitionTimingFunction = fallingTextStyle.MozTransitionTimingFunction = fallingTextStyle.OTransitionTimingFunction = fallingTextStyle.transitionTimingFunction = "ease-in";
          fallingTextStyle.WebkitTransform = fallingTextStyle.MozTransform = fallingTextStyle.OTransform = fallingTextStyle.transform = "scaleY(0)";
        }, 1);
        window.setTimeout(function() {
          me._fallingText.innerHTML = newValue;
          fallingStyle.top = "-.03em";
          fallingStyle.bottom = "auto";
          fallingTextStyle.top = "-.65em";
          fallingTextStyle.WebkitTransitionTimingFunction = fallingTextStyle.MozTransitionTimingFunction = fallingTextStyle.OTransitionTimingFunction = fallingTextStyle.transitionTimingFunction = "ease-out";
          fallingTextStyle.WebkitTransform = fallingTextStyle.MozTransform = fallingTextStyle.OTransform = fallingTextStyle.transform = "scaleY(1)";
        }, this.DROP_TIME / 2);
        window.setTimeout(function() {
          me._bottomText.innerHTML = newValue;
          fallingStyle.display = "none";
          fallingStyle.top = "auto";
          fallingStyle.bottom = 0;
          fallingTextStyle.top = 0;
        }, this.DROP_TIME);
        if (this._index === this._stopAt) {
          clearInterval(this._interval);
          delete this._interval;
        }
      };
      this._element = document.createElement("span");
      this._element.className = "letter";
      this._bottom = document.createElement("span");
      this._bottom.className = "flap bottom";
      this._element.appendChild(this._bottom);
      this._bottomText = document.createElement("span");
      this._bottomText.className = "text";
      this._bottom.appendChild(this._bottomText);
      this._top = document.createElement("span");
      this._top.className = "flap top";
      this._element.appendChild(this._top);
      this._topText = document.createElement("span");
      this._topText.className = "text";
      this._top.appendChild(this._topText);
      this._fold = document.createElement("span");
      this._fold.className = "fold";
      this._element.appendChild(this._fold);
      this._falling = document.createElement("span");
      this._falling.className = "flap falling";
      this._fold.appendChild(this._falling);
      this._fallingText = document.createElement("span");
      this._fallingText.className = "text";
      this._fallingText.style.transitionDuration = this.DROP_TIME * 0.5 + "ms";
      this._falling.appendChild(this._fallingText);
      this._index = 0;
      this._interval = null;
      this._stopAt = null;
    }
    getElement() {
      return this._element;
    }
  };

  // transit/transit.ts
  function buildDepartureBoard() {
    var board = new DepartureBoard(document.getElementById("departure"), 2, 25);
    board.setValue(0, "19:30 London King's Cross");
    board.setValue(1, "19:42 Sheffield");
    window.setTimeout(function() {
      board.setValue(0, "19:42 Sheffield");
      board.setValue(1, "");
    }, 12e3);
  }
  window.onload = function() {
    buildDepartureBoard();
  };
})();
