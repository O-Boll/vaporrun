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
* Map holds the data and methods pertaining to the layout and style of the road
* network and its immediate surroundings.
*/
vr.Map = function()
{
    'use strict';
    
    this.approximateQuadLength = 10;
    this.approximateSubsequenceLength = 1;
    
    this.roadSegments = {};
    
    const p = vec3.fromValues(0, 0, 0);
    const q = vec3.fromValues(0, 0, 100);
    const r = vec3.fromValues(100, -30, 200);
    const s = vec3.fromValues(100, -30, 300);
    let rs1 = new vr.RoadSegment(p, q, r, s, 0, this.approximateSubsequenceLength, this.approximateQuadLength);
    let l1 = new vr.Lane(0, 6);
    rs1.addLane(l1);
    let l2 = new vr.Lane(6, 6);
    rs1.addLane(l2);
    this.addRoadSegment(rs1);
    
    const p_ = vec3.fromValues(100, -30, 300);
    const q_ = vec3.fromValues(100, -30, 400);
    const r_ = vec3.fromValues(0, 0, 400);
    const s_ = vec3.fromValues(0, 0, 500);
    let rs2 = new vr.RoadSegment(p_, q_, r_, s_, rs1.vFar, this.approximateSubsequenceLength, this.approximateQuadLength);
    let l3 = new vr.Lane(6, 6);
    l3.addStartConnection(l2);
    rs2.addLane(l3);
    this.addRoadSegment(rs2);    
    
    
    const p__ = vec3.fromValues(100, -30, 300);
    const q__ = vec3.fromValues(100, -30, 400);
    const r__ = vec3.fromValues(-5, 3, 400);
    const s__ = vec3.fromValues(-5, 3, 500);
    let rs3 = new vr.RoadSegment(p__, q__, r__, s__, rs1.vFar, this.approximateSubsequenceLength, this.approximateQuadLength);
    let l4 = new vr.Lane(0, 6);
    l4.addStartConnection(l1);
    rs3.addLane(l4);
    this.addRoadSegment(rs3);
}

vr.Map.prototype.addRoadSegment = function(roadSegment)
{
    'use strict';
    
    this.roadSegments[vr.getNewID()] = roadSegment;
}

vr.Map.prototype.computeRoadCoordinates = function(referenceRoadSegment, u, v)
{
    /* Fills the quadVertexBuffer and returns the number of vertices to draw. */
    
    'use strict';
    
    const position = vec3.create();
    const tangent = vec3.create();
    referenceRoadSegment.getPosition(position, tangent, u, v);
    const referenceDistance = vec3.dot(tangent, position);
    const uDirection = referenceRoadSegment.getUDirection(u, v);
    
    let i = 0;
    for(let roadSegmentID in this.roadSegments)
    {
        const roadSegment = this.roadSegments[roadSegmentID];
        const polyline = roadSegment.quadPolyline;
        
        for(let laneID in roadSegment.lanes)
        {
            const lane = roadSegment.lanes[laneID];
            const leftEdge = lane.u;
            const rightEdge = lane.u + lane.width;
            for(let k = 0; k < polyline.length - 1; k++, i++)
            {
                const p = vec3.clone(polyline[k]);
                
                if(vec3.dot(tangent, p) - referenceDistance > 200)
                {
                    break;
                }
                
                const q = vec3.clone(polyline[k + 1]);
                
                const nl = vec3.create();
                const nr = vec3.create();
                const fl = vec3.create();
                const fr = vec3.create();
                
                vec3.scaleAndAdd(nl, p, uDirection, leftEdge);
                vec3.scaleAndAdd(nr, p, uDirection, rightEdge);
                vec3.scaleAndAdd(fl, q, uDirection, leftEdge);
                vec3.scaleAndAdd(fr, q, uDirection, rightEdge);
                
                const quadVertexCoordinates =
                [
                    /* Triangle 1 */
                    nl[0], nl[1], nl[2],
                    fr[0], fr[1], fr[2],
                    nr[0], nr[1], nr[2],
                    
                    /* Triangle 2 */
                    nl[0], nl[1], nl[2],
                    fl[0], fl[1], fl[2],
                    fr[0], fr[1], fr[2]
                ];
                
                const quadTextureCoordinates =
                [
                    /* Triangle 1 */
                    0, 0,
                    1, 1,
                    1, 0,
                    
                    /* Triangle 2 */
                    0, 0,
                    0, 1,
                    1, 1
                ];
                
                vr.gl.bindBuffer
                (
                    vr.gl.ARRAY_BUFFER,
                    vr.quadVertexBuffer
                );
                vr.gl.bufferSubData
                (
                    vr.gl.ARRAY_BUFFER,
                    i * 18 * Float32Array.BYTES_PER_ELEMENT,
                    new Float32Array(quadVertexCoordinates)
                );
                
                vr.gl.bindBuffer
                (
                    vr.gl.ARRAY_BUFFER,  vr.quadTextureCoordinateBuffer
                );
                vr.gl.bufferSubData
                (
                    vr.gl.ARRAY_BUFFER,
                    i * 12 * Float32Array.BYTES_PER_ELEMENT,
                    new Float32Array(quadTextureCoordinates)
                );
            }
        }
    }
    return 6 * i;
}

