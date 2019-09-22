import { Texture2D, createEmptyTexture } from './texture2d';

export interface FrameBuffer {
	handle: WebGLFramebuffer;
	colorTexture: Texture2D;
	depthStencilRenderbuffer: WebGLRenderbuffer | null;
	width: number;
	height: number;
	owningDepthStencil: boolean;
}

export function createFrameBuffer(
	gl: WebGLRenderingContext, target: FrameBuffer, width: number, height: number,
	createDepthStencil: boolean, depthStencilRenderbuffer: WebGLRenderbuffer | null
) {
	const handle = gl.createFramebuffer();
	if (!handle) {
		throw new Error('Failed to create frame buffer');
	}

	const resources = createFrameBufferResources(gl, width, height, createDepthStencil);
	target.handle = handle;
	target.colorTexture = resources.colorTexture;
	target.depthStencilRenderbuffer = resources.depthStencilRenderbuffer;
	target.width = width;
	target.height = height;
	target.owningDepthStencil = createDepthStencil;

	if (!createDepthStencil) {
		target.depthStencilRenderbuffer = depthStencilRenderbuffer;
	}

	gl.bindFramebuffer(gl.FRAMEBUFFER, handle);
	bindFrameBufferAttachments(gl, target);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

export function disposeFrameBuffer(gl?: WebGLRenderingContext, buffer?: FrameBuffer) {
	try {
		if (gl && buffer) {
			gl.deleteFramebuffer(buffer.handle);
			if (buffer.colorTexture) {
				gl.deleteTexture(buffer.colorTexture.handle);
			}
			if (buffer.depthStencilRenderbuffer && buffer.owningDepthStencil) {
				gl.deleteRenderbuffer(buffer.depthStencilRenderbuffer);
			}
		}
	} catch (e) {
		DEVELOPMENT && console.error(e);
	}

	return undefined;
}

export function bindFrameBuffer(gl: WebGLRenderingContext, { handle }: FrameBuffer) {
	gl.bindFramebuffer(gl.FRAMEBUFFER, handle);
}

export function unbindFrameBuffer(gl: WebGLRenderingContext) {
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function bindFrameBufferAttachments(gl: WebGLRenderingContext, { colorTexture, depthStencilRenderbuffer }: FrameBuffer) {
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture.handle, 0);
	if (depthStencilRenderbuffer) {
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthStencilRenderbuffer);
	}

	gl.depthMask(true);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.depthMask(false);

	if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
		throw new Error('Failed to set framebuffer attachments');
	}
}

function createFrameBufferResources(
	gl: WebGLRenderingContext, width: number, height: number, createDepthBuffer: boolean
) {
	const colorTexture = createEmptyTexture(gl, false, width, height, gl.RGB);
	if (!colorTexture) {
		throw new Error('Failed to create frame buffer\'s color texture');
	}

	let depthStencilRenderbuffer: WebGLRenderbuffer | null = null;
	if (createDepthBuffer) {
		depthStencilRenderbuffer = gl.createRenderbuffer();
		if (depthStencilRenderbuffer) {
			gl.bindRenderbuffer(gl.RENDERBUFFER, depthStencilRenderbuffer);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		}
		else {
			console.warn('depth/stencil is not available');
		}
	}

	return { colorTexture, depthStencilRenderbuffer };
}
