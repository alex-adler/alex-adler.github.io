async function bytesToBase64DataUrl(bytes: Uint8Array, type = "application/octet-stream") {
	return await new Promise((resolve, reject) => {
		const reader = Object.assign(new FileReader(), {
			onload: () => resolve(reader.result),
			onerror: () => reject(reader.error),
		});
		reader.readAsDataURL(new File([bytes], "", { type }));
	});
}

function display_jpeg(b64: string) {
	let canvas = document.getElementById("gl-canvas") as HTMLCanvasElement;
	let ctx = canvas.getContext("2d");

	const width = 4;
	const heigh = 0.75 * width;

	canvas.width = width;
	canvas.height = heigh;

	let img = new Image();
	img.src = b64;

	img.onload = function () {
		console.log("Displaying JPEG of size " + img.width + " x " + img.height + ": " + img.src);
		canvas.width = img.width;
		canvas.height = img.height;
		console.log("Image Onload");
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	};
	img.onerror = function (stuff) {
		console.log("Img Onerror:", stuff);
	};

	// const image_data = ctx.createImageData(width, heigh);
	// const data = image_data.data;
	// console.log(data);
	// for (let i = 0; i < data.length; i += 4) {
	// 	// data[i] = 0;
	// 	// data[i] = 0xff;
	// 	// data[i + 1] = 0;
	// 	// data[i + 1] = 0xff;
	// 	// data[i + 2] = 0;
	// 	// data[i + 2] = 120;
	// 	data[i + 3] = 0xff;
	// }
	// data[0] = 0xff;
	// data[5] = 0xff;
	// ctx.putImageData(image_data, 0, 0);
}

function parse(buf: Uint8Array) {
	let output = document.getElementById("raw-header") as HTMLParagraphElement;
	output.innerHTML = "";
	let magic = new TextDecoder().decode(buf.slice(0, 16));
	if (magic !== "FUJIFILMCCD-RAW ") {
		output.innerHTML += "Unknown file format";
		console.log("File is not a FujiFilm RAW file, magic is: " + magic);
		bytesToBase64DataUrl(buf).then(display_jpeg);
		return;
	}
	output.innerHTML += "FujiFilm RAW\n";

	let pos = 16;
	let format_version = buf.slice(pos, (pos += 4));
	output.innerHTML += "Format v" + new TextDecoder().decode(format_version) + "\n";

	let camera_id = buf.slice(pos, (pos += 8));
	output.innerHTML += "Camera ID " + new TextDecoder().decode(camera_id) + "\n";

	let camera_string = buf.slice(pos, (pos += 30));
	output.innerHTML += new TextDecoder().decode(camera_string) + "\n";
	pos += 2;

	// Should be 0100 or 0159
	let directory_version = buf.slice(pos, (pos += 4));
	output.innerHTML += "Directory v" + new TextDecoder().decode(directory_version) + " (" + directory_version.toString() + ")\n";

	//     20 bytes “unknown”
	let unknown = buf.slice(pos, (pos += 20));
	output.innerHTML += "Unknown " + unknown.toString() + "\n";

	//     Jpeg image offset (4 bytes)
	const jpeg_offset_raw = buf.slice(pos, (pos += 4));
	const jpeg_offset = new DataView(jpeg_offset_raw.buffer).getUint32(0);
	output.innerHTML += "JPEG offset " + jpeg_offset + " (" + jpeg_offset.toString() + ")\n";
	//     Jpeg Image length (4 bytes)
	const jpeg_length_raw = buf.slice(pos, (pos += 4));
	const jpeg_length = new DataView(jpeg_length_raw.buffer).getUint32(0);
	output.innerHTML += "JPEG length " + jpeg_length + " (" + jpeg_length_raw.toString() + ")\n";

	//     Meta container Offset (4 bytes)
	const meta_offset = buf.slice(pos, (pos += 4));
	output.innerHTML += "Meta offset " + new DataView(meta_offset.buffer).getUint32(0) + " (" + meta_offset.toString() + ")\n";
	//     Meta container Length (4 bytes)
	const meta_length = buf.slice(pos, (pos += 4));
	output.innerHTML += "Meta length " + new DataView(meta_length.buffer).getUint32(0) + " (" + meta_length.toString() + ")\n";

	//     CFA Offset (4 bytes)
	const cfa_offset = buf.slice(pos, (pos += 4));
	output.innerHTML += "CFA offset " + new DataView(cfa_offset.buffer).getUint32(0) + " (" + cfa_offset.toString() + ")\n";
	//     CFA Length (4 bytes)
	const cfa_length = buf.slice(pos, (pos += 4));
	output.innerHTML += "CFA length " + new DataView(cfa_length.buffer).getUint32(0) + " (" + cfa_length.toString() + ")\n";

	//     (Jpeg image offset must be greater) 12 bytes unknown.
	//     (Jpeg image offset must be greater) Some offset (4 bytes)

	// Jpeg image offset
	bytesToBase64DataUrl(buf.slice(jpeg_offset, jpeg_offset + jpeg_length)).then(display_jpeg);

	//     Exif JFIF with thumbnail + preview
	//     An XMP packet may also be found. This is used by camera to indicate favourited image by adding a Rating property.

	// Meta container offset - Big Endian

	//     4 bytes: count of records
	//     Records, one after the other
	//         2 bytes: tag ID
	//         2 bytes: size of record (N)
	//         N bytes: data

	// CFA Offset

	//     TIFF container.
	//     RAW data. Maybe compressed.
}

function readSingleFile() {
	console.log("Reading file");
	const fileList = this.files;
	console.log(fileList);
	let file = fileList[0];
	if (!file) {
		console.log("Failed to find file");
		return;
	}
	let fr = new FileReader();
	fr.onload = function () {
		let contents = fr.result;
		if (contents instanceof ArrayBuffer) {
			parse(new Uint8Array(contents));
		} else {
			display_jpeg(contents);
			console.log("File contents are a string");
		}
	};
	fr.readAsArrayBuffer(file);
}

function rawr() {
	console.log("Adding callback");
	document.getElementById("file-input").addEventListener("change", readSingleFile, false);
}
