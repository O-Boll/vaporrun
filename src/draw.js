
vr.draw = function()
{
    'use strict';
    
    vr.gl.clear(vr.gl.COLOR_BUFFER_BIT | vr.gl.DEPTH_BUFFER_BIT);

    vr.gl.useProgram(vr.program);
    
    const matViewUniformLocation = vr.gl.getUniformLocation(vr.program, 'viewMatrix');
    const matProjUniformLocation = vr.gl.getUniformLocation(vr.program, 'projectionMatrix');
    
    let viewMatrix = vr.camera.getViewMatrix(); //mat4.create();
    let projectionMatrix = vr.camera.getProjectionMatrix(); //mat4.create();
    
    //mat4.lookAt(viewMatrix, [0, 2, -5], [0, 1, 0], [0, 1, 0]);
    //mat4.scale(viewMatrix, viewMatrix, [-1, 1, 1]);
    //mat4.perspective(projectionMatrix, glMatrix.toRadian(45), vr.glCanvas.width / vr.glCanvas.height, 0.1, 1000.0);
    
    vr.gl.uniformMatrix4fv(matViewUniformLocation, vr.gl.FALSE, viewMatrix);
    vr.gl.uniformMatrix4fv(matProjUniformLocation, vr.gl.FALSE, projectionMatrix);
    
    vr.drawRoad(vr.vehicles[0].roadSegment , vr.vehicles[0].u, vr.vehicles[0].v);
    vr.drawVehicle(vr.vehicles[0]);
}

vr.drawRoad = function(referenceRoadSegment, u, v)
{
    'use strict';
    
    vr.gl.enable(vr.gl.DEPTH_TEST);
    vr.gl.enable(vr.gl.CULL_FACE);
    vr.gl.frontFace(vr.gl.CW);
    vr.gl.cullFace(vr.gl.BACK);
    
    let n = vr.map.computeRoadCoordinates(referenceRoadSegment, u, v);
    vr.gl.useProgram(vr.program);
    
    let matWorldUniformLocation = vr.gl.getUniformLocation(vr.program, 'worldMatrix');
    let worldMatrix = mat4.create();
    mat4.identity(worldMatrix);
    vr.gl.uniformMatrix4fv(matWorldUniformLocation, vr.gl.FALSE, worldMatrix);
    
    vr.gl.bindVertexArray(vr.quadVertexArray);
    
    vr.gl.activeTexture(vr.gl.TEXTURE0);
    vr.gl.bindTexture(vr.gl.TEXTURE_2D, vr.textures['roadTexture']);
    let diffuseMapLocation = vr.gl.getUniformLocation(vr.program, "diffuseMap");
	vr.gl.uniform1i(diffuseMapLocation, 0);
    
    vr.gl.drawArrays(vr.gl.TRIANGLES, 0, n);
}

vr.drawVehicle = function(vehicle)
{
    'use strict';
    
    vr.gl.enable(vr.gl.DEPTH_TEST);
    vr.gl.enable(vr.gl.CULL_FACE);
    vr.gl.frontFace(vr.gl.CW);
    vr.gl.cullFace(vr.gl.BACK);
    
    let pos = vec3.fromValues(0, 0, 0);
    let dir = vec3.fromValues(0, 0, 1);
    let up = vec3.fromValues(0, 1, 0);
    
    vehicle.getPosition(pos, dir, up);
    
    let tar = vec3.create();
    vec3.add(tar, pos, dir);
    let worldMatrix = mat4.create();
    mat4.targetTo(worldMatrix, pos, tar, up);
    
    vr.gl.useProgram(vr.program);
    let matWorldUniformLocation = vr.gl.getUniformLocation(vr.program, 'worldMatrix');
    
    vr.gl.uniformMatrix4fv(matWorldUniformLocation, vr.gl.FALSE, worldMatrix);
    
    vr.gl.bindVertexArray(vehicle.model.vertexArray);
    
    
    vr.gl.activeTexture(vr.gl.TEXTURE0);
    vr.gl.bindTexture(vr.gl.TEXTURE_2D, vehicle.model.texture);
    let diffuseMapLocation = vr.gl.getUniformLocation(vr.program, "diffuseMap");
	vr.gl.uniform1i(diffuseMapLocation, 0);
    
    vr.gl.drawElements(vr.gl.TRIANGLES, vehicle.model.INDEX_BUFFER_SIZE, vr.gl.UNSIGNED_SHORT, 0);
}
