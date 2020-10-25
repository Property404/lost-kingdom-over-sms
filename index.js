const net = require('net');
const lk = require("./LostKingdom");
const Brainfuck = require("./bf");

const tokens = Brainfuck.tokenize(lk);
console.log("Finished tokenizing");

const server = net.createServer(function(socket) {
	console.log("New connection");
	const bf = new Brainfuck();
	bf.output_handler = socket.write.bind(socket);
	bf.interpret(tokens);

	socket.on("data", function(chunk){
		const data = chunk.toString();
		console.log("Recv: ", data)
		bf.absorb(data);
	});
});

server.listen(23, '0.0.0.0');

