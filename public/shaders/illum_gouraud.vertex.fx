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
uniform float mat_shininess;
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
    // Pass diffuse and specular illumination onto the fragment shader
    mat3 world3x3 = mat3(world);
    vec3 viewDir = camera_position-position;

    //diffuse
    mat3 tp_inv_world = transpose(inverse(world3x3));
    vec3 N = normalize(tp_inv_world*normal);

    vec3 lightDir = light_positions[0]-position;
    vec3 L = normalize(lightDir);

    float NdL = max(dot(N, L), 0.0);

    vec3 Idiff = light_colors[0]*NdL;

    //specular
    vec3 R = normalize(2.0*dot(N, L)*N-L);
    vec3 V = normalize(viewDir);
    float RdV = max(dot(R, V), 0.0);
    vec3 Ispec = light_colors[0]*pow(RdV, mat_shininess);

    
    // for(int i=0; i<num_lights; i++){
        
    // }


    diffuse_illum = Idiff;
    specular_illum = Ispec;

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;
    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world * vec4(position, 1.0);
}
