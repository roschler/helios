#!/usr/bin/env node

// strip statements containing @internal in the preceding comment block

import { readFileSync, writeFileSync } from "fs"
import { correctDir } from "./util.js"

const ORIG_FILE = "../helios.js"
const INPUT_FILE = "../helios-internal.d.ts"
const OUTPUT_FILE = "../helios.d.ts"
const TAB = "    "

function extractTypedefName(src) {
	const re = /^\s*\*\s*@typedef\s*(\{[\s\S]*\}\s*)?([a-zA-Z][a-zA-Z0-9_]*)/m

	const m = src.match(re)

	if (m) {
		return m[2]
	} else {
		return null
	}
}

function extractExportedName(src) {
	const re = /^\s*export\s*[a-z]+\s*([a-zA-Z][a-zA-Z0-9_]*)/m

	const m = src.match(re)

	if (m) {
		return m[1]
	} else {
		return null
	}
}

function findInternalNames(src) {
	const lines = src.split("\n")

	const internalNames = new Set()

	// first search for all internal typedefs
	let start = -1
	let isInternal = false

	lines.forEach((line, i) => {
		line = line.trim()

		if (start == -1) {
			if (line.startsWith("/**")) {
				start = i
				isInternal = false
			}
		} else {
			if (line.startsWith("* @internal")) {
				isInternal = true
			} else if (line.startsWith("*/")) {
				if (isInternal) {
					const name = extractTypedefName(lines.slice(start, i+1).join("\n"))

					if (name) {
						internalNames.add(name)
					} else {
						const name = extractExportedName(lines[i+1])
						
						if (name) {
							internalNames.add(name)
						}
					}
				}
				start = -1
			}
		}
	})

	return internalNames
}

function hideInternalNames(src, internalNames) {
	const lines = src.split("\n")
	
	lines.forEach((line, i) => {
		const m = line.match(/^\s*export\s*([a-z]+)\s*([a-zA-Z][a-zA-Z0-9_]*)/m)

		if (m) {
			const kind = m[1]
			const name = m[2]

			if (internalNames.has(name)) {
				lines[i] = line.replace(/(\s*)(export\s*)/, "$1")
			}
		}
	})

	return lines.join("\n")
}

function hideInternalMethods(src) {
	const lines = src.split("\n")
	const keep = (new Array(lines.length)).fill(true)

	let insideExportedClass = false
	let docletStart = -1
	let isInternal = false

	lines.forEach((line, i) => {
		if (!insideExportedClass) {
			if (line.startsWith(`${TAB}export class`)) {
				insideExportedClass = true
				docletStart = -1
				isInternal = false
			}
		} else {
			if (line.startsWith(`${TAB}}`)) {
				insideExportedClass = false
				docletStart = -1
				isInternal = false
			} else if (docletStart == -1) {
				if (line.startsWith(`${TAB}${TAB}/**`)) { // must be precisely 4 spaces
					docletStart = i
					isInternal = false
				}
			} else {
				if (line.trim().startsWith("* @internal")) {
					isInternal = true
				} else if (line.trim().startsWith("*/")) {
					if (isInternal && lines[i+1].match(/\s*[a-zA-Z_]/)) {
					
						for (let j = docletStart; j <= i+1; j++) {
							keep[j] = false
						}

						isInternal = false
					}

					docletStart = -1
				}
			}
		}
	})

	return lines.filter((l, i) => keep[i]).join("\n")
}

function hideOuterDeclaration(src) {
	const lines = src.split("\n")

	lines[0] = ""

	lines[lines.length-2] = ""

	return lines.join("\n")
}

async function main() {
	correctDir()

	const internalNames = findInternalNames(readFileSync(ORIG_FILE).toString())

	let src = readFileSync(INPUT_FILE).toString()

	src = hideInternalNames(src, internalNames)

	src = hideInternalMethods(src)

	src = hideOuterDeclaration(src)

	writeFileSync(OUTPUT_FILE, src)
}

main()
