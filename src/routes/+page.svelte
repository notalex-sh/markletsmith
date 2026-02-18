<!-- Main page: bookmarklet editor UI with code input, options, output, and sidebar guide -->
<script lang="ts">
	import { onMount } from 'svelte';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import { generateBookmarklet, type GenerateResult } from '$lib/generator';

	let bookmarkletName = $state('');
	let code = $state('');
	let externalScripts = $state('');
	let externalStyles = $state('');
	let shouldMinify = $state(true);
	let shouldWrapIIFE = $state(true);
	let shouldEncode = $state(true);

	let isLoading = $state(false);
	let result: GenerateResult | null = $state(null);
	let error: string | null = $state(null);
	let showOutput = $state(false);
	let toastVisible = $state(false);
	let toastMessage = $state('Copied to clipboard');
	let mounted = $state(false);

	// Run the bookmarklet generator with a brief loading delay for UX feedback
	async function handleGenerate() {
		isLoading = true;
		error = null;
		showOutput = true;

		try {
			await new Promise((resolve) => setTimeout(resolve, 400));
			result = await generateBookmarklet({
				code,
				name: bookmarkletName || 'Bookmarklet',
				externalScripts,
				externalStyles,
				shouldMinify,
				shouldWrapIIFE,
				shouldEncode
			});
		} catch (err) {
			error = `Minification error: ${err}`;
			result = null;
		} finally {
			isLoading = false;
		}
	}

	// Copy the generated bookmarklet code to the clipboard
	function copyCode() {
		if (!result) return;
		navigator.clipboard.writeText(result.bookmarkletCode).then(() => {
			showToast('Copied to clipboard');
		});
	}

	// Display a temporary toast notification that auto-dismisses after 2 seconds
	function showToast(msg: string) {
		toastMessage = msg;
		toastVisible = true;
		setTimeout(() => {
			toastVisible = false;
		}, 2000);
	}

	onMount(() => {
		mounted = true;
	});
</script>

<svelte:head>
	<title>Markletsmith</title>
	<meta name="description" content="Bookmarklet forge - build, minify, and deploy JavaScript bookmarklets" />
</svelte:head>

