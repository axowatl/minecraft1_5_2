export class Material {
    /**
     * @param {string} vertexShaderCode - WGSL code for vertex shader
     * @param {string} fragmentShaderCode - WGSL code for fragment shader
     */
    constructor(vertexShaderCode, fragmentShaderCode) {
        this.vertexShaderCode = vertexShaderCode;
        this.fragmentShaderCode = fragmentShaderCode;
        this.shaderModuleVertex = null;
        this.shaderModuleFragment = null;
    }

    /**
     * Creates shader modules from the WGSL code.
     * @param {GPUDevice} device
     */
    async createShaderModules(device) {
        this.shaderModuleVertex = device.createShaderModule({
            code: this.vertexShaderCode,
        });
        this.shaderModuleFragment = device.createShaderModule({
            code: this.fragmentShaderCode,
        });
    }
}
