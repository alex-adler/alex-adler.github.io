let canvas = <HTMLCanvasElement>document.getElementsByTagName('canvas')[0];
let ctx = canvas.getContext('2d');

// ----------------------- Consts -------------------------------
// Deal with devices with a pixel ratio != 1
const pixelRatio = window.devicePixelRatio;
const developmentState = { completed: 0, testing: 1, building: 2, research: 3, idea: 4 };
const colours = { completed: "#143F6B", testing: "#F55353", building: "#FEB139", research: "#F6F54D", idea: "#FFFFFF" };

const defaultSpacing = 250;
const defaultFontSize = 40;

class Project {
    name: string;
    scale: number;
    // Text
    font: string;
    fontSize: number;
    textMeasurements: TextMetrics;
    children: Project[];
    x: number;
    y: number;
    isOpen: boolean;
    path: Path2D;
    developmentState: number;
    fill: string;

    constructor(name: string, childrenOrState: Project[] | number) {
        this.isOpen = false;
        this.name = name;

        // Default value
        this.developmentState = 0;
        this.scale = 1;

        // If no children have been provided, set the development state
        if (this.isState(childrenOrState)) {
            this.developmentState = childrenOrState;
            this.children = [];
        }
        else {
            // Set up children
            this.children = childrenOrState;
        }
    }
    // Return true if the input is a number and false if it is an array of Projects
    isState(input: Project[] | number): input is number {
        return typeof input.valueOf() === 'number';
    }
    initChildren(scale?: number) {
        // Top level projects won't be given a scale
        if (!scale) {
            this.scale = 1;
        }
        else {
            this.scale = scale;
        }

        this.fontSize = defaultFontSize * this.scale;
        this.font = this.fontSize + "px Roboto";
        ctx.textAlign = 'center';
        ctx.font = this.font;
        this.textMeasurements = ctx.measureText(this.name);

        // Recursively initialise all children
        let childrenCount = this.children.length;
        if (childrenCount !== 0) {
            this.children.forEach(child => {
                child.initChildren(this.scale / 2);
            });
        }

        // Init position
        let angularSeparation = 2 * Math.PI / childrenCount;
        let angularOffset = Math.PI / 2;
        // let angularOffset = 0;
        for (let i = 0; i < childrenCount; i++) {
            const child = this.children[i];
            // A project is only as developed as its least developed child
            if (child.developmentState > this.developmentState)
                this.developmentState = child.developmentState;

            // Draw children in a circle around the parent
            child.y = Math.sin(angularSeparation * i + angularOffset) * (defaultSpacing * this.scale);
            child.x = Math.cos(angularSeparation * i + angularOffset) * (defaultSpacing * this.scale + this.textMeasurements.width / 2);
        };
    }
    checkClick(x: number, y: number): boolean {
        if (this.isOpen) {
            for (let i = 0; i < this.children.length; i++) {
                const child = this.children[i];
                if (child.checkClick(x, y))
                    return true;
            };
        }
        if (ctx.isPointInPath(this.path, x, y)) {
            this.toggleOpen();
            return true;
        } else {
            return false;
        }

    }
    // Run when the object is clicked
    toggleOpen() {
        if (this.isOpen)
            this.isOpen = false;
        else
            this.isOpen = true;
    }
    draw(parentX?: number, parentY?: number) {

        // console.log(this);
        // If it is a top level project
        if (!parentX && !parentY) {
            parentX = 0;
            parentY = 0;
        }
        else {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#dddddd";
            ctx.moveTo(parentX, parentY);
            ctx.lineTo(parentX + this.x, parentY + this.y - (this.textMeasurements.actualBoundingBoxAscent + this.textMeasurements.actualBoundingBoxDescent) / 2);
            ctx.stroke();
        }

        this.path = new Path2D();
        switch (this.developmentState) {
            case developmentState.completed:
                ctx.fillStyle = colours.completed;
                break;
            case developmentState.testing:
                ctx.fillStyle = colours.testing;
                break;
            case developmentState.building:
                ctx.fillStyle = colours.building;
                break;
            case developmentState.research:
                ctx.fillStyle = "#F6F54D";
                break;
            case developmentState.idea:
                ctx.fillStyle = "#FFFFFF";
                break;

            default:
                console.log(this);
                console.log("Invalid state");
                break;
        }
        // Draw containing box
        this.path.rect(parentX + this.x - this.textMeasurements.actualBoundingBoxLeft * 1.1,
            parentY + this.y - this.textMeasurements.actualBoundingBoxAscent * 1.2,
            (this.textMeasurements.actualBoundingBoxLeft + this.textMeasurements.actualBoundingBoxRight) * 1.1,
            (this.textMeasurements.actualBoundingBoxAscent + this.textMeasurements.actualBoundingBoxDescent) * 1.4);
        ctx.fill(this.path);
        if (this.isOpen) {
            // this.path.rect(parentX + this.x - 200, parentY + this.y - 200, 400, 400);
            // ctx.fill(this.path);
            this.children.forEach(c => {
                c.draw(parentX + this.x, parentY + this.y - (this.textMeasurements.actualBoundingBoxAscent + this.textMeasurements.actualBoundingBoxDescent) / 2 + (c.textMeasurements.actualBoundingBoxAscent + c.textMeasurements.actualBoundingBoxDescent) / 2);
            });
            ctx.fillStyle = "#555555";
        }
        else {
            // this.path.rect(parentX + this.x - 100, parentY + this.y - 50, 200, 100);
            // ctx.fill(this.path);
            ctx.fillStyle = "#000000";
        }

        ctx.textAlign = 'center';
        ctx.font = this.font;
        ctx.fillText(this.name, parentX + this.x, parentY + this.y);
    }
}

