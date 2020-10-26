const net = require('net');
const lk = require("./LostKingdom");
const Brainfuck = require("./bf");

const tokens = Brainfuck.tokenize(lk);
console.log("Finished tokenizing");

const server = net.createServer(function(socket) {
	console.log(`New connection from ${socket.address().address}`);
	
	const bf = new Brainfuck();
	bf.output_handler = socket.write.bind(socket);

	bf.interpret(tokens);

	socket.on("data", function(chunk){
		const data = chunk.toString();
		
		// Reject binary data
		const initial = data.charCodeAt(0);
		if(initial != 10 && initial != 13 &&
			(initial<32 || initial > 128))
			return;

		console.log("Recv: ", data)
		bf.absorb(data);
	});
});

server.listen(23, '0.0.0.0');

