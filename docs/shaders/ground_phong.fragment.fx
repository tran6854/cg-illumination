#version 300 es
precision mediump float;

// Input
in vec3 model_normal;
in vec2 model_uv;
in vec3 model_position;

// Uniforms
// material
uniform vec3 mat_color;
uniform vec3 mat_specular;
uniform float mat_shininess;
uniform sampler2D mat_texture;
// camera
uniform vec3 camera_position;
// lights
uniform vec3 ambient; // Ia
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec4 FragColor;

void main() {
    // Pass diffuse and specular illumination onto the fragment shader
    vec3 viewDir = camera_position-model_position;
    //diffuse
    vec3 N = model_normal;
    vec3 lightDir, L, R, V, diffuse_illum, specular_illum;
    float NdL, RdV;

    for(int i=0; i<num_lights; i++) {
        lightDir = light_positions[i]-model_position;
        L = normalize(lightDir);

        NdL = max(dot(N, L), 0.0);

        diffuse_illum += light_colors[i]*NdL;

        //specular
        R = normalize(2.0*dot(N, L)*N-L);
        V = normalize(viewDir);
        RdV = max(dot(R, V), 0.0);
        specular_illum += light_colors[i]*pow(RdV, mat_shininess);
    }

    vec3 model_color = mat_color * texture(mat_texture, model_uv).rgb; //ka & kd
    model_color = (model_color * ambient) + (model_color * diffuse_illum) + (mat_specular * specular_illum);

    // Color
    FragColor = vec4(model_color, 1.0);
}
