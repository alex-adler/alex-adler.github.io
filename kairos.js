class Celestial {
    constructor(name, dayLength, yearLength, leapSeconds) {
        this.name = name;
        this.dayLength = Math.floor(dayLength * 3600) * 1000;
        this.yearLength = Math.floor(yearLength * 3600) * 1000;
        this.y = 0;
        this.Ls = 0;
        this.d = 0;
        this.h = 0;
        this.m = 0;
        this.s = 0;
        this.ms = 0;
        this.leapSeconds = leapSeconds;
        this.LsLength = this.yearLength / 8;
    }
    getDateTime(msFromEpoch) {

        msFromEpoch += this.leapSeconds * 1000;

        if (this.yearLength !== 1) {
            this.y = Math.floor(msFromEpoch / this.yearLength);
            msFromEpoch %= this.yearLength;
        }

        this.Ls = Math.floor(msFromEpoch / this.LsLength) + 1;
        let msFromEpochwLs = msFromEpoch % this.LsLength;
        // console.log(msFromEpochwLs);
        let d = Math.floor(msFromEpoch / this.dayLength);
        this.d = Math.floor(msFromEpochwLs / this.dayLength);
        msFromEpoch %= this.dayLength;

        this.h = Math.floor(msFromEpoch / 3600000);
        msFromEpoch %= 3600000;
        this.m = Math.floor(msFromEpoch / 60000);
        msFromEpoch %= 60000;
        this.s = Math.floor(msFromEpoch / 1000);
        msFromEpoch %= 1000;
        this.ms = Math.floor(msFromEpoch);
    }
    formatTime() {
        let m = checkTime(this.m);
        let s = checkTime(this.s);
        let h = checkHour(this.h, this.dayLength);
        return h + ":" + m + ":" + s;
    }
    formatDate() {
        let d = checkDay(this.d, this.dayLength, this.LsLength);
        return d + "/" + this.Ls + "/" + this.y;
    }
}

function checkTime(i) {
    if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
    return i;
}
function checkHour(i, dayLength) {
    let curDigit = i.toString().length;
    let maxDigit = Math.floor(dayLength / 3600000).toString().length;
    if (curDigit < maxDigit) {
        for (let j = 0; j < maxDigit - curDigit; j++) { i = "0" + i; }
    }
    return i;
}

function checkDay(i, dayLength, yearLength) {
    let curDigit = i.toString().length;
    let maxDigit = Math.floor(yearLength / dayLength).toString().length;
    if (curDigit < maxDigit) {
        for (let j = 0; j < maxDigit - curDigit; j++) { i = "0" + i; }
    }
    return i;
}

// Celestial Bodies
var Earth = new Celestial("Earth", 24, 365.25 * 24, 5);
var Mars = new Celestial("Mars", 24.6230, 668.5991 * 24.6230, 0);
var Venus = new Celestial("Venus", 5832.6, 1.92 * 5832.6, 0);

var Ceres = new Celestial("Ceres", 9.074170, 1683.14570801 * 24, 0);

var Europa = new Celestial("Europa", 3.551181 * 24, (4332.59 / 3.551181) * 24, 0);
var Ganymede = new Celestial("Ganymede", 7.15455296 * 24, (4332.59 / 7.15455296) * 24, 0);
// Callisto

var Titan = new Celestial("Titan", 15.945 * 24, (10759.22 / 15.945) * 24, 0);
// Enceladus

// Titania

// Triton (retrograde)

function times(table, bodies) {
    // J2000ish epoch
    let msFromEpoch = Date.now() - 946663200000;
    // console.log(Date());
    update(msFromEpoch);
    data = generateData(bodies);
    updateTable(table, data);
    // var t = setTimeout(function () { times(table, bodies); }, 1000);
}

