/*
Based on Datepickk.js (https://github.com/crsten/datepickk) which is
distributed under The MIT License (MIT)

Copyright (c) 2016 Carsten Jacobsen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function webpackUniversalModuleDefinition(root, factory) {
	if (typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if (typeof define === 'function' && define.amd)
		define([], factory);
	else if (typeof exports === 'object')
		exports["Datepickk"] = factory();
	else
		root["Datepickk"] = factory();
})
	(this, function () {
		return (function (modules) { // webpackBootstrap
			// The module cache
			var installedModules = {};

			// The require function
			function __webpack_require__(moduleId) {

				// Check if module is in cache
				if (installedModules[moduleId]) {
					return installedModules[moduleId].exports;

				}
				// Create a new module (and put it into the cache)
				var module = installedModules[moduleId] = {
					i: moduleId,
					l: false,
					exports: {}

				};

				// Execute the module function
				modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

				// Flag the module as loaded
				module.l = true;

				// Return the exports of the module
				return module.exports;

			}


			// expose the modules object (__webpack_modules__)
			__webpack_require__.m = modules;

			// expose the module cache
			__webpack_require__.c = installedModules;

			// define getter function for harmony exports
			__webpack_require__.d = function (exports, name, getter) {
				if (!__webpack_require__.o(exports, name)) {
					Object.defineProperty(exports, name, {
						configurable: false,
						enumerable: true,
						get: getter

					});

				}

			};

			// getDefaultExport function for compatibility with non-harmony modules
			__webpack_require__.n = function (module) {
				var getter = module && module.__esModule ?
					function getDefault() { return module['default']; } :
					function getModuleExports() { return module; };
				__webpack_require__.d(getter, 'a', getter);
				return getter;

			};

			// Object.prototype.hasOwnProperty.call
			__webpack_require__.o = function (object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

			// __webpack_public_path__
			__webpack_require__.p = "";

			// Load entry module and return exports
			return __webpack_require__(__webpack_require__.s = 0);

		})
			/************************************************************************/
			([(function (module, exports, __webpack_require__) {

				"use strict";


				Object.defineProperty(exports, "__esModule", {
					value: true
				});

				__webpack_require__(1);

				function Datepickk(args) {
					Datepickk.numInstances = (Datepickk.numInstances || 0) + 1;
					var that = this;
					var eventName = 'click';

					var container = document.body;
					var opened = false;
					var months = 1;
					var closeOnSelect = false;
					var onNavigation = null;
					var onClose = null;
					var closeOnClick = true;
					var inline = false;
					var daynames = true;
					var today = true;
					var startDate = null;
					var minDate = null;
					var weekStart = null;
					var locked = false;

					// My variables
					var bodyCount = bodies.length;
					var currentBody = 0;
					var lastBody = currentBody;
					var body = bodies[currentBody];
					var displayedWeeksCount = 6;
					var displayedDaysCount = displayedWeeksCount * body.weekLength_hd;

					var currentYear = body.y;
					var currentMonth = body.month;

					function generateDaynames() {
						that.el.days.innerHTML = '';
						if (daynames) {
							for (var x = 0; x < months && x < 3; x++) {
								var weekEl = document.createElement('div');
								weekEl.setAttribute('class', 'd-week');

								// Cycle through each day of the week and set their names
								for (var i = 0; i < body.weekLength_hd; i++) {
									var dayEl = document.createElement('div');
									var dayTextEl = document.createElement('p');
									dayTextEl.innerHTML = i + 1;

									dayEl.appendChild(dayTextEl);
									weekEl.appendChild(dayEl);
								}

								that.el.days.appendChild(weekEl);
							}
						}
					}

					// Ensures that newBody is within the bodies array and loops if it isn't
					function loopBodies(newBody) {
						if (newBody > (bodyCount - 1)) {
							newBody %= bodyCount;
						} else if (newBody < 0) {
							newBody = bodyCount + newBody;
						}
						return newBody;
					}

					// Generate month selector that appears when the current month is clicked 
					function generateMonths() {
						[].slice.call(that.el.monthPicker.childNodes).forEach(function (node, index) {
							let newMonth = currentMonth + parseInt(node.getAttribute('data-month'));
							if (newMonth > body.monthCount || newMonth < 1) {
								if (newMonth <= body.monthCount) {
									newMonth += body.monthCount;
								} else {
									while (newMonth > body.monthCount) {
										newMonth -= body.monthCount;
									}
								}
							}
							node.innerHTML = newMonth;
						});
					}

					// Generate year selector that appears when the current year is clicked 
					function generateYears() {
						[].slice.call(that.el.yearPicker.childNodes).forEach(function (node, index) {
							node.innerHTML = (currentYear + parseInt(node.getAttribute('data-year')));
						});
					}


					// Generate body selector that appears when the current body is clicked 
					function generateBodies() {
						[].slice.call(that.el.bodyPicker.childNodes).forEach(function (node, index) {
							node.innerHTML = bodies[loopBodies(currentBody + parseInt(node.getAttribute('data-body')))].name;
						});
					}

					// Set up days so that mouse-overs and clicks do stuff
					function generateInputs() {
						that.el.tables.innerHTML = '';
						for (var x = 0; x < months; x++) {
							var container = document.createElement('div');
							container.setAttribute('class', 'd-table');
							for (var i = 0; i < displayedDaysCount; i++) {
								var input = document.createElement('input');
								input.type = 'checkbox';
								input.id = Datepickk.numInstances + '-' + x + '-d-day-' + i;
								var label = document.createElement('label');
								label.setAttribute("for", Datepickk.numInstances + '-' + x + '-d-day-' + i);

								var text = document.createElement('text');

								var tooltip = document.createElement('span');
								tooltip.setAttribute('class', 'd-tooltip');

								container.appendChild(input);
								container.appendChild(label);

								label.appendChild(text);
								label.appendChild(tooltip);

								input.addEventListener(eventName, function (event) {
									if (locked) {
										event.preventDefault();
									}
								});
								input.addEventListener('change', inputChange);
							}

							that.el.tables.appendChild(container);
						}
					}

					function generateDates(year, month) {
						var monthElements = that.el.querySelectorAll('.d-table');

						[].slice.call(that.el.querySelectorAll('.d-table')).forEach(function (element, index) {
							// Number of days in current month
							var days = new SpaceDate(body, year, month + index, 0).getDate();
							// Number of days in last month
							var daysLast = new SpaceDate(body, year, month + index - 1, 0).getDate();
							// Day of the week of the first day of the month
							var startDay = new SpaceDate(body, year, month + index, 1).getDay();

							element.setAttribute('data-month', month);

							[].slice.call(element.querySelectorAll('.d-table input')).forEach(function (inputEl, i) {
								var labelEl = inputEl.nextSibling;

								inputEl.checked = false;
								inputEl.removeAttribute('disabled');
								labelEl.removeAttribute('style');
								labelEl.removeAttribute('data-legend-id');
								labelEl.className = '';

								var date = null;
								// If the date is from the previous month
								if (i < startDay - 1) {
									labelEl.childNodes[0].innerHTML = daysLast - (startDay - i - 2);
									if (index == 0) {
										date = new SpaceDate(body, year, month + index - 1, daysLast - (startDay - i - 2));
										labelEl.className = 'prev';
									} else {
										date = '';
										labelEl.className = 'd-hidden';
										inputEl.setAttribute('disabled', true);
									}
								}
								// Else if the date is from the current month 
								else if (i < days + startDay - 1) {
									date = new SpaceDate(body, year, month + index, i - startDay + 2);
									labelEl.childNodes[0].innerHTML = i - startDay + 2;
									labelEl.className = '';
								}
								// Else the date is from the next month
								else {
									labelEl.childNodes[0].innerHTML = i - days - startDay + 2;
									if (index == monthElements.length - 1) {
										date = new SpaceDate(body, year, month + index + 1, i - days - startDay + 2);
										labelEl.className = 'next';
									} else {
										date = '';
										labelEl.className = 'd-hidden';
										inputEl.setAttribute('disabled', true);
									}
								}

								if (date instanceof SpaceDate) {
									inputEl.setAttribute('data-date', JSON.stringify(date));
								} else {
									console.log("date is not a SpaceDate");
								}

								// Disable the arrow if you are trying to go before the epoch
								if (date.year < 0) {
									inputEl.setAttribute('disabled', true);
									labelEl.className = 'd-hidden';
								}

								// Add indicator to the current day
								if (today && (JSON.stringify(date) == JSON.stringify(new SpaceDate(body)))) {
									labelEl.classList.add('today');
								} else {
									labelEl.classList.remove('today');
								}
							});
						});
					};

					function setDate() {
						if (lastBody !== currentBody) {
							// Calculate the ms from epoch of the first day of the displayed month
							let dateOfOldBody = new SpaceDate(bodies[lastBody], currentYear, currentMonth, Math.floor(bodies[lastBody].nominalMonthLength_hd / 2));
							let msOfFirstDay = dateOfOldBody.getMsFromEpoch();

							// Confirm the change of celestial body
							lastBody = currentBody;

							// Reconfigure how many days are displayed on the current month and how large each rectangle is
							displayedDaysCount = displayedWeeksCount * body.weekLength_hd;
							let newDayBoxSize = 100 / body.weekLength_hd;

							// Probably not the correct way of changing the css rules

							// Display all week numbers
							document.styleSheets[2].deleteRule(60);
							document.styleSheets[2].insertRule("#Datepickk .d-week > div {flex-basis: calc(" + newDayBoxSize + "%);text-align: center;}", 60);

							// Not sure what this changes
							document.styleSheets[2].deleteRule(65);
							document.styleSheets[2].insertRule("#Datepickk .d-table label:nth-of-type(" + body.weekLength_hd + "n) .d-date-legends {padding-right: 0;}", 65);

							// Nor this one
							document.styleSheets[2].deleteRule(66);
							document.styleSheets[2].insertRule("#Datepickk .d-table label:nth-last-of-type(-n + " + body.weekLength_hd + ") .d-date-legends {padding-bottom: 0;}", 66);

							// Correctly display week lengths
							document.styleSheets[2].deleteRule(68);
							document.styleSheets[2].insertRule("#Datepickk .d-table input + label {flex-basis: calc(" + newDayBoxSize + "%);display: flex;align-items: center;justify-content: center;cursor: pointer;transition: background-color 0.2s ease, background 0.2s ease, color 0.2s ease;position: relative;box-sizing: border-box;}", 68);

							let newYearMonth = bodies[currentBody].getYearMonth(msOfFirstDay);
							currentYear = newYearMonth[0];
							currentMonth = newYearMonth[1];

							generateInputs();
							generateDaynames();
						}
						if (!that.el.tables.childNodes.length || !that.el.tables.childNodes[0].childNodes.length) return;

						resetCalendar();

						// Overflow the months if they go too far
						if (currentMonth > body.monthCount || currentMonth < 1) {
							if (currentMonth <= body.monthCount) {
								currentYear -= 1;
								currentMonth += body.monthCount;
							} else {
								while (currentMonth > body.monthCount) {
									currentYear += 1;
									currentMonth -= body.monthCount;
								}
							}
						}

						// If you have gone before the epoch, set the date to the first month
						if ((currentYear == 0 && currentMonth == 1) || (currentYear < 0)) {
							currentYear = 0;
							currentMonth = 1;
							that.el.header.childNodes[0].setAttribute('style', 'visibility:hidden');
						} else {
							that.el.header.childNodes[0].removeAttribute('style');
						}

						generateDates(currentYear, currentMonth);
						generateYears();

						// Generate strings to be displayed
						var monthname = 'M' + currentMonth + '';
						var yearname = 'Y' + currentYear.toString();

						// Display current body name
						that.el.body.childNodes[1].childNodes[0].innerHTML = body.name;

						// Display selected month and year
						that.el.header.childNodes[1].childNodes[0].innerHTML = monthname;
						that.el.header.childNodes[1].childNodes[1].innerHTML = yearname;

						// Set current body, year, and month
						that.el.monthPicker.querySelector('[data-month="0"]').classList.add('current');
						that.el.bodyPicker.querySelector('[data-body="0"]').classList.add('current');
						that.el.yearPicker.querySelector('[data-year="0"]').classList.add('current');
						// Check for month overflow
						if (currentMonth - 1 + months - 1 > body.monthCount - 1) {
							that.el.yearPicker.querySelector('[data-year="1"]').classList.add('current');
						}
						if (onNavigation) onNavigation.call(that);
					};

					function resetCalendar() {
						[].slice.call(that.el.querySelectorAll('.d-table input')).forEach(function (inputEl) {
							inputEl.checked = false;
						});

						[].slice.call(that.el.monthPicker.querySelectorAll('.current')).forEach(function (monthPickEl) {
							monthPickEl.classList.remove('current');
						});

						[].slice.call(that.el.yearPicker.querySelectorAll('.current')).forEach(function (yearPickEl) {
							yearPickEl.classList.remove('current');
						});
					};

					function nextMonth() {
						currentMonth += months;
						setDate();
					};

					function prevMonth() {
						currentMonth -= months;
						setDate();
					};

					function nextBody() {
						currentBody += 1;
						currentBody = loopBodies(currentBody);
						body = bodies[currentBody];
						generateBodies();
						setDate();
					}

					function prevBody() {
						currentBody -= 1;
						currentBody = loopBodies(currentBody);
						body = bodies[currentBody];
						generateBodies();
						setDate();
					}

					// Runs when a date is selected
					function inputChange() {
						// Close calendar
						that.hide();

						var input = this;

						// Get the data stored in the selected date
						var parsedData = JSON.parse(input.getAttribute('data-date'));
						var date = new SpaceDate(body, parsedData.year, parsedData.month, parsedData.day);

						// Make sure the date is valid
						if (date.isBeforeEpoch())
							realTime = 0;
						else
							realTime = date.getMsFromEpoch();
					};

					function show(properties) {
						if (!that.inline && that.container === document.body) {
							document.body.classList.add('d-noscroll');
						}
						setArgs(properties);
						var handler = function handler() {
							that.el.classList.remove('d-show');
							that.el.calendar.removeEventListener(whichAnimationEvent(), handler);
						};
						that.el.calendar.addEventListener(whichAnimationEvent(), handler);
						that.el.classList.add('d-show');
						container.appendChild(that.el);
						opened = true;

						currentYear = body.y;
						currentMonth = body.month;
						setDate();
					};

					function hide() {
						document.body.classList.remove('d-noscroll');
						var handler = function handler() {
							that.el.parentNode.removeChild(that.el);
							opened = false;
							that.el.classList.remove('d-hide');
							if (typeof onClose == 'function') {
								onClose.apply(that);
							}
							that.el.removeEventListener(whichAnimationEvent(), handler);
						};
						that.el.addEventListener(whichAnimationEvent(), handler);
						that.el.classList.add('d-hide');
					};

					function bindEvents() {
						// Button to go to previous month
						that.el.header.childNodes[0].addEventListener(eventName, prevMonth);
						// Button to go to next month
						that.el.header.childNodes[2].addEventListener(eventName, nextMonth);
						// Click on month to show selector
						that.el.header.childNodes[1].childNodes[0].addEventListener(eventName, function () {
							generateMonths();
							if (that.el.monthPicker.classList.contains('d-show')) {
								that.el.monthPicker.classList.remove('d-show');
							} else {
								that.el.monthPicker.classList.add('d-show');
							}
							that.el.yearPicker.classList.remove('d-show');
						});
						// Click on year to show selector
						that.el.header.childNodes[1].childNodes[1].addEventListener(eventName, function () {
							generateYears();
							if (that.el.yearPicker.classList.contains('d-show')) {
								that.el.yearPicker.classList.remove('d-show');
							} else {
								that.el.yearPicker.classList.add('d-show');
							}
							that.el.monthPicker.classList.remove('d-show');
						});

						// Button to go to previous month
						that.el.body.childNodes[0].addEventListener(eventName, prevBody);
						// Button to go to next month
						that.el.body.childNodes[2].addEventListener(eventName, nextBody);
						// Click on body to show selector
						that.el.body.childNodes[1].childNodes[0].addEventListener(eventName, function () {
							generateBodies();
							if (that.el.bodyPicker.classList.contains('d-show')) {
								that.el.bodyPicker.classList.remove('d-show');
							} else {
								that.el.bodyPicker.classList.add('d-show');
							}
						});

						// Close when the close button is clicked 
						that.el.button.addEventListener(eventName, hide);
						// Click off the calendar to close it
						that.el.overlay.addEventListener(eventName, function () {
							if (closeOnClick) {
								that.hide();
							}
						});

						// Display a selection of months
						[].slice.call(that.el.monthPicker.childNodes).forEach(function (monthPicker) {
							monthPicker.addEventListener(eventName, function () {
								currentMonth += parseInt(this.getAttribute('data-month'));
								setDate();
								that.el.monthPicker.classList.remove('d-show');
							});
						});

						// Display a selection of years
						[].slice.call(that.el.yearPicker.childNodes).forEach(function (yearPicker) {
							yearPicker.addEventListener(eventName, function () {
								currentYear += parseInt(this.getAttribute('data-year'));
								setDate();
								that.el.yearPicker.classList.remove('d-show');
							});
						});

						// Display a selection of celestial bodies
						[].slice.call(that.el.bodyPicker.childNodes).forEach(function (bodyPicker) {
							bodyPicker.addEventListener(eventName, function () {
								currentBody += parseInt(this.getAttribute('data-body'));
								currentBody = loopBodies(currentBody);
								body = bodies[currentBody];
								setDate();
								that.el.bodyPicker.classList.remove('d-show');
							});
						});

						var startX = 0;
						var distance = 0;
						that.el.calendar.addEventListener('touchstart', function (e) {
							startX = e.changedTouches[0].clientX || e.originalEvent.changedTouches[0].clientX;
							//e.preventDefault();
						});

						that.el.calendar.addEventListener('touchmove', function (e) {
							distance = e.changedTouches[0].clientX - startX || e.originalEvent.changedTouches[0].clientX - startX;
							e.preventDefault();
						});

						that.el.calendar.addEventListener('touchend', function (e) {
							if (distance > 50) {
								prevMonth();
							} else if (distance < -50) {
								nextMonth();
							}
							distance = 0;
						});
					};

					function setArgs(x) {
						for (var key in x) {
							if (key in that) {
								that[key] = x[key];
							}
						};
					};

					function init() {
						that.el = document.createElement('div');
						that.el.id = 'Datepickk';
						that.el.classList.add(getBrowserVersion().type);
						that.el.innerHTML = template;
						that.el.calendar = that.el.childNodes[1];
						that.el.titleBox = that.el.childNodes[0];
						that.el.button = that.el.childNodes[3];

						that.el.body = that.el.calendar.childNodes[0];
						that.el.bodyPicker = that.el.calendar.childNodes[1];

						that.el.header = that.el.calendar.childNodes[2];
						that.el.monthPicker = that.el.calendar.childNodes[3];
						that.el.yearPicker = that.el.calendar.childNodes[4];
						that.el.tables = that.el.calendar.childNodes[6];
						that.el.days = that.el.calendar.childNodes[5];

						that.el.overlay = that.el.childNodes[4];
						that.el.legend = that.el.childNodes[2];


						setArgs(args);

						generateInputs();
						generateDaynames();
						bindEvents();

						if (inline) {
							show();
						}
					}

					that.show = show;
					that.hide = hide;

					function currentDateGetter() {
						return new SpaceDate(body, currentYear, currentMonth - 1, 1);
					}
					function currentDateSetter() {
						currentMonth = body.month;
						currentYear = body.y;
						setDate();
					}

					Object.defineProperties(that, {
						"weekStart": {
							get: function get() {
								return weekStart !== null ? weekStart : languages[lang].weekStart;
							},
							set: function set(x) {
								if (typeof x == 'number' && x > -1 && x < 7) {
									weekStart = x;
									generateDaynames();
									setDate();
								} else {
									console.error('weekStart must be a number between 0 and 6');
								}
							}
						},
						"months": {
							get: function get() {
								return months;
							},
							set: function set(x) {
								if (typeof x == 'number' && x > 0) {
									months = x;
									generateDaynames();
									generateInputs();
									setDate();

									if (months == 1) {
										that.el.classList.remove('multi');
									} else {
										that.el.classList.add('multi');
									}
								} else {
									console.error('months must be a number > 0');
								}
							}
						},
						"isOpen": {
							get: function get() {
								return opened;
							}
						},
						"closeOnSelect": {
							get: function get() {
								return closeOnSelect;
							},
							set: function set(x) {
								if (x) {
									closeOnSelect = true;
								} else {
									closeOnSelect = false;
								}
							}
						},
						"onClose": {
							set: function set(callback) {
								onClose = callback;
							}
						},
						"onSelect": {
							set: function set(callback) {
								onSelect = callback;
							}
						},
						"today": {
							get: function get() {
								return today;
							},
							set: function set(x) {
								if (x) {
									today = true;
								} else {
									today = false;
								}
							}
						},
						"daynames": {
							get: function get() {
								return daynames;
							},
							set: function set(x) {
								if (x) {
									daynames = true;
								} else {
									daynames = false;
								}
								generateDaynames();
							}
						},
						"onNavigation": {
							set: function set(callback) {
								if (typeof callback == 'function') {
									onNavigation = callback.bind(that);
								} else if (!callback) {
									onNavigation = null;
								}
							}
						},
						"closeOnClick": {
							get: function get() {
								return closeOnClick;
							},
							set: function set(x) {
								if (x) {
									closeOnClick = true;
								} else {
									closeOnClick = false;
								}
							}
						},
						"currentDate": {
							get: currentDateGetter,
							set: currentDateSetter
						},
						"setDate": {
							set: currentDateSetter
						},
						"startDate": {
							get: function get() {
								return startDate;
							},
							set: function set(x) {
								if (x) {
									startDate = new Date(x);
								} else {
									startDate = null;
									currentYear = new Date().getFullYear();
									currentMonth = new Date().getMonth() + 1;
								}
								setDate();
							}
						},
						"minDate": {
							get: function get() {
								return minDate;
							},
							set: function set(x) {
								minDate = x ? new Date(x) : null;
								setDate();
							}
						},
						"container": {
							get: function get() {
								return container;
							},
							set: function set(x) {
								if (x instanceof String) {
									var y = document.querySelector(x);
									if (y) {
										container = y;
										if (container != document.body) {
											that.el.classList.add('wrapped');
										} else {
											that.el.classList.remove('wrapped');
										}
									} else {
										console.error("Container doesn't exist");
									}
								} else if (x instanceof HTMLElement) {
									container = x;
									if (container != document.body) {
										that.el.classList.add('wrapped');
									} else {
										that.el.classList.remove('wrapped');
									}
								} else {
									console.error("Invalid type");
								}
							}
						}
					});

					init();
					setDate();

					return Object.freeze(that);
				};

				function whichAnimationEvent() {
					var t;
					var el = document.createElement('fakeelement');
					var transitions = {
						'animation': 'animationend',
						'OAnimation': 'oanimationend',
						'MozAnimation': 'animationend',
						'WebkitAnimation': 'webkitAnimationEnd',
						'': 'MSAnimationEnd'
					};

					for (t in transitions) {
						if (el.style[t] !== undefined) {
							return transitions[t];
						}
					}
				}

				var template = '<div class="d-title"></div>';
				template += '<div class="d-calendar">';
				template += '<div class="d-header">' + '<i id="d-previous"></i>' + '<p><span class="d-body"></span></p>' + '<i id="d-next"></i>' + '</div>';
				template += '<div class="d-year-picker">' + '<div data-body="-2"></div>' + '<div data-body="-1"></div>' + '<div data-body="0"></div>' + '<div data-body="1"></div>' + '<div data-body="2"></div>' + '</div>';
				template += '<div class="d-header">' + '<i id="d-previous"></i>' + '<p><span class="d-month"></span><span class="d-year"></span></p>' + '<i id="d-next"></i>' + '</div>';
				template += '<div class="d-month-picker">' + '<div data-month="-5"></div>' + '<div data-month="-4"></div>' + '<div data-month="-3"></div>' + '<div data-month="-2"></div>' + '<div data-month="-1"></div>' + '<div data-month="0"></div>' + '<div data-month="1"></div>' + '<div data-month="2"></div>' + '<div data-month="3"></div>' + '<div data-month="4"></div>' + '<div data-month="5"></div>' + '</div>';
				template += '<div class="d-year-picker">' + '<div data-year="-5"></div>' + '<div data-year="-4"></div>' + '<div data-year="-3"></div>' + '<div data-year="-2"></div>' + '<div data-year="-1"></div>' + '<div data-year="0"></div>' + '<div data-year="1"></div>' + '<div data-year="2"></div>' + '<div data-year="3"></div>' + '<div data-year="4"></div>' + '<div data-year="5"></div>' + '</div>';
				template += '<div class="d-weekdays"></div>' + '<div class="d-tables"></div>' + '</div>';
				template += '<div class="d-legend"></div>' + '<button class="d-confirm"></button>' + '<div class="d-overlay"></div>';

				var getBrowserVersion = function getBrowserVersion() {
					var browser = {
						type: null,
						version: null
					};

					var ua = navigator.userAgent,
						tem,
						ios,
						M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
					ios = ua.match(/(iphone|ipad)\s+OS\s+([\d+_]+\d+)/i) || [];
					if (/trident/i.test(M[1])) {
						tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
						browser.type = 'MSIE';
						browser.version = parseInt(tem[1]);
						return browser;
					}
					if (M[1] === 'Chrome') {
						tem = ua.match(/\bOPR\/(\d+)/);
						if (tem != null) return 'Opera ' + tem[1];
					}
					if (ios[1]) {
						return browser = {
							type: 'iOS',
							version: ios[2]
						};
					}
					M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
					if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
					browser.type = M[0];
					browser.version = parseInt(M[1]);

					return browser;
				};

				exports.default = Datepickk;

				/***/
			}),
			/* 1 */
			(function (module, exports) { })
			])["default"];
	});