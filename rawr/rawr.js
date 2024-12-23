function parse(buf) {
    let output = document.getElementById("raw-header");
    let magic = new TextDecoder().decode(buf.slice(0, 16));
    if (magic === "FUJIFILMCCD-RAW") {
        output.innerHTML += "Unknown file format";
        console.log("File is not a FujiFilm RAW file, magic is: " + magic);
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
    let jpeg_offset = buf.slice(pos, (pos += 4));
    output.innerHTML += "JPEG offset " + new DataView(jpeg_offset.buffer).getUint32(0) + " (" + jpeg_offset.toString() + ")\n";
    //     Jpeg Image length (4 bytes)
    let jpeg_length = buf.slice(pos, (pos += 4));
    output.innerHTML += "JPEG length " + new DataView(jpeg_length.buffer).getUint32(0) + " (" + jpeg_length.toString() + ")\n";
    //     Meta container Offset (4 bytes)
    let meta_offset = buf.slice(pos, (pos += 4));
    output.innerHTML += "Meta offset " + new DataView(meta_offset.buffer).getUint32(0) + " (" + meta_offset.toString() + ")\n";
    //     Meta container Length (4 bytes)
    let meta_length = buf.slice(pos, (pos += 4));
    output.innerHTML += "Meta length " + new DataView(meta_length.buffer).getUint32(0) + " (" + meta_length.toString() + ")\n";
    //     CFA Offset (4 bytes)
    let cfa_offset = buf.slice(pos, (pos += 4));
    output.innerHTML += "CFA offset " + new DataView(cfa_offset.buffer).getUint32(0) + " (" + cfa_offset.toString() + ")\n";
    //     CFA Length (4 bytes)
    let cfa_length = buf.slice(pos, (pos += 4));
    output.innerHTML += "CFA length " + new DataView(cfa_length.buffer).getUint32(0) + " (" + cfa_length.toString() + ")\n";
    //     (Jpeg image offset must be greater) 12 bytes unknown.
    //     (Jpeg image offset must be greater) Some offset (4 bytes)
    pos += 16;
    // Jpeg image offset
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
            // let array = new Uint8Array(contents);
            parse(new Uint8Array(contents));
            // console.log("Have array of length " + contents.byteLength + " with first value " + array[0]);
            // console.log("Magic: " + new TextDecoder().decode(array.slice(0, 16)));
        }
        else {
            console.log("File contents are a string");
        }
        // displayContents(contents);
    };
    fr.readAsArrayBuffer(file);
}
// function displayContents(contents) {
// 	var element = document.getElementById("file-content");
// 	element.textContent = contents;
// }
function rawr() {
    console.log("Adding callback");
    document.getElementById("file-input").addEventListener("change", readSingleFile, false);
}
