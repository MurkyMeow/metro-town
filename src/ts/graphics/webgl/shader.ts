export interface ShaderProgramData {
	program: WebGLProgram;
	uniforms: { [key: string]: WebGLUniformLocation; };
}

export class Shader {
	private programs: { [key: string]: ShaderProgramData; } = {};
	private vertexCode: string;
	private fragmentCode: string;

	constructor(source: string | { vertex: string; fragment: string; }) {
		if (typeof source === 'string') {
			const index = source.indexOf('// FRAGMENT');

			if (index === -1) {
				throw new Error(`Missing fragment shader separator`);
			}

			source = {
				vertex: source.substring(0, index),
				fragment: source.substring(index),
			};
		}

		this.vertexCode = source.vertex;
		this.fragmentCode = source.fragment;
	}

	compile(gl: WebGLRenderingContext, defines: string[]) {
		defines.sort();
		let definesString = defines.reduce((prev, cur) => prev + cur, '');

		let data = this.programs[definesString];
		if (!data) {
			data = Shader.compileShader(gl, this.vertexCode, this.fragmentCode, defines);
			this.programs[definesString] = data;
		}

		return data;
	}


	private static compileShader(gl: WebGLRenderingContext, vertexCode: string, fragmentCode: string, defines: string[]) {
		let shaderDefines = defines.reduce((prev, cur) => prev + '#define ' + cur + '\n', '');

		const vertexShader = createWebGLShader(gl, gl.VERTEX_SHADER, shaderDefines + vertexCode);
		const fragmentShader = createWebGLShader(gl, gl.FRAGMENT_SHADER, shaderDefines + fragmentCode);
		const program = gl.createProgram();

		if (!program) {
			throw new Error('Failed to create shader program');
		}

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);

		const attribs = vertexCode.match(/^attribute [a-zA-Z0-9_]+ ([a-zA-Z0-9_]+)/mg)!;

		for (var i = 0; i < attribs.length; ++i) {
			const [, name] = /attribute [a-zA-Z0-9_]+ ([a-zA-Z0-9_]+)/.exec(attribs[i])!;
			gl.bindAttribLocation(program, i, name);
		}

		gl.linkProgram(program);
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error('Failed to link shader program');
		}

		gl.useProgram(program);

		const uniforms: any = {};
		const samplers: string[] = [];

		for (let i = 0; i < gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); i++) {
			const info = gl.getActiveUniform(program, i)!;
			uniforms[info.name] = gl.getUniformLocation(program, info.name);

			if (!uniforms[info.name]) {
				throw new Error(`Failed to get uniform location (${info.name})`);
			}

			if (info.type === gl.SAMPLER_2D) {
				samplers.push(info.name);
			}
		}

		samplers.sort().forEach((name, i) => gl.uniform1i(uniforms[name], i));

		gl.useProgram(null);

		return {program, uniforms};
	}
}

function createWebGLShader(gl: WebGLRenderingContext, type: number, source: string) {
	const shader = gl.createShader(type);

	if (!shader) {
		throw new Error('Failed to create shader');
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(shader) || 'Shader error');
	}

	return shader;
}

export function disposeShaderProgramData(gl: WebGLRenderingContext, data: ShaderProgramData) {
	try {
		if (gl) {
			gl.deleteProgram(data.program);
		}
	} catch (e) {
		DEVELOPMENT && console.error(e);
	}
}