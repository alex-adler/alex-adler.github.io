import * as fs from "fs";

const data = {
	name: "John Doe",
	age: 30,
	address: {
		street: "123 Main St",
		city: "Anytown",
		state: "CA",
		zip: "12345",
	},
};

let jsonString = "export default";
jsonString += JSON.stringify(data);

fs.writeFile("data.js", jsonString, (err) => {
	if (err) throw err;
	console.log("Data written to file");
});