/**
* RoadSegment implements a road segment os variable length and shape, with a
* variable number of lanes. The lanes are connected to other lanes (belonging to
* other road segments) at each end of the road segment.
*/
vr.RoadSegment = function
(
    p, q, r, s,
    vNear,
    approximateSubsegmentLength,
    approximateQuadLength
)
{
    /* Constructs a road segment from the control points of a cubic
       Bézier curve (p, q, r, s).*/
    
    'use strict';
    
    this.lanes = {};
    
    this.vNear = vNear;
    
    this.quadPolyline = vr.bezierToEquidistantPolyline
    (
        p, q, r, s,
        approximateQuadLength
    );
    this.quadLength = vec3.distance
    (
        this.quadPolyline[0],
        this.quadPolyline[1]
    );
    
    this.subsegmentPolyline = vr.bezierToEquidistantPolyline
    (
        p, q, r, s,
        approximateSubsegmentLength
    );
    this.subsegmentLength = vec3.distance
    (
        this.subsegmentPolyline[0],
        this.subsegmentPolyline[1]
    );
    this.segmentLength = this.subsegmentLength
                         * (this.subsegmentPolyline.length - 1);
                         
    this.vFar = this.vNear + this.segmentLength;
    
    this.tangents = vr.polylineTangents(p, q, r, s, this.subsegmentPolyline);
    
    this.numberOfLanes = 1;
}

vr.RoadSegment.prototype.addLane = function(lane)
{
    'use strict';
    
    lane.parent = this;
    this.lanes[vr.getNewID()] = lane;
}

vr.RoadSegment.prototype.getLane = function(u)
{
    'use strict';
    
    for(let laneID in this.lanes)
    {
        const lane = this.lanes[laneID];
        const leftEdge = lane.u;
        const rightEdge = lane.u + lane.width;
        if(leftEdge <= u && u <= rightEdge)
        {
            return lane;
        }
    }
    return null;
}

vr.RoadSegment.prototype.getPosition = function(outPosition, outTangent, u, v)
{
    /* Sets outPosition and outTangent (both vec3) to the position and tangent
       vectors corresponding to the road coordinates (u, v). If v is past the
       end of the road segment and u corresponds to a lane that continues in a
       new segment, then the position in the new segment is returned. The road
       segment to which the position belongs is returned. */
    
    'use strict';
    
    const polyline = this.subsegmentPolyline;
    const tangents = this.tangents;
    
    let position = vec3.create();
    let tangent = vec3.create();
    
    const lane = this.getLane(u);
    
    /* If we have not yet reached the start of the road segment. */
    if(v <= this.vNear)
    {
        /* If we are on a lane that has a start connection, we check for our
           position on the connecting lane. */
        if(lane != null && lane.connectsToAtStart != null)
        {
            const prevRoadSegment = lane.connectsToAtStart.parent;
            return prevRoadSegment.getPosition(outPosition, outTangent, u, v);
        }
        else
        {
            position = vec3.clone(polyline[0]);
            tangent = vec3.clone(tangents[0]);
        }
    }
    /* If we have reached the end of the road segment. */
    else if(v >= this.vFar)
    {
        /* If we are on a lane that has an end connection, we continue on the
           connecting lane. */
        if(lane != null && lane.connectsToAtEnd != null)
        {
            const nextRoadSegment = lane.connectsToAtEnd.parent;
            return nextRoadSegment.getPosition(outPosition, outTangent, u, v);
        }
        else
        {
            position = vec3.clone(polyline[polyline.length - 1]);
            tangent = vec3.clone(tangents[tangents.length - 1]);
        }
    }
    else
    {
        const i = Math.floor((v - this.vNear) / this.subsegmentLength);
        const t = (v - this.vNear - i * this.subsegmentLength)
                  / this.subsegmentLength;
        vec3.lerp(position, polyline[i], polyline[i + 1], t);
        vec3.lerp(tangent, tangents[i], tangents[i + 1], t);
    }
    let uDirection = vec3.create();
    vec3.cross(uDirection, vec3.fromValues(0, 1, 0), tangent);
    vec3.scaleAndAdd(position, position, uDirection, u);
    
    for(let i = 0; i < 3; i++)
    {
        outPosition[i] = position[i];
        outTangent[i] = tangent[i];
    }
    return this;
}

vr.RoadSegment.prototype.getUDirection = function(u, v)
{
    'use strict';
    
    let position = vec3.create();
    let tangent = vec3.create();
    
    this.getPosition(position, tangent, u, v);
    
    let uDirection = vec3.create();
    vec3.cross(uDirection, vec3.fromValues(0, 1, 0), tangent);
    
    return uDirection;
}