<div class="app">
	<div class="scanline"></div>
	<div class="grid-bg"></div>

	<div class="container" class:mounted>
		<header class="header">
			<img src="/logo.png" alt="markletsmith logo" class="header-logo" />
			<div>
				<h1 class="title">markletsmith</h1>
				<p class="subtitle">bookmarklet forge</p>
			</div>
		</header>

		<div class="layout">
			<div class="main-col">
								<div class="card" style="animation-delay: 0.1s">
					<div class="toolbar">
						<div class="toolbar-name">
							<label class="label" for="bm-name">NAME</label>
							<input
								id="bm-name"
								type="text"
								class="input input-sm"
								bind:value={bookmarkletName}
								placeholder="my-script"
							/>
						</div>
						<div class="toggles">
							<label class="toggle-label">
								<input type="checkbox" bind:checked={shouldMinify} />
								<span class="toggle-track"><span class="toggle-knob"></span></span>
								<span class="toggle-text">minify</span>
							</label>
							<label class="toggle-label">
								<input type="checkbox" bind:checked={shouldWrapIIFE} />
								<span class="toggle-track"><span class="toggle-knob"></span></span>
								<span class="toggle-text">iife</span>
							</label>
							<label class="toggle-label">
								<input type="checkbox" bind:checked={shouldEncode} />
								<span class="toggle-track"><span class="toggle-knob"></span></span>
								<span class="toggle-text">encode</span>
							</label>
						</div>
					</div>

					<div class="field">
						<span class="label">CODE</span>
						<CodeEditor bind:value={code} />
						<p class="hint">Write JavaScript here, then hit generate. Test in devtools first.</p>
					</div>

					<div class="ext-grid">
						<div class="field">
							<label class="label" for="ext-scripts">EXTERNAL SCRIPTS</label>
							<textarea
								id="ext-scripts"
								class="input textarea"
								bind:value={externalScripts}
								placeholder="https://cdn.example.com/lib.js"
							></textarea>
						</div>
						<div class="field">
							<label class="label" for="ext-styles">EXTERNAL STYLES</label>
							<textarea
								id="ext-styles"
								class="input textarea"
								bind:value={externalStyles}
								placeholder="https://cdn.example.com/style.css"
							></textarea>
						</div>
					</div>

					<button
						class="btn-generate"
						onclick={handleGenerate}
						disabled={isLoading}
					>
						{#if isLoading}
							<span class="spinner"></span>
							generating...
						{:else}
							<span class="bolt">&gt;</span> generate
						{/if}
					</button>
				</div>

								{#if showOutput}
					<div class="card output-card" style="animation-delay: 0.2s">
						{#if isLoading}
							<div class="loading">
								<div class="loader"></div>
								<p>forging bookmarklet...</p>
							</div>
						{:else if error}
							<div class="error-msg">{error}</div>
						{:else if result}
							<div class="card-header">
								<span class="card-icon">[ok]</span>
								<span>output</span>
							</div>

							<div class="output-section">
								<p class="drag-hint">Drag to bookmarks bar:</p>
								<a
									class="bookmarklet-link"
									href={result.bookmarkletCode}
									title="Drag me to your bookmarks bar"
								>
									<span class="bm-icon">#</span>
									{bookmarkletName || 'Bookmarklet'}
								</a>
							</div>

							<div class="output-section">
								<div class="output-header">
									<span class="label">BOOKMARKLET CODE</span>
									<button class="btn-copy" onclick={copyCode}>copy</button>
								</div>
								<div class="code-output">{result.bookmarkletCode}</div>
							</div>

							<div class="stats">
								<div class="stat">
									<span class="stat-label">original</span>
									<span class="stat-value">{result.originalSize}b</span>
								</div>
								<div class="stat">
									<span class="stat-label">compressed</span>
									<span class="stat-value accent">{result.compressedSize}b</span>
								</div>
								<div class="stat">
									<span class="stat-label">reduction</span>
									<span class="stat-value success">{result.reduction}%</span>
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>

						<div class="sidebar">
				<div class="card" style="animation-delay: 0.3s">
					<div class="card-header">
						<span class="card-icon">?</span>
						<span>how it works</span>
					</div>

					<div class="guide-section">
						<h4>what is a bookmarklet?</h4>
						<p class="guide-desc">A bookmarklet is a small piece of JavaScript saved as a browser bookmark. Click it on any page and it runs your code on that page.</p>
					</div>

					<div class="guide-section">
						<h4>1. write your code</h4>
						<p class="guide-desc">Write any JavaScript in the editor. It will run on whatever page you activate the bookmarklet from.</p>
					</div>

					<div class="guide-section">
						<h4>2. hit generate</h4>
						<p class="guide-desc">Your code gets minified, wrapped in an IIFE to avoid polluting the page, and encoded into a <code>javascript:</code> URL.</p>
					</div>

					<div class="guide-section">
						<h4>3. drag to bookmarks bar</h4>
						<p class="guide-desc">Drag the output button to your browser's bookmarks bar. Click it on any page to run your script.</p>
					</div>

					<div class="guide-section">
						<h4>options</h4>
						<ul class="guide-list">
							<li><span class="bullet">&gt;</span> <strong>minify</strong> — shrink code with terser</li>
							<li><span class="bullet">&gt;</span> <strong>iife</strong> — wrap in a function to prevent variable leaks</li>
							<li><span class="bullet">&gt;</span> <strong>encode</strong> — URI-encode for browser compatibility</li>
						</ul>
					</div>

					<div class="guide-section hide-mobile">
						<h4>external resources</h4>
						<p class="guide-desc">Load CDN scripts/styles. Prefix with <code>!loadOnce</code> to prevent duplicate injection:</p>
						<pre><code>!loadOnce https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js</code></pre>
					</div>

					<div class="guide-section">
						<h4>tips</h4>
						<ul class="guide-list">
							<li><span class="check">+</span> keep code under 2000 chars</li>
							<li><span class="check">+</span> test in devtools console first</li>
							<li><span class="check">+</span> use const/let, not var</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>

		<div class="toast" class:show={toastVisible}>
		<span class="toast-check">+</span> {toastMessage}
	</div>
</div>

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		background: #000;
		color: #c8c8c8;
		font-family: 'JetBrains Mono', monospace;
		min-height: 100vh;
		overflow-x: hidden;
	}

	:global(::selection) {
		background: rgba(100, 160, 255, 0.25);
		color: #fff;
	}

	:global(::-webkit-scrollbar) {
		width: 6px;
		height: 6px;
	}
	:global(::-webkit-scrollbar-track) {
		background: #0a0a0a;
	}
	:global(::-webkit-scrollbar-thumb) {
		background: #333;
		border-radius: 3px;
	}
	:global(::-webkit-scrollbar-thumb:hover) {
		background: #555;
	}

	.app {
		position: relative;
		min-height: 100vh;
	}

	.scanline {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: repeating-linear-gradient(
			0deg,
			transparent,
			transparent 2px,
			rgba(255, 255, 255, 0.006) 2px,
			rgba(255, 255, 255, 0.006) 4px
		);
		pointer-events: none;
		z-index: 100;
		animation: scanlineScroll 8s linear infinite;
	}

	@keyframes scanlineScroll {
		0% { background-position: 0 0; }
		100% { background-position: 0 100px; }
	}

	.grid-bg {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
		background-size: 40px 40px;
		pointer-events: none;
		z-index: 0;
	}

	.container {
		position: relative;
		z-index: 1;
		max-width: 1100px;
		margin: 0 auto;
		padding: 20px 16px;
		opacity: 0;
		transform: translateY(10px);
		transition: opacity 0.6s ease, transform 0.6s ease;
	}

	.container.mounted {
		opacity: 1;
		transform: translateY(0);
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		margin-bottom: 20px;
		animation: fadeIn 0.8s ease forwards;
	}

	.header-logo {
		width: 40px;
		height: auto;
		opacity: 0.85;
		filter: drop-shadow(0 0 6px rgba(122, 162, 212, 0.3));
		transition: filter 0.3s, opacity 0.3s;
	}

	.header-logo:hover {
		opacity: 1;
		filter: drop-shadow(0 0 10px rgba(122, 162, 212, 0.5));
	}

	.title {
		font-size: clamp(20px, 3.5vw, 28px);
		font-weight: 400;
		letter-spacing: 2px;
		color: #e0e0e0;
		line-height: 1;
		margin-bottom: 4px;
	}

	.subtitle {
		font-size: 10px;
		color: #555;
		font-weight: 400;
		letter-spacing: 3px;
		text-transform: uppercase;
	}

	.layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 14px;
	}

	@media (min-width: 1024px) {
		.layout {
			grid-template-columns: 5fr 2fr;
		}
	}

	.main-col {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.card {
		background: #0a0a0a;
		border: 1px solid #1e1e1e;
		padding: 16px;
		position: relative;
		animation: slideUp 0.5s ease forwards;
		opacity: 0;
		transition: border-color 0.3s;
	}

	.card:hover {
		border-color: #2a2a2a;
	}

	.card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(100, 160, 255, 0.15), transparent);
		opacity: 0;
		transition: opacity 0.3s;
	}

	.card:hover::before {
		opacity: 1;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 12px;
		font-size: 13px;
		font-weight: 600;
		color: #e0e0e0;
		text-transform: lowercase;
		letter-spacing: 1px;
	}

	.card-icon {
		color: #7aa2d4;
		font-weight: 400;
	}

	.toolbar {
		display: flex;
		align-items: flex-end;
		gap: 16px;
		margin-bottom: 12px;
		flex-wrap: wrap;
	}

	.toolbar-name {
		flex: 1;
		min-width: 140px;
	}

	.field {
		margin-bottom: 12px;
	}

	.label {
		display: block;
		font-size: 10px;
		color: #777;
		font-weight: 600;
		letter-spacing: 2px;
		margin-bottom: 5px;
	}

	.input {
		width: 100%;
		background: #070707;
		border: 1px solid #1e1e1e;
		color: #d0d0d0;
		padding: 8px 10px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 13px;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.input:focus {
		outline: none;
		border-color: #4a7ab5;
		box-shadow: 0 0 0 1px rgba(100, 160, 255, 0.15);
	}

	.input::placeholder {
		color: #3a3a3a;
	}

	.input-sm {
		padding: 6px 10px;
	}

	.textarea {
		height: 64px;
		resize: vertical;
	}

	.hint {
		font-size: 10px;
		color: #555;
		margin-top: 4px;
	}

	.toggles {
		display: flex;
		gap: 14px;
		flex-wrap: wrap;
		align-items: center;
		padding-bottom: 2px;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: 6px;
		cursor: pointer;
		user-select: none;
	}

	.toggle-label input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-track {
		position: relative;
		width: 32px;
		height: 16px;
		background: #1a1a1a;
		border: 1px solid #2a2a2a;
		display: flex;
		align-items: center;
		transition: background 0.3s, border-color 0.3s;
		border-radius: 1px;
	}

	.toggle-knob {
		position: absolute;
		left: 2px;
		width: 10px;
		height: 10px;
		background: #555;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s;
	}

	.toggle-label input:checked + .toggle-track {
		background: #1a2a3a;
		border-color: #4a7ab5;
	}

	.toggle-label input:checked + .toggle-track .toggle-knob {
		transform: translateX(14px);
		background: #7aa2d4;
	}

	.toggle-text {
		font-size: 11px;
		color: #666;
		transition: color 0.2s;
	}

	.toggle-label input:checked ~ .toggle-text {
		color: #aaa;
	}

	.ext-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
		margin-bottom: 12px;
	}

	@media (min-width: 640px) {
		.ext-grid {
			grid-template-columns: 1fr 1fr;
		}
		.ext-grid .field {
			margin-bottom: 0;
		}
	}

	.btn-generate {
		width: 100%;
		background: #e8e8e8;
		color: #000;
		border: none;
		padding: 11px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 1px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		transition: all 0.2s;
		text-transform: lowercase;
		position: relative;
		overflow: hidden;
	}

	.btn-generate::after {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.05), transparent);
		transition: left 0.5s;
	}

	.btn-generate:hover::after {
		left: 100%;
	}

	.btn-generate:hover {
		background: #fff;
		box-shadow: 0 0 16px rgba(255, 255, 255, 0.08);
	}

	.btn-generate:active {
		transform: scale(0.99);
	}

	.btn-generate:disabled {
		background: #1a1a1a;
		color: #555;
		cursor: not-allowed;
	}

	.bolt {
		font-weight: 400;
		color: #999;
	}

	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid #444;
		border-top-color: #888;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.output-card {
		animation: slideUp 0.4s ease forwards !important;
	}

	.loading {
		text-align: center;
		padding: 24px 0;
	}

	.loader {
		width: 20px;
		height: 20px;
		border: 2px dashed #555;
		border-radius: 50%;
		animation: spin 2s linear infinite;
		margin: 0 auto 10px;
	}

	.loading p {
		color: #666;
		font-size: 11px;
	}

	.error-msg {
		color: #e06060;
		font-size: 11px;
		padding: 12px;
		border-left: 2px solid #e06060;
		background: #100808;
	}

	.output-section {
		margin-bottom: 14px;
	}

	.drag-hint {
		font-size: 10px;
		color: #666;
		margin-bottom: 6px;
	}

	.bookmarklet-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: #e8e8e8;
		color: #000;
		padding: 10px 20px;
		text-decoration: none;
		font-weight: 700;
		font-size: 13px;
		font-family: 'JetBrains Mono', monospace;
		transition: all 0.3s;
		position: relative;
		overflow: hidden;
		letter-spacing: 0.5px;
	}

	.bookmarklet-link::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent);
		transition: left 0.6s;
	}

	.bookmarklet-link:hover::before {
		left: 100%;
	}

	.bookmarklet-link:hover {
		background: #fff;
		box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
		transform: translateY(-1px);
	}

	.bm-icon {
		color: #7aa2d4;
		font-weight: 400;
	}

	.output-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 6px;
	}

	.output-header .label {
		margin-bottom: 0;
	}

	.btn-copy {
		background: transparent;
		border: 1px solid #2a2a2a;
		color: #999;
		padding: 3px 10px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 10px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-copy:hover {
		background: #111;
		border-color: #4a7ab5;
		color: #d0d0d0;
	}

	.code-output {
		background: #050505;
		border: 1px solid #1e1e1e;
		padding: 10px;
		font-size: 11px;
		color: #888;
		word-break: break-all;
		max-height: 160px;
		overflow-y: auto;
		line-height: 1.6;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}

	.stat {
		background: #070707;
		border: 1px solid #1e1e1e;
		padding: 8px 10px;
		transition: border-color 0.2s;
	}

	.stat:hover {
		border-color: #2a2a2a;
	}

	.stat-label {
		display: block;
		font-size: 9px;
		color: #666;
		letter-spacing: 1px;
		margin-bottom: 2px;
	}

	.stat-value {
		font-size: 13px;
		font-weight: 700;
		color: #e0e0e0;
	}

	.stat-value.accent {
		color: #7aa2d4;
	}

	.stat-value.success {
		color: #7ab87a;
	}

	.sidebar .card {
		position: sticky;
		top: 20px;
	}

	.guide-section {
		background: #070707;
		border: 1px solid #181818;
		padding: 10px;
		margin-bottom: 6px;
		transition: border-color 0.2s;
	}

	.guide-section:last-child {
		margin-bottom: 0;
	}

	.guide-section:hover {
		border-color: #2a2a2a;
	}

	.guide-section h4 {
		font-size: 11px;
		color: #ccc;
		font-weight: 600;
		margin-bottom: 4px;
		letter-spacing: 0.5px;
	}

	.guide-desc {
		font-size: 10px;
		color: #777;
		margin-bottom: 6px;
	}

	.guide-section pre {
		background: #040404;
		border: 1px solid #181818;
		padding: 8px;
		overflow-x: auto;
		font-size: 10px;
		line-height: 1.5;
	}

	.guide-section code {
		color: #999;
		font-family: 'JetBrains Mono', monospace;
	}

	.guide-list {
		list-style: none;
	}

	.guide-list li {
		display: flex;
		align-items: flex-start;
		gap: 6px;
		font-size: 10px;
		color: #888;
		padding: 1px 0;
	}

	.guide-list :global(strong) {
		color: #bbb;
		font-weight: 600;
	}

	.bullet {
		color: #7aa2d4;
		font-weight: 700;
		flex-shrink: 0;
	}

	.check {
		color: #7ab87a;
		font-weight: 700;
		flex-shrink: 0;
	}

	.toast {
		position: fixed;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%) translateY(80px);
		background: #111;
		border: 1px solid #2a2a2a;
		color: #d0d0d0;
		padding: 8px 16px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		font-weight: 500;
		opacity: 0;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 200;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.toast.show {
		transform: translateX(-50%) translateY(0);
		opacity: 1;
	}

	.toast-check {
		color: #7ab87a;
		font-weight: 700;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@media (max-width: 768px) {
		.container {
			padding: 14px 10px;
		}

		.toolbar {
			flex-direction: column;
			align-items: stretch;
			gap: 10px;
		}

		.toggles {
			gap: 10px;
		}

		.hide-mobile {
			display: none;
		}

		.stats {
			grid-template-columns: 1fr;
		}
	}

	@media (min-width: 769px) {
		.container {
			padding: 28px 24px;
		}
	}
</style>
