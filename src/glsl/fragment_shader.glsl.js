vr.fragmentShaderSource =
`
precision mediump float;

varying vec2 fragmentTextureCoordinates;
uniform sampler2D diffuseMap;

varying float zDistance;

void main()
{
    float fogNear = 120.0;
    float fogFar = 200.0;
    float alpha = 0.5;
    if(zDistance < fogNear) {
        alpha = 1.0;
    }
    if(zDistance > fogFar) {
        alpha = 0.0;
    }
    else {
        alpha = (fogFar - zDistance) / (fogFar - fogNear);
    }
    vec4 v = texture2D(diffuseMap, fragmentTextureCoordinates);
    gl_FragColor = vec4(v.x, v.y, v.z, alpha);
}
`;