/**
* Returns the signed curvature of the road polygon, projected onto the xz-plane,
* in degrees.
*/
vr.RoadSegment.prototype.getCurvature = function(v)
{
    'use strict';
    
    const polyline = this.subsegmentPolyline;
    const tangents = this.tangents;
    let curvature = 0;
    
    if(this.vNear <= v && v < this.vFar)
    {
        const i = Math.floor((v - this.vNear) / this.subsegmentLength);
        let t0 = vec3.clone(tangents[i]);
        let t1;
        if(i < tangents.length - 1)
        {
            t1 = vec3.clone(tangents[i + 1]);
        }
        else
        {
            t1 = vec3.clone(tangents[i - 1]);
        }
        t0[1] = 0;
        t1[1] = 0;
        vec3.normalize(t0, t0);
        vec3.normalize(t1, t1);
        const sign = Math.sign(t0[0] * t1[2] - t0[2] * t1[0]);
        curvature = sign * Math.acos(vec3.dot(t0, t1)) / this.subsegmentLength;
        curvature = isNaN(curvature) ? 0 : curvature;
    }
    return vr.radiansToDegrees(curvature);
}

vr.bezierToEquidistantPolyline = function(p, q, r, s, approxSegmentLength)
{
    /* The arguments a, b, c and d are the control points of a cubic Bézier
       curve. */
    /* NOTE: The name of this function is a bit misleading. The polyline
       returned is not equidistant in the sense that its segments have equal
       length. However, the lengths between adjacent vertices of the polyline
       should be approximately equal when measured along the Bézier curve. */
    
    'use strict';
    
    /* First we construct a non-equidistant polyline. */
    let polyline = [p];
    let polylineLength = 0;
    
    const steps = 1000; /* Higher value gives better approximation. */
    for(let i = 1; i <= steps; i++)
    {
        const t = i / steps;
        let vertex = vec3.create();
        vec3.bezier(vertex, p, q, r, s, t);
        polyline[i] = vertex;
        polylineLength += vec3.distance(polyline[i - 1], polyline[i]);
    }    
    
    /* Next, we proceed to construct an equidistant polyline from the polyline we. */
    const numberOfSegments = Math.max
    (
        1,
        Math.round(polylineLength / approxSegmentLength)
    );
    const segLength = polylineLength / numberOfSegments;
    let vertex = p;
    let j = 1;
    let length = 0;
    let equidistantPolyline = [vec3.clone(vertex)];
    
    for(let i = 1; i < numberOfSegments; i++)
    {
        let nextVertex = polyline[j];
        let nextSegLength = vec3.distance(vertex, nextVertex);
        while(length + nextSegLength <= i * segLength)
        {
            length += nextSegLength;
            vertex = nextVertex;
            j++;
            nextVertex = polyline[j];
            nextSegLength = vec3.distance(vertex, nextVertex);
        }
        let t = 1 - ((length + nextSegLength) - i * segLength) / nextSegLength;
        length = i * segLength;
        vec3.lerp(vertex, vertex, nextVertex, t);
        equidistantPolyline.push(vec3.clone(vertex));
    }
    equidistantPolyline.push(vec3.clone(s));
    
    return equidistantPolyline;
}

vr.polylineTangents = function(p, q, r, s, polyline)
{
    /* Returns an array of tangent vectors to the polyline at each vertex. The
       first and last tangents are given by the arguments p, q, r and s, which
       are the control points of the cubic Bézier curve that was used to
       generate the polynomial (see the function
       vr.bezierToEquidistantPolyline). */
    
    'use strict';
    
    let firstTangent = vec3.create();
    vec3.sub(firstTangent, q, p);
    vec3.normalize(firstTangent, firstTangent);
    
    let tangents = [firstTangent];
    
    for(let i = 1; i < polyline.length - 1; i++)
    {
        let u = vec3.create();
        vec3.sub(u, polyline[i], polyline[i - 1]);
        let v = vec3.create();
        vec3.sub(v, polyline[i + 1], polyline[i]);
        let tangent = vec3.create();
        vec3.add(tangent, v, u);
        vec3.normalize(tangent, tangent);
        tangents[i] = tangent;
    }
    
    let lastTangent = vec3.create();
    vec3.sub(lastTangent, s, r);
    vec3.normalize(lastTangent, lastTangent);
    
    tangents.push(lastTangent);
    
    return tangents;
}

/**
* Lane holds data pertaining to a single lane in a road segment.
*/
vr.Lane = function(u, width)
{
    'use strict';

    this.parent = null; /* A road segment. */
    this.connectsToAtStart = null; /* A lane. */
    this.connectsToAtEnd = null; /* A lane. */
    
    this.u = u; /* The u-coordinate of the left edge of the lane. */
    this.width = width;
}

vr.Lane.prototype.addStartConnection = function(lane)
{
    'use strict';
    
    this.connectsToAtStart = lane;
    lane.connectsToAtEnd = this;
}

vr.Lane.prototype.addEndConnection = function(lane)
{
    'use strict';
    
    this.connectsToAtEnd = lane;
    lane.connectsToAtStart = this;
}
