const fs = require("fs");

// Helper function to make a new brick
function makeBrick({
	color = 'white',
	power = false,
	type = 'normal'
} = {}){

	const COLORS = {
		white : 0b0000,
		orange :  0b0001,
		cyan :  0b0010,
		green :  0b0011,
		red :  0b0100,
		blue :  0b0101,
		pink :  0b0110,
		gold :  0b0111
	};

	const TYPES = {
		empty : 0b0000,
		normal : 0b0001,
		silver : 0b0010,
		gold : 0b0011,
	}

	return (TYPES[type] << 4) | COLORS[color] | (power << 3);
}

// Helper function to parse a file
function readMap( string ){
	let lexer = {
		white : makeBrick({ color : 'white' }),
		orange : makeBrick({ color : 'orange' }),
		cyan : makeBrick({ color : 'cyan' }),
		green : makeBrick({ color : 'green' }),
		red : makeBrick({ color : 'red' }),
		blue : makeBrick({ color : 'blue' }),
		pink : makeBrick({ color : 'pink' }),

		whiteP : makeBrick({ color : 'white', power : true }),
		orangeP : makeBrick({ color : 'orange', power : true }),
		cyanP : makeBrick({ color : 'cyan', power : true }),
		greenP : makeBrick({ color : 'green', power : true }),
		redP : makeBrick({ color : 'red', power : true }),
		blueP : makeBrick({ color : 'blue', power : true }),
		pinkP : makeBrick({ color : 'pink', power : true }),

		gold : makeBrick({ type : 'gold' }),
		silver : makeBrick({ type : 'silver' }),
		empty : makeBrick({ type : 'empty' })
	};

	// Parse all the words in the file
	let map = [];
	let data = fs.readFileSync( string, { encoding : 'utf8' } ).split(/\r\n|\r|\n/g).join(" ").split(" ");
	for( let i = 0; i < data.length; i++ ){
		if( lexer.hasOwnProperty( data[i] ) ){
			map.push( lexer[ data[i] ] );
		}
	}

	return map;
}

// Create a new buffer with the needed size
const PatchBuffer = Buffer.alloc(
	5 + // magic number
	3 + // EOF
	3 + // offset
	2 + // payload length
	100 // payload
);

// Write the magic number
let offset = 0;
offset = PatchBuffer.writeUIntBE(0x50, offset, 1);
offset = PatchBuffer.writeUIntBE(0x41, offset, 1);
offset = PatchBuffer.writeUIntBE(0x54, offset, 1);
offset = PatchBuffer.writeUIntBE(0x43, offset, 1);
offset = PatchBuffer.writeUIntBE(0x48, offset, 1);

// Write the offset where to write
const LvlAddress = 0x07000a;
offset = PatchBuffer.writeUIntBE(LvlAddress, offset, 3);

// Write the payload, and the payload length
const Payload = readMap('map.txt');
offset = PatchBuffer.writeUIntBE(100, offset, 2);
for( let i = 0; i < Payload.length; i++ ){
	offset = PatchBuffer.writeUIntBE(Payload[i], offset, 1);
}

// Write the EOF
offset = PatchBuffer.writeUIntBE(0x45, offset, 1);
offset = PatchBuffer.writeUIntBE(0x4f, offset, 1);
offset = PatchBuffer.writeUIntBE(0x46, offset, 1);

// Write file
fs.writeFile('patch.ips', PatchBuffer, function(err){
	console.log(err);
})