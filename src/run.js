vr.gameLoop = function()
{
    'use strict';
    
    vr.vehicles[0].gasPedalEngaged = vr.input.gasPedalEngaged;
    vr.vehicles[0].breakPedalEngaged = vr.input.breakPedalEngaged;
    vr.vehicles[0].isTurningLeft = vr.input.isTurningLeft;
    vr.vehicles[0].isTurningRight = vr.input.isTurningRight;
    
    vr.vehicles[0].updatePosition();
    vr.camera.updatePosition();
    
    vr.draw();
    
    let currentTime = performance.now();
    
    vr.dt = vr.restrictToInterval(
        (currentTime - vr.lastFrameTime) / 1000,
        0.001, 0.05
    );
    vr.lastFrameTime = currentTime;
    
    requestAnimationFrame(vr.gameLoop);
}
