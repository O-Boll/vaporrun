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
