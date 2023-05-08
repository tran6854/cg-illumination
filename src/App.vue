<script>
import { Engine } from '@babylonjs/core/Engines/engine';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
import { Vector2 } from '@babylonjs/core/Maths/math.vector';

import { Renderer } from './renderer'

export default {
    data() {
        return {
            renderer: null,
            height_scale: 1.0
        }
    },
    methods: {
        createBasicMaterial(name, shader_path, scene) {
            let basic_mat = new ShaderMaterial(name, scene, shader_path, {
                attributes: ['position', 'normal', 'uv'],
                uniforms: ['world', 'view', 'projection', 'mat_color', 'mat_specular', 'mat_shininess', 'texture_scale',
                           'camera_position', 'ambient', 'num_lights', 'light_positions', 'light_colors'],
                samplers: ['mat_texture']
            });
            basic_mat.backFaceCulling = false;
            basic_mat.onBindObservable.add((mesh) => {
                const shader = basic_mat.getEffect();
                shader.setColor3('mat_color', mesh.metadata.mat_color);
                shader.setTexture('mat_texture', mesh.metadata.mat_texture);
                shader.setVector2('texture_scale', mesh.metadata.texture_scale);
                shader.setColor3('mat_specular', mesh.metadata.mat_specular);
                shader.setFloat('mat_shininess', mesh.metadata.mat_shininess);
            });
            return basic_mat;
        },

        createGroundMaterial(name, shader_path, scene) {
            let ground_mat = new ShaderMaterial(name, scene, shader_path, {
                attributes: ['position', 'uv'],
                uniforms: ['world', 'view', 'projection', 'mat_color', 'mat_specular', 'mat_shininess', 'ground_size',
                           'height_scalar', 'texture_scale', 'camera_position', 'ambient', 'num_lights', 'light_positions',
                           'light_colors'],
                samplers: ['mat_texture', 'heightmap']
            });
            ground_mat.backFaceCulling = false;
            ground_mat.onBindObservable.add((mesh) => {
                const shader = ground_mat.getEffect();
                shader.setColor3('mat_color', mesh.metadata.mat_color);
                shader.setTexture('mat_texture', mesh.metadata.mat_texture);
                shader.setVector2('texture_scale', mesh.metadata.texture_scale);
                shader.setColor3('mat_specular', mesh.metadata.mat_specular);
                shader.setFloat('mat_shininess', mesh.metadata.mat_shininess);
                shader.setVector2('ground_size', new Vector2(mesh.scaling.x, mesh.scaling.z));
                shader.setFloat('height_scalar', mesh.metadata.height_scalar);
                shader.setTexture('heightmap', mesh.metadata.heightmap);
            });
            return ground_mat;
        },

        createGroundModel(name, subdivisions, scene) {
            let ground = new Mesh(name, scene);
            let vertex_positions = [];
            let vertex_texcoords = [];
            let triangle_indices = [];
            for (let j = 0; j <= subdivisions[1]; j++) {
                let v = j / subdivisions[1];
                let curr_row = j * (subdivisions[0] + 1);
                let next_row = (j + 1) * (subdivisions[0] + 1);
                for (let i = 0; i <= subdivisions[0]; i++) {
                    let u = i / subdivisions[0];
                    vertex_positions.push(u - 0.5, 0.0, v - 0.5);
                    vertex_texcoords.push(u, v);
                    if (j < subdivisions[1] && i < subdivisions[0]) {
                        triangle_indices.push(curr_row + i, curr_row + i + 1, next_row + i);
                        triangle_indices.push(next_row + i, curr_row + i + 1, next_row + i + 1);
                    }
                }
            }

            let vertex_data = new VertexData();
            vertex_data.positions = vertex_positions;
            vertex_data.uvs = vertex_texcoords;
            vertex_data.indices = triangle_indices;
            vertex_data.applyToMesh(ground);

            return ground;
        },
        appendRect(arr, x, y, z, w, h, d){
            let result = arr;
            let vertices = [
                x, y, z,
                x, y+h, z-d,
                x+w, y+h, z-d,

                x, y, z,
                x+w, y+h, z-d,
                x+w, y, z
            ];

            for (let i=0; i<vertices.length; i++){
                result.push(vertices[i]);
            }
            
            return result;
        },
        appendArrays(arr1, arr2){
            let result = arr1;
            for (let i=0; i<arr2.length; i++){
                result.push(arr2[i]);
            }
            return result;
        },

        createBoatModel(name, scene){
            //probably wont need to use subdivision
            let triangle = new Mesh(name, scene);
            let vertex_positions = [];
            let vertex_texcoords = [];
            let triangle_indices = [];

            let x = -1;
            let y = -4.9;
            let z = -5;
            let height = 0.5;
            let depth = 0.2;
            let width = 1.5;
            //bottom
            // vertex_positions = this.appendRect(vertex_positions, x,     y,     z-depth,    width, 0,   1-depth-depth);
            vertex_positions = this.appendRect(vertex_positions, x,     y,     z-depth-0.6,    width, 0,   -(1-depth-depth));
            
            //sides
            vertex_positions = this.appendRect(vertex_positions, x,     y,     z-depth,    width, height, -depth);
            vertex_positions = this.appendRect(vertex_positions, x+width, y,     z-1+depth, -width, height, depth);

            //top
            vertex_positions = this.appendRect(vertex_positions, x,     y+height, z,        width, 0,   1);

            //boat tips
            let boatTip1 = [
                x + width, y, z-depth,
                x + width + (1.5*0.5), y+0.5, z-0.5,
                x + width, y, z-depth-0.6,

                
                x + width, y, z-depth,
                x + width, y+height, z,
                x + width + (width*0.5), y+height, z-0.5,

                
                x + width + (1.5*0.5), y+0.5, z-0.5,
                x + width, y+height, z-1,
                x + width, y, z-depth-0.6,
                
                x + width, y+height, z,
                x + width, y+height, z-1,
                x + width + (width*0.5), y+height, z-0.5,
            ]
            
            let boatTip2 = [
                x , y, z-depth-0.6,
                x - (1.5*0.5), y+0.5, z-0.5,
                x, y, z-depth,

                x, y+height, z-1,
                x - (width*0.5), y+height, z-0.5,
                x, y, z-depth-0.6,

                x, y, z-depth,
                x - (1.5*0.5), y+0.5, z-0.5,
                x, y+height, z,
                
                x, y+height, z,
                x - (width*0.5), y+height, z-0.5,
                x, y+height, z-1,
            ]

            let sailOffsetY = 0.1;
            let sail = [
                //front
                x - (width*0.7), y+height+sailOffsetY, z-0.5-0.001,
                x + (width*0.5), y+height+height*3, z-0.5,
                x + (width*0.5), y+height+sailOffsetY, z-0.5,

                x - (width*0.7), y+height+sailOffsetY, z-0.5,
                x + (width*0.5), y+height+sailOffsetY, z-0.5,
                x + (width*0.5), y+height+height*3, z-0.5,

                //back
                x + (width*0.5) + (width*0.03), y+height+sailOffsetY, z-0.5-0.001,
                x + (width*0.5) + (width*0.03), y+height+height*3, z-0.5,
                x +    width    + (width*0.2), y+height+sailOffsetY, z-0.5-0.001,

                x + (width*0.5) + (width*0.03), y+height+sailOffsetY, z-0.5-0.001,
                x +    width    + (width*0.2), y+height+sailOffsetY, z-0.5-0.001,
                x + (width*0.5) + (width*0.03), y+height+height*3, z-0.5,


            ]

            vertex_positions = this.appendArrays(vertex_positions, boatTip1);
            vertex_positions = this.appendArrays(vertex_positions, boatTip2);
            vertex_positions = this.appendArrays(vertex_positions, sail);

            let u = 0.0;
            let v = 1.0;
            vertex_texcoords.push(u, v);
            

            for(let i = 0; i<3*20; i++){
                triangle_indices.push(i);
            }
            let vertex_data = new VertexData();
            vertex_data.positions = vertex_positions;
            // vertex_data.colors = vertex_colors;
            vertex_data.uvs = vertex_texcoords;
            vertex_data.indices = triangle_indices;
            vertex_data.applyToMesh(triangle);

            return triangle;

        },
        changeScene(event) {
            let scene_idx = parseInt(event.target.value.substring(5));
            this.renderer.setActiveScene(scene_idx);
        },
        
        selectShadingAlgorithm(event) {
            this.renderer.setShadingAlgorithm(event.target.value);
        },

        updateHeightScale(event) {
            this.height_scale = event.target.value / 10.0
            this.renderer.setHeightScale(this.height_scale);
        },

        selectLightIdx(event) {
            let light_idx = parseInt(event.target.value.substring(5));
            this.renderer.setActiveLight(light_idx);
        }
    },
    mounted() {
        // Get the canvas element from the DOM
        const canvas = document.getElementById('renderCanvas');
        canvas.width = 992;
        canvas.height = 558;

        // Create a WebGL 2 rendering context
        const gl = canvas.getContext('webgl2');
        if (!gl) {
            alert('Error: Browser does not support WebGL2 Canvas');
            return;
        }

        // Associate a Babylon Render Engine to it.
        const engine = new Engine(gl);

        // Create our Renderer
        this.renderer = new Renderer(canvas, engine, (scene) => {
            let illum_gouraud = this.createBasicMaterial('illum_gouraud', '/shaders/illum_gouraud', scene);
            let illum_phong = this.createBasicMaterial('illum_phong', '/shaders/illum_phong', scene);
            let ground_gouraud = this.createGroundMaterial('ground_gouraud', '/shaders/ground_gouraud', scene);
            let ground_phong = this.createGroundMaterial('ground_phong', '/shaders/ground_phong', scene);
            return {
                illum_gouraud: illum_gouraud,
                illum_phong: illum_phong,
                ground_gouraud: ground_gouraud,
                ground_phong: ground_phong
            };
        }, (scene, subdivisions) => {
            return this.createGroundModel('ground', subdivisions, scene);
        }, (scene) => {
            return this.createBoatModel('boat', scene);
        });


        // Render every frame
        engine.runRenderLoop(() => {
            this.renderer.getActiveScene().render();
        });
    }
}
</script>

