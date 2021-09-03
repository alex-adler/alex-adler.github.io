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
        this.smear = false; // 1 if smeared in the animation
        this.disabled = false;  // 0 if enabled
        this.path = new Path2D();
        this.hover = false;
    }
    draw(c, ctx) {
        if (!this.disabled) {
            var min = Math.min(c.height, c.width);
            this.path = new Path2D();
            // Just draw the orbit
            if (this.smear) {
                ctx.strokeStyle = this.colour;
                ctx.lineWidth = 2;
                this.path.arc(this.x0 * min, this.y0 * min, this.a * min, 0, 2 * Math.PI);
                ctx.stroke(this.path);
            }
            // Draw the body
            else {
                ctx.fillStyle = this.colour;
                this.path.arc(this.x * min, this.y * min, this.radius * min, 0, 2 * Math.PI);
                ctx.fill(this.path);

                //Draw a ring
                if (this.ring) {
                    ctx.strokeStyle = this.colour;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(this.x * min, this.y * min, this.radius * 1.3 * min, 0, 2 * Math.PI);
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

        // Deal with devices with a pixel ratio != 1
        const pixelRatio = window.devicePixelRatio;
        canvas.width = canvas.clientWidth * pixelRatio;
        canvas.height = canvas.clientHeight * pixelRatio;

        var fullscreenHovered = false;
        const fullscreenButtonSize = canvas.width / 20;
        const fullscreenButtonPadding = canvas.width / 60;

        var lastTime = 0;

        var sun_x0 = 0.5;
        var sun_y0 = 0.5;

        var circles = {};

        // Circle parameters: semi-major axis, x0, y0, period (Earth days), radius, colour, omega = 0, ring = 0
        var sun = new Circle(0, sun_x0, sun_y0, 0, .02, 'yellow');

        circles["Mercury"] = new Circle(0.05, sun_x0, sun_y0, 89.9691, .004, 'red', 252.25166724);

        circles["Venus"] = new Circle(0.1, sun_x0, sun_y0, 224.701, .008, '#D4CAA3', 181.97970850);

        circles["Earth"] = new Circle(0.15, sun_x0, sun_y0, 365.25, .01, 'blue', 100.46457166);
        circles["Luna"] = new Circle(0.02, 0, 0, 28, .002, 'white', Math.random() * 360);

        circles["Mars"] = new Circle(.2, sun_x0, sun_y0, 686.971, .008, 'orangered', -4.56813164);
        circles["Phobos"] = new Circle(.014, 0, 0, 0.3189, .002, 'white', Math.random() * 360);
        circles["Deimos"] = new Circle(.02, 0, 0, 1.263, .002, 'white', Math.random() * 360);

        circles["Ceres"] = new Circle(.25, sun_x0, sun_y0, 1683, .004, 'white', 153.9032);

        circles["Jupiter"] = new Circle(.3, sun_x0, sun_y0, 4332.59, .016, 'orange', 34.33479152);
        circles["Io"] = new Circle(.034, 0, 0, 1.769, .002, 'yellow', Math.random() * 360);
        circles["Europa"] = new Circle(.038, 0, 0, 3.5551, .002, 'white', Math.random() * 360);
        circles["Ganymede"] = new Circle(.042, 0, 0, 7.155, .002, 'white', Math.random() * 360);
        circles["Callisto"] = new Circle(.046, 0, 0, 16.69, .002, 'white', Math.random() * 360);

        circles["Saturn"] = new Circle(.35, sun_x0, sun_y0, 10759.22, .014, '#FFFDD0', 50.07571329, true);
        circles["Enceladus"] = new Circle(.025, 0, 0, 1.37, .002, 'white', Math.random() * 360);
        circles["Titan"] = new Circle(.03, 0, 0, 15.945, .003, 'orange', Math.random() * 360);

        circles["Uranus"] = new Circle(.4, sun_x0, sun_y0, 30688.5, .012, 'cyan', 314.20276625);

        circles["Neptune"] = new Circle(.45, sun_x0, sun_y0, 60182, .012, 'purple', 304.22289287);

        // circles["Pluto"] = new Circle(250, sun_x0, sun_y0, 90560, 1, 'white', 238.96535011);


        // Set up a function that runs whenever the mouse moves over the canvas
        canvas.addEventListener('mousemove', e => {
            var rect = canvas.getBoundingClientRect(), // abs. size of element
                scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
                scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

            var mouseX = (e.clientX - rect.left) * scaleX;   // scale mouse coordinates after they have
            var mouseY = (e.clientY - rect.top) * scaleY;     // been adjusted to be relative to element

            if ((canvas.width - mouseX) <= (fullscreenButtonSize + fullscreenButtonPadding) && (canvas.height - mouseY) <= (fullscreenButtonSize + fullscreenButtonPadding))
                fullscreenHovered = true;
            else
                fullscreenHovered = false;

            if (ctx.isPointInPath(sun.path, mouseX, mouseY))
                sun.hover = true;
            else
                sun.hover = false;

            for (var body in circles) {
                if (ctx.isPointInPath(circles[body].path, mouseX, mouseY))
                    circles[body].hover = true;
                else
                    circles[body].hover = false;
            }
        });

        ['click', 'ontouchstart'].forEach(evt => {
            canvas.addEventListener(evt, e => {
                var rect = canvas.getBoundingClientRect(), // abs. size of element
                    scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
                    scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

                var mouseX = (e.clientX - rect.left) * scaleX;   // scale mouse coordinates after they have
                var mouseY = (e.clientY - rect.top) * scaleY;     // been adjusted to be relative to element

                if ((canvas.width - mouseX) <= (fullscreenButtonSize + fullscreenButtonPadding) && (canvas.height - mouseY) <= (fullscreenButtonSize + fullscreenButtonPadding)) {
                    // If we are already full screen
                    if (document.fullscreenElement)
                        document.exitFullscreen();
                    // Go fullscreen
                    else {
                        var anim = document.getElementsByClassName("right")[0];
                        if (anim.requestFullscreen) {
                            anim.requestFullscreen("hide");
                        } else if (anim.webkitRequestFullscreen) { /* Safari */
                            anim.webkitRequestFullscreen();
                        } else if (anim.msRequestFullscreen) { /* IE11 */
                            anim.msRequestFullscreen();
                        }
                    }
                }

                if (ctx.isPointInPath(sun.path, mouseX, mouseY)) {
                    sun.hover = true;
                    for (var body in circles)
                        circles[body].hover = true;
                }
            }, false)
        });

        function step(timestamp) {
            // Account for pixel ratio's != 1 to improve resolution on most mobile devices
            canvas.width = canvas.clientWidth * pixelRatio;
            canvas.height = canvas.clientHeight * pixelRatio;

            var min = Math.min(canvas.height, canvas.width);

            // Clear the previous frame
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Use slider for speed if it is being displayed
            var slider = document.getElementById('sliderSpeed');
            if (slider.style.display !== 'none' && !isPaused) {
                if (slider.value >= 0)
                    scalingFactor = Math.pow(10, slider.value * .04);
                else
                    scalingFactor = -Math.pow(10, -slider.value * .04);
            }

            output.innerHTML = "Multiplier: " + scalingFactor.toPrecision(5) + "x";

            // Update the time by adding the time since last frame
            realTime += (timestamp - lastTime) * scalingFactor;

            // Make sure time doesn't go negative
            if (realTime < 0) {
                realTime = 0;
                scalingFactor = 0;
            }

            // If a body has a moon, make it orbit the body and disable it when it smears
            for (var body in circles) {
                if (body === "Luna") {
                    circles[body].disabled = circles["Earth"].smear;
                    circles[body].x0 = circles["Earth"].x;
                    circles[body].y0 = circles["Earth"].y;
                }
                if (body === "Phobos" || body === "Deimos") {
                    circles[body].disabled = circles["Mars"].smear;
                    circles[body].x0 = circles["Mars"].x;
                    circles[body].y0 = circles["Mars"].y;
                }
                if (body === "Titan" || body === "Enceladus") {
                    circles[body].disabled = circles["Saturn"].smear;
                    circles[body].x0 = circles["Saturn"].x;
                    circles[body].y0 = circles["Saturn"].y;
                }
                if (body === "Io" || body === "Europa" || body === "Ganymede" || body === "Callisto") {
                    circles[body].disabled = circles["Jupiter"].smear;
                    circles[body].x0 = circles["Jupiter"].x;
                    circles[body].y0 = circles["Jupiter"].y;
                }
                // Calculate the new position for the body and whether it should smear
                updatePos(circles[body], realTime, scalingFactor);

                // Draw the body
                circles[body].draw(canvas, ctx);

                // Display the name of the body if the mouse is hovering it
                if (circles[body].hover) {
                    if (circles[body].smear === false)
                        drawBodyName(ctx, body, circles[body].x * min, circles[body].y * min - canvas.width / 50);
                    else
                        drawBodyName(ctx, body, circles[body].x0 * min, (circles[body].y0 - circles[body].a) * min - canvas.width / 50);
                }
            }

            // Display "The Sun" if the mouse is hovering it
            if (sun.hover)
                drawBodyName(ctx, "The Sun", sun.x * min, sun.y * min - canvas.width / 40);

            // Draw the sun
            sun.draw(canvas, ctx);

            // If we are already fullscreen then draw the button to exit, if not draw the other one (both at the bottom right corner)
            if (document.fullscreenElement)
                drawFullScreenButtonClose(ctx, canvas.width - (fullscreenButtonPadding + fullscreenButtonSize), canvas.height - (fullscreenButtonPadding + fullscreenButtonSize), fullscreenButtonSize, fullscreenHovered);
            else
                drawFullScreenButtonOpen(ctx, canvas.width - (fullscreenButtonPadding + fullscreenButtonSize), canvas.height - (fullscreenButtonPadding + fullscreenButtonSize), fullscreenButtonSize, fullscreenHovered);

            // Store the current time
            lastTime = timestamp;
            // Tell the browser that this frame is done
            requestAnimationFrame(step);
            // Update the data in the table
            updateTimes(table, bodies, realTime);
        }
        requestAnimationFrame(step);
    }
}

// Calculate the new x and y of a body and whether or not it should be smeared
function updatePos(circle, realTime, scalingFactor = 0) {
    var x, y;
    var time = realTime % circle.period;

    // Calculate the mean anomaly of the body
    circle.progress = (time / circle.period) * 360 + circle.startProgress;
    circle.progress %= 360;

    // If it's spinning too fast, smear it
    if (Math.abs(scalingFactor / circle.period) * 1000 > 2)
        circle.smear = true;
    else
        circle.smear = false;

    // Calculate new x and y coordinates
    x = circle.a * Math.sin((circle.progress) * (Math.PI / 180)); // x = ƒ(t)
    y = circle.a * Math.cos((circle.progress) * (Math.PI / 180)); // y = ƒ(t)

    // Take into account the orbital barycenter position
    circle.x = circle.x0 + x;
    circle.y = circle.y0 + y;
}

// Display the name of a body
function drawBodyName(ctx, body, x, y) {
    ctx.font = "20px Atkinson Hyperlegible";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(body, x, y);
}

// Draw the button to enter fullscreen
function drawFullScreenButtonOpen(ctx, posX, posY, size, hovered) {
    if (hovered)
        ctx.strokeStyle = "white";
    else
        ctx.strokeStyle = "#c4c4c4";
    ctx.lineWidth = 4;
    ctx.beginPath();

    // |-
    ctx.moveTo(posX, size / 3 + posY);
    ctx.lineTo(posX, posY);
    ctx.lineTo(size / 3 + posX, posY);

    // -|
    ctx.moveTo(2 * size / 3 + posX, posY);
    ctx.lineTo(size + posX, posY);
    ctx.lineTo(size + posX, size / 3 + posY);

    // _|
    ctx.moveTo(size + posX, 2 * size / 3 + posY);
    ctx.lineTo(size + posX, size + posY);
    ctx.lineTo(2 * size / 3 + posX, size + posY);

    // |_
    ctx.moveTo(size / 3 + posX, size + posY);
    ctx.lineTo(posX, size + posY);
    ctx.lineTo(posX, 2 * size / 3 + posY);

    ctx.stroke();
}

// Draw the button to exit fullscreen
function drawFullScreenButtonClose(ctx, posX, posY, size, hovered) {
    if (hovered)
        ctx.strokeStyle = "white";
    else
        ctx.strokeStyle = "#ffffff22";
    ctx.lineWidth = 4;
    ctx.beginPath();

    // _|
    ctx.moveTo(posX, size / 3 + posY);
    ctx.lineTo(size / 3 + posX, size / 3 + posY);
    ctx.lineTo(size / 3 + posX, posY);

    // |_
    ctx.moveTo(2 * size / 3 + posX, posY);
    ctx.lineTo(2 * size / 3 + posX, size / 3 + posY);
    ctx.lineTo(size + posX, size / 3 + posY);

    // |-
    ctx.moveTo(size + posX, 2 * size / 3 + posY);
    ctx.lineTo(2 * size / 3 + posX, 2 * size / 3 + posY);
    ctx.lineTo(2 * size / 3 + posX, size + posY);

    // -|
    ctx.moveTo(size / 3 + posX, size + posY);
    ctx.lineTo(size / 3 + posX, 2 * size / 3 + posY);
    ctx.lineTo(posX, 2 * size / 3 + posY);

    ctx.stroke();
}