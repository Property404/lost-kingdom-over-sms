const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const lk = require("./LostKingdom");
const Brainfuck = require("./bf");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const tokens = Brainfuck.tokenize(lk);
const bmap = {}

app.post('/sms', async (req, res) => {
	const twiml = new MessagingResponse();
	const from = req.body.From;
	const message = req.body.Body;

	console.log(`${from}: ${message}`);

	if(!bmap[from])
	{
		console.log(`<${from} started>`);
		bmap[from] = new Brainfuck();
		bmap[from].interpret(tokens).then(()=>{
			console.log(`<${from} left>`);
			bmap[from] = undefined
		});
	}
	else
	{
		bmap[from].absorb(message);
	}

	const text = await bmap[from].getText();

	twiml.message(text);

	res.writeHead(200, {'Content-Type': 'text/xml'});
	res.end(twiml.toString());
});

http.createServer(app).listen(1337, () => {
	console.log('Express server listening on port 1337');
});
