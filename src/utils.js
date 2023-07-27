//@ts-check
// Utilities

import { TAB } from "./config.js";

/**
 * @typedef {string & {}} hexstring
 */

/**
 * Needed by transfer() methods
 * @internal
 * @typedef {{
 *   transferByteArrayData: (bytes: number[]) => any,
 *   transferConstrData: (index: number, fields: any[]) => any,
 *   transferIntData: (value: bigint) => any,
 *   transferListData: (items: any[]) => any,
 *   transferMapData: (pairs: [any, any][]) => any,
 *   transferSite: (src: any, startPos: number, endPos: number, codeMapSite: null | any) => any,
 *   transferSource: (raw: string, name: string) => any,
 *   transferUplcBool: (site: any, value: boolean) => any,
 *   transferUplcBuiltin: (site: any, name: string | number) => any,
 *   transferUplcByteArray: (site: any, bytes: number[]) => any,
 *   transferUplcCall: (site: any, a: any, b: any) => any,
 *   transferUplcConst: (value: any) => any,
 *   transferUplcDataValue: (site: any, data: any) => any,
 *   transferUplcDelay: (site: any, expr: any) => any,
 *   transferUplcError: (site: any, msg: string) => any,
 *   transferUplcForce: (site: any, expr: any) => any,
 *   transferUplcInt: (site: any, value: bigint, signed: boolean) => any,
 *   transferUplcLambda: (site: any, rhs: any, name: null | string) => any,
 *   transferUplcList: (site: any, itemType: any, items: any[]) => any,
 *   transferUplcPair: (site: any, first: any, second: any) => any,
 *   transferUplcString: (site: any, value: string) => any,
 *   transferUplcType: (typeBits: string) => any,
 *   transferUplcUnit: (site: any) => any,
 *   transferUplcVariable: (site: any, index: any) => any
 * }} TransferUplcAst
 */

/**
 * Throws an error if 'cond' is false.
 * @internal
 * @param {boolean} cond 
 * @param {string} msg 
 */
export function assert(cond, msg = "unexpected") {
	if (!cond) {
		throw new Error(msg);
	}
}

/**
 * Throws an error if 'obj' is undefined. Returns 'obj' itself (for chained application).
 * @internal
 * @template T
 * @param {T | undefined | null} obj 
 * @param {string} msg 
 * @returns {T}
 */
export function assertDefined(obj, msg = "unexpected undefined value") {
	if (obj === undefined || obj === null ) {
		throw new Error(msg);
	}

	return obj;
}

/**
 * @internal
 * @template Tin, Tout
 * @param {Tin} obj
 * @param {{new(...any): Tout}} C
 * @returns {Tout}
 */
export function assertClass(obj, C, msg = "unexpected class") {
	if (obj instanceof C) {
		return obj;
	} else {
		throw new Error(msg);
	}
}

/**
 * @internal
 * @param {string} str 
 * @param {string} msg 
 * @returns {string}
 */
export function assertNonEmpty(str, msg = "empty string") {
	if (str.length == 0) {
		throw new Error(msg);
	} else {
		return str;
	}
}

/**
 * @internal
 * @param {any} obj 
 * @param {string} msg 
 * @returns {number}
 */
export function assertNumber(obj, msg = "expected a number") {
	if (obj === undefined || obj === null) {
		throw new Error(msg);
	} else if (typeof obj == "number") {
		return obj;
	} else {
		throw new Error(msg);
	}
}

/**
 * @internal
 * @template T
 * @param {(T | null)[]} lst
 * @returns {null | (T[])}
 */
export function reduceNull(lst) {
	/**
	 * @type {T[]}
	 */
	const nonNullLst = [];

	let someNull = false;

	lst.forEach(item => {
		if (item !== null && !someNull) {
			nonNullLst.push(item);
		} else {
			someNull = true;
		}
	});

	if (someNull) {
		return null;
	} else {
		return nonNullLst;
	}
}

/**
 * @internal
 * @template Ta
 * @template Tb
 * @param {[Ta | null, Tb | null][]} pairs
 * @returns {null | [Ta, Tb][]}
 */
export function reduceNullPairs(pairs) {
	/**
	 * @type {[Ta, Tb][]}
	 */
	const nonNullPairs = [];

	let someNull = false;

	pairs.forEach(([a, b]) => {
		if (a === null || b === null) {
			someNull = true;
		} else if (!someNull) {
			nonNullPairs.push([a, b]);
		}
	});

	if (someNull) {
		return null;
	} else {
		return nonNullPairs;
	}
}

