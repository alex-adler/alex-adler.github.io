class Celestial {
    constructor(name, dayLength, yearLength, leapSeconds, initialYearProgress = 0, initialWeekDay = 0) {
        this.name = name;
        this.dayLength = Math.floor(dayLength * 3600) * 1000;
        this.yearLength = Math.floor(yearLength * 3600) * 1000;
        this.y = 0;
        this.month = 0;
        this.dayOfYear = 0;
        this.dayOfMonth = 0;
        this.hDayOfYear = 0;
        this.hDayOfWeek = 0;
        this.hDaysSinceEpoch = 0;
        this.h = 0;
        this.m = 0;
        this.s = 0;
        this.ms = 0;
        this.hh = 0;
        this.hm = 0;
        this.hs = 0;
        this.hms = 0;
        // this.monthLength = Math.floor(this.yearLength / (3600 * 1000 * 12)) * 3600 * 1000;

        let numMonths = 12;
        let dayDiff = 1;

        // Check if day length is +-dayDiff from 24 hours
        if (Math.abs((24 * 3600 * 1000) - this.dayLength) > (dayDiff * 3600 * 1000)) {
            // If it's not, use the solar day as a week and calculate a human day
            this.calculateWeek(dayDiff, 1);
            console.log(this.name + " " + this.hDayLength / (3600 * 1000) + " " + this.hdWeekLength + " " + this.dWeekLength);
        } else {
            // Use a default 7 day week if we don't need a special one
            this.hDayLength = this.dayLength;
            this.dWeekLength = 7;
            this.hdWeekLength = this.dWeekLength;
        }

        this.hYearLength = Math.floor(this.yearLength / this.hDayLength) * this.hDayLength;
        this.monthLength = Math.floor(this.yearLength / (this.hDayLength * numMonths)) * this.hDayLength;
        console.log(this.name + " month length is " + this.monthLength / this.hDayLength + " days");

        this.YearRemainder1 = (this.yearLength % this.hYearLength) / this.hDayLength;
        this.LeapYearFreq1 = Math.ceil(1 / this.YearRemainder1);

        this.YearRemainder2 = (this.yearLength % this.hYearLength) / this.hDayLength - (1 / this.LeapYearFreq1);
        this.LeapYearFreq2 = Math.ceil(1 / this.YearRemainder2);

        this.monthRemainder = (this.hYearLength / this.hDayLength) - ((this.monthLength / this.hDayLength) * numMonths);

        this.excessYearRemainder = (this.yearLength % this.hYearLength) / this.hDayLength - (1 / this.LeapYearFreq1) - (1 / this.LeapYearFreq2);

        console.log(this.name + " remainder from year length " + this.YearRemainder1 + " days, leap year every " + this.LeapYearFreq1 + " and " + this.LeapYearFreq2 + " years");
        console.log(this.name + " excess remainder " + this.excessYearRemainder + " days");
        console.log(this.name + " remainder from months " + this.monthRemainder + " days");
        console.log(this.name + " year length = " + this.hYearLength / this.hDayLength + " days");

        // Fudge factors
        this.leapSeconds = leapSeconds;
        this.initialWeekDay = initialWeekDay;
        this.initialYearProgress = initialYearProgress;
    }
    calculateWeek(dayDiff, solarDaysPerWeek) {
        let minWeekLength = 4;
        let lowerLimit = (this.dayLength * solarDaysPerWeek) / ((24 - dayDiff) * 3600 * 1000)
        let upperLimit = (this.dayLength * solarDaysPerWeek) / ((24 + dayDiff) * 3600 * 1000)

        if ((Math.floor(lowerLimit) > upperLimit) && (Math.floor(lowerLimit) > minWeekLength)) {
            // Valid week length (also longer than the minimum length)
            this.dWeekLength = solarDaysPerWeek;
            this.hdWeekLength = Math.floor(lowerLimit);
            this.hDayLength = Math.floor((this.dayLength * solarDaysPerWeek) / (this.hdWeekLength * 1000)) * 1000;
        }
        else {
            if (solarDaysPerWeek < 100) {
                this.calculateWeek(dayDiff, solarDaysPerWeek + 1);
            }
            else {
                console.log("Week length not found for " + this.name);
                this.hDayLength = 0;
                this.dWeekLength = 0;
                this.hdWeekLength = 0;
            }
        }
    }
    getDateTime(msFromEpoch) {

        msFromEpoch += this.leapSeconds * 1000;

        this.hDaysSinceEpoch = Math.floor(msFromEpoch / this.hDayLength);

        if (this.hYearLength !== 1) {
            this.y = Math.floor(msFromEpoch / this.hYearLength);
            this.leapDays = Math.floor(this.y / this.LeapYearFreq1) + Math.floor(this.y / this.LeapYearFreq2);
            // if ((this.y % this.LeapYearFreq1) === 0 || (this.y % this.LeapYearFreq2) === 0) {
            //     this.leapYear = 1;
            // }
            // else {
            //     this.leapYear = 0;
            // }
            msFromEpoch %= this.hYearLength;
        }

        // msFromEpoch -= this.leapDays * 86400 * 1000;

        this.dayOfYear = Math.floor(msFromEpoch / this.dayLength);
        this.hDayOfYear = Math.floor(msFromEpoch / this.hDayLength);

        this.month = Math.floor(msFromEpoch / this.monthLength);
        let msFromEpochwLs = msFromEpoch % this.monthLength;
        this.dayOfMonth = Math.floor(msFromEpochwLs / this.hDayLength);

        this.hDayOfWeek = Math.floor((this.hDaysSinceEpoch + this.initialWeekDay) % this.hdWeekLength);

        let msFromEpoch2 = msFromEpoch;

        msFromEpoch %= this.dayLength;
        this.h = Math.floor(msFromEpoch / 3600000);
        msFromEpoch %= 3600000;
        this.m = Math.floor(msFromEpoch / 60000);
        msFromEpoch %= 60000;
        this.s = Math.floor(msFromEpoch / 1000);
        msFromEpoch %= 1000;
        this.ms = Math.floor(msFromEpoch);

        msFromEpoch2 %= this.hDayLength;
        this.hh = Math.floor(msFromEpoch2 / 3600000);
        msFromEpoch2 %= 3600000;
        this.hm = Math.floor(msFromEpoch2 / 60000);
        msFromEpoch2 %= 60000;
        this.hs = Math.floor(msFromEpoch2 / 1000);
        msFromEpoch2 %= 1000;
        this.hms = Math.floor(msFromEpoch2);

        this.dayOfYear += 1;
        this.dayOfMonth += 1;
        this.hDayOfYear += 1;
        this.hDayOfWeek += 1;
        this.month += 1;
    }
    formatTime() {
        let m = this.checkTime(this.hm);
        let s = this.checkTime(this.hs);
        let h = this.checkHour(this.hh, this.hDayLength);
        return h + ":" + m + ":" + s;// + ":" + this.ms;
    }
    formatSolarTime() {
        let m = this.checkTime(this.m);
        let s = this.checkTime(this.s);
        let h = this.checkHour(this.h, this.dayLength);
        return h + ":" + m + ":" + s;// + ":" + this.ms;
    }
    formatDate() {
        let d = this.checkDay(this.dayOfMonth, this.dayLength, this.monthLength);
        return d + "/" + this.month + "/" + this.y;
    }
    formatWeekDay() {
        return this.hDayOfWeek + "/" + this.hdWeekLength;
    }
    // Functions to add leading zeros
    checkTime(i) {
        // Add zero in front of numbers < 10
        if (i < 10) { i = "0" + i };
        return i;
    }
    checkHour(i, dayLength) {
        let curDigit = i.toString().length;
        let maxDigit = Math.floor(dayLength / 3600000).toString().length;
        if (curDigit < maxDigit) {
            for (let j = 0; j < maxDigit - curDigit; j++) { i = "0" + i; }
        }
        return i;
    }
    checkDay(i, dayLength, yearLength) {
        let curDigit = i.toString().length;
        let maxDigit = Math.floor(yearLength / dayLength).toString().length;
        if (curDigit < maxDigit) {
            for (let j = 0; j < maxDigit - curDigit; j++) { i = "0" + i; }
        }
        return i;
    }
}

