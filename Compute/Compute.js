//#region Top
// Ensure this is inside an async function or top-level await
if (!navigator.gpu) {
	throw Error("WebGPU not supported.");
}

/** @type {GPUAdapter} */
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
	throw Error("Couldn't request WebGPU adapter.");
}

/** @type {GPUDevice} */
const device = await adapter.requestDevice();
//#endregion Top

/**
 * Represents a compute shader module.
 */
export class ComputeShader {
	/**
	 * Creates a new ComputeShader instance.
	 * @param {string} c - The shader code (WGSL or other supported language).
	 */
	constructor(c) {
		/**
		 * The GPUShaderModule created from the shader code.
		 * @type {GPUShaderModule}
		 */
		this.shaderModule = device.createShaderModule({ code: c });
	}

	/**
	 * 
	 * @param {string} kernal - The kernel name to run.
	 * @param {ComputeBuffer} buffers - An array of all the buffers in the shader.
	 * @param {ComputeBuffer} resultBuffer - A buffer that could be in the shader.
	 * @param {ComputeBuffer} stagingBuffer - A buffer to act as a between point when reading results.
	 * @returns {Float32Array} The results.
	 */
	async Dispatch(kernal, buffers, resultBuffer, stagingBuffer) {
		// Create an array of bind group layout entries based on buffers
		const entries = buffers.map((buffer, index) => {
			// Make sure each buffer has setBindings called
			if (!buffer.entry) {
				console.error(`Buffer at index ${index} does not have entry set. Call setBindings() first.`);
				return null;
			}
			return {
				binding: buffer.entry.binding,
				visibility: GPUShaderStage.COMPUTE,
				buffer: { type: buffer.entry.buffer.type }
			};
		}).filter(entry => entry !== null);

		// Create the bind group layout
		const bindGroupLayout = device.createBindGroupLayout({
			entries: entries,
		});

		// Optionally, create a bind group with the buffers
		const bindGroupEntries = buffers.map((buffer) => {
			return {
				binding: buffer.entry.binding,
				resource: { buffer: buffer.buffer }
			};
		});

		const bindGroup = device.createBindGroup({
			layout: bindGroupLayout,
			entries: bindGroupEntries,
		});

		const pipelineLayout = device.createPipelineLayout({
			bindGroupLayouts: [bindGroupLayout],
		});

		const cp = device.createComputePipeline({
			layout: pipelineLayout,
			compute: {
				module: this.shaderModule,
				entryPoint: kernal,
			},
		});

		const commandEncoder = device.createCommandEncoder();
		const passEncoder = commandEncoder.beginComputePass();
		passEncoder.setPipeline(cp);
		passEncoder.setBindGroup(0, bindGroup);
		passEncoder.dispatchWorkgroups(64, 1, 1); // Consider passing workgroup counts as parameters
		passEncoder.end();

		device.queue.submit([commandEncoder.finish()]);

		await device.queue.onSubmittedWorkDone();

		// Read back the result
		const readEncoder = device.createCommandEncoder();
		readEncoder.copyBufferToBuffer(resultBuffer.buffer, 0, stagingBuffer.buffer, 0, stagingBuffer.buffer.size);
		device.queue.submit([readEncoder.finish()]);

		await stagingBuffer.buffer.mapAsync(GPUMapMode.READ);
		const resultArrayBuffer = stagingBuffer.buffer.getMappedRange();
		const result = new Float32Array(resultArrayBuffer.slice()); // clone if needed
		stagingBuffer.buffer.unmap();

		return result[0]; // or result[0] if scalar
	}
}

/**
 * Represents a GPU buffer for compute operations.
 */
export class ComputeBuffer {
	/**
	 * Creates a new ComputeBuffer.
	 * @param {ArrayBuffer | null} [array=null] - Optional initial data for the buffer.
	 * @param {Object} [flags={ copy_src: false, copy_dst: false, index: false, indirect: false, map_read: false, map_write: false, query_resolve: false, storage: true, uniform: false, vertex: false }] - Usage flags.
	 * @param {boolean} [flags.copy_src=false] - If true, buffer will have COPY_SRC usage.
	 * @param {boolean} [flags.copy_dst=false] - If true, buffer will have COPY_DST usage.
	 * @param {boolean} [flags.index=false] - If true, buffer will have INDEX usage.
	 * @param {boolean} [flags.indirect=false] - If true, buffer will have INDIRECT usage.
	 * @param {boolean} [flags.map_read=false] - If true, buffer will have MAP_READ usage.
	 * @param {boolean} [flags.map_write=false] - If true, buffer will have MAP_WRITE usage.
	 * @param {boolean} [flags.query_resolve=false] - If true, buffer will have QUERY_RESOLVE usage.
	 * @param {boolean} [flags.storage=true] - If true, buffer will have STORAGE usage.
	 * @param {boolean} [flags.uniform=false] - If true, buffer will have UNIFORM usage.
	 * @param {boolean} [flags.vertex=false] - If true, buffer will have VERTEX usage
	 */
	constructor(array = null, flags = { copy_src: false, copy_dst: false, index: false, indirect: false, map_read: false, map_write: false, query_resolve: false, storage: true, uniform: false, vertex: false }) {
		// Determine GPUBufferUsage based on flags
		let usage = 0;
		if (flags.copy_src) usage |= GPUBufferUsage.COPY_SRC;
		if (flags.copy_dst) usage |= GPUBufferUsage.COPY_DST;
		if (flags.index) usage |= GPUBufferUsage.INDEX;
		if (flags.indirect) usage |= GPUBufferUsage.INDIRECT;
		if (flags.map_read) usage |= GPUBufferUsage.MAP_READ;
		if (flags.map_write) usage |= GPUBufferUsage.MAP_WRITE;
		if (flags.query_resolve) usage |= GPUBufferUsage.QUERY_RESOLVE;
		if (flags.storage) usage |= GPUBufferUsage.STORAGE;
		if (flags.uniform) usage |= GPUBufferUsage.UNIFORM;
		if (flags.vertex) usage |= GPUBufferUsage.VERTEX;

		// Create buffer with or without initial data
		this.buffer = device.createBuffer({
			size: array ? array.byteLength : 4, // default size if no data
			usage,
			mappedAtCreation: !!array,
		});

		// If initial data is provided, write it into the buffer
		if (array) {
			const writeArray = new Uint8Array(this.buffer.getMappedRange());
			writeArray.set(new Uint8Array(array.buffer));
			this.buffer.unmap();
		}
	}

	/**
	 * 
	 * @param {number} binding - the binding to the shader
	 * @param {number} type - 0 for readOnlyStorage, 1 for storage, 2 for uniform
	 */
	setBindings(b, t) {
		let _t;
		switch (t) {
			case 0:
				_t = "read-only-storage";
				break;
			case 1:
				_t = "storage";
				break;
			case 2:
				_t = "uniform";
				break;
			default:
				console.error("Did not provide a correct type value");
		}

		this.entry = {
			binding: b,
			visibility: GPUShaderStage.COMPUTE,
			buffer: { type: _t }
		}
	}
}