/**
 * Compares two objects (deep recursive comparison)
 * @internal
 * @template T
 * @param {T} a 
 * @param {T} b 
 * @returns {boolean}
 */
export function eq(a, b) {
	if (a === undefined || b === undefined) {
		throw new Error("one of the args is undefined");
	} else if (typeof a == "string") {
		return a === b;
	} else if (typeof a == "number") {
		return a === b;
	} else if (typeof a == "boolean") {
		return a === b;
	} else if (typeof a == "bigint") {
		return a === b;
	} else if (a instanceof Array && b instanceof Array) {
		if (a.length != b.length) {
			return false;
		}

		for (let i = 0; i < a.length; i++) {
			if (!eq(a[i], b[i])) {
				return false;
			}
		}

		return true;
	} else {
		throw new Error(`eq not yet implemented for these types: ${typeof a} and ${typeof b}`);
	}
}

/**
 * Throws an error if two object aren't equal (deep comparison).
 * Used by unit tests that are autogenerated from JSDoc inline examples.
 * @internal
 * @template T
 * @param {T} a
 * @param {T} b
 * @param {string} msg
 */
export function assertEq(a, b, msg) {
	if (!eq(a, b)) {
		console.log("lhs:", a);
		console.log("rhs:", b);
		console.log("...")
		throw new Error(msg);
	}
}

/**
 * Divides two integers. Assumes a and b are whole numbers. Rounds down the result.
 * @example
 * idiv(355, 113) => 3
 * @internal
 * @param {number} a
 * @param {number} b 
 */
export function idiv(a, b) {
	return Math.floor(a / b);
	// alternatively: (a - a%b)/b
}

/**
 * 2 to the power 'p' for bigint.
 * @internal
 * @param {bigint} p
 * @returns {bigint}
 */
export function ipow2(p) {
	return (p <= 0n) ? 1n : 2n << (p - 1n);
}

/**
 * Masks bits of 'b' by setting bits outside the range ['i0', 'i1') to 0. 
 * 'b' is an 8 bit integer (i.e. number between 0 and 255).
 * The return value is also an 8 bit integer, shift right by 'i1'.
 
 * @example
 * imask(0b11111111, 1, 4) => 0b0111 // (i.e. 7)
 * @internal
 * @param {number} b 
 * @param {number} i0 
 * @param {number} i1 
 * @returns {number}
 */
export function imask(b, i0, i1) {
	assert(i0 < i1);

	const mask_bits = [
		0b11111111,
		0b01111111,
		0b00111111,
		0b00011111,
		0b00001111,
		0b00000111,
		0b00000011,
		0b00000001,
	];

	return (b & mask_bits[i0]) >> (8 - i1);
}

/**
 * Make sure resulting number fits in uint8
 * @internal
 * @param {number} x
 */
export function imod8(x) {
	return x & 0xff;
}

/**
 * Converts an unbounded integer into a list of uint8 numbers (big endian)
 * Used by the CBOR encoding of data structures, and by Ed25519
 * @internal
 * @param {bigint} x
 * @returns {number[]}
 */
export function bigIntToBytes(x) {
	if (x == 0n) {
		return [0];
	} else {
		/**
		 * @type {number[]}
		 */
		const res = [];

		while (x > 0n) {
			res.unshift(Number(x%256n));

			x = x/256n;
		}

		return res;
	}
}

/**
 * Converts a list of uint8 numbers into an unbounded int (big endian)
 * Used by the CBOR decoding of data structures.
 * @internal
 * @param {number[]} b
 * @return {bigint}
 */
export function bytesToBigInt(b) {
	let s = 1n;
	let total = 0n;

	while (b.length > 0) {
		total += BigInt(assertDefined(b.pop()))*s;

		s *= 256n;
	}

	return total;
}

/**
 * Little Endian 32 bytes
 * @internal
 * @param {number[]} b 
 * @returns {bigint}
 */
export function leBytesToBigInt(b) {
	return bytesToBigInt(b.slice().reverse());
}

/**
 * Little Endian 32 bytes
 * @internal
 * @param {bigint} x 
 * @returns {number[]}
 */
export function bigIntToLe32Bytes(x) {
	const bytes = bigIntToBytes(x).reverse();
			
	while (bytes.length < 32) {
		bytes.push(0);
	}

	return bytes;
}

/**
 * Prepends zeroes to a bit-string so that 'result.length == n'.
 * @example
 * padZeroes("1111", 8) => "00001111"
 * @internal
 * @param {string} bits
 * @param {number} n 
 * @returns {string}
 */