// Celestial Bodies (name, dayLength, yearLength, leapSeconds, initialYearProgress, initialWeekDay)
var Earth = new Celestial("Earth", 24, 365.256363004 * 24, 0, 0, 5);
var Mars = new Celestial("Mars", 24.6230, 668.5991 * 24.6230, 0);
var Venus = new Celestial("Venus", 116.75 * 24, 5832.6, 0);

var Ceres = new Celestial("Ceres", 9.074170, 1683.14570801 * 24, 0);

var Europa = new Celestial("Europa", 3.551181 * 24, 4332.59 * 24, 0);
var Ganymede = new Celestial("Ganymede", 7.15455296 * 24, 4332.59 * 24, 0);
var Callisto = new Celestial("Callisto", 16.6890184 * 24, 4332.59 * 24, 0);

var Titan = new Celestial("Titan", 15.945 * 24, 10759.22 * 24, 0);
var Enceladus = new Celestial("Enceladus", 1.370218 * 24, 10759.22 * 24, 0);

var Titania = new Celestial("Titania", 8.706234 * 24, 30688.5 * 24, 0);

var Triton = new Celestial("Triton", 5.876854 * 24, 60182 * 24, 0);

var bodies = [Earth, Mars, Venus, Europa, Ganymede, Callisto, Titan, Enceladus, Titania, Triton, Ceres];

