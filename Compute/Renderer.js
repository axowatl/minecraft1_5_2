export class MeshRenderer {
    /**
     * 
     * @param {Float32Array} vertices - The vertices for the mesh.
     * @param {Uint32Array} indices - The indices that make up the triangles.
     * @param {Material} material - The material for rendering (to be implemented).
     * @param {GPUDevice} device - The WebGPU device.
     * @param {GPUCanvasContext} context - The WebGPU context for rendering.
     * @param {GPUTextureFormat} format - The canvas format for presentation.
     */
    constructor(vertices, indices, material, device, context, format) {
        this.vertices = vertices;
        this.indices = indices;
        this.material = material;
        this.device = device;
        this.context = context;
        this.format = format;

        this.createBuffers();
        this.createPipeline();
    }

    createBuffers() {
        // Create vertex buffer
        this.vertexBuffer = this.device.createBuffer({
            label: "Mesh Vertices",
            size: this.vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        this.device.queue.writeBuffer(this.vertexBuffer, 0, this.vertices);

        // Create index buffer
        this.indexBuffer = this.device.createBuffer({
            label: "Mesh Indices",
            size: this.indices.length * 4,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
        // Number of bytes to write must be a multiple of 4
        this.device.queue.writeBuffer(this.indexBuffer, 0, this.indices);
    }

    createPipeline() {
        // For now, use a simple shader, but you can expand this with material info.
        const shaderModule = this.device.createShaderModule({
            label: "Mesh Shader",
            code: `
                @vertex
                fn vs_main(@location(0) pos: vec3<f32>) -> @builtin(position) vec4<f32> {
                    return vec4<f32>(pos, 1.0);
                }

                @fragment
                fn fs_main() -> @location(0) vec4<f32> {
                    // Placeholder: material can influence color later
                    return vec4<f32>(1.0, 1.0, 1.0, 1.0);
                }
            `
        });

        this.pipeline = this.device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: this.material.shaderModuleVertex,
                entryPoint: "vs_main",
                buffers: [{
                    arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
                    attributes: [{
                        shaderLocation: 0,
                        offset: 0,
                        format: "float32x3",
                    }],
                }],
            },
            fragment: {
                module: this.material.shaderModuleFragment,
                entryPoint: "fs_main",
                targets: [{ format: this.format }],
            },
            primitive: {
                topology: "triangle-list",
            },
        });
    }

    render() {
        const commandEncoder = this.device.createCommandEncoder();
        const textureView = this.context.getCurrentTexture().createView();

        const renderPassDescriptor = {
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setViewport(0, 0, canvas.width, canvas.height, 0, 1);
        passEncoder.setPipeline(this.pipeline);
        passEncoder.setVertexBuffer(0, this.vertexBuffer);
        passEncoder.setIndexBuffer(this.indexBuffer, "uint32");
        // Draw the mesh
        passEncoder.drawIndexed(this.indices.length);
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }
}
