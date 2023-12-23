const LETTERS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,':()&!?+-/";

export class DepartureBoard {
	_element: HTMLElement;
	_letters: Letter[][];

	constructor(element: HTMLElement, rowCount = 1, letterCount = 25) {
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
			(function (i) {
				window.setTimeout(function () {
					me._letters[i].forEach(this.spin());
				}, 20 * i + Math.random() * 400);
			})(i);
		}
	}
	setValue(row: number, value_in: String) {
		let me = this;
		let value = value_in.toUpperCase();

		for (let i = 0, l = this._letters[row].length; i < l; i++) {
			(function (row, i) {
				window.setTimeout(function () {
					me._letters[row][i].setValue(value[i]);
				}, 25 * i + Math.random() * 400);
			})(row, i);
		}
	}
	setValueNoSpin(row: number, value_in: String) {
		let me = this;
		let value = value_in.toUpperCase();

		for (let i = 0, l = value.length; i < l; i++) {
			me._letters[row][i].setValueNoSpin(value[i]);
		}
	}
}

class Letter {
	_element: HTMLElement;
	_bottom: HTMLElement;
	_bottomText: HTMLElement;
	_top: HTMLElement;
	_topText: HTMLElement;
	_fold: HTMLElement;
	_falling: HTMLElement;
	_fallingText: HTMLElement;

	_index: number;
	_interval: number;
	_stopAt: number;

	DROP_TIME: 100;
	constructor() {
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
		this._interval = 0;
		this._stopAt = 0;
	}
	getElement() {
		return this._element;
	}
	spin(clear: boolean) {
		if (clear !== false) this._stopAt = 0;

		var me = this;
		this._interval = window.setInterval(function () {
			me._tick();
		}, this.DROP_TIME * 1.1);
	}
	setValue(value: string) {
		this._stopAt = LETTERS.indexOf(value);

		if (this._stopAt < 0) this._stopAt = 0;
		if (!this._interval && this._index != this._stopAt) this.spin(false);
	}
	setValueNoSpin(value: string) {
		this._topText.innerHTML = value;
		this._fallingText.innerHTML = value;
		this._bottomText.innerHTML = value;
	}
	_tick = function () {
		var me = this,
			oldValue = LETTERS.charAt(this._index),
			fallingStyle = this._falling.style,
			fallingTextStyle = this._fallingText.style;

		this._index = (this._index + 1) % LETTERS.length;
		let newValue = LETTERS.charAt(this._index);

		this._fallingText.innerHTML = oldValue;
		fallingStyle.display = "block";

		this._topText.innerHTML = newValue;

		window.setTimeout(function () {
			fallingTextStyle.WebkitTransitionTimingFunction =
				fallingTextStyle.MozTransitionTimingFunction =
				fallingTextStyle.OTransitionTimingFunction =
				fallingTextStyle.transitionTimingFunction =
					"ease-in";
			fallingTextStyle.WebkitTransform = fallingTextStyle.MozTransform = fallingTextStyle.OTransform = fallingTextStyle.transform = "scaleY(0)";
		}, 1);

		window.setTimeout(function () {
			me._fallingText.innerHTML = newValue;

			fallingStyle.top = "-.03em";
			fallingStyle.bottom = "auto";
			fallingTextStyle.top = "-.65em";

			fallingTextStyle.WebkitTransitionTimingFunction =
				fallingTextStyle.MozTransitionTimingFunction =
				fallingTextStyle.OTransitionTimingFunction =
				fallingTextStyle.transitionTimingFunction =
					"ease-out";
			fallingTextStyle.WebkitTransform = fallingTextStyle.MozTransform = fallingTextStyle.OTransform = fallingTextStyle.transform = "scaleY(1)";
		}, this.DROP_TIME / 2);

		window.setTimeout(function () {
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
}
