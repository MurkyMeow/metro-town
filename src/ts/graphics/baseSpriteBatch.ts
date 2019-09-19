import { Sprite, Batch, SpriteBatchBase } from '../common/interfaces';
import { WHITE } from '../common/colors';
import { colorToFloat, colorToFloatAlpha } from '../common/color';
import { BaseStateBatch } from './baseStateBatch';
import { VAO, createVAO } from './webgl/glVao';
import { VAOAttributeDefinition, getVAOAttributesSize, createVAOAttributes } from './webgl/vaoAttributes';
import { timeStart, timeEnd } from '../client/timing';
import { isIdentity } from '../common/mat2d';

// const BATCH_BUFFER_SIZE = 2048; // 8kb
// const BATCH_BUFFER_POOL_SIZE = 5;

// const pool: ArrayBuffer[] = [];

// function aquireBuffer(size: number): Float32Array | undefined {
// 	if (size <= BATCH_BUFFER_SIZE) {
// 		if (!pool.length) console.log('alloc');
// 		const buffer = pool.pop() || new ArrayBuffer(BATCH_BUFFER_SIZE);
// 		return new Float32Array(buffer, 0, size);
// 	} else {
// 		DEVELOPMENT && console.warn(`Failed to aquire buffer of size: ${size}`);
// 		return undefined;
// 	}
// }

// function releaseBuffer(buffer: Float32Array) {
// 	if (pool.length < BATCH_BUFFER_POOL_SIZE) {
// 		pool.push(buffer.buffer);
// 	} else {
// 		console.log('delete');
// 	}
// }

const WHITE_FLOAT = colorToFloat(WHITE);

export function getColorFloat(color: number, alpha: number) {
	return (color === WHITE && alpha === 1) ? WHITE_FLOAT : colorToFloatAlpha(color, alpha);
}

export abstract class BaseSpriteBatch extends BaseStateBatch implements SpriteBatchBase {
	depth = 1;
	drawnTrisStats = 0;
	flushes = 0;
	index = 0;
	spritesCount = 0;
	rectSprite: Sprite | undefined = undefined;
	vao: VAO | undefined;
	vertexBuffer: WebGLBuffer | undefined;
	protected indexBuffer: WebGLBuffer;
	protected vertices!: Float32Array;
	protected spritesCapacity: number;
	private floatsPerSprite: number;
	private batching = false;
	private startBatchIndex = 0;
	private startBatchSprites = 0;
	constructor(
		public gl: WebGLRenderingContext,
		public vertexCapacityMax: number,
		indexBuffer: WebGLBuffer,
		public attributes: VAOAttributeDefinition[],
	) {
		super();

		const bytesPerVertex = getVAOAttributesSize(gl, attributes);
		this.vertices = new Float32Array(vertexCapacityMax * bytesPerVertex);
		this.spritesCapacity = (vertexCapacityMax / 4) | 0; // 4 vertices per sprite
		this.floatsPerSprite = bytesPerVertex | 0; // bytesPerVertex * 4 / sizeof(float)

		const vertexBuffer = gl.createBuffer();
		if (!vertexBuffer) {
			throw new Error(`Failed to allocate vertex buffer`);
		}
		this.vertexBuffer = vertexBuffer;
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

		this.indexBuffer = indexBuffer;
		this.vao = createVAO(gl, createVAOAttributes(gl, attributes, vertexBuffer), indexBuffer);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	dispose() {
		disposeBuffers(this.gl, this);
	}
	begin() {
		if (!this.vao) {
			throw new Error('Disposed');
		}

		this.batching = false;
		this.vao.bind();
	}
	end() {
		if (!this.vao) {
			throw new Error('Disposed');
		}

		this.flush();
		this.vao.unbind();
	}
	drawBatch(batch: Batch) {
		if (DEVELOPMENT && !isIdentity(this.transform)) {
			throw new Error('Cannot transform batch');
		}

		const batchSpriteCount = (batch.length / this.floatsPerSprite) | 0;

		if (this.spritesCapacity < (this.spritesCount + batchSpriteCount)) {
			this.flush();
		}

		this.vertices.set(batch, this.index);
		this.index += batch.length;
		this.spritesCount += batchSpriteCount;
	}
	startBatch() {
		if (this.batching) {
			throw new Error('Cannot start new batch');
		}

		this.startBatchIndex = this.index;
		this.startBatchSprites = this.spritesCount;
		this.batching = true;
	}
	finishBatch(): Batch | undefined {
		if (!this.batching) {
			throw new Error('Cannot finish batch');
		}

		this.batching = false;

		try {
			// const batch = aquireBuffer(this.index - this.startBatchIndex);

			// if (batch) {
			// 	batch.set(this.vertices.subarray(this.startBatchIndex, this.index));
			// }

			// return batch;
			return this.vertices.slice(this.startBatchIndex, this.index);
		} catch {
			return undefined;
		}
	}
	releaseBatch(_batch: Batch) {
		// releaseBuffer(batch);
	}
	flush() {
		if (this.index === 0)
			return;

		if (!this.vao || !this.vertexBuffer) {
			throw new Error('Disposed');
		}

		const gl = this.gl;

		if (this.batching) {
			TIMING && timeStart('bufferSubData');
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices.subarray(0, this.startBatchIndex));
			TIMING && timeEnd();

			TIMING && timeStart('vao.draw');
			this.vao.draw(this.gl.TRIANGLES, this.startBatchSprites * 6, 0);
			TIMING && timeEnd();

			this.drawnTrisStats += this.startBatchSprites * 2;
			this.spritesCount -= this.startBatchSprites;
			this.index -= this.startBatchIndex;
			this.vertices.copyWithin(0, this.startBatchIndex, this.startBatchIndex + this.index);
			this.startBatchIndex = 0;
			this.startBatchSprites = 0;
		} else {
			TIMING && timeStart('bufferSubData');
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices.subarray(0, this.index));
			TIMING && timeEnd();

			TIMING && timeStart('vao.draw');
			this.vao.draw(this.gl.TRIANGLES, this.spritesCount * 6, 0);
			TIMING && timeEnd();

			this.drawnTrisStats += this.spritesCount * 2;
			this.spritesCount = 0;
			this.index = 0;
		}

		this.flushes++;
	}
}

function disposeBuffers(gl: WebGLRenderingContext, batch: BaseSpriteBatch) {
	try {
		if (batch.vao) {
			batch.vao.dispose();
		}
		if (batch.vertexBuffer) {
			gl.deleteBuffer(batch.vertexBuffer);
		}
	} catch (e) {
		DEVELOPMENT && console.error(e);
	}

	batch.vao = undefined;
	batch.vertexBuffer = undefined;
}