function update(msFromEpoch) {
    Earth.getDateTime(msFromEpoch);
    Mars.getDateTime(msFromEpoch);
    Venus.getDateTime(msFromEpoch);
    Ganymede.getDateTime(msFromEpoch);
    Titan.getDateTime(msFromEpoch);
    Europa.getDateTime(msFromEpoch);
    Ceres.getDateTime(msFromEpoch);
}

function generateData(bodies) {
    var data = [];
    var i;
    for (i = 0; i < bodies.length; i++) {
        data.push([bodies[i].name, bodies[i].formatTime(), bodies[i].formatDate()]);
    }
    return data;
}

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

function generate() {
    let table = document.querySelector("table");
    let tableHeaders = ["Body", "Local Time", "Date"];
    let bodies = [Earth, Mars, Venus, Ganymede, Titan, Europa, Ceres];
    data = generateData(bodies);
    generateTableHead(table, tableHeaders);
    generateTable(table, data);
    // document.write(bodies)
    // times(table, bodies);
    balls(table, bodies);
}

/* --------------------- Animation ------------------------- */

class Circle {
    constructor(a, x0, y0, period, radius, colour, omega = 0, ring = 0) {
        this.a = a; // Semi major axis (px)
        this.x0 = x0;   // Barycenter x (px)
        this.y0 = y0;   // Barycenter y (px)
        this.period = period * 86400 * 1000; // Orbital Period (ms)
        this.startProgress = omega; // Mean Longitude at Epoch (deg)
        this.progress = omega;  // Mean Longitude (deg)
        this.x = this.x0;   // x position (px)
        this.y = this.y0;   // y position (px)
        this.radius = radius;
        this.colour = colour;
        this.ring = ring;   // 0 if body has no rings
        this.smear = 0; // 1 if smeared in the animation
        this.disabled = 0;  // 0 if enabled
    }
    draw(ctx) {
        if (!this.disabled) {
            if (this.smear) {
                ctx.strokeStyle = this.colour;
                ctx.beginPath();
                ctx.arc(this.x0, this.y0, this.a, 0, 2 * Math.PI);
                ctx.stroke();
            } else {
                ctx.fillStyle = this.colour;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
                ctx.fill();
                if (this.ring) {
                    ctx.strokeStyle = this.colour;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius * 1.5, 0, 2 * Math.PI);
                    ctx.stroke();
                }
            }
        }

    }
}

