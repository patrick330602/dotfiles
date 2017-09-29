define("amf",function(exports) {


const bits = require("./bits");

function DecodeValue(data,offset,type) {
	if(typeof type=="undefined") {
		if(offset>=data.length)
			throw new Error("End of structure");
		type = data[offset];
	}
	switch(type) {
		case 0x02: // string
			var length = bits.ReadInt16(data,offset+1);
			var string = String.fromCharCode.apply(null, data.subarray(offset+3,offset+3+length));
			return {
				offset: offset+3+length,
				value: string,
			}
		case 0x03: // anonymous
			var container = {};
			offset += 1;
			while(bits.ReadInt24(data,offset)!=0x09) {
				var ret = DecodeValue(data,offset-1,0x02);
				var name = ret.value;
				offset = ret.offset;
				ret = DecodeValue(data,offset);
				var value = ret.value;
				offset = ret.offset;
				container[name] = value;
			}
			return {
				offset: offset+3,
				value: container,
			};
			break;
		case 0x08: // object
			var count = bits.ReadInt32(data,offset+1);
			var container = {};
			offset += 5;
			while(bits.ReadInt24(data,offset)!=0x09) {
				var ret = DecodeValue(data,offset-1,0x02);
				var name = ret.value;
				offset = ret.offset;
				ret = DecodeValue(data,offset);
				var value = ret.value;
				offset = ret.offset;
				container[name] = value;
			}
			return {
				offset: offset+3,
				value: container,
			};
		case 0x0A:
			var count = bits.ReadInt32(data,offset+1);
			var container = [];
			offset += 5;
			for(var i=0;i<count;i++) {
				var ret = DecodeValue(data,offset);
				var value = ret.value;
				offset = ret.offset;
				container.push(value);
			}
			return {
				offset: offset,
				value: container,
			};
		case 0x00: // number
			var number = new DataView(data.buffer).getFloat64(offset+1);
			return {
				offset: offset+9,
				value: number,
			};
		case 0x01: // boolean
			return {
				offset: offset+2,
				value: !!data[offset+1],
			}
			break;
		default:
			throw new Error("AMF not supported type 0x"+type.toString(16));
	}
}

exports.decode = function(data) {
	try {
		var values = [];
		var offset = 0;
		while(offset>=0 && offset<data.length) {
			var ret = DecodeValue(data,offset);
			values.push(ret.value);
			offset = ret.offset;
		}
		return values;
	} catch(e) {
		console.error("decode error",e.message || e);
		return null;
	}
}



});