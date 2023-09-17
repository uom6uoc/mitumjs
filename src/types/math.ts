import bigInt from "big-integer"
import Int64 from "int64-buffer"

import { IBuffer, IString } from "../types"
import { Assert, ECODE, MitumError } from "../error"

export class Big implements IBuffer, IString {
	readonly big: bigint

	constructor(big: string | number | Buffer | BigInt | Uint8Array) {
		switch (typeof big) {
			case "number":
			case "string":
			case "bigint":
				this.big = BigInt(big)
				break
			case "object":
				if (big instanceof Buffer || big instanceof Uint8Array) {
					this.big = this.bufferToBig(big)
				} else {
					throw MitumError.detail(ECODE.INVALID_BIG_INTEGER, "wrong big")
				}
				break
			default:
				throw MitumError.detail(ECODE.INVALID_BIG_INTEGER, "wrong big")
		}
	}

	static from(big: string | number | Buffer | BigInt | Uint8Array | Big) {
		return big instanceof Big ? big : new Big(big)
	}

	private bufferToBig(big: Buffer | Uint8Array): bigint {
		const res: string[] = []

		Uint8Array.from(big).forEach((n) => {
			let s = n.toString(16)
			s.length % 2 ? res.push("0" + s) : res.push(s)
		})

		return BigInt("0x" + res.join(""))
	}

	toBuffer(option?: "fill"): Buffer {
		const size = this.byteLen()

		if (option === "fill") {
			Assert.check(
				size <= 8,
				MitumError.detail(ECODE.INVALID_BIG_INTEGER, "big out of range")
			)

			return Buffer.from(new Int64.Uint64LE(this.toString()).toBuffer())
		}

		const buf = new Uint8Array(size)

		let n = bigInt(this.big)
		for (let i = size - 1; i >= 0; i--) {
			buf[i] = n.mod(256).valueOf()
			n = n.divide(256)
		}

		return Buffer.from(buf)
	}

	byteLen(): number {
		const bitLen = bigInt(this.big).bitLength()
		const quotient = bigInt(bitLen).divide(8)

		if (bitLen.valueOf() - quotient.valueOf() * 8 > 0) {
			return quotient.valueOf() + 1
		}

		return quotient.valueOf()
	}

	get v(): number {
		if (this.big <= BigInt(Number.MAX_SAFE_INTEGER)) {
			return parseInt(this.toString())
		}
		return -1
	}

	toString(): string {
		return this.big.toString()
	}

	isZero(): boolean {
		return this.big < 1
	}
}

export class Float implements IBuffer, IString {
	readonly n: number

	constructor(n: number) {
		this.n = n
	}

	static from(n: number | Float) {
		return n instanceof Float ? n : new Float(n)
	}

	toBuffer(): Buffer {
		const b = Buffer.allocUnsafe(8)
		b.writeDoubleBE(this.n)
		return b
	}

	toString(): string {
		return "" + this.n
	}
}

export class Uint8 implements IBuffer, IString {
	readonly n: number

	constructor(n: number) {
		Assert.check(
			0 <= n && n <= 255,
			MitumError.detail(ECODE.INVALID_UINT8, "uint8 out of range")
		)
		this.n = n
	}

	static from(n: number | Uint8) {
		return n instanceof Uint8 ? n : new Uint8(n)
	}

	toBuffer(): Buffer {
		const buffer = Buffer.alloc(1)
		buffer.writeUint8(this.n, 0)
		return buffer
	}

	get v(): number {
		return this.n
	}

	toString(): string {
		return this.n.toString()
	}
}

export class Bool implements IBuffer, IString {
	private b: boolean

	constructor(b: boolean) {
		this.b = b
	}

	static from(b: boolean | Bool) {
		return b instanceof Bool ? b : new Bool(b)
	}

	toBuffer(): Buffer {
		return this.b ? Buffer.from([1]) : Buffer.from([0])
	}

	get v(): boolean {
		return this.b
	}
}