export function padZeroes(bits, n) {
	// padded to multiple of n
	if (bits.length % n != 0) {
		const nPad = n - bits.length % n;

		bits = (new Array(nPad)).fill('0').join('') + bits;
	}

	return bits;
}

/**
 * Converts a 8 bit integer number into a bit string with an optional "0b" prefix.
 * The result is padded with leading zeroes to become 'n' chars long ('2 + n' chars long if you count the "0b" prefix). 
 * @example
 * byteToBitString(7) => "0b00000111"
 * @internal
 * @param {number} b 
 * @param {number} n
 * @param {boolean} prefix
 * @returns {string}
 */
export function byteToBitString(b, n = 8, prefix = true) {
	const s = padZeroes(b.toString(2), n);

	if (prefix) {
		return "0b" + s;
	} else {
		return s;
	}
}

/**
 * Converts a hexadecimal representation of bytes into an actual list of uint8 bytes.
 * @example
 * hexToBytes("00ff34") => [0, 255, 52] 
 * @param {hexstring} hex 
 * @returns {number[]}
 */
export function hexToBytes(hex) {
	hex = hex.trim();
	
	const bytes = [];

	for (let i = 0; i < hex.length; i += 2) {
		const b = parseInt(hex.slice(i, i + 2), 16);

		assert(!Number.isNaN(b), `invalid hexstring "${hex}"`);
		
		bytes.push(parseInt(hex.slice(i, i + 2), 16));
	}

	return bytes;
}

/**
 * Converts a list of uint8 bytes into its hexadecimal string representation.
 * @example
 * bytesToHex([0, 255, 52]) => "00ff34"
 * @param {number[]} bytes
 * @returns {hexstring}
 */
export function bytesToHex(bytes) {
	const parts = [];

	for (let b of bytes) {
		parts.push(padZeroes(b.toString(16), 2));
	}

	/**
	 * @type {hexstring}
	 */
	return parts.join('');
}

/**
 * Encodes a string into a list of uint8 bytes using UTF-8 encoding.
 * @example
 * textToBytes("hello world") => [104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]
 * @param {string} str 
 * @returns {number[]}
 */
export function textToBytes(str) {
	return Array.from((new TextEncoder()).encode(str));
}

/**
 * Decodes a list of uint8 bytes into a string using UTF-8 encoding.
 * @example
 * bytesToText([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]) => "hello world"
 * @param {number[]} bytes 
 * @returns {string}
 */
export function bytesToText(bytes) {
	return (new TextDecoder("utf-8", {fatal: true})).decode((new Uint8Array(bytes)).buffer);
}

/**
 * Replaces the tab characters of a string with spaces.
 * This is used to create a prettier IR (which is built-up from many template js strings in this file, which might contain tabs depending on the editor used)
 * @example
 * replaceTabs("\t\t\t") => [TAB, TAB, TAB].join("")
 * @internal
 * @param {string} str 
 * @returns {string}
 */
export function replaceTabs(str) {
	return str.replace(new RegExp("\t", "g"), TAB);
}

/**
 * Read non-byte aligned numbers
 * @internal
 */
export class BitReader {
    /**
     * @type {Uint8Array}
     */
	#view;

    /**
     * @type {number}
     */
	#pos;

    /**
     * @type {boolean}
     */
	#truncate;

	/**
	 * @param {number[]} bytes
	 * @param {boolean} truncate - if true then read last bits as low part of number, if false pad with zero bits
	 */
	constructor(bytes, truncate = true) {
		this.#view = new Uint8Array(bytes);
		this.#pos = 0; // bit position, not byte position
		this.#truncate = truncate;
	}

