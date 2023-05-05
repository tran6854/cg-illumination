#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec2 uv;

// Uniforms
// projection 3D to 2D
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
// height displacement
uniform vec2 ground_size;
uniform float height_scalar;
uniform sampler2D heightmap;
// material
uniform vec2 texture_scale;

// Output
out vec3 model_normal;
out vec2 model_uv;
out vec3 model_position;

void main() {
    model_position = position;

    vec3 new_pos = (world*vec4(position, 1.0)).xyz;

    //Height displacement
    float d = 2.0*height_scalar*(texture(heightmap, uv).r-0.5);

    //Calculate the normal
    vec3 neighbor1_pos = new_pos;
    neighbor1_pos.x += 0.1;
    vec2 neighbor1_uv = uv;
    neighbor1_uv.x += 0.1/ground_size.x;

    vec3 neighbor2_pos = new_pos;
    neighbor2_pos.z += 0.1;
    vec2 neighbor2_uv = uv;
    neighbor2_uv.y += 0.1/ground_size.y;

    new_pos.y += d;

    d = 2.0*height_scalar*(texture(heightmap, neighbor1_uv).r-0.5);
    neighbor1_pos.y += d;

    d = 2.0*height_scalar*(texture(heightmap, neighbor2_uv).r-0.5);
    neighbor2_pos.y += d;

    vec3 tangent = neighbor1_pos - new_pos;
    vec3 bitangent = neighbor2_pos - new_pos;
    model_normal = normalize(cross(tangent, bitangent));

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world * vec4(position, 1.0);
}
