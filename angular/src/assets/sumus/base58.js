// 'use strict';
//
// var bs58 = require('bs58');
// var crc32 = require('buffer-crc32');
// var Buffer = require('buffer').Buffer;
//
// var base58 = {};
// module.exports = base58;
//
// base58.pack = function(data) {
// 	try {
// 		// write data
// 		var buf = Buffer.alloc(data.length + 4);
// 		for (var i = 0; i < data.length; i++) {
// 			buf.writeUInt8(data[i], i);
// 		}
//
// 		// calc crc
// 		var crc = crc32.unsigned(buf.slice(0, buf.length - 4));
//
// 		// write crc
// 		buf.writeUInt32LE(crc, data.length);
//
// 		// encode
// 		return bs58.encode(buf);
// 	} catch (e) {
// 		console.error(e);
// 	}
// 	return null;
// };
//
// base58.unpack = function(str) {
// 	try {
// 		var bytes = bs58.decode(str);
// 		if (bytes.length > 4) {
// 			// get slices
// 			var dataPart = bytes.slice(0, bytes.length - 4);
// 			var crc = bytes.slice(bytes.length - 4, bytes.length).readUInt32LE(0);
//
// 			// calc crc
// 			var calcCrc = crc32.unsigned(dataPart);
//
// 			// compare
// 			if (crc == calcCrc) {
// 				return dataPart;
// 			}
// 		}
// 	} catch (e) {
// 		console.error(e);
// 	}
// 	return null;
// };