	/**
     * @internal
	 * @returns {boolean}
	 */
	eof() {
		return idiv(this.#pos, 8) >= this.#view.length;
	}

	/**
	 * Reads a number of bits (<= 8) and returns the result as an unsigned number
     * @internal
	 * @param {number} n - number of bits to read
	 * @returns {number}
	 */
	readBits(n) {
		assert(n <= 8, "reading more than 1 byte");

		let leftShift = 0;
		if (this.#pos + n > this.#view.length * 8) {
			const newN = (this.#view.length*8 - this.#pos);

			if (!this.#truncate) {
				leftShift = n - newN;
			}

			n = newN;
		}

		assert(n > 0, "eof");

		// it is assumed we don't need to be at the byte boundary

		let res = 0;
		let i0 = this.#pos;

		for (let i = this.#pos + 1; i <= this.#pos + n; i++) {
			if (i % 8 == 0) {
				const nPart = i - i0;

				res += imask(this.#view[idiv(i, 8) - 1], i0 % 8, 8) << (n - nPart);

				i0 = i;
			} else if (i == this.#pos + n) {
				res += imask(this.#view[idiv(i, 8)], i0 % 8, i % 8);
			}
		}

		this.#pos += n;
		return res << leftShift;
	}

	/**
	 * Moves position to next byte boundary
     * @internal
	 * @param {boolean} force - if true then move to next byte boundary if already at byte boundary
	 */
	moveToByteBoundary(force = false) {
		if (this.#pos % 8 != 0) {
			let n = 8 - this.#pos % 8;

			void this.readBits(n);
		} else if (force) {
			this.readBits(8);
		}
	}

	/**
	 * Reads 8 bits
     * @internal
	 * @returns {number}
	 */
	readByte() {
		return this.readBits(8);
	}

	/**
	 * Dumps remaining bits we #pos isn't yet at end.
	 * This is intended for debugging use.
     * @internal
	 */
	dumpRemainingBits() {
		if (!this.eof()) {
			console.log("remaining bytes:");
			for (let first = true, i = idiv(this.#pos, 8); i < this.#view.length; first = false, i++) {
				if (first && this.#pos % 8 != 0) {
					console.log(byteToBitString(imask(this.#view[i], this.#pos % 8, 8) << 8 - this.#pos % 7));
				} else {
					console.log(byteToBitString(this.#view[i]));
				}
			}
		} else {
			console.log("eof");
		}
	}
}

/**
 * BitWriter turns a string of '0's and '1's into a list of bytes.
 * Finalization pads the bits using '0*1' if not yet aligned with the byte boundary.
 * @internal
 */
export class BitWriter {
	/**
	 * Concatenated and padded upon finalization
	 * @type {string[]}
	 */
	#parts;

	/**
	 * Number of bits written so far
	 * @type {number}
	 */
	#n;

	constructor() {
		this.#parts = [];
		this.#n = 0;
	}

	/**
     * @internal
	 * @type {number}
	 */
	get length() {
		return this.#n;
	}

	/**
	 * Write a string of '0's and '1's to the BitWriter.
     * @internal
	 * @param {string} bitChars
	 */
	write(bitChars) {
		for (let c of bitChars) {
			if (c != '0' && c != '1') {
				throw new Error("bit string contains invalid chars: " + bitChars);
			}
		}

		this.#parts.push(bitChars);
		this.#n += bitChars.length;
	}

	/**
     * @internal
	 * @param {number} byte
	 */
	writeByte(byte) {
		this.write(padZeroes(byte.toString(2), 8));
	}

	/**
	 * Add padding to the BitWriter in order to align with the byte boundary.
	 * If 'force == true' then 8 bits are added if the BitWriter is already aligned.
     * @internal
	 * @param {boolean} force 
	 */
	padToByteBoundary(force = false) {
		let nPad = 0;
		if (this.#n % 8 != 0) {
			nPad = 8 - this.#n % 8;
		} else if (force) {
			nPad = 8;
		}

		if (nPad != 0) {
			let padding = (new Array(nPad)).fill('0');
			padding[nPad - 1] = '1';

			this.#parts.push(padding.join(''));

			this.#n += nPad;
		}
	}

	/**
	 * Pop n bits of the end
	 * @param {number} n 
	 * @returns {string}
	 */
	pop(n) {
		assert(n <= this.#n, `too many bits to pop, only have ${this.#n} bits, but want ${n}`);
		const n0 = n;

		/**
		 * @type {string[]}
		 */
		const parts = [];

		while (n > 0) {
			const last = assertDefined(this.#parts.pop());

			if (last.length == 0) {
				continue;
			}

			if (last.length <= n) {
				parts.unshift(last);
				n -= last.length;
			} else {
				parts.unshift(last.slice(last.length - n));
				this.#parts.push(last.slice(0, last.length - n));
				n = 0;
			}
		}

		this.#n -= n0;

		const bits = parts.join('');
		assert(bits.length == n0);

		return bits;
	}

	/**
	 * Pads the BitWriter to align with the byte boundary and returns the resulting bytes.
     * @internal
	 * @param {boolean} force - force padding (will add one byte if already aligned)
	 * @returns {number[]}
	 */
	finalize(force = true) {
		this.padToByteBoundary(force);

		let chars = this.#parts.join('');

		let bytes = [];

		for (let i = 0; i < chars.length; i += 8) {
			let byteChars = chars.slice(i, i + 8);
			let byte = parseInt(byteChars, 2);

			bytes.push(byte);
		}

		return bytes;
	}
}

/**
 * Function that generates a random number between 0 and 1
 * @typedef {() => number} NumberGenerator
 */

/**
 * A Source instance wraps a string so we can use it cheaply as a reference inside a Site.
 * Also used by VSCode plugin
 * @internal
 */
export class Source {
	#raw;
	#name;
	#errors; // errors are collected into this object

	/**
	 * @param {string} raw 
	 * @param {string} name
	 */
	constructor(raw, name) {
		this.#raw = assertDefined(raw);
		this.#name = name;
		this.#errors = [];
	}

	/**
	 * @param {TransferUplcAst} other 
	 * @returns {any}
	 */
	transfer(other) {
		// errors don't need to be transfered
		return other.transferSource(
			this.#raw,
			this.#name	
		)
	}

    /**
     * @internal
     * @type {string}
     */
	get raw() {
		return this.#raw;
	}

    /**
     * @internal
     * @type {string}
     */
	get name() {
		return this.#name;
	}

	/**
	 * @type {Error[]}
	 */
	get errors() {
		return this.#errors;
	}

	throwErrors() {
		if (this.#errors.length > 0) {
			throw this.#errors[0];
		}
	}

	/**
	 * Get char from the underlying string.
	 * Should work fine utf-8 runes.
     * @internal
	 * @param {number} pos
	 * @returns {string}
	 */
	getChar(pos) {
		return this.#raw[pos];
	}
	
	/**
	 * Returns word under pos
     * @internal
	 * @param {number} pos 
	 * @returns {?string}
	 */
	getWord(pos) {
		/** @type {string[]} */
		const chars = [];

		/**
		 * @param {string | undefined} c 
		 * @returns {boolean}
		 */
		function isWordChar(c) {
			if (c === undefined) {
				return false;
			} else {
				return (c == '_' || (c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z'));
			}
		}

		let c = this.#raw[pos];
		while (isWordChar(c)) {
			chars.push(c);
			pos += 1;
			c = this.#raw[pos];
		}

		if (chars.length == 0) {
			return null;
		} else {
			return chars.join("");
		}
	}

    /**
     * @internal
     * @type {number}
     */
	get length() {
		return this.#raw.length;
	}

	/**
	 * Calculates the line number of the line where the given character is located (0-based).
     * @internal
	 * @param {number} pos 
	 * @returns {number}
	 */
	posToLine(pos) {
		let line = 0;
		for (let i = 0; i < pos; i++) {
			if (this.#raw[i] == '\n') {
				line += 1;
			}
		}

		return line;
	}

	/**
	 * Calculates the column and line number where the given character is located (0-based).
     * @internal
	 * @param {number} pos
	 * @returns {[number, number]}
	 */
	// returns [col, line]
	posToLineAndCol(pos) {
		let col = 0;
		let line = 0;
		for (let i = 0; i < pos; i++) {
			if (this.#raw[i] == '\n') {
				col = 0;
				line += 1;
			} else {
				col += 1;
			}
		}

		return [line, col];
	}

	/**
	 * Creates a more human-readable version of the source by prepending the line-numbers to each line.
	 * The line-numbers are at least two digits.
	 * @example
	 * (new Source("hello\nworld")).pretty() => "01  hello\n02  world"
     * @internal
	 * @returns {string}
	 */
	pretty() {
		const lines = this.#raw.split("\n");

		const nLines = lines.length;
		const nDigits = Math.max(Math.ceil(Math.log10(nLines)), 2); // line-number is at least two digits

		for (let i = 0; i < nLines; i++) {
			lines[i] = String(i + 1).padStart(nDigits, '0') + "  " + lines[i];
		}

		return lines.join("\n");
	}
}

/**
 * A tag function for a helios source.
 * Is just a marker so IDE support can work on literal helios sources inside javascript/typescript files.
 * @example
 * hl`hello ${"world"}!` => "hello world!"
 * @param {string[]} a 
 * @param  {...any} b 
 * @returns {string}
 */
export function hl(a, ...b) {
	return a.map((part, i) => {
		if (i < b.length) {
			return part + b[i].toString();
		} else {
			return part;
		}
	}).join("");
}

/**
 * Display a warning message that a certain feature will be deprecated at some point in the future.
 * @internal
 * @param {string} feature
 * @param {string} futureVersion
 * @param {string} alternative
 * @param {string} docUrl
 */
export function deprecationWarning(feature, futureVersion, alternative, docUrl = "") {
	let msg = `${feature} is DEPRECATED, and will be removed from version ${futureVersion} onwards!
${alternative}`;

	if (docUrl != "") {
		msg += `\n(for more information: ${docUrl})`;
	}

	console.warn(msg);
}
