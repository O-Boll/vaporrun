var gsurf;
var gcont;
var gprog;

var quadVertexBufferObject;
var quadIndexBufferObject;

function initWebGL()
{
    gsurf = document.getElementById('gsurf');

    gcont = gsurf.getContext('webgl');
    if(!gcont)
    {
        console.error('ERROR WebGL not supported!');
        return;
    }

    gcont.enable(gcont.DEPTH_TEST);
    gcont.enable(gcont.CULL_FACE);
    gcont.frontFace(gcont.CCW);
    gcont.cullFace(gcont.BACK);

    var vertexShader = gcont.createShader(gcont.VERTEX_SHADER);
    gcont.shaderSource(vertexShader, vertexShaderString);
    gcont.compileShader(vertexShader);
    if(!gcont.getShaderParameter(vertexShader, gcont.COMPILE_STATUS))
    {
        console.error
        (
            'ERROR compiling vertex shader!',
            gcont.getShaderInfoLog(vertexShader)
        );
        return;
    }

    var fragmentShader = gcont.createShader(gcont.FRAGMENT_SHADER);
    gcont.shaderSource(fragmentShader, fragmentShaderString);
    gcont.compileShader(fragmentShader);
    if(!gcont.getShaderParameter(fragmentShader, gcont.COMPILE_STATUS))
    {
        console.error
        (
            'ERROR compiling fragment shader!',
            gcont.getShaderInfoLog(fragmentShader)
        );
        return;
    }

    gprog = gcont.createProgram();
    gcont.attachShader(gprog, fragmentShader);
    gcont.attachShader(gprog, vertexShader);

    gcont.linkProgram(gprog);
    if(!gcont.getProgramParameter(gprog, gcont.LINK_STATUS))
    {
        console.error
        (
            'ERROR linking program!',
            gcont.getProgramInfoLog(gprog)
        );
        return;
    }
    gcont.validateProgram(gprog);

    if(!gcont.getProgramParameter(gprog, gcont.VALIDATE_STATUS))
    {
        console.error
        (
            'ERROR validating program!',
            context.getProgramInfoLog(program)
        );
        return;
    }

    gcont.useProgram(gprog);

	var maxRoadQuads = 10000;
	
    quadVertexBufferObject = gcont.createBuffer();
    gcont.bindBuffer(gcont.ARRAY_BUFFER, quadVertexBufferObject);
    gcont.bufferData
    (
        gcont.ARRAY_BUFFER,
        maxRoadQuads * 5 * Float32Array.BYTES_PER_ELEMENT,
        gcont.DYNAMIC_DRAW
    );

    quadIndexBufferObject = gcont.createBuffer();
    gcont.bindBuffer(gcont.ELEMENT_ARRAY_BUFFER, quadIndexBufferObject);
    gcont.bufferData
    (
        gcont.ELEMENT_ARRAY_BUFFER,
        6 * maxRoadQuads * Float32Array.BYTES_PER_ELEMENT,
        gcont.DYNAMIC_DRAW
    );
	for(var i = 0; i < maxRoadQuads; i++)
	{
        var quadIndices =
		[
		    4 * i, 4 * i + 1, 4 * i + 2,
		    4 * i, 4 * i + 2, 4 * i + 3
		];
		gcont.bufferSubData
		(
		    gcont.ELEMENT_ARRAY_BUFFER,
			i * 6 * Uint16Array.BYTES_PER_ELEMENT,
			new Uint16Array(quadIndices)
	    );
	}
	
    var matWorldUniformLocation = gcont.getUniformLocation(gprog, 'mWorld');
    var matViewUniformLocation = gcont.getUniformLocation(gprog, 'mView');
    var matProjUniformLocation = gcont.getUniformLocation(gprog, 'mProj');

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);

    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0, 0, 0], [0, 0, 1], [0, 1, 0]);
    mat4.scale(viewMatrix, viewMatrix, [-1, 1, 1]);
    mat4.perspective(projMatrix, glMatrix.toRadian(45), gsurf.width / gsurf.height, 0.1, 1000.0);

    gcont.uniformMatrix4fv(matWorldUniformLocation, gcont.FALSE, worldMatrix);
    gcont.uniformMatrix4fv(matViewUniformLocation, gcont.FALSE, viewMatrix);
    gcont.uniformMatrix4fv(matProjUniformLocation, gcont.FALSE, projMatrix);
	
	var testTexture = gcont.createTexture();
    gcont.bindTexture(gcont.TEXTURE_2D, testTexture);
    gcont.texImage2D(
        gcont.TEXTURE_2D,
        0,
        gcont.RGBA,
        gcont.RGBA,
        gcont.UNSIGNED_BYTE,
        document.getElementById('road_texture')
    );
    gcont.generateMipmap(gcont.TEXTURE_2D);
    gcont.texParameteri(gcont.TEXTURE_2D, gcont.TEXTURE_WRAP_S, gcont.REPEAT);
    gcont.texParameteri(gcont.TEXTURE_2D, gcont.TEXTURE_WRAP_T, gcont.REPEAT);
    gcont.texParameteri(gcont.TEXTURE_2D, gcont.TEXTURE_MIN_FILTER, gcont.NEAREST_MIPMAP_NEAREST);
    gcont.texParameteri(gcont.TEXTURE_2D, gcont.TEXTURE_MAG_FILTER, gcont.LINEAR);
	
    var ext = gcont.getExtension('EXT_texture_filter_anisotropic');
	var max = gcont.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    gcont.texParameterf(gcont.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);

}

