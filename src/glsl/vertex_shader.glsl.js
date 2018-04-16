vr.vertexShaderSource =
`
precision mediump float;
attribute vec3 vertexCoordinates;
attribute vec2 textureCoordinates;
varying vec2 fragmentTextureCoordinates;
varying float zDistance;
uniform mat4 worldMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

void main()
{

    zDistance = -(viewMatrix * worldMatrix * vec4(vertexCoordinates, 1.0)).z;
    fragmentTextureCoordinates = textureCoordinates;
    gl_Position =   projectionMatrix * viewMatrix * worldMatrix
                  * vec4(vertexCoordinates, 1.0);
}
`;