function balls(table, bodies) {

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    var canvas = document.getElementById('canvas');
    var slider = document.getElementById("sliderSpeed");
    var output = document.getElementById("speedText");
    output.innerHTML = "Seconds per second: " + Math.pow(10, slider.value * .04); // Display the default slider value

    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        var maxX = canvas.clientWidth;
        var maxY = canvas.clientHeight;
        var scalingFactor = Math.pow(10, slider.value * .04).toPrecision(3);
        // var scalingFactor = 365 / 10;

        var lastTime = 0;
        var realTime = 0;

        var sun_x0 = 0.5 * maxX;
        var sun_y0 = 0.5 * maxY;

        var circles = {};

        var sun = new Circle(0, sun_x0, sun_y0, 0, 10, 'yellow', 0);

        circles["mercury"] = new Circle(25, sun_x0, sun_y0, 89.9691, 2, 'red', 252.25166724);

        circles["venus"] = new Circle(50, sun_x0, sun_y0, 224.701, 4, '#D4CAA3', 181.97970850);

        circles["earth"] = new Circle(75, sun_x0, sun_y0, 365.25, 5, 'blue', 100.46457166);
        circles["luna"] = new Circle(10, 0, 0, 28, 1, 'white', Math.random() * 360);

        circles["mars"] = new Circle(100, sun_x0, sun_y0, 686.971, 4, 'orangered', -4.56813164);
        circles["phobos"] = new Circle(7, 0, 0, 0.3189, 1, 'white', Math.random() * 360);
        circles["deimos"] = new Circle(10, 0, 0, 2, 1.263, 'white', Math.random() * 360);

        circles["ceres"] = new Circle(125, sun_x0, sun_y0, 1683, 2, 'white', 153.9032);

        circles["jupiter"] = new Circle(150, sun_x0, sun_y0, 4332.59, 8, 'orange', 34.33479152);
        circles["io"] = new Circle(17, 0, 0, 1.769, 1, 'yellow', Math.random() * 360);
        circles["europa"] = new Circle(19, 0, 0, 3.5551, 1, 'white', Math.random() * 360);
        circles["ganymede"] = new Circle(21, 0, 0, 7.155, 1, 'white', Math.random() * 360);
        circles["callisto"] = new Circle(23, 0, 0, 16.69, 1, 'white', Math.random() * 360);
        // circles["io"] = new Circle(17, 0, 0, 1.769, 1, 'yellow', 0);
        // circles["europa"] = new Circle(19, 0, 0, 3.5551, 1, 'white', 0);
        // circles["ganymede"] = new Circle(21, 0, 0, 7.155, 1, 'white', 0);
        // circles["callisto"] = new Circle(23, 0, 0, 16.69, 1, 'white', 0);

        circles["saturn"] = new Circle(175, sun_x0, sun_y0, 10759.22, 7, '#FFFDD0', 50.07571329, 1);
        circles["titan"] = new Circle(15, 0, 0, 15.945, 1, 'white', Math.random() * 360);

        circles["uranus"] = new Circle(200, sun_x0, sun_y0, 30688.5, 6, 'cyan', 314.20276625);
        circles["neptune"] = new Circle(225, sun_x0, sun_y0, 60182, 6, 'purple', 304.22289287);
        circles["pluto"] = new Circle(250, sun_x0, sun_y0, 90560, 1, 'white', 238.96535011);

        function step(timestamp) {
            ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            scalingFactor = Math.pow(10, slider.value * .04) * 3600;
            output.innerHTML = "Seconds per second: " + scalingFactor.toPrecision(3);

            var deltaTime = timestamp - lastTime;
            realTime += deltaTime * scalingFactor;

            for (var body in circles) {
                if (body === "luna") {
                    circles[body].disabled = circles["earth"].smear;
                    circles[body].x0 = circles["earth"].x;
                    circles[body].y0 = circles["earth"].y;
                }
                if (body === "phobos" || body === "deimos") {
                    circles[body].disabled = circles["mars"].smear;
                    circles[body].x0 = circles["mars"].x;
                    circles[body].y0 = circles["mars"].y;
                }
                if (body === "titan") {
                    circles[body].disabled = circles["saturn"].smear;
                    circles[body].x0 = circles["saturn"].x;
                    circles[body].y0 = circles["saturn"].y;
                }
                if (body === "io" || body === "europa" || body === "ganymede" || body === "callisto") {
                    circles[body].disabled = circles["jupiter"].smear;
                    circles[body].x0 = circles["jupiter"].x;
                    circles[body].y0 = circles["jupiter"].y;
                }
                updatePos(circles[body], realTime, deltaTime, scalingFactor);
            }

            for (var body in circles) circles[body].draw(ctx);

            sun.draw(ctx);
            lastTime = timestamp;
            requestAnimationFrame(step);
            times(table, bodies);
            // console.log(realTime);
        }
        requestAnimationFrame(step);
    }
}

function updatePos(circle, realTime, deltaTime = 0, scalingFactor = 0) {
    var x, y;
    var time = realTime % circle.period;
    var deltaProg = (deltaTime / circle.period) * 360 * scalingFactor;

    circle.progress = (time / circle.period) * 360 + circle.startProgress;
    circle.progress %= 360;

    if (deltaProg > 10) {
        circle.smear = 1;
    } else {
        circle.smear = 0;
    }

    x = circle.a * Math.sin((circle.progress) * (Math.PI / 180)); // x = ƒ(t)
    y = circle.a * Math.cos((circle.progress) * (Math.PI / 180)); // y = ƒ(t)

    circle.x = circle.x0 + x;
    circle.y = circle.y0 + y;
}