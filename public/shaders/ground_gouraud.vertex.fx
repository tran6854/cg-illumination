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
uniform float mat_shininess;
uniform vec2 texture_scale;
// camera
uniform vec3 camera_position;
// lights
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec2 model_uv;
out vec3 diffuse_illum;
out vec3 specular_illum;

void main() {
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
    vec3 normal = normalize(cross(tangent, bitangent));

    // Pass diffuse and specular illumination onto the fragment shader
    vec3 viewDir = camera_position-position;
    //diffuse
    vec3 N = normal;
    vec3 lightDir, L, R, V;
    float NdL, RdV;

    for(int i=0; i<num_lights; i++){
        lightDir = light_positions[i]-position;
        L = normalize(lightDir);

        NdL = max(dot(N, L), 0.0);

        diffuse_illum += light_colors[i]*NdL;

        //specular
        R = normalize(2.0*dot(N, L)*N-L);
        V = normalize(viewDir);
        RdV = max(dot(R, V), 0.0);
        specular_illum += light_colors[i]*pow(RdV, mat_shininess);
    }

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;
    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * vec4(new_pos, 1.0);
}
