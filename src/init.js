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



/* We will use vr as a namespace. */
const vr =
{
    modelData: [],
    spriteData: []
};

vr.init = function()
{
    'use strict';
    
    vr.initWebGL();
    
    //vr.programs = cr.createShaderPrograms();
    
    vr.initShaderPrograms();
    
    vr.createQuadBuffers();
    
    vr.textures = vr.createTextureArray();
    
    vr.models = vr.createModels(vr.modelByID);
    
    vr.map = new vr.Map;
    
    vr.vehicles = [new vr.Vehicle];
    
    vr.camera = new vr.Camera(vr.vehicles[0]);
    
    vr.input.addEventListeners();
    
    /* The elapsed time (in seconds) since the last frame was rendered is stored
       in vr.dt. We initialize this value to 1 / 60 (corresponding to a
       framerate of 60 fps) for the first frame. */
    vr.dt = 1 / 60;
    
    /* We store the current time so that we can update vr.dt later on. */
    vr.lastFrameTime = performance.now();
    
    requestAnimationFrame(vr.gameLoop);
}

vr.initWebGL = function()
{
    'use strict';
    
    vr.glCanvas = document.getElementById('webGLCanvas');
    
    vr.glCanvas.width = 1600;
    vr.glCanvas.height = 1200;
    
    vr.gl = vr.glCanvas.getContext
    (
        'webgl2',
        {
            alpha: false,
            premultipliedAlpha: false
        }
    );
    
    if(!vr.gl)
    {
        console.error('ERROR WebGL not supported!');
        return;
    }
    
    vr.gl.clearColor(0, 0.6, 1, 1);
    vr.gl.enable(vr.gl.BLEND);
    vr.gl.blendFunc(vr.gl.SRC_ALPHA, vr.gl.ONE_MINUS_SRC_ALPHA);
}

vr.initShaderPrograms = function()
{
    vr.vertexShader = vr.gl.createShader(vr.gl.VERTEX_SHADER);
    vr.gl.shaderSource(vr.vertexShader, vr.vertexShaderSource);
    vr.gl.compileShader(vr.vertexShader);
    if(!vr.gl.getShaderParameter(vr.vertexShader, vr.gl.COMPILE_STATUS))
    {
        console.error
        (
            'ERROR Could not compile vertex shader!',
            vr.gl.getShaderInfoLog(vr.vertexShader)
        );
        return;
    }
    
    vr.fragmentShader = vr.gl.createShader(vr.gl.FRAGMENT_SHADER);
    vr.gl.shaderSource(vr.fragmentShader, vr.fragmentShaderSource);
    vr.gl.compileShader(vr.fragmentShader);
    if(!vr.gl.getShaderParameter(vr.fragmentShader, vr.gl.COMPILE_STATUS))
    {
        console.error
        (
            'ERROR Could not compile fragment shader!',
            vr.gl.getShaderInfoLog(vr.fragmentShader)
        );
        return;
    }
    
    vr.program = vr.gl.createProgram();
    vr.gl.attachShader(vr.program, vr.fragmentShader);
    vr.gl.attachShader(vr.program, vr.vertexShader);

    vr.gl.linkProgram(vr.program);
    
    if(!vr.gl.getProgramParameter(vr.program, vr.gl.LINK_STATUS))
    {
        console.error
        (
            'ERROR Could not link program!',
            vr.gl.getProgramInfoLog(vr.program)
        );
        return;
    }
    
    vr.gl.validateProgram(vr.program);
    
    if(!vr.gl.getProgramParameter(vr.program, vr.gl.VALIDATE_STATUS))
    {
        console.error
        (
            'ERROR Program could not be validated!',
            vr.gl.getProgramInfoLog(vr.program)
        );
        return;
    }
    
    vr.vertexCoordinateAttributeLocation = vr.gl.getAttribLocation
    (
        vr.program,
        "vertexCoordinates"
    );

    vr.textureCoordinateAttributeLocation = vr.gl.getAttribLocation
    (
        vr.program,
        "textureCoordinates"
    );
}

vr.bindVertexCoordinateAttribute = function()
{
    vr.gl.enableVertexAttribArray(vr.vertexCoordinateAttributeLocation);
    vr.gl.vertexAttribPointer
    (
        vr.vertexCoordinateAttributeLocation,
        3,
        vr.gl.FLOAT,
        false,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
}

vr.bindTextureCoordinateAttribute = function()
{
    vr.gl.enableVertexAttribArray(vr.textureCoordinateAttributeLocation);
    vr.gl.vertexAttribPointer
    (
        vr.textureCoordinateAttributeLocation,
        2,
        vr.gl.FLOAT,
        false,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
}

vr.createQuadBuffers = function()
{
    'use strict';
    
    vr.quadVertexArray = vr.gl.createVertexArray();
    vr.gl.bindVertexArray(vr.quadVertexArray)
    
	vr.MAX_NUMBER_OF_QUADS = 10000;
    
    vr.quadVertexBuffer = vr.gl.createBuffer();
    
    vr.gl.bindBuffer(vr.gl.ARRAY_BUFFER, vr.quadVertexBuffer);
    vr.gl.bufferData
    (
        vr.gl.ARRAY_BUFFER,
        vr.MAX_NUMBER_OF_QUADS * 2 * 3 * Float32Array.BYTES_PER_ELEMENT,
        vr.gl.DYNAMIC_DRAW
    );
    vr.bindVertexCoordinateAttribute();
    
    vr.quadTextureCoordinateBuffer = vr.gl.createBuffer();
    
    vr.gl.bindBuffer(vr.gl.ARRAY_BUFFER, vr.quadTextureCoordinateBuffer);
    vr.gl.bufferData
    (
        vr.gl.ARRAY_BUFFER,
        vr.MAX_NUMBER_OF_QUADS * 2 * 2 * Float32Array.BYTES_PER_ELEMENT,
        vr.gl.DYNAMIC_DRAW
    );
    vr.bindTextureCoordinateAttribute();
}
