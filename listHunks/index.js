const fs = require("fs");

// Magic number that every patch has at the beginning
const MagicNumber = Buffer.from([0x50, 0x41, 0x54, 0x43, 0x48]);

// EOF that every patch has at the end
const EOF = Buffer.from([0x45, 0x4f, 0x46]);

// Hunk class to encapsulate it.
class Hunk {
	constructor( offset, length, payload ){
		this.offset = offset;
		this.length = length;
		this.payload = payload;
	}
};

// Read patch file
fs.readFile("patch.ips", function(err, buff){

	// Notify if we have some error
	if( err ){
		console.error( err );
		return;
	}

	// Check that its a valid patch
	if( !buff.slice(0,5).equals(MagicNumber) ){
		console.error("Invalid IPS file");
		return;
	}

	// Start at the 5th byte storing each hunk
	let hunks = [];
	let offset = 5;

	while ( !buff.slice(offset, offset+3).equals(EOF) ) {
		let hunkOffset = buff.slice( offset, offset+3 );
		offset += 3;

		let hunkLength = buff.slice( offset, offset+2 ).readUInt16BE(0);
		offset += 2;

		let hunkPayload;
		if( hunkLength == 0 ){
			hunkPayload = buff.slice( offset, offset + 3);
			offset += 3;
		}else{
			hunkPayload = buff.slice( offset, offset + hunkLength);
			offset += hunkLength;
		}

		hunks.push( new Hunk(hunkOffset, hunkLength, hunkPayload ) );
	}

	// Print all the hunks
	for( let i = 0; i < hunks.length; i++){
		console.log( `${hunks[i].offset.toString('hex')}: ${hunks[i].length}`);
	}
})