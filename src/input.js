
vr.input =
{
    /* Arrow and/or WASD keys can be used. */
    upArrowKeyDown: false,
    downArrowKeyDown: false,
    leftArrowKeyDown: false,
    rightArrowKeyDown: false,
    
    gasPedalEngaged: false,
    breakPedalEngaged: false,
    isTurningLeft: false,
    isTurningRight: false,
}

vr.input.addEventListeners = function()
{
    'use strict';
    
    document.addEventListener('keydown', vr.input.keyDownEvent);
    document.addEventListener('keyup', vr.input.keyUpEvent);
}

vr.input.keyDownEvent = vr.input.keyUpEvent = function(event)
{
    'use strict';
    
    const keyName = event.key;
    const keyDown = event.type == 'keydown';
    
    switch(keyName)
    {
        case 'ArrowUp':
        case 'w':
            vr.input.upArrowKeyDown = keyDown;
            break;
        case 'ArrowDown':
        case 's':
            vr.input.downArrowKeyDown = keyDown;
            break;
        case 'ArrowLeft':
        case 'a':
            vr.input.leftArrowKeyDown = keyDown;
            break;
        case 'ArrowRight':
        case 'd':
            vr.input.rightArrowKeyDown = keyDown;
            break;
    }
    
    vr.input.update();
}

vr.input.update = function()
{
    'use strict';
    
    vr.input.gasPedalEngaged = vr.input.upArrowKeyDown;
    vr.input.breakPedalEngaged = vr.input.downArrowKeyDown;
    
    if(vr.input.leftArrowKeyDown && vr.input.rightArrowKeyDown)
    {
        vr.input.isTurningLeft = false;
        vr.input.isTurningRight = false;
    }
    else
    {
        vr.input.isTurningLeft = vr.input.leftArrowKeyDown;
        vr.input.isTurningRight = vr.input.rightArrowKeyDown;
    }
}
