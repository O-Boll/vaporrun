/*
This file is part of VaporRun.

Copyright 2018 Olle Eriksson

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/



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
