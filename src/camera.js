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



/**
* Camera implements a camera that is set to follow a vehicle.
*/
vr.Camera = function(vehicle)
{
    'use strict';
    
    this.position = vec3.fromValues(0, 1, 0);
    this.direction = vec3.fromValues(0, 0, 1);
    this.up = vec3.fromValues(0, 1, 0);
    
    this.verticalFieldOfView = 45;
    this.nearBound = 0.1;
    this.farBound = 1000;
    
    this.vehicle = vehicle;
    
    this.preferredDistanceBehindVehicle = 8;
    this.preferredDistanceAboveVehicle = 3;
    
    this.targetDistanceAboveVehicle = 1.5;
    
    /* The time (in seconds) it takes for the camera to move 'close' to a
       new position. */
    this.relaxationTime = 0.2;
}

vr.Camera.prototype.updatePosition = function()
{
    'use strict';
    
    const preferredPosition = this.getPreferredPosition();
    
    let cameraVelocity = vec3.create();
    vec3.sub(cameraVelocity, preferredPosition, this.position);
    
    vec3.scale(cameraVelocity, cameraVelocity, vr.dt / this.relaxationTime);
    
    vec3.add(this.position, this.position, cameraVelocity);
    
    const targetPosition = this.getTargetPosition();
    
    vec3.sub(this.direction, targetPosition, this.position);
    vec3.normalize(this.direction, this.direction);
}

vr.Camera.prototype.getPreferredPosition = function()
{
    'use strict';
    
    let vehiclePosition = vec3.create();
    let vehicleDirection = vec3.create();
    let vehicleUp = vec3.create();
    
    this.vehicle.getPosition(vehiclePosition, vehicleDirection, vehicleUp);
    let preferredPosition = vec3.create();
    
    vec3.scaleAndAdd
    (
        preferredPosition,
        vehiclePosition,
        vehicleDirection,
        -this.preferredDistanceBehindVehicle
    );
    
    vec3.scaleAndAdd
    (
        preferredPosition,
        preferredPosition,
        vehicleUp,
        this.preferredDistanceAboveVehicle
    );
    
    return preferredPosition;
}

vr.Camera.prototype.getTargetPosition = function()
{
    'use strict';
    
    let vehiclePosition = vec3.create();
    let vehicleDirection = vec3.create();
    let vehicleUp = vec3.create();
    
    this.vehicle.getPosition(vehiclePosition, vehicleDirection, vehicleUp);
    
    let targetPosition = vec3.create();
    vec3.scaleAndAdd
    (
        targetPosition,
        vehiclePosition,
        vehicleUp,
        this.targetDistanceAboveVehicle
    );
    return targetPosition;
}

vr.Camera.prototype.getViewMatrix = function()
{
    'use strict';
    
    let viewMatrix = mat4.create();
    let target = vec3.create();
    vec3.add(target, this.position, this.direction);
    mat4.lookAt(viewMatrix, this.position, target, this.up);
    return viewMatrix;
}

vr.Camera.prototype.getProjectionMatrix = function()
{
    'use strict';
    
    let projectionMatrix = mat4.create();
    let aspectRatio = vr.glCanvas.width / vr.glCanvas.height;
    mat4.perspective
    (
        projectionMatrix,
        glMatrix.toRadian(this.verticalFieldOfView),
        aspectRatio,
        this.nearBound,
        this.farBound
    );
    mat4.scale(projectionMatrix, projectionMatrix, vec4.fromValues(-1, 1, 1, 1));
    return projectionMatrix;
}
