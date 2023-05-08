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
    vec3 new_pos = (world*vec4(position, 1.0)).xyz;
    vec3 viewDir = camera_position-new_pos;

    //diffuse
    mat3 tp_inv_world = inverse(transpose(world3x3));
    vec3 N = normalize(tp_inv_world*normal);
    vec3 lightDir, L, R, V;
    float NdL, RdV;

    for(int i=0; i<num_lights; i++){
    
        lightDir = light_positions[i]-new_pos;
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
    model_uv = uv*texture_scale;
    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world * vec4(position, 1.0);
}