let projects: Project[] = [];
let sub1projects: Project[] = [];
let sub2projects: Project[] = [];
let sub3projects: Project[] = [];

// Space Time
{
    // System
    {
        sub2projects.push(new Project("Days", developmentState.completed));
        sub2projects.push(new Project("Months", developmentState.completed));
        sub2projects.push(new Project("Years", developmentState.completed));
        sub1projects.push(new Project("System", sub2projects));
        sub2projects = [];
    }
    // Site
    {
        sub2projects.push(new Project("Description", developmentState.completed));
        sub2projects.push(new Project("Table", developmentState.completed));
        sub2projects.push(new Project("Canvas", developmentState.completed));
        sub1projects.push(new Project("Site", sub2projects));
        sub2projects = [];
    }
    // Video
    {
        sub2projects.push(new Project("Inkscape", developmentState.completed));
        sub2projects.push(new Project("Blender", developmentState.completed));
        sub2projects.push(new Project("DaVinci Resolve", developmentState.completed));
        sub2projects.push(new Project("Audio", developmentState.completed));
        sub1projects.push(new Project("Video", sub2projects));
        sub2projects = [];
    }
    projects.push(new Project("Space Time", sub1projects));
    sub1projects = [];
}

// Arean Freight
{
    // Engineering
    {
        sub2projects.push(new Project("Hypersonics", developmentState.completed));
        sub2projects.push(new Project("2D Design", developmentState.completed));
        sub2projects.push(new Project("3D Design", developmentState.research));
        sub2projects.push(new Project("Propulsion", developmentState.idea));
        sub1projects.push(new Project("Engineering", sub2projects));
        sub2projects = [];
    }
    // Site
    {
        sub2projects.push(new Project("Intro", developmentState.completed));
        sub2projects.push(new Project("Atmosphere", developmentState.completed));
        sub2projects.push(new Project("Ground Effect", developmentState.completed));
        sub2projects.push(new Project("3D Design", developmentState.idea));
        sub2projects.push(new Project("The Rest", developmentState.idea));
        sub1projects.push(new Project("Site", sub2projects));
        sub2projects = [];
    }
    projects.push(new Project("Arean Freight", sub1projects));
    sub1projects = [];
}
// PIT
{
    projects.push(new Project("PIT", developmentState.research));
    sub1projects = [];
}

// Helico
{
    // Ground Station
    {
        sub2projects.push(new Project("Mapping", developmentState.idea));
        sub2projects.push(new Project("Live Feeds", developmentState.idea));
        sub2projects.push(new Project("Live Telemetry", developmentState.idea));
        sub2projects.push(new Project("3D Visualisation", developmentState.idea));
        sub1projects.push(new Project("Ground Station", sub2projects));
        sub2projects = [];
    }
    {
        sub2projects.push(new Project("Software", developmentState.idea));
        sub2projects.push(new Project("Hardware", developmentState.idea));
        sub1projects.push(new Project("Avionics", sub2projects));
        sub2projects = [];
    }
    sub1projects.push(new Project("Physical Design", developmentState.idea));
    projects.push(new Project("Helico", sub1projects));
    sub1projects = [];
}

projects.push(new Project("Gauntlet", developmentState.idea));

// Init top level projects
ctx.textAlign = 'center';
ctx.font = defaultFontSize * 2 + "px Roboto";
ctx.fillStyle = "#FFFFFF";
let centerText = "Projects";
let textMeasurements = ctx.measureText(centerText);

let projectCount = projects.length;
let angularSeparation = 2 * Math.PI / projectCount;
for (let i = 0; i < projectCount; i++) {
    projects[i].initChildren();
    // Draw children in a circle around the parent
    projects[i].y = Math.sin(angularSeparation * i) * (defaultSpacing * 2 + textMeasurements.width / 2);
    projects[i].x = Math.cos(angularSeparation * i) * (defaultSpacing * 2 + textMeasurements.width / 2);
}

