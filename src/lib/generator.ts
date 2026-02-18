// Bookmarklet code generator: minifies, wraps in IIFE, encodes, and injects external resources
import { minify } from 'terser';

export interface GenerateOptions {
	code: string;
	name: string;
	externalScripts: string;
	externalStyles: string;
	shouldMinify: boolean;
	shouldWrapIIFE: boolean;
	shouldEncode: boolean;
}

export interface GenerateResult {
	bookmarkletCode: string;
	originalSize: number;
	compressedSize: number;
	reduction: number;
}

// Transform user code into a javascript: bookmarklet URL with optional minification, IIFE wrapping, encoding, and external resource injection
export async function generateBookmarklet(options: GenerateOptions): Promise<GenerateResult> {
	const { code, externalScripts, externalStyles, shouldMinify, shouldWrapIIFE, shouldEncode } =
		options;

	const scripts = externalScripts.split('\n').filter((s) => s.trim());
	const styles = externalStyles.split('\n').filter((s) => s.trim());

	let finalCode = code;

	if (styles.length > 0) {
		let styleCode = '';
		for (const styleUrl of styles) {
			const loadOnce = styleUrl.includes('!loadOnce');
			const url = styleUrl.replace('!loadOnce', '').trim();
			const id = `bm_style_${btoa(url).substring(0, 8)}`;

			if (loadOnce) styleCode += `if(!document.getElementById("${id}")){`;
			styleCode += `var l=document.createElement("link");`;
			if (loadOnce) styleCode += `l.id="${id}";`;
			styleCode += `l.rel="stylesheet";l.href="${url}";document.head.appendChild(l);`;
			if (loadOnce) styleCode += `}`;
		}
		finalCode = styleCode + finalCode;
	}

	if (scripts.length > 0) {
		for (const scriptUrl of [...scripts].reverse()) {
			const loadOnce = scriptUrl.includes('!loadOnce');
			const url = scriptUrl.replace('!loadOnce', '').trim();
			const id = `bm_script_${btoa(url).substring(0, 8)}`;

			let scriptCode = '';
			if (loadOnce) scriptCode = `if(!document.getElementById("${id}")){`;
			scriptCode += `var s=document.createElement("script");`;
			if (loadOnce) scriptCode += `s.id="${id}";`;
			scriptCode += `s.src="${url}";s.onload=function(){${finalCode}};document.body.appendChild(s);`;
			if (loadOnce) scriptCode += `}else{(${finalCode})()}`;

			finalCode = scriptCode;
		}
	}

	const originalSize = finalCode.length;

	if (shouldMinify) {
		const result = await minify(finalCode, { mangle: { toplevel: false } });
		if (result.code) finalCode = result.code;
	}

	if (shouldWrapIIFE) finalCode = `(function(){${finalCode}})()`;

	finalCode = shouldEncode
		? `javascript:${encodeURIComponent(finalCode)}`
		: `javascript:${finalCode}`;

	const compressedSize = finalCode.length;
	const reduction = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

	return { bookmarkletCode: finalCode, originalSize, compressedSize, reduction };
}
