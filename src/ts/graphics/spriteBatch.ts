import { Sprite, SpriteBatch as ISpriteBatch, Matrix2D } from '../common/interfaces';
import { BaseSpriteBatch, getColorFloat } from './baseSpriteBatch';

function vertex(
	vertices: Float32Array, index: number,
	x: number, y: number, depth: number, u: number, v: number, c: number, transform: Matrix2D
) {
	vertices[index++] = transform[0] * x + transform[2] * y + transform[4];
	vertices[index++] = transform[1] * x + transform[3] * y + transform[5];
	vertices[index++] = depth;
	vertices[index++] = u;
	vertices[index++] = v;
	vertices[index++] = c;
}

// function colorWithAlpha(color: number, alpha: number) {
// 	return ((color & 0xffffff00) | (((color & 0xff) * alpha) & 0xff)) >>> 0;
// }

export class SpriteBatch extends BaseSpriteBatch implements ISpriteBatch {
	palette = false;
	constructor(gl: WebGLRenderingContext, vertexCapacityMax: number, indexBuffer: WebGLBuffer) {
		super(gl, vertexCapacityMax, indexBuffer, [
			{ name: 'position', size: 3 },
			{ name: 'texcoord0', size: 2 }, // , type: gl.UNSIGNED_SHORT },
			{ name: 'color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
		]);
	}
	drawImage(
		color: number, sx: number, sy: number, sw: number, sh: number,
		dx: number, dy: number, dw: number, dh: number
	) {
		if (this.spritesCapacity <= this.spritesCount) {
			this.flush();
		}

		const c = getColorFloat(color, this.globalAlpha);

		const x2 = dx + dw;
		const y2 = dy + dh;

		const u1 = sx;
		const v1 = sy;
		const u2 = sx + sw;
		const v2 = sy + sh;

		const vertices = this.vertices;
		const transform = this.transform;

		const index = this.index;

		vertex(vertices, index, dx, dy, this.depth, u1, v1, c, transform);
		vertex(vertices, index + 6, x2, dy, this.depth, u2, v1, c, transform);
		vertex(vertices, index + 12, x2, y2, this.depth, u2, v2, c, transform);
		vertex(vertices, index + 18, dx, y2, this.depth, u1, v2, c, transform);

		this.index += 24;
		this.spritesCount++;
	}
	drawRect(color: number, x: number, y: number, w: number, h: number) {
		if (w && h) {
			const rect = this.rectSprite;

			if (rect) {
				this.drawImage(color, rect.x, rect.y, rect.w, rect.h, x, y, w, h);
			} else {
				this.drawImage(color, 0, 0, 1, 1, x, y, w, h);
			}
		}
	}
	drawSprite(s: Sprite, color: number, x: number, y: number) {
		if (s && s.w && s.h) {
			this.drawImage(color, s.x, s.y, s.w, s.h, x + s.ox, y + s.oy, s.w, s.h);
		}
	}
}
