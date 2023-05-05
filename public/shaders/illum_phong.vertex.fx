#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec3 normal;
in vec2 uv;

// Uniforms
// projection 3D to 2D
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
// material
uniform vec2 texture_scale;

// Output
out vec3 model_normal;
out vec2 model_uv;
out vec3 model_position;

void main() {
    mat3 world3x3 = mat3(world);
    model_position = (world*vec4(position, 1.0)).xyz;

    // Pass vertex normal onto the fragment shader
    mat3 tp_inv_world = inverse(transpose(world3x3));
    model_normal = normalize(tp_inv_world*normal);

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv*texture_scale;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world * vec4(position, 1.0);
}
