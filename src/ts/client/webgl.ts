import { mergeShader, spriteShader, paletteLayersShader, lightShader } from '../generated/shaders';
import { FrameBuffer, disposeFrameBuffer, createFrameBuffer } from '../graphics/webgl/frameBuffer';
import { CommonPalettes, PaletteManager, Camera } from '../common/interfaces';
import { Shader, ShaderProgramData, disposeShaderProgramData } from '../graphics/webgl/shader';
import { PaletteSpriteBatch } from '../graphics/paletteSpriteBatch';
import { getWebGLContext, unbindAllTexturesAndBuffers } from '../graphics/webgl/webglUtils';
import { createCommonPalettes } from '../graphics/graphicsUtils';
import { createTexturesForSpriteSheets, disposeTexturesForSpriteSheets } from '../graphics/spriteSheetUtils';
import * as sprites from '../generated/sprites';
import { SpriteBatch } from '../graphics/spriteBatch';
import { BATCH_VERTEX_CAPACITY_MAX } from '../common/constants';

export interface WebGL {
	gl: WebGLRenderingContext;
	frameBuffer?: FrameBuffer;
	frameBuffer2?: FrameBuffer;
	mergeShader: ShaderProgramData;
	paletteShader: ShaderProgramData;
	paletteShaderWithDepth: ShaderProgramData;
	spriteShader: ShaderProgramData;
	spriteShaderWithColor: ShaderProgramData;
	lightShader: ShaderProgramData;
	spriteBatch: SpriteBatch;
	paletteBatch: PaletteSpriteBatch;
	palettes: CommonPalettes;
	failedFBO: boolean;
	failedDepthBuffer: boolean;
	renderer: string;
	indexBuffer: WebGLBuffer;
}

const mergeShaderSource = mergeShader;
const spriteShaderSource = spriteShader;
const paletteShaderSource = paletteLayersShader;
const lightShaderSource = lightShader;

function createIndices(vertexCount: number) {
	const numIndices = (vertexCount * 6 / 4) | 0;
	const indices = new Uint16Array(numIndices);

	for (let i = 0, j = 0; i < numIndices; j = (j + 4) | 0) {
		indices[i++] = (j + 0) | 0;
		indices[i++] = (j + 1) | 0;
		indices[i++] = (j + 2) | 0;
		indices[i++] = (j + 0) | 0;
		indices[i++] = (j + 2) | 0;
		indices[i++] = (j + 3) | 0;
	}

	return indices;
}

export function initWebGL(canvas: HTMLCanvasElement, paletteManager: PaletteManager, camera: Camera): WebGL {
	const gl = getWebGLContext(canvas);
	return initWebGLResources(gl, paletteManager, camera);
}

export function initWebGLResources(gl: WebGLRenderingContext, paletteManager: PaletteManager, camera: Camera): WebGL {
	let renderer = '';
	let failedFBO = false;
	let failedDepthBuffer = false;
	let frameBuffer = {} as FrameBuffer;
	let frameBuffer2 = {} as FrameBuffer;

	gl.enable(gl.DEPTH_TEST); // no reason to not have it enabled at all times, depth reads/writes are controlled by other parameters
	gl.disable(gl.DITHER);

	try {
		createFrameBuffer(gl, frameBuffer, camera.w, camera.h, true, null);
		createFrameBuffer(gl, frameBuffer2, camera.w, camera.h, false, frameBuffer.depthStencilRenderbuffer);
	} catch (e) {
		DEVELOPMENT && console.warn(e);
		failedFBO = true;
		failedDepthBuffer = true;
	}

	if (!failedFBO) {
		failedDepthBuffer = frameBuffer!.depthStencilRenderbuffer === null;
	}

	createTexturesForSpriteSheets(gl, sprites.spriteSheets);
	const palettes = createCommonPalettes(paletteManager);

	const mergeShaderRaw = new Shader(mergeShaderSource);
	const paletteShaderRaw = new Shader(paletteShaderSource);
	const spriteShaderRaw = new Shader(spriteShaderSource);
	const lightShaderRaw = new Shader(lightShaderSource);

	const indexBuffer = gl.createBuffer();
	if (!indexBuffer) {
		throw new Error(`Failed to allocate index buffer`);
	}
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, createIndices(BATCH_VERTEX_CAPACITY_MAX), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	const spriteBatch = new SpriteBatch(gl, BATCH_VERTEX_CAPACITY_MAX, indexBuffer);
	const paletteBatch = new PaletteSpriteBatch(gl, BATCH_VERTEX_CAPACITY_MAX, indexBuffer);
	spriteBatch.rectSprite = sprites.pixel;
	paletteBatch.rectSprite = sprites.pixel2;
	paletteBatch.defaultPalette = palettes.defaultPalette;

	paletteManager.init(gl);

	const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

	if (debugInfo) {
		renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
	}

	const mergeShader = mergeShaderRaw.compile(gl, []);
	const paletteShader = paletteShaderRaw.compile(gl, []);
	const paletteShaderWithDepth = paletteShaderRaw.compile(gl, ['DEPTH_BUFFERED']);
	const spriteShader = spriteShaderRaw.compile(gl, []);
	const spriteShaderWithColor = spriteShaderRaw.compile(gl, ['USE_COLOR']);
	const lightShader = lightShaderRaw.compile(gl, []);

	return {
		gl, mergeShader: mergeShader, paletteShader: paletteShader, paletteShaderWithDepth: paletteShaderWithDepth,
		spriteShader: spriteShader, spriteShaderWithColor: spriteShaderWithColor, lightShader: lightShader,
		spriteBatch, paletteBatch, frameBuffer, frameBuffer2, palettes, failedFBO, failedDepthBuffer, renderer, indexBuffer
	};
}

export function disposeWebGL(webgl: WebGL) {
	const { gl } = webgl;

	unbindAllTexturesAndBuffers(gl);
	disposeTexturesForSpriteSheets(gl, sprites.spriteSheets);
	disposeFrameBuffer(gl, webgl.frameBuffer);
	disposeShaderProgramData(gl, webgl.paletteShader);
	disposeShaderProgramData(gl, webgl.paletteShaderWithDepth);
	disposeShaderProgramData(gl, webgl.spriteShader);
	disposeShaderProgramData(gl, webgl.spriteShaderWithColor);
	disposeShaderProgramData(gl, webgl.lightShader);
	webgl.spriteBatch.dispose();
	webgl.paletteBatch.dispose();
	gl.deleteBuffer(webgl.indexBuffer);
}
