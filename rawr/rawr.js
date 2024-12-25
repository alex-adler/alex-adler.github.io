async function bytesToBase64DataUrl(bytes, type = "application/octet-stream") {
    return await new Promise((resolve, reject) => {
        const reader = Object.assign(new FileReader(), {
            onload: () => resolve(reader.result),
            onerror: () => reject(reader.error),
        });
        reader.readAsDataURL(new File([bytes], "", { type }));
    });
}
function display_jpeg(b64) {
    let canvas = document.getElementById("gl-canvas");
    let ctx = canvas.getContext("2d");
    const width = 4;
    const heigh = 0.75 * width;
    canvas.width = width;
    canvas.height = heigh;
    let img = new Image();
    img.src = b64;
    img.onload = function () {
        console.log("Displaying JPEG of size " + img.width + " x " + img.height);
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
function parse(buf) {
    let output = document.getElementById("raw-header");
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
    //     20 bytes “unknown” (Probably padding)
    let unknown = buf.slice(pos, (pos += 20));
    // output.innerHTML += "Unknown " + unknown.toString() + "\n";
    //     Jpeg image offset (4 bytes)
    const jpeg_offset_raw = buf.slice(pos, (pos += 4));
    const jpeg_offset = new DataView(jpeg_offset_raw.buffer).getUint32(0);
    output.innerHTML += "JPEG offset " + jpeg_offset + " (" + jpeg_offset.toString() + ")\n";
    //     Jpeg Image length (4 bytes)
    const jpeg_length_raw = buf.slice(pos, (pos += 4));
    const jpeg_length = new DataView(jpeg_length_raw.buffer).getUint32(0);
    output.innerHTML += "JPEG length " + jpeg_length + " (" + jpeg_length_raw.toString() + ")\n";
    //     Meta container Offset (4 bytes)
    const meta_offset_raw = buf.slice(pos, (pos += 4));
    const meta_offset = new DataView(meta_offset_raw.buffer).getUint32(0);
    output.innerHTML += "Meta offset " + meta_offset + " (" + meta_offset_raw.toString() + ")\n";
    //     Meta container Length (4 bytes)
    const meta_length_raw = buf.slice(pos, (pos += 4));
    const meta_length = new DataView(meta_length_raw.buffer).getUint32(0);
    output.innerHTML += "Meta length " + meta_length + " (" + meta_length_raw.toString() + ")\n";
    //     CFA Offset (4 bytes)
    const cfa_offset_raw = buf.slice(pos, (pos += 4));
    const cfa_offset = new DataView(cfa_offset_raw.buffer).getUint32(0);
    output.innerHTML += "CFA offset " + cfa_offset + " (" + cfa_offset_raw.toString() + ")\n";
    //     CFA Length (4 bytes)
    const cfa_length_raw = buf.slice(pos, (pos += 4));
    const cfa_length = new DataView(cfa_length_raw.buffer).getUint32(0);
    output.innerHTML += "CFA length " + cfa_length + " (" + cfa_length_raw.toString() + ")\n";
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
    pos = meta_offset;
    const record_count = new DataView(buf.slice(pos, (pos += 4)).buffer).getUint32(0);
    console.log("Number of meta records: " + record_count);
    for (let i = 0; i < record_count; i++) {
        const tag_id = new DataView(buf.slice(pos, (pos += 2)).buffer).getUint16(0);
        const record_size = new DataView(buf.slice(pos, (pos += 2)).buffer).getUint16(0);
        const record_data = buf.slice(pos, (pos += record_size));
        // console.log("Record with ID: " + tag_id + " of size " + record_size);
        switch (tag_id) {
            case 0x100:
                output.innerHTML +=
                    "\tSensor Dimensions: " +
                        new DataView(record_data.slice(0, 2).buffer).getUint16(0) +
                        " x " +
                        new DataView(record_data.slice(2, 4).buffer).getUint16(0) +
                        " (" +
                        record_data.toString() +
                        ")\n";
                break;
            case 0x110:
                output.innerHTML += "\tActive area Top Left: " + record_data.toString() + "\n";
                break;
            case 0x111:
                output.innerHTML +=
                    "\tActive area Height Width: " +
                        new DataView(record_data.slice(0, 2).buffer).getUint16(0) +
                        " x " +
                        new DataView(record_data.slice(2, 4).buffer).getUint16(0) +
                        " (" +
                        record_data.toString() +
                        ")\n";
                break;
            case 0x115:
                output.innerHTML +=
                    "\tAspect Ratio: " +
                        new DataView(record_data.slice(0, 2).buffer).getUint16(0) +
                        " x " +
                        new DataView(record_data.slice(2, 4).buffer).getUint16(0) +
                        " (" +
                        record_data.toString() +
                        ")\n";
                break;
            case 0x121:
                output.innerHTML += "\tRaw Image Size: " + +" (" + record_data.toString() + ")\n";
                break;
            case 0x130:
                // Fuji Layout?
                output.innerHTML += "\tRaw Info: " + record_data.toString() + "\n";
                break;
            case 0x131:
                // XTransLayout?
                output.innerHTML += "\tCFA Pattern: " + record_data.toString() + "\n";
                break;
            case 0x2f00:
                // WB_GRGBLevels
                output.innerHTML += "\tWB_GRGBLevels: " + record_data.toString() + "\n";
                break;
            case 0x2ff0:
                // WB_GRGBLevels?
                output.innerHTML += "\tCamera Multiplier: " + record_data.toString() + "\n";
                break;
            case 0x4000:
                output.innerHTML += "\tBlack Level: " + record_data.toString() + "\n";
                break;
            case 0x9200:
                output.innerHTML += "\tRelative Exposure: " + record_data.toString() + "\n";
                break;
            case 0x9650:
                output.innerHTML += "\tRaw Exposure Bias: " + record_data.toString() + "\n";
                break;
            case 0xc000:
                console.log("RAF data of size " + record_size + " with data " + record_data);
                break;
            default:
                console.log("Unknown tag: 0x" + tag_id.toString(16) + " of size " + record_size + " with data " + record_data);
        }
    }
    // CFA Offset
    pos = cfa_offset;
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
        }
        else {
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