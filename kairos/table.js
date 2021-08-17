class Celestial {
    constructor(name, dayLength, yearLength, leapSeconds, initialYearProgress = 0, initialWeekDay = 0) {
        this.name = name;
        this.dayLength_ms = Math.floor(dayLength * 3600) * 1000;
        this.yearLength_ms = Math.floor(yearLength * 3600) * 1000;
        this.y = 0;
        this.month = 0;
        this.dayOfYear = 0;
        this.dayOfMonth = 0;
        this.yearLength_hd = 0;
        this.monthLength_hd = 0;
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

        this.monthTimeSteps_ms = [];
        this.monthData = [];

        // Path to image
        this.img = "/images/" + this.name + ".jpg";

        // ------------------ Days and weeks -----------------------------

        // Factor for calculating length of human day
        let offsetFrom24h = 1;
        // Check if day length is +-offsetFrom24h from 24 hours
        if (Math.abs((24 * 3600 * 1000) - this.dayLength_ms) > (offsetFrom24h * 3600 * 1000)) {
            // If it's not, use the solar day as a week and calculate a human day
            this.calculateWeek(offsetFrom24h, 1);
            console.log(this.name + " " + this.hDayLength_ms / (3600 * 1000) + " " + this.weekLength_hd + " " + this.weekLength_d);
        } else {
            // Use a default 7 day week if we don't need a special one
            this.hDayLength_ms = this.dayLength_ms;
            this.weekLength_d = 7;
            this.weekLength_hd = this.weekLength_d;
        }
        // Calculate year length including rounding to integer days
        this.yearLength_hd = Math.floor(this.yearLength_ms / this.hDayLength_ms)
        this.hYearLength_ms = this.yearLength_hd * this.hDayLength_ms;


        // ------------------ Months -----------------------------

        let idealWeeksPerMonth = 4;

        let idealDaysPerMonth = idealWeeksPerMonth * this.weekLength_hd;
        let idealMonthCount = Math.floor(this.yearLength_hd / idealDaysPerMonth);

        this.monthCount = Math.floor(idealMonthCount / 4) * 4;
        this.nominalMonthLength_hd = Math.floor(this.yearLength_hd / this.monthCount);
        this.nominalMonthLength_ms = this.nominalMonthLength_hd * this.hDayLength_ms;

        console.log(this.name + " has " + this.monthCount + " months, each typically with " + this.nominalMonthLength_hd + " days");


        // ------------------ Leap Years -----------------------------

        this.YearRemainder1 = (this.yearLength_ms % this.hYearLength_ms) / this.hDayLength_ms;
        this.LeapYearFreq1 = Math.ceil(1 / this.YearRemainder1);

        this.YearRemainder2 = (this.yearLength_ms % this.hYearLength_ms) / this.hDayLength_ms - (1 / this.LeapYearFreq1);
        this.LeapYearFreq2 = Math.ceil(1 / this.YearRemainder2);

        this.monthRemainder = (this.hYearLength_ms / this.hDayLength_ms) - ((this.nominalMonthLength_ms / this.hDayLength_ms) * this.monthCount);

        this.excessYearRemainder = (this.yearLength_ms % this.hYearLength_ms) / this.hDayLength_ms - (1 / this.LeapYearFreq1) - (1 / this.LeapYearFreq2);

        console.log(this.name + " : " + (this.hYearLength_ms / this.hDayLength_ms) + " : " + this.hDayLength_ms + " : " + this.hDayLength_ms);
        console.log(this.name + " remainder from year length " + this.YearRemainder1 + " days, leap year every " + this.LeapYearFreq1 + " and " + this.LeapYearFreq2 + " years");
        console.log(this.name + " excess remainder " + this.excessYearRemainder + " days");
        console.log(this.name + " remainder from months " + this.monthRemainder + " days");
        console.log(this.name + " year length = " + this.hYearLength_ms / this.hDayLength_ms + " days");

        // Length of time between leap years in ms
        this.block1YearLength = this.LeapYearFreq1 * this.hYearLength_ms + this.hDayLength_ms;
        this.block2YearLength = Math.floor(this.LeapYearFreq2 / this.LeapYearFreq1) * this.block1YearLength + (this.LeapYearFreq2 % this.LeapYearFreq1) * this.hYearLength_ms + this.hDayLength_ms;

        console.log(this.name + " block 1 length = " + this.block1YearLength / this.hDayLength_ms + " days, block 2 length = " + this.block2YearLength / this.hDayLength_ms + " days");

        // Fudge factors
        this.leapSeconds = leapSeconds;
        this.initialWeekDay = initialWeekDay;
        this.initialYearProgress = initialYearProgress;
    }
    calculateWeek(dayDiff, solarDaysPerWeek) {
        let minWeekLength = 4;
        let lowerLimit = (this.dayLength_ms * solarDaysPerWeek) / ((24 - dayDiff) * 3600 * 1000)
        let upperLimit = (this.dayLength_ms * solarDaysPerWeek) / ((24 + dayDiff) * 3600 * 1000)

        if ((Math.floor(lowerLimit) > upperLimit) && (Math.floor(lowerLimit) > minWeekLength)) {
            // Valid week length (also longer than the minimum length)
            this.weekLength_d = solarDaysPerWeek;
            this.weekLength_hd = Math.floor(lowerLimit);
            this.hDayLength_ms = Math.floor((this.dayLength_ms * solarDaysPerWeek) / (this.weekLength_hd * 1000)) * 1000;
        }
        else {
            if (solarDaysPerWeek < 100) {
                this.calculateWeek(dayDiff, solarDaysPerWeek + 1);
            }
            else {
                console.log("Week length not found for " + this.name);
                this.hDayLength_ms = 0;
                this.weekLength_d = 0;
                this.weekLength_hd = 0;
            }
        }
    }
    // Generate the timestep for when each month starts for the displayed time 
    generateMonths() {
        this.monthTimeSteps_ms = [];

        // Add current year to beginning of array for checking data is valid
        this.monthTimeSteps_ms.push(this.y);

        // First month starts at 0ms
        this.monthTimeSteps_ms.push(0);

        // For each month, add the ms since the start of the year that the month starts on
        for (let i = 1; i < this.monthCount; i++) {
            this.monthTimeSteps_ms.push(this.monthTimeSteps_ms[i] + this.getMonthLength(i, this.y) * this.hDayLength_ms);
        }
    }
    // Generate month data for the calendar
    generateMonthData(y) {
        // [ms at end of month, length of month(in days), week day of the first day of the month]
        this.monthData = [];

        var monthLength = this.nominalMonthLength_hd;

        // Add data for the final month of the previous year
        this.monthData.push([0, this.getMonthLength(this.monthCount, y - 1), 0]);

        for (let i = 1; i < this.monthCount + 1; i++) {
            monthLength = this.getMonthLength(i, y);
            let monthLength_ms = monthLength * this.hDayLength_ms;
            // Append the ms of the start of the month, the month length in days, and the weekday on day 1
            if (i === 1) {
                this.monthData.push([monthLength_ms, monthLength, this.getWeekDay(0, y)]);
            }
            else {
                this.monthData.push([this.monthData[i - 1][0] + monthLength_ms, monthLength, this.getWeekDay(this.monthData[i - 1][0] + monthLength_ms, y)]);
            }
        }
    }
    // If no other system is preferred, stuff all the excess days into the last month
    processLastMonth(y, monthLength) {
        monthLength += this.monthRemainder;

        // Add the leap day to the final month
        if ((y % this.LeapYearFreq1) === 0) {
            monthLength++;
        }
        if ((y % this.LeapYearFreq2) === 0) {
            monthLength++;
        }
        return monthLength;
    }
    getMonthLength(month, year) {
        var monthLength = 0;
        // Yay Fudge factors !!
        if (this.name === "Earth") {
            // Assign different lengths to each month
            if (month === 2) {
                monthLength = 28;
                if (year % this.LeapYearFreq1 === 0 || year % this.LeapYearFreq2 === 0) {
                    monthLength++;
                }
            }
            else if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
                monthLength = 31;
            } else {
                monthLength = 30;
            }
        }
        // General rule for the rest of the bodies
        else {
            monthLength = this.nominalMonthLength_hd;

            // Check if it is the last month of the year
            if (month === this.monthCount) {
                // Current plan is to dump excess days in the last month
                monthLength = this.processLastMonth(year, monthLength);
            }
        }
        return monthLength;
    }
    generateMsFromEpoch(y, month, day) {
        let msFromEpoch = 0;

        if (month === 0) {
            y -= 1;
        }

        // Add the time from the years that have passed
        msFromEpoch += Math.floor(y / this.LeapYearFreq2) * this.block2YearLength;
        y %= this.LeapYearFreq2;
        msFromEpoch += Math.floor(y / this.LeapYearFreq1) * this.block1YearLength;
        y %= this.LeapYearFreq1;
        msFromEpoch += y * this.hYearLength_ms;

        // Add leap seconds
        msFromEpoch += this.leapSeconds * 1000;

        // Add all the ms from previous months
        if (month === 0) {

        } else {
            msFromEpoch += this.monthData[month - 1][0];
        }

        // Add ms from the days of the month
        msFromEpoch += (day - 1) * this.dayLength_ms;

        // Add fudge factor to account for Earth year 0 being a leap year
        if (this.name === "Earth" && msFromEpoch > this.dayLength_ms) {
            msFromEpoch += this.dayLength_ms;
        }

        return msFromEpoch;
    }
    updateDateTime(msFromEpoch) {
        // Leap seconds
        msFromEpoch += this.leapSeconds * 1000;

        // Add fudge factor to account for Earth year 0 being a leap year
        if (this.name === "Earth" && msFromEpoch > this.dayLength_ms) {
            msFromEpoch -= this.dayLength_ms;
        }

        this.hDaysSinceEpoch = Math.floor(msFromEpoch / this.hDayLength_ms);

        // Years
        let yearFromLeap2 = Math.floor(msFromEpoch / this.block2YearLength) * this.LeapYearFreq2;
        if (yearFromLeap2 !== 0) msFromEpoch %= Math.floor(msFromEpoch / this.block2YearLength) * this.block2YearLength;
        let yearFromLeap1 = Math.floor(msFromEpoch / this.block1YearLength) * this.LeapYearFreq1;
        if (yearFromLeap1 !== 0) msFromEpoch %= Math.floor(msFromEpoch / this.block1YearLength) * this.block1YearLength;
        this.y = yearFromLeap2 + yearFromLeap1 + Math.floor(msFromEpoch / this.hYearLength_ms);
        msFromEpoch %= this.hYearLength_ms;

        this.dayOfYear = Math.floor(msFromEpoch / this.dayLength_ms);
        this.hDayOfYear = Math.floor(msFromEpoch / this.hDayLength_ms);

        // Check if the array of months is up to date
        if (this.monthTimeSteps_ms[0] !== this.y) {
            this.generateMonths();
            console.log("Regenerating months for " + this.name);
        }

        // Find what the current month is
        for (let i = this.monthCount + 1; i > 0; i--) {
            if (msFromEpoch >= this.monthTimeSteps_ms[i]) {
                this.month = i - 1;

                // Do not apply mod to 1st month (divide by 0)
                if (i !== 1) {
                    msFromEpoch %= this.monthTimeSteps_ms[i];
                }

                this.dayOfMonth = Math.floor(msFromEpoch / this.hDayLength_ms);
                break;
            }
        }

        this.hDayOfWeek = Math.floor((this.hDaysSinceEpoch + this.initialWeekDay) % this.weekLength_hd);

        let hmsFromEpoch = msFromEpoch;

        // Normal days
        msFromEpoch %= this.dayLength_ms;
        this.h = Math.floor(msFromEpoch / 3600000);
        msFromEpoch %= 3600000;
        this.m = Math.floor(msFromEpoch / 60000);
        msFromEpoch %= 60000;
        this.s = Math.floor(msFromEpoch / 1000);
        msFromEpoch %= 1000;
        this.ms = Math.floor(msFromEpoch);

        // Human days
        hmsFromEpoch %= this.hDayLength_ms;
        this.hh = Math.floor(hmsFromEpoch / 3600000);
        hmsFromEpoch %= 3600000;
        this.hm = Math.floor(hmsFromEpoch / 60000);
        hmsFromEpoch %= 60000;
        this.hs = Math.floor(hmsFromEpoch / 1000);
        hmsFromEpoch %= 1000;
        this.hms = Math.floor(hmsFromEpoch);

        // Fudge factors because dates start at 1
        this.dayOfYear += 1;
        this.dayOfMonth += 1;
        this.hDayOfYear += 1;
        this.hDayOfWeek += 1;
        this.month += 1;
    }
    getWeekDay(msFromYearStart, y) {

        let msFromEpoch = msFromYearStart;

        // Add the time from the years that have passed
        msFromEpoch += Math.floor(y / this.LeapYearFreq2) * this.block2YearLength;
        y %= this.LeapYearFreq2;
        msFromEpoch += Math.floor(y / this.LeapYearFreq1) * this.block1YearLength;
        y %= this.LeapYearFreq1;
        msFromEpoch += y * this.hYearLength_ms;

        // Add leap seconds
        msFromEpoch += this.leapSeconds * 1000;

        // Add fudge factor to account for Earth year 0 being a leap year
        if (this.name === "Earth" && msFromEpoch > this.dayLength_ms) {
            msFromEpoch -= this.dayLength_ms;
        }

        this.hDaysSinceEpoch = Math.floor(msFromEpoch / this.hDayLength_ms);

        this.hDayOfWeek = Math.floor((this.hDaysSinceEpoch + this.initialWeekDay) % this.weekLength_hd);

        // Fudge factor because weeks start on day 1
        this.hDayOfWeek += 1;

        return this.hDayOfWeek;
    }
    formatTime() {
        let m = this.checkTime(this.hm);
        let s = this.checkTime(this.hs);
        let h = this.checkHour(this.hh, this.hDayLength_ms);
        return h + ":" + m + ":" + s;// + ":" + this.ms;
    }
    formatSolarTime() {
        let m = this.checkTime(this.m);
        let s = this.checkTime(this.s);
        let h = this.checkHour(this.h, this.dayLength_ms);
        return h + ":" + m + ":" + s;// + ":" + this.ms;
    }
    formatDate() {
        let d = this.checkDay(this.dayOfMonth, this.dayLength_ms, this.nominalMonthLength_ms);
        return d + "/" + this.month + "/" + this.y;
    }
    formatWeekDay() {
        return this.hDayOfWeek + "/" + this.weekLength_hd;
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
// var Venus = new Celestial("Venus", 116.75 * 24, 5832.6, 0, 0, 0);

var Ceres = new Celestial("Ceres", 9.074170, 1683.14570801 * 24, 0, 0, 0);

var Europa = new Celestial("Europa", 3.551181 * 24, 4332.59 * 24, 0, 0, 0);
var Ganymede = new Celestial("Ganymede", 7.15455296 * 24, 4332.59 * 24, 0, 0, 0);
var Callisto = new Celestial("Callisto", 16.6890184 * 24, 4332.59 * 24, 0, 0, 0);

var Titan = new Celestial("Titan", 15.945 * 24, 10759.22 * 24, 0, 0, 0);
var Enceladus = new Celestial("Enceladus", 1.370218 * 24, 10759.22 * 24, 0, 0, 0);

var Titania = new Celestial("Titania", 8.706234 * 24, 30688.5 * 24, 0, 0, 0);

var Triton = new Celestial("Triton", 5.876854 * 24, 60182 * 24, 0, 0, 0);

var bodies = [Earth, Mars, /*Venus,*/ Europa, Ganymede, Callisto, Titan, Enceladus, Titania, Triton, Ceres];

class SpaceDate {
    constructor(body, year = -1, month = -1, day = -1) {
        this.body = body;
        // Get current date for the body
        if ((year === -1) && (month === -1) && (day === -1)) {
            this.year = this.body.y;
            this.month = this.body.month;
            this.day = this.body.dayOfMonth;
        } else if (month > this.body.monthCount) {
            this.year = year + Math.floor(month / this.body.monthCount);
            this.month = month % this.body.monthCount;
        }
        else {
            this.year = year;
            this.month = month;
            this.day = day;
        }
        this.body.generateMonthData(this.year);

        this.monthLength = this.body.monthData[this.month][1];
        this.weekDay = this.body.monthData[this.month][2];
    }
    /** Gets the day-of-the-month, using local time. */
    getDate() {
        if (this.day === 0) {
            return this.monthLength;
        } else {
            return this.day;
        }
    }
    /** Gets the day of the week, using local time. */
    getDay() {
        return this.weekDay;
    }
    getMsFromEpoch() {
        console.log(this.day + "/" + this.month + "/" + this.year)
        var ms = this.body.generateMsFromEpoch(this.year, this.month, this.day);
        if (isNaN(ms)) ms = 0;
        return ms;
    }
    isBeforeEpoch() {
        if ((this.year < 0) || (this.year === 0 && this.month === 0)) return true;
        else return false;
    }
}

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
    bodies.forEach(body => { body.updateDateTime(msFromEpoch) });
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
        (bodies[i].hDayLength_ms / (3600 * 1000)).toPrecision(2),
        (parseFloat((bodies[i].hDayLength_ms / (3600 * 1000)).toPrecision(4).toString().slice(2)) * 60).toFixed(0),
        bodies[i].weekLength_hd,
        bodies[i].yearLength_hd,
        bodies[i].monthCount,
        bodies[i].nominalMonthLength_hd,
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
    // For each body that will have data displayed
    for (let i = 0; i < dataTime.length; i++) {
        // Add row to show the times
        let rowTime = table.insertRow();
        rowTime.className = "collapsible";

        // Add row to include the bonus info
        let rowFacts = table.insertRow();
        rowFacts.className = "content";
        rowFacts.style.display = 'none';

        // Make clicking the time row toggle the info row
        rowTime.addEventListener("click", function () {
            this.classList.toggle("active");
            if (rowFacts.style.display == 'none') {
                rowFacts.style.display = '';
            } else {
                rowFacts.style.display = 'none';
            }
        });

        // Add each piece of data to the table
        for (key in dataTime[i]) {
            let cell = rowTime.insertCell();
            let text = document.createTextNode(dataTime[i][key]);
            cell.appendChild(text);

            // Set the css for specific columns of data
            if (key == 0) { cell.id = "tableName"; }
            else if (key == 3) { cell.id = "weekDay"; }
            else { cell.id = "tableValue"; }
        }

        // Format the cell for the extra info
        let cell = rowFacts.insertCell();
        cell.colSpan = "5";

        // Insert the image placeholder
        let image = document.createElement("img");
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

        // Insert placeholders for bonus info
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
    p.innerHTML = data[2] + " h " + data[3] + " min per day, " + data[4] + " day week";

    p = document.getElementById("yearLength" + id);
    p.innerHTML = data[0] + "'s " + data[5] + " day year is comprised of " + data[6] + " months, each with " + data[7] + " days";

    p = document.getElementById("leapYear" + id);
    p.innerHTML = "Leap years every " + data[8] + " and " + data[9] + " years";

}

function updateTable(table, dataTime, dataFacts) {
    for (let i = 0; i < dataTime.length; i++) {
        for (let j = 0; j < dataTime[i].length; j++) {
            table.rows[2 * (i + 1) - 1].cells[j].innerHTML = dataTime[i][j];
        }
        updateFlavour(table, i, dataFacts[i]);
    }
}
