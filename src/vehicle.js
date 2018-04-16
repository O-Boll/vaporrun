
vr.Vehicle = function()
{
    'use strict';
    
    const keys = Object.keys(vr.map.roadSegments);
    this.roadSegment = vr.map.roadSegments[keys[0]];
    this.u = 0;
    this.v = 0;
    this.speed = 0;
    this.maxSpeed = 100;
    
    this.gasPedalEngaged = false;
    this.breakPedalEngaged = false;
    
    this.isTurningLeft = false;
    this.isTurningRight = false;
    this.turnAngle = 0;
    this.turnAngleSpeed = 30; /* In degrees per second. */
    this.turnAngleRelaxationTime = 2;
    this.maxTurnAngle = 30;
    
    this.model = vr.models['trueno'];
}

vr.Vehicle.prototype.updatePosition = function()
{
    if(this.gasPedalEngaged)
    {
        this.speed += 10 * vr.dt;
    }
    if(this.breakPedalEngaged)
    {
        this.speed -= 40 * vr.dt;
    }
    this.speed = vr.restrictToInterval(this.speed, 0, this.maxSpeed);
    const ds = this.speed * vr.dt;
    
    this.turnAngle += 0.5 * ds * this.roadSegment.getCurvature(this.v);
    
    if(this.isTurningLeft || this.isTurningRight)
    {
        if(this.isTurningLeft)
        {
            this.turnAngle -= this.turnAngleSpeed * vr.dt;
        }
        else if(this.isTurningRight)
        {
            this.turnAngle += this.turnAngleSpeed * vr.dt;
        }
    }
    else {
        this.turnAngle += (-this.turnAngle) * vr.dt
                          / this.turnAngleRelaxationTime;
    }
    this.turnAngle = vr.restrictToInterval
    (
        this.turnAngle,
        -this.maxTurnAngle,
        this.maxTurnAngle
    );
    
    this.v += this.speed * Math.cos(glMatrix.toRadian(this.turnAngle)) * vr.dt;
    this.u += this.speed * Math.sin(glMatrix.toRadian(this.turnAngle)) * vr.dt;
}

vr.Vehicle.prototype.getPosition = function(outPosition, outDirection, outUp)
{
    let position = vec3.create();
    let direction = vec3.create();
    let up = vec3.create();
    
    const u = this.u;
    const v = this.v;
    
    this.roadSegment = this.roadSegment.getPosition(position, direction, u, v);
    
    vec3.cross(up, direction, vec3.fromValues(0, 1, 0));
    vec3.cross(up, up, direction);
    vec3.normalize(up, up);
    
    let rotationMatrix = mat4.create();
    
    mat4.fromRotation(rotationMatrix, glMatrix.toRadian(this.turnAngle), up);
    
    let temp = vec4.create();
    for(let i = 0; i < 3; i++)
        temp[i] = direction[i];
    
    vec4.transformMat4(temp, temp, rotationMatrix);
    
    for(let i = 0; i < 3; i++)
        direction[i] = temp[i];
    
    for(let i = 0; i < 3; i++)
    {
        outPosition[i] = position[i];
        outDirection[i] = direction[i];
        outUp[i] = up[i];
    }
}
