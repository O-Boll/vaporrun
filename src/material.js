
vr.Material = function()
{
    this.diffuseMap = null;
}

vr.createTextureArray = function()
{
    'use strict';
    
    const anisotropicFilterExtension = vr.gl.getExtension
    (
        'EXT_texture_filter_anisotropic'
    );
    let maxAnisotropy = 1;
    
    if(anisotropicFilterExtension)
        maxAnisotropy = vr.gl.getParameter
        (
            anisotropicFilterExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT
        );
    else
        console.warn('WARNING Anisotropic filtering unavailable!');
    
    let textures = {};
    
    const textureHTMLCollection = document.getElementsByClassName("texture");
    const numberOfTextures = textureHTMLCollection.length;

    for(let i = 0; i < numberOfTextures; i++)
    {
        const image = textureHTMLCollection[i];
        const isCubeMap = image.classList.contains('cm');
        let texture;
        if(isCubeMap)
        {
            texture = vr.createCubeMapTextureFromImage(image);
        }
        else
        {
            texture = vr.create2DTextureFromImage
            (
                image,
                anisotropicFilterExtension,
                maxAnisotropy
            );
        }
        textures[image.id] = texture;
    }
    return textures;
}

vr.create2DTextureFromImage = function
(
    image,
    anisotropicFilterExtension,
    maxAnisotropy
)
{
    'use strict';
    
    let texture = vr.gl.createTexture();
    vr.gl.bindTexture(vr.gl.TEXTURE_2D, texture);
    vr.gl.pixelStorei(vr.gl.UNPACK_FLIP_Y_WEBGL, true);
    vr.gl.texImage2D
    (
        vr.gl.TEXTURE_2D,
        0,
        vr.gl.RGBA,
        vr.gl.RGBA,
        vr.gl.UNSIGNED_BYTE,
        image
    );
    vr.gl.generateMipmap(vr.gl.TEXTURE_2D);
    const wrapMode = vr.gl.REPEAT;
    vr.gl.texParameteri(vr.gl.TEXTURE_2D, vr.gl.TEXTURE_WRAP_S, wrapMode);
    vr.gl.texParameteri(vr.gl.TEXTURE_2D, vr.gl.TEXTURE_WRAP_T, wrapMode);
    const useAnisotropicFiltering = image.classList.contains('af');    
    if(useAnisotropicFiltering && maxAnisotropy > 1)
    {
        vr.gl.texParameterf
        (
            vr.gl.TEXTURE_2D,
            anisotropicFilterExtension.TEXTURE_MAX_ANISOTROPY_EXT,
            maxAnisotropy
        );
    }
    
    return texture;
}

vr.createCubeMapTextureFromImage = function(image)
{
    'use strict';
    
    let cubeMap = vr.gl.createTexture();
    vr.gl.bindTexture(vr.gl.TEXTURE_CUBE_MAP, cubeMap);    
    vr.gl.pixelStorei(vr.gl.UNPACK_FLIP_Y_WEBGL, true);
    let targets =
    [
        vr.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        vr.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        vr.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        vr.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        vr.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        vr.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];
    for(const i in targets)
    {
        const target = targets[i];
        vr.gl.texImage2D
        (
            target,
            0,
            vr.gl.RGBA,
            vr.gl.RGBA,
            vr.gl.UNSIGNED_BYTE,
            image
        );
    }
    const wrapMode = vr.gl.CLAMP_TO_EDGE;
    vr.gl.texParameteri(vr.gl.TEXTURE_2D, vr.gl.TEXTURE_WRAP_S, wrapMode);
    
    return cubeMap;
}

