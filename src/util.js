
vr.restrictToInterval = function(value, min, max)
{
    return Math.min(max, Math.max(min, value));
}

vr.radiansToDegrees = function(rad)
{
    return rad * 180 / Math.PI;
}

vr.getNewID = (function()
{
    'use strict';
    
    var IDCounter = 0;
    return function()
    {
        return (IDCounter++).toString();
    };
})();
