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
					var selectedDates = [];

					// var currentYear = new Date().getFullYear();

					// var currentYear = 21;
					// var currentMonth = new Date().getMonth() + 1;

					// var languages = {
					// 	no: {
					// 		monthNames: ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'],
					// 		dayNames: ['sø', 'ma', 'ti', 'on', 'to', 'fr', 'lø'],
					// 		weekStart: 1
					// 	},
					// 	se: {
					// 		monthNames: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'],
					// 		dayNames: ['sö', 'må', 'ti', 'on', 'to', 'fr', 'lö'],
					// 		weekStart: 1
					// 	},
					// 	ru: {
					// 		monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
					// 		dayNames: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
					// 		weekStart: 1
					// 	},
					// 	en: {
					// 		monthNames: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
					// 		dayNames: ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'],
					// 		weekStart: 1
					// 	},
					// 	de: {
					// 		monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
					// 		dayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
					// 		weekStart: 1
					// 	}
					// };

					/*Language aliases*/
					// languages.nb = languages.no;
					// languages.nn = languages.no;

					var range = false;
					var maxSelections = null;
					var container = document.body;
					var opened = false;
					var months = 1;
					var closeOnSelect = false;
					var button = null;
					var title = null;
					var onNavigation = null;
					var onClose = null;
					var onConfirm = null;
					var closeOnClick = true;
					var inline = false;
					var lang = 'en';
					var onSelect = null;
					var disabledDates = [];
					var disabledDays = [];
					var highlight = [];
					var tooltips = {};
					var daynames = true;
					var today = true;
					var startDate = null;
					var minDate = null;
					var maxDate = null;
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

					// TODO: Remove gracefully
					// function parseMonth(month) {
					// 	if (month > 11) month -= 12; else if (month < 0) month += 12;
					// 	return month;
					// }

					function generateDates(year, month) {
						var monthElements = that.el.querySelectorAll('.d-table');
						// var ws = weekStart !== null ? weekStart : languages[lang].weekStart;
						// Week start
						var ws = 1;

						[].slice.call(that.el.querySelectorAll('.d-table')).forEach(function (element, index) {
							// // Number of days in current month
							// var days = new Date(year, month + index, 0).getDate();
							// // Number of days in last month
							// var daysLast = new Date(year, month + index - 1, 0).getDate();
							// // Day of the week of the first day of the month
							// var startDay = new Date(year, month + index - 1, 1).getDay();

							// Number of days in current month
							var days = new SpaceDate(body, year, month + index, 0).getDate();
							// Number of days in last month
							var daysLast = new SpaceDate(body, year, month + index - 1, 0).getDate();
							// Day of the week of the first day of the month
							var startDay = new SpaceDate(body, year, month + index - 1, 1).getDay();

							var startDate = null;
							var endDate = null;

							// Decide which day of the week to start on 
							if (startDay - ws < 0) {
								startDay = body.weekLength_hd - ws;
							} else {
								startDay -= ws;
							}

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
								if (i < startDay) {
									labelEl.childNodes[0].innerHTML = daysLast - (startDay - i - 1);
									if (index == 0) {
										date = new SpaceDate(body, year, month + index - 1, daysLast - (startDay - i - 1));
										labelEl.className = 'prev';
									} else {
										date = '';
										labelEl.className = 'd-hidden';
										inputEl.setAttribute('disabled', true);
									}
								}
								// Else if the date is from the current month 
								else if (i < days + startDay) {
									date = new SpaceDate(body, year, month + index, i - startDay + 1);
									labelEl.childNodes[0].innerHTML = i - startDay + 1;
									labelEl.className = '';
								}
								// Else the date is from the next month
								else {
									labelEl.childNodes[0].innerHTML = i - days - startDay + 1;
									if (index == monthElements.length - 1) {
										date = new SpaceDate(body, year, month + index + 1, i - days - startDay + 1);
										labelEl.className = 'next';
									} else {
										date = '';
										labelEl.className = 'd-hidden';
										inputEl.setAttribute('disabled', true);
									}
								}

								// console.log(month + index);

								if (date instanceof SpaceDate) {
									inputEl.setAttribute('data-date', date.day);
								} else {
									console.log("date is not a SpaceDate");
								}

								// 	if (disabledDates.indexOf(date.getTime()) != -1 || disabledDays.indexOf(date.getDay()) != -1) {
								// 		inputEl.setAttribute('disabled', true);
								// 	}

								// Disable the arrow if you are trying to go before the epoch
								if (date.year < 0) {
									// console.log("Before epoch");
									inputEl.setAttribute('disabled', true);
									labelEl.className = 'd-hidden';
								}

								// Add indicator to the current day
								if (today && (JSON.stringify(date) == JSON.stringify(new SpaceDate(body)))) {
									labelEl.classList.add('today');
								} else {
									labelEl.classList.remove('today');
								}

								// 	if (tooltips[date.getTime()]) {
								// 		labelEl.childNodes[0].setAttribute('data-tooltip', true);
								// 		labelEl.childNodes[1].innerHTML = tooltips[date.getTime()];
								// 	} else {
								// 		labelEl.childNodes[0].removeAttribute('data-tooltip');
								// 		labelEl.childNodes[1].innerHTML = '';
								// 	}

								// 	var _highlights = highlight.filter(function (x) {
								// 		for (var m = 0; m < x.dates.length; m++) {
								// 			if (date.getTime() >= x.dates[m].start.getTime() && date.getTime() <= x.dates[m].end.getTime()) {
								// 				return true;
								// 			}
								// 		}
								// 		return false;
								// 	});

								// 	if (_highlights.length > 0) {
								// 		var bgColor = '';
								// 		var legendIds = '';

								// 		if (_highlights.length > 1) {
								// 			var percent = Math.round(100 / _highlights.length);
								// 			bgColor = 'background: linear-gradient(-45deg,';
								// 			for (var z = 0; z < _highlights.length; z++) {
								// 				legendIds += highlight.indexOf(_highlights[z]);
								// 				if (z !== _highlights.length - 1) {
								// 					legendIds += ' ';
								// 				}
								// 				bgColor += _highlights[z].backgroundColor + ' ' + percent * z + '%';
								// 				if (z != _highlights.length - 1) {
								// 					bgColor += ',';
								// 					bgColor += _highlights[z].backgroundColor + ' ' + percent * (z + 1) + '%,';
								// 				}
								// 			}
								// 			bgColor += ');';
								// 		} else {
								// 			bgColor = _highlights[0].backgroundColor ? 'background:' + _highlights[0].backgroundColor + ';' : '';
								// 			legendIds += highlight.indexOf(_highlights[0]);
								// 		}
								// 		var Color = _highlights[0].color ? 'color:' + _highlights[0].color + ';' : '';
								// 		labelEl.setAttribute('style', bgColor + Color);
								// 		labelEl.setAttribute('data-legend-id', legendIds);
								// 	}
								// }
							});
						});

						// generateLegends();
					};

					function setDate() {
						if (lastBody !== currentBody) {
							lastBody = currentBody;
							console.log("Body has changed");

							displayedDaysCount = displayedWeeksCount * body.weekLength_hd;
							let newDayBoxSize = 100 / body.weekLength_hd;

							// Probably not the correct way of changing the css rules

							// Display all week numbers
							// console.log(document.styleSheets[1].cssRules[60]);
							document.styleSheets[1].deleteRule(60);
							document.styleSheets[1].insertRule("#Datepickk .d-week > div {flex-basis: calc(" + newDayBoxSize + "%);text-align: center;}", 60);
							// console.log(document.styleSheets[1].cssRules[60]);

							// Not sure what this changes
							// console.log(document.styleSheets[1].cssRules[65]);
							document.styleSheets[1].deleteRule(65);
							document.styleSheets[1].insertRule("#Datepickk .d-table label:nth-of-type(" + body.weekLength_hd + "n) .d-date-legends {padding-right: 0;}", 65);
							// console.log(document.styleSheets[1].cssRules[65]);

							// Nor this one
							// console.log(document.styleSheets[1].cssRules[66]);
							document.styleSheets[1].deleteRule(66);
							document.styleSheets[1].insertRule("#Datepickk .d-table label:nth-last-of-type(-n + " + body.weekLength_hd + ") .d-date-legends {padding-bottom: 0;}", 66);
							// console.log(document.styleSheets[1].cssRules[66]);

							// Correctly display week lengths
							console.log(document.styleSheets[1].cssRules[68]);
							document.styleSheets[1].deleteRule(68);
							document.styleSheets[1].insertRule("#Datepickk .d-table input + label {flex-basis: calc(" + newDayBoxSize + "%);display: flex;align-items: center;justify-content: center;cursor: pointer;transition: background-color 0.2s ease, background 0.2s ease, color 0.2s ease;position: relative;box-sizing: border-box;}", 68);
							// console.log(document.styleSheets[1].cssRules[68]);

							generateInputs();
							generateDaynames();
							// bindEvents();
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

						// for (var c = 0; c < months; c++) {
						// 	var index = currentMonth - 1 + c;
						// 	if (index > body.monthCount - 1) {
						// 		index -= body.monthCount;
						// 	} else if (index < 0) {
						// 		index += body.monthCount;
						// 	}

						// 	that.el.monthPicker.childNodes[index].classList.add('current');
						// }

						generateDates(currentYear, currentMonth);
						generateYears();
						// var startmonth = languages[lang].monthNames[currentMonth - 1];
						// var startmonth = currentMonth;
						// var endmonth = '';

						var monthname = 'M' + currentMonth + '';

						var yearname = 'Y' + currentYear.toString();



						// Display current body name
						that.el.body.childNodes[1].childNodes[0].innerHTML = body.name;

						// Display slected month and year
						that.el.header.childNodes[1].childNodes[0].innerHTML = monthname;
						that.el.header.childNodes[1].childNodes[1].innerHTML = yearname;

						that.el.yearPicker.querySelector('[data-year="0"]').classList.add('current');
						if (currentMonth - 1 + months - 1 > body.monthCount - 1) {
							that.el.yearPicker.querySelector('[data-year="1"]').classList.add('current');
						}

						that.el.monthPicker.querySelector('[data-month="0"]').classList.add('current');
						that.el.bodyPicker.querySelector('[data-body="0"]').classList.add('current');

						renderSelectedDates();
						if (onNavigation) onNavigation.call(that);
					};

					function renderSelectedDates() {
						selectedDates.forEach(function (date) {
							var el = that.el.querySelector('[data-date="' + date.save() + '"]');
							if (el) {
								el.checked = true;
							}
						});

						that.el.tables.classList.remove('before');
						if (range && selectedDates.length > 1) {
							var currentDate = new Date(currentYear, currentMonth - 1, 1);
							var sorted = selectedDates.sort(function (a, b) {
								return a.getTime() - b.getTime();
							});
							var first = that.el.querySelector('[data-date="' + sorted[0].toJSON() + '"]');
							if (!first && currentDate >= new Date(sorted[0].getFullYear(), sorted[0].getMonth(), 1) && currentDate <= new Date(sorted[1].getFullYear(), sorted[1].getMonth(), 1)) {
								that.el.tables.classList.add('before');
							}
						}
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

					function selectDate(date, ignoreOnSelect) {
						date = new SpaceDate(body, date);
						date.setHours(0, 0, 0, 0);
						var el = that.el.querySelector('[data-date="' + date.save() + '"]');

						if (range && el && el.checked) {
							el.classList.add('single');
						}

						if (el && !el.checked) {
							el.checked = true;
						}

						selectedDates.push(date);

						if (onSelect && !ignoreOnSelect) {
							onSelect.apply(date, [true]);
						}
					};

					// function unselectDate(date, ignoreOnSelect) {
					// 	date = new Date(date);
					// 	date.setHours(0, 0, 0, 0);
					// 	var el = that.el.querySelector('[data-date="' + date.save() + '"]');
					// 	if (el) {
					// 		el.classList.remove('single');
					// 		if (el.checked) {
					// 			el.checked = false;
					// 		}
					// 	}

					// 	selectedDates = selectedDates.filter(function (x) {
					// 		return x.getTime() != date.getTime();
					// 	});

					// 	if (onSelect && !ignoreOnSelect) {
					// 		onSelect.call(date, false);
					// 	}
					// };

					// function unselectAll(ignoreOnSelect) {
					// 	selectedDates.forEach(function (date) {
					// 		unselectDate(date, ignoreOnSelect);
					// 	});
					// };

					// Runs when a date is selected
					function inputChange(e) {
						// Close calendar
						that.hide();

						var input = this;
						var date = new SpaceDate(body, currentYear, currentMonth, input.getAttribute('data-date'));
						realTime = date.getMsFromEpoch();
						// var date = new SpaceDate(body, currentYear,currentMonth)

						// var input = this;
						// var date = new Date(input.getAttribute('data-date'));
						// input.classList.remove('single');
						// if (locked) {
						// 	return;
						// }
						// if (range) {
						// 	that.el.tables.classList.remove('before');
						// }
						// if (input.checked) {
						// 	if (maxSelections && selectedDates.length > maxSelections - 1) {
						// 		var length = selectedDates.length;
						// 		for (length; length > maxSelections - 1; length--) {
						// 			unselectDate(selectedDates[0]);
						// 		}
						// 	}

						// 	if (range && selectedDates.length) {
						// 		var first = that.el.querySelector('[data-date="' + selectedDates[0].toJSON() + '"]');
						// 		if (!first && date > selectedDates[0]) {
						// 			that.el.tables.classList.add('before');
						// 		}
						// 	}

						// 	selectedDates.push(date);

						// if (onSelect) {
						// 	onSelect.call(date, input.checked);
						// }
					};

					function setRange(val) {
						if (val) {
							range = true;
							that.el.tables.classList.add('range');
						} else {
							range = false;
							that.el.tables.classList.remove('range');
						}
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

						// if (startDate) {
						// 	currentMonth = startDate.getMonth() + 1;
						// 	currentYear = startDate.getFullYear() - 2000;
						// }
						currentYear = body.y;
						currentMonth = body.month;
						setDate();
					};

					function hide() {
						console.log("Hiding");
						console.log(that.el);
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

						console.log(that.el.childNodes);

						// that.el.header = that.el.calendar.childNodes[0];
						// that.el.monthPicker = that.el.calendar.childNodes[1];
						// that.el.yearPicker = that.el.calendar.childNodes[2];
						// that.el.tables = that.el.calendar.childNodes[4];
						// that.el.days = that.el.calendar.childNodes[3];

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
					// that.selectDate = selectDate;
					// that.unselectAll = unselectAll;
					// that.unselectDate = unselectDate;

					function currentDateGetter() {
						return new SpaceDate(body, currentYear, currentMonth - 1, 1);
					}
					function currentDateSetter() {
						// x = new Date(x);
						// currentMonth = x.getMonth() + 1;
						// currentYear = x.getFullYear();
						currentMonth = body.month;
						currentYear = body.y;
						setDate();
					}

					Object.defineProperties(that, {
						"selectedDates": {
							get: function get() {
								return selectedDates.sort(function (a, b) {
									return a.getTime() - b.getTime();
								});
							}
						},
						"range": {
							get: function get() {
								return range;
							},
							set: function set(x) {
								setRange(x);
								if (x) {
									maxSelections = 2;
								}
							}
						},
						"button": {
							get: function get() {
								return button;
							},
							set: function set(x) {
								if (typeof x == 'string') {
									button = x;
								} else {
									button = null;
								}
								that.el.button.innerHTML = button ? button : '';
							}
						},
						"title": {
							get: function get() {
								return title;
							},
							set: function set(x) {
								if (typeof x == 'string') {
									title = x;
								} else {
									title = null;
								}
								that.el.titleBox.innerText = title ? title : '';
							}
						},
						"lang": {
							get: function get() {
								return lang;
							},
							set: function set(x) {
								if (x in languages) {
									lang = x;
									generateDaynames();
									setDate();
								} else {
									console.error('Language not found');
								}
							}
						},
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
						"disabledDays": {
							get: function get() {
								return disabledDays;
							},
							set: function set(x) {
								if (x instanceof Array) {
									for (var i = 0; i < x.length; i++) {
										if (typeof x[i] == 'number') {
											disabledDays.push(x[i]);
										}
									}
								} else if (typeof x == 'number') {
									disabledDays = [x];
								} else if (!x) {
									disabledDays = [];
								}
								setDate();
							}
						},
						"disabledDates": {
							get: function get() {
								return disabledDates.map(function (x) {
									return new Date(x);
								});
							},
							set: function set(x) {
								if (x instanceof Array) {
									x.forEach(function (date) {
										if (date instanceof Date) {
											disabledDates.push(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime());
										}
									});
								} else if (x instanceof Date) {
									disabledDates = [new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()];
								} else if (!x) {
									disabledDates = [];
								}
								setDate();
							}
						},
						"highlight": {
							get: function get() {
								return highlight;
							},
							set: function set(x) {
								if (x instanceof Array) {
									x.forEach(function (hl) {
										if (hl instanceof Object) {
											var highlightObj = {};
											highlightObj.dates = [];

											if ('start' in hl) {
												highlightObj.dates.push({
													start: new Date(hl.start.getFullYear(), hl.start.getMonth(), hl.start.getDate()),
													end: 'end' in hl ? new Date(hl.end.getFullYear(), hl.end.getMonth(), hl.end.getDate()) : new Date(hl.start.getFullYear(), hl.start.getMonth(), hl.start.getDate())
												});
											} else if ('dates' in hl && hl.dates instanceof Array) {
												hl.dates.forEach(function (hlDate) {
													highlightObj.dates.push({
														start: new Date(hlDate.start.getFullYear(), hlDate.start.getMonth(), hlDate.start.getDate()),
														end: 'end' in hlDate ? new Date(hlDate.end.getFullYear(), hlDate.end.getMonth(), hlDate.end.getDate()) : new Date(hlDate.start.getFullYear(), hlDate.start.getMonth(), hlDate.start.getDate())
													});
												});
											}

											highlightObj.color = hl.color;
											highlightObj.backgroundColor = hl.backgroundColor;
											highlightObj.legend = 'legend' in hl ? hl.legend : null;

											highlight.push(highlightObj);
										}
									});
								} else if (x instanceof Object) {
									var highlightObj = {};
									highlightObj.dates = [];

									if ('start' in x) {
										highlightObj.dates.push({
											start: new Date(x.start.getFullYear(), x.start.getMonth(), x.start.getDate()),
											end: 'end' in x ? new Date(x.end.getFullYear(), x.end.getMonth(), x.end.getDate()) : new Date(x.start.getFullYear(), x.start.getMonth(), x.start.getDate())
										});
									} else if ('dates' in x && x.dates instanceof Array) {
										x.dates.forEach(function (hlDate) {
											highlightObj.dates.push({
												start: new Date(hlDate.start.getFullYear(), hlDate.start.getMonth(), hlDate.start.getDate()),
												end: 'end' in hlDate ? new Date(hlDate.end.getFullYear(), hlDate.end.getMonth(), hlDate.end.getDate()) : new Date(hlDate.start.getFullYear(), hlDate.start.getMonth(), hlDate.start.getDate())
											});
										});
									}

									highlightObj.color = x.color;
									highlightObj.backgroundColor = x.backgroundColor;
									highlightObj.legend = 'legend' in x ? x.legend : null;

									highlight.push(highlightObj);
								} else if (!x) {
									highlight = [];
								}

								setDate();
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
						"fullscreen": {
							get: function get() {
								return that.el.classList.contains('fullscreen');
							},
							set: function set(x) {
								if (x) {
									that.el.classList.add('fullscreen');
								} else {
									that.el.classList.remove('fullscreen');
								}
							}
						},
						"locked": {
							get: function get() {
								return locked;
							},
							set: function set(x) {
								if (x) {
									locked = true;
									that.el.tables.classList.add('locked');
								} else {
									locked = false;
									that.el.tables.classList.remove('locked');
								}
							}
						},
						"maxSelections": {
							get: function get() {
								return maxSelections;
							},
							set: function set(x) {
								if (typeof x == 'number' && !range) {
									maxSelections = x;
								} else {
									if (range) {
										maxSelections = 2;
									} else {
										maxSelections = null;
									}
								}
							}
						},
						"onConfirm": {
							set: function set(callback) {
								if (typeof callback == 'function') {
									onConfirm = callback.bind(that);
									that.el.button.addEventListener(eventName, onConfirm);
								} else if (!callback) {
									that.el.button.removeEventListener(eventName, onConfirm);
									onConfirm = null;
								}
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
						// "tooltips": {
						// 	get: function get() {
						// 		var ret = [];
						// 		for (key in tooltips) {
						// 			ret.push({
						// 				date: new Date(parseInt(key)),
						// 				text: tooltips[key]
						// 			});
						// 		}
						// 		return ret;
						// 	},
						// 	set: function set(x) {
						// 		if (x instanceof Array) {
						// 			x.forEach(function (item) {
						// 				if (item.date && item.text && item.date instanceof Date) {
						// 					tooltips[new Date(item.date.getFullYear(), item.date.getMonth(), item.date.getDate()).getTime()] = item.text;
						// 				}
						// 			});
						// 		} else if (x instanceof Object) {
						// 			if (x.date && x.text && x.date instanceof Date) {
						// 				tooltips[new Date(x.date.getFullYear(), x.date.getMonth(), x.date.getDate()).getTime()] = x.text;
						// 			}
						// 		} else if (!x) {
						// 			tooltips = [];
						// 		}
						// 		setDate();
						// 	}
						// },
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
						"maxDate": {
							get: function get() {
								return maxDate;
							},
							set: function set(x) {
								maxDate = x ? new Date(x) : null;
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
						},
						"inline": {
							get: function get() {
								return inline;
							},
							set: function set(x) {
								if (x) {
									inline = true;
									that.el.classList.add('inline');
								} else {
									inline = false;
									that.el.classList.remove('inline');
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

				// var template = '<div class="d-title"></div>' + '<div class="d-calendar">' + '<div class="d-header">' + '<i id="d-previous"></i>' + '<p><span class="d-month"></span><span class="d-year"></span></p>' + '<i id="d-next"></i>' + '</div>' + '<div class="d-month-picker">' + '<div data-month="1">1</div>' + '<div data-month="2">2</div>' + '<div data-month="3">3</div>' + '<div data-month="4">4</div>' + '<div data-month="5">5</div>' + '<div data-month="6">6</div>' + '<div data-month="7">7</div>' + '<div data-month="8">8</div>' + '<div data-month="9">9</div>' + '<div data-month="10">10</div>' + '<div data-month="11">11</div>' + '<div data-month="12">12</div>' + '</div>' + '<div class="d-year-picker">' + '<div data-year="-5"></div>' + '<div data-year="-4"></div>' + '<div data-year="-3"></div>' + '<div data-year="-2"></div>' + '<div data-year="-1"></div>' + '<div data-year="0"></div>' + '<div data-year="1"></div>' + '<div data-year="2"></div>' + '<div data-year="3"></div>' + '<div data-year="4"></div>' + '<div data-year="5"></div>' + '</div>' + '<div class="d-weekdays"></div>' + '<div class="d-tables"></div>' + '</div>' + '<div class="d-legend"></div>' + '<button class="d-confirm"></button>' + '<div class="d-overlay"></div>';

				// var template = '<div class="d-title"></div>';
				// template += '<div class="d-calendar">';
				// template += '<div class="d-header">' + '<i id="d-previous"></i>' + '<p><span class="d-month"></span><span class="d-year"></span></p>' + '<i id="d-next"></i>' + '</div>';
				// template += '<div class="d-month-picker">' + '<div data-month="1">1</div>' + '<div data-month="2">2</div>' + '<div data-month="3">3</div>' + '<div data-month="4">4</div>' + '<div data-month="5">5</div>' + '<div data-month="6">6</div>' + '<div data-month="7">7</div>' + '<div data-month="8">8</div>' + '<div data-month="9">9</div>' + '<div data-month="10">10</div>' + '<div data-month="11">11</div>' + '<div data-month="12">12</div>' + '</div>';
				// template += '<div class="d-year-picker">' + '<div data-year="-5"></div>' + '<div data-year="-4"></div>' + '<div data-year="-3"></div>' + '<div data-year="-2"></div>' + '<div data-year="-1"></div>' + '<div data-year="0"></div>' + '<div data-year="1"></div>' + '<div data-year="2"></div>' + '<div data-year="3"></div>' + '<div data-year="4"></div>' + '<div data-year="5"></div>' + '</div>';
				// template += '<div class="d-weekdays"></div>' + '<div class="d-tables"></div>' + '</div>';
				// template += '<div class="d-legend"></div>' + '<button class="d-confirm"></button>' + '<div class="d-overlay"></div>';

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