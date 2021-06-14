class Celestial {
    constructor(name, dayLength, yearLength, leapSeconds, initialYearProgress = 0, initialWeekDay = 0) {
        this.name = name;
        this.dayLength = Math.floor(dayLength * 3600) * 1000;
        this.yearLength = Math.floor(yearLength * 3600) * 1000;
        this.y = 0;
        this.month = 0;
        this.dayOfYear = 0;
        this.dayOfMonth = 0;
        this.hDaysPerYear = 0;
        this.hTypicalDaysPerYear = 0;
        this.hDaysPerMonth = 0;
        this.hTypicalDaysPerMonth = 0;
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

        this.img = "/images/" + this.name + ".jpg";

        let weeksPerMonth = 4;
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

        this.hDaysPerYear = Math.floor(this.yearLength / this.hDayLength)
        this.hTypicalYearLength = this.hDaysPerYear * this.hDayLength;
        this.hTypicalDaysPerMonth = weeksPerMonth * this.hdWeekLength;
        this.monthLength = this.hTypicalDaysPerMonth * this.hDayLength;
        this.monthCount = Math.floor(this.hDaysPerYear / this.hTypicalDaysPerMonth);


        console.log(this.name + " has " + this.monthCount + " months, each with " + this.hTypicalDaysPerMonth + " days");

        this.YearRemainder1 = (this.yearLength % this.hTypicalYearLength) / this.hDayLength;
        this.LeapYearFreq1 = Math.ceil(1 / this.YearRemainder1);

        this.YearRemainder2 = (this.yearLength % this.hTypicalYearLength) / this.hDayLength - (1 / this.LeapYearFreq1);
        this.LeapYearFreq2 = Math.ceil(1 / this.YearRemainder2);

        this.monthRemainder = (this.hTypicalYearLength / this.hDayLength) - ((this.monthLength / this.hDayLength) * this.monthCount);

        this.excessYearRemainder = (this.yearLength % this.hTypicalYearLength) / this.hDayLength - (1 / this.LeapYearFreq1) - (1 / this.LeapYearFreq2);

        console.log(this.name + " remainder from year length " + this.YearRemainder1 + " days, leap year every " + this.LeapYearFreq1 + " and " + this.LeapYearFreq2 + " years");
        console.log(this.name + " excess remainder " + this.excessYearRemainder + " days");
        console.log(this.name + " remainder from months " + this.monthRemainder + " days");
        console.log(this.name + " year length = " + this.hTypicalYearLength / this.hDayLength + " days");

        // Length of time between leap years in ms
        this.block1YearLength = this.LeapYearFreq1 * this.hTypicalYearLength + this.hDayLength;
        this.block2YearLength = Math.floor(this.LeapYearFreq2 / this.LeapYearFreq1) * this.block1YearLength + (this.LeapYearFreq2 % this.LeapYearFreq1) * this.hTypicalYearLength + this.hDayLength;

        console.log(this.name + " block 1 length = " + this.block1YearLength / this.hDayLength + " days, block 2 length = " + this.block2YearLength / this.hDayLength + " days");

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

        let yearFromLeap2 = Math.floor(msFromEpoch / this.block2YearLength) * this.LeapYearFreq2;
        if (yearFromLeap2 !== 0) msFromEpoch %= Math.floor(msFromEpoch / this.block2YearLength) * this.block2YearLength;
        let yearFromLeap1 = Math.floor(msFromEpoch / this.block1YearLength) * this.LeapYearFreq1;
        if (yearFromLeap1 !== 0) msFromEpoch %= Math.floor(msFromEpoch / this.block1YearLength) * this.block1YearLength;
        this.y = yearFromLeap2 + yearFromLeap1 + Math.floor(msFromEpoch / this.hTypicalYearLength);
        msFromEpoch %= this.hTypicalYearLength;

        // msFromEpoch -= this.leapDays * 86400 * 1000;

        this.dayOfYear = Math.floor(msFromEpoch / this.dayLength);
        this.hDayOfYear = Math.floor(msFromEpoch / this.hDayLength);

        // if (this.month < this.monthRemainder) {
        //     this.month = Math.floor(msFromEpoch / this.monthLength);
        //     this.dayOfMonth = Math.floor((msFromEpoch % this.monthLength) / this.hDayLength);
        // } else {
        //     this.month = Math.floor(msFromEpoch / this.monthLength);
        //     this.dayOfMonth = Math.floor((msFromEpoch % this.monthLength) / this.hDayLength);
        // }
        this.month = Math.floor(msFromEpoch / this.monthLength);
        this.dayOfMonth = Math.floor((msFromEpoch % this.monthLength) / this.hDayLength);

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
var Mars = new Celestial("Mars", 24.6230, 668.5991 * 24.6230, 0, 0, 0);
var Venus = new Celestial("Venus", 116.75 * 24, 5832.6, 0, 0, 0);

var Ceres = new Celestial("Ceres", 9.074170, 1683.14570801 * 24, 0, 0, 0);

var Europa = new Celestial("Europa", 3.551181 * 24, 4332.59 * 24, 0, 0, 0);
var Ganymede = new Celestial("Ganymede", 7.15455296 * 24, 4332.59 * 24, 0, 0, 0);
var Callisto = new Celestial("Callisto", 16.6890184 * 24, 4332.59 * 24, 0, 0, 0);

var Titan = new Celestial("Titan", 15.945 * 24, 10759.22 * 24, 0, 0, 0);
var Enceladus = new Celestial("Enceladus", 1.370218 * 24, 10759.22 * 24, 0, 0, 0);

var Titania = new Celestial("Titania", 8.706234 * 24, 30688.5 * 24, 0, 0, 0);

var Triton = new Celestial("Triton", 5.876854 * 24, 60182 * 24, 0, 0, 0);

var bodies = [Earth, Mars, Venus, Europa, Ganymede, Callisto, Titan, Enceladus, Titania, Triton, Ceres];

// console.log(Mars.img);

// Update everything
function updateTimes(table, bodies, msFromEpoch) {
    updateInternalValues(msFromEpoch);
    data = generateData(bodies);
    info = generateInformation(bodies);
    updateTable(table, data, info);
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

function generateInformation(bodies) {
    var data = [];
    var i;
    for (i = 0; i < bodies.length; i++) {
        data.push([bodies[i].name, bodies[i].img,
        (bodies[i].hDayLength / (3600 * 1000)).toPrecision(4),
        bodies[i].hdWeekLength,
        bodies[i].hDaysPerYear,
        bodies[i].monthCount,
        bodies[i].hTypicalDaysPerMonth,
        bodies[i].LeapYearFreq1,
        bodies[i].LeapYearFreq2]);
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

function generateTable(table, dataTime, dataFacts) {
    // for (let element of dataTime) {
    for (let i = 0; i < dataTime.length; i++) {
        let rowTime = table.insertRow();
        rowTime.className = "collapsible";

        let rowFacts = table.insertRow();
        rowFacts.className = "content";
        rowFacts.style.display = 'none';

        rowTime.addEventListener("click", function () {
            this.classList.toggle("active");
            if (rowFacts.style.display == 'none') {
                rowFacts.style.display = '';
            } else {
                rowFacts.style.display = 'none';
            }
        });

        for (key in dataTime[i]) {
            let cell = rowTime.insertCell();
            let text = document.createTextNode(dataTime[i][key]);
            cell.appendChild(text);

            if (key == 0) { cell.id = "tableName"; }
            else { cell.id = "tableValue"; }
        }

        let cell = rowFacts.insertCell();
        cell.colSpan = "5";
        let image = document.createElement("img");
        // image.src = "https://images-assets.nasa.gov/image/PIA19048/PIA19048~orig.jpg";
        image.src = "/images/Europa.jpg"
        image.alt = "Galileo image of Europa"
        imageWidth = image.naturalWidth;
        imageHeight = image.naturalHeight;
        cellWidth = table.offsetWidth;
        imageScale = 3 * imageWidth / cellWidth;
        image.style = "width:" + (imageWidth / imageScale) + "px;height:" + (imageHeight / imageScale) + "px;";
        image.id = "image" + i;
        image.className = "bodyImage";
        cell.appendChild(image);

        let div = document.createElement("div");

        let p = document.createElement("p");
        let text = document.createTextNode("Day length, week length");
        p.appendChild(text);
        p.id = "dayLength" + i;
        div.appendChild(p);

        p = document.createElement("p");
        text = document.createTextNode("Year length, month length");
        p.appendChild(text);
        p.id = "yearLength" + i;
        div.appendChild(p);

        p = document.createElement("p");
        text = document.createTextNode("Leap year frequency");
        p.appendChild(text);
        p.id = "leapYear" + i;
        div.appendChild(p);

        div.className = "flavourText";
        cell.appendChild(div);
    }
}

// Try not to DDoS NASA
function updateFlavour(table, id, data) {
    img = document.getElementById("image" + id);
    img.src = data[1];
    img.alt = "Image of " + data[0];
    imageWidth = img.naturalWidth;
    imageHeight = img.naturalHeight;
    cellWidth = table.offsetWidth;
    imageScale = 3 * imageWidth / cellWidth;
    img.style = "width:" + (imageWidth / imageScale) + "px;height:" + (imageHeight / imageScale) + "px;";

    p = document.getElementById("dayLength" + id);
    p.innerHTML = data[2] + " h per day, " + data[3] + " day week";

    p = document.getElementById("yearLength" + id);
    p.innerHTML = data[0] + "'s " + data[4] + " day year is comprised of " + data[5] + " months, each with " + data[6] + " days";

    p = document.getElementById("leapYear" + id);
    p.innerHTML = "Leap years every " + data[7] + " and " + data[8] + " years";

}

function updateTable(table, dataTime, dataFacts) {
    for (let i = 0; i < dataTime.length; i++) {
        for (let j = 0; j < dataTime[i].length; j++) {
            table.rows[2 * (i + 1) - 1].cells[j].innerHTML = dataTime[i][j];
        }
        updateFlavour(table, i, dataFacts[i]);
    }
}
