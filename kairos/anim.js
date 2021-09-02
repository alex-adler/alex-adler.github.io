class Circle {
    constructor(a, x0, y0, period, radius, colour, omega = 0, ring = 0) {
        // Units for distances are fractions of the canvas dimensions
        this.a = a; // Semi major axis
        this.x0 = x0;   // Barycenter x
        this.y0 = y0;   // Barycenter y
        this.period = period * 86400 * 1000; // Orbital Period (ms)
        this.startProgress = omega; // Mean Longitude at Epoch (deg)
        this.progress = omega;  // Mean Longitude (deg)
        this.x = this.x0;   // x position
        this.y = this.y0;   // y position
        this.radius = radius;
        this.colour = colour;
        this.ring = ring;   // 0 if body has no rings
        this.smear = 0; // 1 if smeared in the animation
        this.disabled = 0;  // 0 if enabled
    }
    draw(c, ctx) {
        if (!this.disabled) {
            var min = Math.min(c.height, c.width);
            if (this.smear) {
                ctx.strokeStyle = this.colour;
                ctx.beginPath();
                ctx.arc(this.x0 * min, this.y0 * min, this.a * min, 0, 2 * Math.PI);
                ctx.stroke();
            } else {
                ctx.fillStyle = this.colour;
                ctx.beginPath();
                ctx.arc(this.x * min, this.y * min, this.radius * min, 0, 2 * Math.PI);
                ctx.fill();
                if (this.ring) {
                    ctx.strokeStyle = this.colour;
                    ctx.beginPath();
                    ctx.arc(this.x * min, this.y * min, this.radius * 1.5 * min, 0, 2 * Math.PI);
                    ctx.stroke();
                }
            }
        }
    }
}

const setUpCanvas = () => {
    // Feed the size back to the canvas.
    var c = document.getElementById("planets-canvas");
    c.width = c.clientWidth;
    c.height = c.clientHeight;
};

function balls(table, bodies) {

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    var canvas = document.getElementById("planets-canvas");
    var output = document.getElementById("speedText");

    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        const pixelRatio = window.devicePixelRatio;

        canvas.width = canvas.clientWidth * pixelRatio;
        canvas.height = canvas.clientHeight * pixelRatio;

        var lastTime = 0;

        var sun_x0 = 0.5;
        var sun_y0 = 0.5;

        var circles = {};

        // Circle parameters: semi-major axis, x0, y0, period, radius, colour, omega = 0, ring = 0

        var sun = new Circle(0, sun_x0, sun_y0, 0, .02, 'yellow', 0);

        circles["mercury"] = new Circle(0.05, sun_x0, sun_y0, 89.9691, .004, 'red', 252.25166724);

        circles["venus"] = new Circle(0.1, sun_x0, sun_y0, 224.701, .008, '#D4CAA3', 181.97970850);

        circles["earth"] = new Circle(0.15, sun_x0, sun_y0, 365.25, .01, 'blue', 100.46457166);
        circles["luna"] = new Circle(0.02, 0, 0, 28, .002, 'white', Math.random() * 360);

        circles["mars"] = new Circle(.2, sun_x0, sun_y0, 686.971, .008, 'orangered', -4.56813164);
        circles["phobos"] = new Circle(.014, 0, 0, 0.3189, .002, 'white', Math.random() * 360);
        circles["deimos"] = new Circle(.02, 0, 0, 1.263, .002, 'white', Math.random() * 360);

        circles["ceres"] = new Circle(.25, sun_x0, sun_y0, 1683, .004, 'white', 153.9032);

        circles["jupiter"] = new Circle(.3, sun_x0, sun_y0, 4332.59, .016, 'orange', 34.33479152);
        circles["io"] = new Circle(.034, 0, 0, 1.769, .002, 'yellow', Math.random() * 360);
        circles["europa"] = new Circle(.038, 0, 0, 3.5551, .002, 'white', Math.random() * 360);
        circles["ganymede"] = new Circle(.042, 0, 0, 7.155, .002, 'white', Math.random() * 360);
        circles["callisto"] = new Circle(.046, 0, 0, 16.69, .002, 'white', Math.random() * 360);

        circles["saturn"] = new Circle(.35, sun_x0, sun_y0, 10759.22, .014, '#FFFDD0', 50.07571329, 1);
        circles["titan"] = new Circle(.03, 0, 0, 15.945, .002, 'white', Math.random() * 360);

        circles["uranus"] = new Circle(.4, sun_x0, sun_y0, 30688.5, .012, 'cyan', 314.20276625);
        circles["neptune"] = new Circle(.45, sun_x0, sun_y0, 60182, .012, 'purple', 304.22289287);
        // circles["pluto"] = new Circle(250, sun_x0, sun_y0, 90560, 1, 'white', 238.96535011);

        function step(timestamp) {
            // Account for pixel ratio's != 1 to improve resolution on most mobile devices
            canvas.width = canvas.clientWidth * pixelRatio;
            canvas.height = canvas.clientHeight * pixelRatio;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Use slider for speed if it is being displayed
            var slider = document.getElementById('sliderSpeed');
            if (slider.style.display !== 'none' && !isPaused) {
                // console.log("Showing slider");
                if (slider.value >= 0)
                    scalingFactor = Math.pow(10, slider.value * .04);
                else
                    scalingFactor = -Math.pow(10, -slider.value * .04);
            }

            output.innerHTML = "Multiplier: " + scalingFactor.toPrecision(5) + "x";

            var deltaTime = timestamp - lastTime;
            realTime += deltaTime * scalingFactor;

            // Make sure time doesn't go negative
            if (realTime < 0) {
                realTime = 0;
                deltaTime = 0;
                scalingFactor = 0;
            }

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
                updatePos(circles[body], realTime, scalingFactor);
            }

            for (var body in circles) circles[body].draw(canvas, ctx);

            sun.draw(canvas, ctx);
            lastTime = timestamp;
            requestAnimationFrame(step);
            updateTimes(table, bodies, realTime);
        }
        requestAnimationFrame(step);
    }
}

function updatePos(circle, realTime, scalingFactor = 0) {
    var x, y;
    var time = realTime % circle.period;

    circle.progress = (time / circle.period) * 360 + circle.startProgress;
    circle.progress %= 360;

    if (Math.abs(scalingFactor / circle.period) * 1000 > 2) {
        circle.smear = 1;
    } else {
        circle.smear = 0;
    }

    x = circle.a * Math.sin((circle.progress) * (Math.PI / 180)); // x = ƒ(t)
    y = circle.a * Math.cos((circle.progress) * (Math.PI / 180)); // y = ƒ(t)

    circle.x = circle.x0 + x;
    circle.y = circle.y0 + y;
}