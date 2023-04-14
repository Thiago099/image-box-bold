
import './style.css'
const canvas = <canvas></canvas>;

const input = <input type="number" value="1" />;


canvas.width = 500;
canvas.height = 500;
//add to body
canvas.$parent(document.body);
input.$parent(document.body);

 // Get the canvas and WebGL context
 var gl = canvas.getContext("webgl2");

 // Define the vertices of the screen quad
 var vertices = [
     -1, -1,
      1, -1,
     -1,  1,
      1,  1
 ];

 // Create a buffer for the vertices
 var vertexBuffer = gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
 gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


 // Create the vertex and fragment shaders
 var vertexShaderSource = `
     attribute vec2 a_position;
     void main() {
         gl_Position = vec4(a_position, 0, 1);
     }
 `;
 function fixFloat(num)
 {
    num = num.toString();
    if(num.indexOf(".") == -1)
    {
        return num+".0";
    }
    return num;
 }
 function fixInt(num)
 {
    num = num.toString();
    if(num.indexOf(".") == -1)
    {
        return num;
    }
    return num.split(".")[0];
 }
 var fragmentShaderSource = (thickness = 0)=>`
     precision mediump float;
     uniform sampler2D u_texture;
     void main() {
            vec2 fragCoord = gl_FragCoord.xy;
            vec2 uv = vec2(fragCoord.x, -fragCoord.y+500.0);

            vec4 color = vec4(1.0);

            for (int i = ${fixInt(-thickness)}; i < ${fixInt(thickness)}; i++) {
                for (int j = ${fixInt(-thickness)}; j < ${fixInt(thickness)}; j++) {
                    float dist = sqrt(float(i*i + j*j));
                    if (dist < ${fixFloat(thickness)}) {
                        vec2 offset = vec2(float(i), float(j));
                        color = min(color,texture2D(u_texture, clamp((uv + offset * 1.0)/500.0,0.0,1.0) ));
                    }
                }
            }


            gl_FragColor = vec4(clamp(color.xyz, 0.0, 1.0),1);
     }
 `;
 console.log(fragmentShaderSource(1));
 var vertexShader = gl.createShader(gl.VERTEX_SHADER);
 gl.shaderSource(vertexShader, vertexShaderSource);
 gl.compileShader(vertexShader);
 var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
 gl.shaderSource(fragmentShader, fragmentShaderSource());
 gl.compileShader(fragmentShader);

 // Create the shader program and attach the shaders
 var shaderProgram = gl.createProgram();
 gl.attachShader(shaderProgram, vertexShader);
 gl.attachShader(shaderProgram, fragmentShader);
 gl.linkProgram(shaderProgram);

 // Use the shader program and set the texture uniform
 gl.useProgram(shaderProgram);

 // Bind the vertex buffer and set the vertex attribute pointer
 gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
 var positionAttributeLocation = gl.getAttribLocation(shaderProgram, "a_position");
 gl.enableVertexAttribArray(positionAttributeLocation);
 gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

 //uThickness
function changeThickness(){
    gl.shaderSource(fragmentShader, fragmentShaderSource(input.value));
    gl.compileShader(fragmentShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
}
input.$on("change", changeThickness);
changeThickness();

 // Draw the screen quad
 // and draw the quad
 // Create a texture
 var image = new Image();
 image.onload = function() {
     var texture = gl.createTexture();
     //no tile

     gl.activeTexture(gl.TEXTURE0);
     gl.bindTexture(gl.TEXTURE_2D, texture);
     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
     //no tile
     gl.generateMipmap(gl.TEXTURE_2D);
     gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_texture"), 0);
     draw();
 };
 image.src = "image.png";
 //add image to body


 function draw() {
     requestAnimationFrame(draw);
     gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
 }