function clearGSurf()
{
    gcont.clearColor(0, 0.6, 1, 1);
    //gcont.clear(gcont.COLOR_BUFFER_BIT | gcont.DEPTH_BUFFER_BIT);
}

function drawQuad(vertices)
{
    gcont.bufferSubData(gcont.ARRAY_BUFFER, 0, new Float32Array(vertices));


}

function drawQuads(n) {
	var positionAttribLocation = gcont.getAttribLocation(gprog, 'vertexPosition');
    gcont.vertexAttribPointer
    (
        positionAttribLocation,
        3,
        gcont.FLOAT,
        gcont.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gcont.enableVertexAttribArray(positionAttribLocation);

    var textureAttribLocation = gcont.getAttribLocation(gprog, 'vertexTextureCoordinates');
    gcont.vertexAttribPointer
    (
        textureAttribLocation,
        2,
        gcont.FLOAT,
        gcont.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT
    );
    gcont.enableVertexAttribArray(textureAttribLocation);
	gcont.activeTexture(gcont.TEXTURE0);
    gcont.drawElements(gcont.TRIANGLES, n * 6, gcont.UNSIGNED_SHORT, 0);
}

function demo()
{
    var xs = [];
    var ys = [];
    var zs = [];
    for(var i = 0; i < 10000; i++)
    {
        xs[i] = -10;
        ys[i] = -5;
        zs[i] = 10 * i;
    }
    var now, elapsed_time, previous_time = Date.now();
    var step = function()
    {

        now = Date.now();
        elapsed_time = now - previous_time;
        if(elapsed_time >= 17) {
            clearGSurf();
			var n = 1000;
            for(var i = 0; i < n; i++)
            {

                x = xs[i];
                y = ys[i];
                z = zs[i];
                z -= 0.1;
                zs[i] = z;
                var quadVertices =
                [
                    x     , y, z    ,    0, 0,
                    x + 20, y, z    ,    1, 0,
                    x + 20, y, z + 10,    1, 1,
                    x     , y , z + 10,    0, 1,
                ];
                if(i < n)
			    {
     			    gcont.bufferSubData(gcont.ARRAY_BUFFER, i * 20 * Float32Array.BYTES_PER_ELEMENT, new Float32Array(quadVertices));
				}

            }
			drawQuads(n);
            previous_time = now;
        }
        requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}
