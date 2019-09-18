interface WebGLRenderingContext {
	readonly MAX_ELEMENT_INDEX: number;
}

declare module "webgl-debug" {
	export function makeDebugContext(context: WebGLRenderingContext): WebGLRenderingContext;
	export function makeDebugContext(context: WebGLRenderingContext, callbackOnThrow: (err: string, funcName: string, args: any) => void): WebGLRenderingContext;
}
