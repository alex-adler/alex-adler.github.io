const view = (() => {
	const matrix = [1, 0, 0, 1, 0, 0]; // current view transform
	var m = matrix; // alias
	var scale = 1; // current scale
	var ctx: CanvasRenderingContext2D; // reference to the 2D context
	const pos = { x: 0, y: 0 }; // current position of origin
	var dirty = true;
	const API = {
		set context(_ctx: CanvasRenderingContext2D) {
			ctx = _ctx;
			dirty = true;
		},
		apply() {
			if (dirty) {
				this.update();
			}
			ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
		},
		get scale() {
			return scale;
		},
		get position() {
			return pos;
		},
		setDirty() {
			dirty = true;
		},
		isDirty() {
			return dirty;
		},
		update() {
			dirty = false;
			m[3] = m[0] = scale;
			m[2] = m[1] = 0;
			m[4] = pos.x;
			m[5] = pos.y;
		},
		pan(amount: { x: number; y: number }) {
			if (dirty) {
				this.update();
			}
			pos.x += amount.x;
			pos.y += amount.y;
			dirty = true;
		},
		scaleAt(at: { x: number; y: number }, amount: number) {
			// at in screen coords
			if (dirty) {
				this.update();
			}
			scale *= amount;
			pos.x = at.x - (at.x - pos.x) * amount;
			pos.y = at.y - (at.y - pos.y) * amount;
			dirty = true;
		},
	};
	return API;
})();

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
	initialPinchDistance: number = 0;
	lastZoom: number = 1;
	lastDrawnZoom: number = 1;

	mouse = { x: 0, y: 0, oldX: 0, oldY: 0, button: false };

	#drawFunctions: ((context: CanvasRenderingContext2D, displayUnit: number, reset: () => void, scale: number) => void)[] = [];
	#needsUpdating: Array<() => boolean> = [];

	constructor(canvas: HTMLCanvasElement) {
		let temp_context = canvas.getContext("2d");
		if (!temp_context) {
			console.log("Failed to get context");
			return;
		}
		view.context = temp_context;
		this.context = temp_context;

		this.canvas = canvas;
		this.#setupEvents(canvas);

		this.canvas.width = this.canvas.clientWidth * this.#pixelRatio;
		this.canvas.height = this.canvas.clientHeight * this.#pixelRatio;

		this.cameraOffset.x = this.canvas.width / 2;
		this.cameraOffset.y = this.canvas.height / 2;

		view.pan({ x: this.canvas.width / 2, y: this.canvas.height / 2 });

		this.#draw();
	}
	addDrawFunction(
		drawFunction: (context: CanvasRenderingContext2D, displayUnit: number, reset: () => void, scale: number) => void,
		needsUpdating: () => boolean
	) {
		this.#drawFunctions.push(drawFunction);
		this.#needsUpdating.push(needsUpdating);
	}
	#draw(): void {
		// Check if the viewport needs updating or if any of the elements need to be redrawn
		if (view.isDirty() || (this.#needsUpdating.length && this.#needsUpdating.some((e) => e()))) {
			this.canvas.width = this.canvas.clientWidth * this.#pixelRatio;
			this.canvas.height = this.canvas.clientHeight * this.#pixelRatio;
			this.context.setTransform(1, 0, 0, 1, 0, 0);
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

			view.apply(); // set the 2D context transform to the view

			// Call all of the user defined functions that draw shapes
			let that = this;
			if (this.#drawFunctions.length) this.#drawFunctions.map((f) => f(that.context, that.canvas.width / 2, view.apply, view.scale));
		}
		// TODO: Get mouse position
		// this.context.beginPath();
		// this.context.ellipse(this.mouse.x - this.canvas.width / 2, this.mouse.y - this.canvas.height / 2, 10, 10, 0, 0, 2 * Math.PI);
		// this.context.strokeStyle = "red";
		// this.context.stroke();
		requestAnimationFrame(this.#draw.bind(this));
	}
	#setupEvents(canvas: HTMLCanvasElement): void {
		// TODO: Touch compatibility
		// canvas.addEventListener("touchstart", (e) => this.#handleTouch(e, this.#onPointerDown));
		// canvas.addEventListener("touchend", (e) => this.#handleTouch(e, this.#onPointerUp));
		// canvas.addEventListener("touchmove", (e) => this.#handleTouch(e, this.#onPointerMove));

		canvas.addEventListener("mousemove", this.mouseEvent.bind(this), { passive: true });
		canvas.addEventListener("mousedown", this.mouseEvent.bind(this), { passive: true });
		canvas.addEventListener("mouseup", this.mouseEvent.bind(this), { passive: true });
		canvas.addEventListener("mouseout", this.mouseEvent.bind(this), { passive: true });
		canvas.addEventListener("wheel", this.mouseWheelEvent.bind(this), { passive: false });

		window.addEventListener("resize", () => view.setDirty());
	}
	mouseEvent(event: MouseEvent) {
		if (event.type === "mousedown") {
			this.mouse.button = true;
		}
		if (event.type === "mouseup" || event.type === "mouseout") {
			this.mouse.button = false;
		}
		this.mouse.oldX = this.mouse.x;
		this.mouse.oldY = this.mouse.y;
		this.mouse.x = event.offsetX;
		this.mouse.y = event.offsetY;
		if (this.mouse.button) {
			// pan
			view.pan({ x: this.mouse.x - this.mouse.oldX, y: this.mouse.y - this.mouse.oldY });
		}
	}
	mouseWheelEvent(event: WheelEvent) {
		var x = event.offsetX;
		var y = event.offsetY;
		if (event.deltaY < 0) {
			view.scaleAt({ x, y }, 1.1);
		} else {
			view.scaleAt({ x, y }, 1 / 1.1);
		}
		event.preventDefault();
	}
	// Gets the relevant location from a mouse or single touch event
	// #getEventLocation(e: TouchEvent | MouseEvent): { x: number; y: number } {
	// 	if (e instanceof MouseEvent && e.clientX && e.clientY) {
	// 		return { x: e.clientX, y: e.clientY };
	// 	} else if (e instanceof TouchEvent && e.touches && e.touches.length == 1) {
	// 		return { x: e.touches[0].clientX, y: e.touches[0].clientY };
	// 	} else return { x: 0, y: 0 };
	// }
	// #onPointerDown(e: TouchEvent | MouseEvent): void {
	// 	this.isDragging = true;
	// 	this.dragStart.x = this.#getEventLocation(e).x / this.cameraZoom - this.cameraOffset.x;
	// 	this.dragStart.y = this.#getEventLocation(e).y / this.cameraZoom - this.cameraOffset.y;
	// }
	// #onPointerUp(e: TouchEvent | MouseEvent): void {
	// 	this.isDragging = false;
	// 	this.initialPinchDistance = null;
	// 	this.lastZoom = this.cameraZoom;
	// }
	// #onPointerMove(e: TouchEvent | MouseEvent): void {
	// 	if (this.isDragging) {
	// 		this.cameraOffset.x = this.#getEventLocation(e).x / this.cameraZoom - this.dragStart.x;
	// 		this.cameraOffset.y = this.#getEventLocation(e).y / this.cameraZoom - this.dragStart.y;
	// 	}
	// 	var rect = this.canvas.getBoundingClientRect();
	// 	this.#pointerPos.x =
	// 		(((this.#getEventLocation(e).x - rect.left) / (rect.right - rect.left)) * this.canvas.width) / this.cameraZoom - this.cameraOffset.x;
	// 	this.#pointerPos.y =
	// 		(((this.#getEventLocation(e).y - rect.top) / (rect.bottom - rect.top)) * this.canvas.height) / this.cameraZoom - this.cameraOffset.y;
	// }
	// #handleTouch(e: TouchEvent, singleTouchHandler: (e: TouchEvent) => void) {
	// 	if (e.touches.length == 1) {
	// 		singleTouchHandler(e);
	// 	} else if (e.type == "touchmove" && e.touches.length == 2) {
	// 		this.isDragging = false;
	// 		this.#handlePinch(e);
	// 	}
	// }
	// #handlePinch(e: TouchEvent) {
	// 	e.preventDefault();

	// 	let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
	// 	let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };

	// 	// This is distance squared, but no need for an expensive sqrt as it's only used in ratio
	// 	let currentDistance = (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2;

	// 	if (initialPinchDistance == null) {
	// 		initialPinchDistance = currentDistance;
	// 	} else {
	// 		this.#adjustZoom(null, currentDistance / initialPinchDistance);
	// 	}
	// }
	// #adjustZoom(zoomAmount: number, zoomFactor: number = null): void {
	// 	if (!this.isDragging) {
	// 		if (zoomAmount) {
	// 			this.cameraZoom += zoomAmount;
	// 		} else if (zoomFactor) {
	// 			console.log(zoomFactor);
	// 			this.cameraZoom = zoomFactor * lastZoom;
	// 		}

	// 		this.cameraZoom = Math.min(this.cameraZoom, this.MAX_ZOOM);
	// 		this.cameraZoom = Math.max(this.cameraZoom, this.MIN_ZOOM);
	// 	}
	// }
}