// Update everything
function updateTimes(table, bodies, msFromEpoch) {
    updateInternalValues(msFromEpoch);
    data = generateData(bodies);
    updateTable(table, data);
    var text = document.getElementById("demo");
    t = timeConverter(realTime);
    text.innerText = t;
}

function timeConverter(timestamp) {
    var a = new Date(timestamp + 946684800000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}

// Update all of the internal values of each celestial body
function updateInternalValues(msFromEpoch) {
    bodies.forEach(body => { body.getDateTime(msFromEpoch) });
}

// Generate data to be displayed in the table
function generateData(bodies) {
    var data = [];
    var i;
    for (i = 0; i < bodies.length; i++) {
        data.push([bodies[i].name, bodies[i].formatTime(), bodies[i].formatSolarTime(), bodies[i].formatWeekDay(), bodies[i].formatDate()]);
    }
    return data;
}

// Generate HTML for the table head
function generateTableHead(table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
        let th = document.createElement("th");
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }
}

function generateTable(table, data) {
    for (let element of data) {
        let row = table.insertRow();
        for (key in element) {
            let cell = row.insertCell();
            let text = document.createTextNode(element[key]);
            cell.appendChild(text);

            if (key == 0) { cell.id = "tableName"; }
            else { cell.id = "tableValue"; }
        }
    }
}

function updateTable(table, data) {
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            // console.log(data[i][j]);
            table.rows[i + 1].cells[j].innerHTML = data[i][j];
            // table.rows[i + 1].cells[j].setA
        }
    }
}

/* Functions called by HTML */

function IrlTime() {
    // J2000ish epoch
    // 946663200000
    realTime = Date.now() - 946684800000;
    var slider = document.getElementById("sliderSpeed");
    slider.value = 0;
}

function EpochTime() {
    // J2000ish epoch
    realTime = 0;
    var slider = document.getElementById("sliderSpeed");
    slider.value = 0;
}

function generate() {
    let table = document.querySelector("table");
    let tableHeaders = ["Body", "Local Time", "Solar Time", "Day of the Week", "Date"];
    data = generateData(bodies);
    generateTableHead(table, tableHeaders);
    generateTable(table, data);

    balls(table, bodies);
}