// Camera settings
let cameraOffset = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let cameraZoom = 0.7;
const MAX_ZOOM = 10;
const MIN_ZOOM = 0.5;
const SCROLL_SENSITIVITY = -0.0005;

let isDragging = false;
let dragStart = { x: 0, y: 0 };

let mouseMovement = { x: 0, y: 0 };

function draw() {
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;
    // canvas.width = window.innerWidth
    // canvas.height = window.innerHeight

    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
    ctx.scale(cameraZoom, cameraZoom);
    ctx.translate(-window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.textAlign = 'center';
    ctx.font = defaultFontSize * 2 + "px Roboto";
    ctx.fillStyle = "#FFFFFF";
    let centerText = "Projects";
    let textMeasurements = ctx.measureText(centerText);

    ctx.fillText(centerText, 0, (textMeasurements.actualBoundingBoxAscent + textMeasurements.actualBoundingBoxDescent) / 2);

    projects.forEach(p => {
        p.draw();
    });

    if (isDragging)
        requestAnimationFrame(draw);
}

// Gets the relevant location from a mouse or single touch event
function getEventLocation(e: MouseEvent | TouchEvent) {
    if (window.TouchEvent && e instanceof TouchEvent) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    else if (e instanceof MouseEvent) {
        return { x: e.clientX, y: e.clientY };
    }
}

function drawRect(x: number, y: number, width: number, height: number) {
    ctx.fillRect(x, y, width, height);
}

function drawText(text: string, x: number, y: number, size: number, font: string) {
    ctx.font = `${size}px ${font}`;
    ctx.fillText(text, x, y);
}

function onPointerDown(e: MouseEvent | TouchEvent) {

    isDragging = true;
    dragStart.x = getEventLocation(e).x / cameraZoom - cameraOffset.x;
    dragStart.y = getEventLocation(e).y / cameraZoom - cameraOffset.y;

    mouseMovement.x = getEventLocation(e).x / cameraZoom;
    mouseMovement.y = getEventLocation(e).y / cameraZoom;
    draw();
}

function onPointerUp(e: MouseEvent | TouchEvent) {

    // Only open or close if the user isn't panning
    mouseMovement.x -= getEventLocation(e).x / cameraZoom;
    mouseMovement.y -= getEventLocation(e).y / cameraZoom;
    if (Math.abs(mouseMovement.x) < 10 && Math.abs(mouseMovement.y) < 10) {
        projects.forEach(p => {
            p.checkClick(getEventLocation(e).x, getEventLocation(e).y);
        });
    }
    isDragging = false;
    initialPinchDistance = null;
    lastZoom = cameraZoom;
    draw();
}

function onPointerMove(e: MouseEvent | TouchEvent) {
    if (isDragging) {
        cameraOffset.x = getEventLocation(e).x / cameraZoom - dragStart.x;
        cameraOffset.y = getEventLocation(e).y / cameraZoom - dragStart.y;
    }
}

function handleTouch(e: TouchEvent, singleTouchHandler: Function) {
    if (e.touches.length == 1) {
        singleTouchHandler(e);
    }
    else if (e.type == "touchmove" && e.touches.length == 2) {
        isDragging = false;
        handlePinch(e);
    }
}

let initialPinchDistance: number = null
let lastZoom = cameraZoom;

function handlePinch(e: TouchEvent) {
    e.preventDefault();

    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };

    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance = (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2;

    if (initialPinchDistance == null) {
        initialPinchDistance = currentDistance;
    }
    else {
        adjustZoom(null, currentDistance / initialPinchDistance);
    }
}

function adjustZoom(zoomAmount: number, zoomFactor?: number) {
    if (!isDragging) {
        if (zoomAmount) {
            cameraZoom += zoomAmount;
        }
        else if (zoomFactor) {
            console.log(zoomFactor);
            cameraZoom = zoomFactor * lastZoom;
        }

        cameraZoom = Math.min(cameraZoom, MAX_ZOOM);
        cameraZoom = Math.max(cameraZoom, MIN_ZOOM);

        // console.log(zoomAmount);
        draw();
    }
}

canvas.addEventListener("resize", draw);
canvas.addEventListener('mousedown', onPointerDown);
canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown));
canvas.addEventListener('mouseup', onPointerUp);
canvas.addEventListener('touchend', (e) => handleTouch(e, onPointerUp));
canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove));
canvas.addEventListener('wheel', (e) => adjustZoom(e.deltaY * SCROLL_SENSITIVITY));

// Ready, set, go
draw();