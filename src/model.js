
vr.createModels = function()
{
    'use strict';
    
    const numberOfModels = vr.modelData.length;
    let models = {};
    for(let i = 0; i < numberOfModels; i++)
    {
        const model = new vr.Model(vr.modelData[i])
        models[model.id] = model;
    }
    return models;
}

vr.Model = function(modelData)
{
    'use strict';
    
    const vertices = modelData.data.attributes.position.array;
    const textureCoordinates = modelData.data.attributes.uv.array;
    const indices = modelData.data.index.array;
    
    this.id = modelData.id;
    this.texture = vr.textures[modelData.textureid];
    
    this.vertexArray = vr.gl.createVertexArray();
    vr.gl.bindVertexArray(this.vertexArray)
    
    this.vertexBuffer = vr.gl.createBuffer();
    vr.gl.bindBuffer(vr.gl.ARRAY_BUFFER, this.vertexBuffer);
    vr.gl.bufferData
    (
        vr.gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        vr.gl.STATIC_DRAW
    );
    vr.bindVertexCoordinateAttribute();
    
    this.textureCoordinateBuffer = vr.gl.createBuffer();
    vr.gl.bindBuffer(vr.gl.ARRAY_BUFFER, this.textureCoordinateBuffer);
    vr.gl.bufferData
    (
        vr.gl.ARRAY_BUFFER,
        new Float32Array(textureCoordinates),
        vr.gl.STATIC_DRAW
    );
    vr.bindTextureCoordinateAttribute();
    
    this.indexBuffer = vr.gl.createBuffer();
    vr.gl.bindBuffer(vr.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    vr.gl.bufferData
    (
        vr.gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        vr.gl.STATIC_DRAW
    );
    
    this.INDEX_BUFFER_SIZE = indices.length;
}
