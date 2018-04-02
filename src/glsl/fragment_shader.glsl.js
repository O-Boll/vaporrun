const fragmentShaderString =
[
    'precision mediump float;',
    '',
    'varying vec2 fragmentTextureCoordinates;',
    'uniform sampler2D sampler;',
    '',
    'void main()',
    '{',
    '    gl_FragColor = texture2D(sampler, fragmentTextureCoordinates);',
    '}'
].join('\n');
