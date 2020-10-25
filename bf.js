function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
class Brainfuck
{

	constructor()
	{
		this._input_buffer = [];
		this._output_buffer = "";
		this.tape = {"0":0};
		this.pointer = 0;

	}

	absorb(data)
	{
		for(const d of data)
		{
			if(d==="\r")
				continue;
			const v =  d.charCodeAt(0);
			this._input_buffer.push(v);
		}
	}

	output()
	{
		if(this._output_buffer !== "")
			this.output_handler(this._output_buffer);
		this._output_buffer = "";
	}

	async interpret(tokens)
	{
		for(let i=0;i<tokens.length;i++)
		{
			let token = tokens[i];

			if (this.tape[this.pointer] == undefined)
				this.tape[this.pointer] = 0;

			switch(token.type)
			{
				case 'B':
					this.tape[this.pointer] = 0;
					break;
				case '+':
					this.tape[this.pointer]+=token.value;
					this.tape[this.pointer]%=256;
					break;
				case '-':
					this.tape[this.pointer]-=token.value;
					while(this.tape[this.pointer] < 0)
						this.tape[this.pointer]+=256;
					break;
				case '>':
					this.pointer+=token.value;
					break;
				case '<':
					this.pointer-=token.value;
					break;
				case '.':
					this._output_buffer +=
						String.fromCharCode(this.tape[this.pointer]);
					break;
				case ',':
					this.output();
					if(this._input_buffer.length === 0)
					{
						while(this._input_buffer.length === 0)
						{
							await sleep(100);
						}
					}
					this.tape[this.pointer] = this._input_buffer.shift();
					break;
				case '[':
					if(!this.tape[this.pointer])
					{
						i = token.partner;
					}
					break;
				case ']':
					i = token.partner - 1;
					break;
				default:
					console.log("meh");
			}
		}
	}

	// Adapted from Property404/dbfi/src/interpret.c
	// See original source for helpful comments or lack thereof
	static tokenize(old_source)
	{
		let token_index = 0;

		let tokens = [];
		let skip_stack = [];

		let source = "";

		for(const c of old_source)
		{
			if("B+-<>[].,".includes(c))
				source+=c;
		}
		while(source.includes("[-]"))
			source = source.replace("[-]","B");

		for(let character of source)
		{
			if(!("B+-<>[].,".includes(character)))
				continue;
			let new_token = {type:character,
				value:1
			};

			switch(character)
			{
				case "[":
					skip_stack.push(token_index);
					break;
				case "]":
					// [ and ] need to be mated
					new_token.partner = skip_stack.pop();
					tokens[new_token.partner].partner = token_index;
					break;
				default:
					break;
			}

			if("+-<>".includes(character) &&
				tokens[tokens.length-1].type === character
			)
			{
				tokens[tokens.length-1].value++;
			}
			else
			{
				tokens.push(new_token);
				token_index++;
			}
		}
		return tokens;
	}
}

module.exports = Brainfuck;