<template>
    <div id="userInterface">
        <label for="sceneSelect">Scene: </label>
        <select v-if="renderer !== null" id="sceneSelect" class="spaceRight" @change="changeScene">
            <option v-for="i in renderer.scenes.length" :value="'scene' + (i - 1)">Scene {{ i - 1 }}</option>
        </select>
        <label for="shadingAlg">Shading Algorithm: </label>
        <select id="shadingAlg" class="spaceRight" @change="selectShadingAlgorithm">
            <option value="gouraud">Gouraud</option>
            <option value="phong">Phong</option>
        </select>
        <label for="heightScale">Heighmap Scale: </label>
        <input id="heightScale" type="range" value="10" min="1" max="50" style="width: 8rem;" @input="updateHeightScale" />
        <label class="spaceRight" style="margin-left: 0.5rem;">{{ height_scale.toFixed(1) }}</label>
        <label for="lightIdx">Light: </label>
        <select v-if="renderer !== null" id="lightIdx" @change="selectLightIdx">
            <option v-for="i in renderer.scenes[renderer.active_scene].lights.length" :value="'light' + (i - 1)">Light {{ i - 1 }}</option>
        </select>
    </div>
    <canvas id="renderCanvas" touch-action="none"></canvas>
</template>

<style scoped>
label, input, select, option {
    font-size: 1rem;
}

#userInterface {
    width: 100%;
    padding: 0.5rem 0 0.75rem 0;
}

.spaceRight {
    margin-right: 2rem;
}
</style>