const net = require('net');
const lk = require("./LostKingdom");
const Brainfuck = require("./bf");
const MAX_DATA_LENGTH = 256;
const MINUTE = 60*1000;

const tokens = Brainfuck.tokenize(lk);
delete lk;
console.log("Finished tokenizing");

const server = net.createServer(function(socket) {
	const address = socket.remoteAddress;
	console.log(`<New connection: ${address}>`);

	const bf = new Brainfuck();
	bf.output_handler = socket.write.bind(socket);

	bf.interpret(tokens).then(()=>socket.end());

	socket.on("error", (err)=>{
		console.log(`<Error: ${address}: ${err}>`);
		bf.end();
	});

	socket.setTimeout(15*MINUTE);
	socket.on("timeout", ()=>{
		console.log(`<${address} timed out>`);
		socket.end("<connection timeout>");
	});

	socket.on("end", ()=>{
		console.log(`<${address} disconnected>`);
		bf.end();
	});

	socket.on("data", function(chunk){
		const data = chunk.toString();

		// Reject data that's too short or long
		// to prevent DOS attacks and weirdness
		if(data.length<1 || data.length > MAX_DATA_LENGTH)
			return;

		// Reject binary data
		const initial = data.charCodeAt(0);
		if(initial != 10 && initial != 13 &&
			(initial<32 || initial > 128))
			return;

		console.log(`${address}: ${data.replace("\r\n","")}`);
		bf.absorb(data);
	});
});

server.listen(23, '::');

