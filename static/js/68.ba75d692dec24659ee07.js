webpackJsonp([68],{813:function(t,n){t.exports='/*{\n\t"DESCRIPTION": "",\n\t"CREDIT": "by VIDVOX",\n\t"ISFVSN": "2",\n\t"CATEGORIES": [\n\t\t"Glitch"\n\t],\n\t"INPUTS": [\n\t\t{\n\t\t\t"NAME": "inputImage",\n\t\t\t"TYPE": "image"\n\t\t},\n\t\t{\n\t\t\t"NAME": "horizontal_magnitude",\n\t\t\t"TYPE": "float",\n\t\t\t"MIN": 0.00,\n\t\t\t"MAX": 1.0,\n\t\t\t"DEFAULT": 0.125\n\t\t},\n\t\t{\n\t\t\t"NAME": "vertical_magnitude",\n\t\t\t"TYPE": "float",\n\t\t\t"MIN": 0.00,\n\t\t\t"MAX": 1.0,\n\t\t\t"DEFAULT": 0.125\n\t\t},\n\t\t{\n\t\t\t"NAME": "color_magnitude",\n\t\t\t"TYPE": "float",\n\t\t\t"MIN": 0.00,\n\t\t\t"MAX": 2.0,\n\t\t\t"DEFAULT": 1.0\n\t\t},\n\t\t{\n\t\t\t"NAME": "mode",\n\t\t\t"VALUES": [\n\t\t\t\t0,\n\t\t\t\t1,\n\t\t\t\t2,\n\t\t\t\t3\n\t\t\t],\n\t\t\t"LABELS": [\n\t\t\t\t"add",\n\t\t\t\t"add mod",\n\t\t\t\t"multiply",\n\t\t\t\t"difference"\n\t\t\t],\n\t\t\t"DEFAULT": 0,\n\t\t\t"TYPE": "long"\n\t\t}\n\t]\n\t\n}*/\n\n\n\n//\tadapted from maxilla inc\'s https://github.com/maxillacult/ofxPostGlitch/\n\n\n\nfloat rand(vec2 co){\n    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\n\n\nvoid main()\n{\n\t\n\tvec2 texCoord = isf_FragNormCoord;\n\n\tvec4 col = IMG_NORM_PIXEL(inputImage,texCoord);\n\n\tvec4 col_r = vec4(0.0);\n\tvec4 col_l = vec4(0.0);\n\tvec4 col_g = vec4(0.0);\n\n\tvec2 rand_offset = texCoord + vec2((horizontal_magnitude * rand(vec2(TIME,0.213))-horizontal_magnitude/2.0), (vertical_magnitude * rand(vec2(TIME,0.463467))) - vertical_magnitude / 2.0);\n\tcol_r = IMG_NORM_PIXEL(inputImage,rand_offset);\n\trand_offset = texCoord + vec2((horizontal_magnitude * rand(vec2(TIME,0.5345))-horizontal_magnitude/2.0), (vertical_magnitude * rand(vec2(TIME,0.7875))) - vertical_magnitude / 2.0);\n\tcol_l = IMG_NORM_PIXEL(inputImage,rand_offset);\n\trand_offset = texCoord + vec2((horizontal_magnitude * rand(vec2(TIME,0.456345))-horizontal_magnitude/2.0), (vertical_magnitude * rand(vec2(TIME,0.9432))) - vertical_magnitude / 2.0);\n\tcol_g = IMG_NORM_PIXEL(inputImage,rand_offset);\n\n\tvec4 color_shift;\n\tcolor_shift.b = color_magnitude*col_r.b*max(1.0,sin(texCoord.y*1.2)*2.5)*rand(vec2(TIME,0.0342));\n\tcolor_shift.r = color_magnitude*col_l.r*max(1.0,sin(texCoord.y*1.2)*2.5)*rand(vec2(TIME,0.5253));\n\tcolor_shift.g = color_magnitude*col_g.g*max(1.0,sin(texCoord.y*1.2)*2.5)*rand(vec2(TIME,0.1943));\n\n\t//\tif doing add maths\n\tif (mode == 0)\t{\n\t\tcol = col + color_shift;\n\t}\n\t//\tadd mod\n\telse if (mode == 1)\t{\n\t\tcol = mod(col + color_shift,1.001);\n\t}\n\t//\tmultiply\n\telse if (mode == 2)\t{\n\t\tcol = mix(col, col * (color_magnitude + color_shift),0.9);\n\t}\n\t// difference\n\telse if (mode == 3)\t{\n\t\tcol = abs(color_shift - col);\n\t}\n\n\tgl_FragColor = col;\n}\n'}});