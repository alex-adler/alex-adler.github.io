export class InfiniteCanvas {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;

	#pixelRatio = window.devicePixelRatio;

	cameraZoom = 1;
	MAX_ZOOM = 5;
	MIN_ZOOM = 0.1;
	SCROLL_SENSITIVITY = 0.0005;

	isDragging = false;
	dragStart = { x: 0, y: 0 };
	cameraOffset = { x: 0, y: 0 };
	initialPinchDistance: number = null;
	lastZoom: number;

	#drawFunction: (context: CanvasRenderingContext2D, displayUnit: number) => void;

	constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, drawFunction: (context: CanvasRenderingContext2D, displayUnit: number) => void) {
		this.#drawFunction = drawFunction;

		this.canvas = canvas;
		this.#setupEvents(canvas);

		this.canvas.width = this.canvas.clientWidth * this.#pixelRatio;
		this.canvas.height = this.canvas.clientHeight * this.#pixelRatio;

		this.cameraOffset.x = this.canvas.width / 2;
		this.cameraOffset.y = this.canvas.height / 2;

		this.context = context;
		this.#draw();
	}
	#draw(): void {
		this.canvas.width = this.canvas.clientWidth * this.#pixelRatio;
		this.canvas.height = this.canvas.clientHeight * this.#pixelRatio;

		this.context.translate(window.innerWidth / 2, window.innerHeight / 2);
		this.context.scale(this.cameraZoom, this.cameraZoom);
		this.context.translate(-window.innerWidth / 2 + this.cameraOffset.x, -window.innerHeight / 2 + this.cameraOffset.y);
		this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);

		// Call the user defined function that draws the canvas
		this.#drawFunction(this.context, this.canvas.width);

		requestAnimationFrame(this.#draw.bind(this));
	}
	#setupEvents(canvas: HTMLCanvasElement): void {
		canvas.addEventListener("mousedown", this.#onPointerDown.bind(this));
		canvas.addEventListener("touchstart", (e) => this.#handleTouch(e, this.#onPointerDown));
		canvas.addEventListener("mouseup", this.#onPointerUp.bind(this));
		canvas.addEventListener("touchend", (e) => this.#handleTouch(e, this.#onPointerUp));
		canvas.addEventListener("mousemove", this.#onPointerMove.bind(this));
		canvas.addEventListener("touchmove", (e) => this.#handleTouch(e, this.#onPointerMove));
		canvas.addEventListener("wheel", (e) => {
			this.#adjustZoom(-e.deltaY * this.SCROLL_SENSITIVITY);
			e.preventDefault();
		});

		window.addEventListener("resize", () => this.#draw());
	}
	// Gets the relevant location from a mouse or single touch event
	#getEventLocation(e: TouchEvent | MouseEvent): { x: number; y: number } {
		if (e instanceof MouseEvent && e.clientX && e.clientY) {
			return { x: e.clientX, y: e.clientY };
		} else if (e instanceof TouchEvent && e.touches && e.touches.length == 1) {
			return { x: e.touches[0].clientX, y: e.touches[0].clientY };
		} else return { x: 0, y: 0 };
	}
	#onPointerDown(e: TouchEvent | MouseEvent): void {
		this.isDragging = true;
		this.dragStart.x = this.#getEventLocation(e).x / this.cameraZoom - this.cameraOffset.x;
		this.dragStart.y = this.#getEventLocation(e).y / this.cameraZoom - this.cameraOffset.y;
	}
	#onPointerUp(e: TouchEvent | MouseEvent): void {
		this.isDragging = false;
		this.initialPinchDistance = null;
		this.lastZoom = this.cameraZoom;
	}
	#onPointerMove(e: TouchEvent | MouseEvent): void {
		if (this.isDragging) {
			this.cameraOffset.x = this.#getEventLocation(e).x / this.cameraZoom - this.dragStart.x;
			this.cameraOffset.y = this.#getEventLocation(e).y / this.cameraZoom - this.dragStart.y;
		}
	}
	#handleTouch(e: TouchEvent, singleTouchHandler: (e: TouchEvent) => void) {
		if (e.touches.length == 1) {
			singleTouchHandler(e);
		} else if (e.type == "touchmove" && e.touches.length == 2) {
			this.isDragging = false;
			this.#handlePinch(e);
		}
	}
	#handlePinch(e: TouchEvent) {
		e.preventDefault();

		let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };

		// This is distance squared, but no need for an expensive sqrt as it's only used in ratio
		let currentDistance = (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2;

		if (initialPinchDistance == null) {
			initialPinchDistance = currentDistance;
		} else {
			this.#adjustZoom(null, currentDistance / initialPinchDistance);
		}
	}
	#adjustZoom(zoomAmount: number, zoomFactor: number = null): void {
		if (!this.isDragging) {
			if (zoomAmount) {
				this.cameraZoom += zoomAmount;
			} else if (zoomFactor) {
				console.log(zoomFactor);
				this.cameraZoom = zoomFactor * lastZoom;
			}

			this.cameraZoom = Math.min(this.cameraZoom, this.MAX_ZOOM);
			this.cameraZoom = Math.max(this.cameraZoom, this.MIN_ZOOM);
		}
	}
}
