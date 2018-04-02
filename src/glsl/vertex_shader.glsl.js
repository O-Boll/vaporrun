const vertexShaderString =
[
    'precision mediump float;',
    'attribute vec3 vertexPosition;',
    'attribute vec2 vertexTextureCoordinates;',
    'varying vec2 fragmentTextureCoordinates;',
    'uniform mat4 mWorld;',
    'uniform mat4 mView;',
    'uniform mat4 mProj;',
    '',
    'void main()',
    '{',
    '    fragmentTextureCoordinates = vertexTextureCoordinates;',
    '    gl_Position = mProj * mView * mWorld * vec4(vertexPosition, 1.0);',
    '}'
].join('\n');
