import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { CreateCylinder } from '@babylonjs/core';

class Renderer {
    constructor(canvas, engine, material_callback, ground_mesh_callback) {
        this.canvas = canvas;
        this.engine = engine;
        this.scenes = [
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.1, 0.1, 0.1, 1.0),
                materials: null,
                ground_subdivisions: [500, 500],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            },
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.3, 0.1, 0.5, 1.0),
                materials: null,
                ground_subdivisions: [50, 50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.32, 0.32, 0.42),
                lights: [],
                models: []
            },
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.8, 5.0, 8.0, 1.0),
                materials: null,
                ground_subdivisions: [50, 50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.6, 0.6, 0.6),
                lights: [],
                models: []
            }
        ];
        this.active_scene = 0;
        this.active_light = 0;
        this.shading_alg = 'gouraud';

        this.scenes.forEach((scene, idx) => {
            scene.materials = material_callback(scene.scene);
            scene.ground_mesh = ground_mesh_callback(scene.scene, scene.ground_subdivisions);
            this['createScene'+ idx](idx);
        });
    }

    createScene0(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(12.0, 15.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        light1.diffuse = new Color3(1.0, 1.0, 1.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture('/heightmaps/new_height.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.10, 0.65, 0.15),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // Create other models
        let sphere = CreateSphere('sphere', {segments: 32}, scene);
        sphere.position = new Vector3(1.0, 0.5, 3.0);
        sphere.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);
        
        
        let box = CreateBox('box', {width: 2, height: 1, depth: 1}, scene);
        box.position = new Vector3(-1.0, 0.5, 2.0);
        box.metadata = {
            mat_color: new Color3(0.75, 0.15, 0.05),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        box.material = materials['illum_' + this.shading_alg];
       current_scene.models.push(box);

       scene.onKeyboardObservable.add((kbInfo) => {
        //current_scene.lights[this.active_light]
        //console.log("Type: ", kbInfo.event.key);
        switch (kbInfo.event.key)
        {
            case "a":
                //translate negative x
                current_scene.lights[this.active_light].position.x -= 0.5;
                console.log("Hello from scene 0");
                break;
            case "d":
                //translate positive x
                current_scene.lights[this.active_light].position.x += 0.5;
                break;
            case "f":
                //translate negative y
                current_scene.lights[this.active_light].position.y -= 0.5;
                break;
            case "r":
                //translate positive y
                current_scene.lights[this.active_light].position.y += 0.5;
                break;
            case "w":
                //translate negative z
                current_scene.lights[this.active_light].position.z -= 0.5;
                break;
            case "s":
                //translate positive z
                current_scene.lights[this.active_light].position.z += 0.5;
                break;
        }
      });


        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...
            
            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    createScene1(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, -1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 0.5, 1.0);
        light0.specular = new Color3(0.0, 0.0, 0.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(-1.0, 0.0, 0.0), scene);
        light1.diffuse = new Color3(0.3, 0.3, 0.3);
        light1.specular = new Color3(0.0, 0.0, 0.0);
        current_scene.lights.push(light1);

        let light2 = new PointLight('light2', new Vector3(0.0, 7.0, 0.0), scene);
        light1.diffuse = new Color3(0.0, 0.5, 0.0);
        light1.specular = new Color3(1.0, 0.0, 0.0);
        current_scene.lights.push(light2);

        let light3 = new PointLight('light3', new Vector3(0.0, 1.5, -100.0), scene);
        light3.diffuse = new Color3(0.0, 0.0, 1.0);
        light3.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light3);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture('/heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.60, 0.65, 0.15),
            mat_texture: white_texture,
            mat_specular: new Color3(0.3, 0.2, 0.5),
            mat_shininess: 3,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 5.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // Create other models
        let sphere = CreateSphere('sphere', {diameter: 1.5, segments:22}, scene);
        sphere.position = new Vector3(-3, 1.5, -6.0);
        sphere.metadata = {
            mat_color: new Color3(0.60, 0.65, 0.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 2,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);
        
        
        let box = CreateCylinder('cylinder', {tessellation: 7, height: 2}, scene);
        box.position = new Vector3(-3, 0, -6.0);
        box.metadata = {
            mat_color: new Color3(0.75, 0.15, 0.05),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        box.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(box);

        scene.onKeyboardObservable.add((kbInfo) => {
            //current_scene.lights[this.active_light]
            //console.log("Type: ", kbInfo.event.key);
            switch (kbInfo.event.key)
            {
                case "a":
                    //translate negative x
                    current_scene.lights[this.active_light].position.x -= 0.5;
                    break;
                case "d":
                    //translate positive x
                    current_scene.lights[this.active_light].position.x += 0.5;
                    break;
                case "f":
                    //translate negative y
                    current_scene.lights[this.active_light].position.y -= 0.5;
                    break;
                case "r":
                    //translate positive y
                    current_scene.lights[this.active_light].position.y += 0.5;
                    break;
                case "w":
                    //translate negative z
                    current_scene.lights[this.active_light].position.z -= 0.5;
                    break;
                case "s":
                    //translate positive z
                    current_scene.lights[this.active_light].position.z += 0.5;
                    break;
            }
          });

        // let customMesh = new BABYLON.Mesh("custom", scene);
        // var positions = [-5, 2, -3, -7, -2, -3, -3, -2, -3, 5, 2, 3, 7, -2, 3, 3, -2, 3];
        // var indices = [0, 1, 2, 3, 4, 5];
        // var vertexData = new BABYLON.VertexData();
        // vertexData.positions = positions;
        // vertexData.indices = indices;
        // vertexData.applyToMesh(customMesh);

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...
            
            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    createScene2(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 6.8, 7.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, -3.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 4.0, 1.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(5.0, 3.0, 10.0), scene);
        light1.diffuse = new Color3(0.0, 0.0, 12.0);
        light1.specular = new Color3(0.0, 0.0, 14.0);
        current_scene.lights.push(light1);

        let light2 = new PointLight('light2', new Vector3(-5.0, 3.0, -5.0), scene);
        light2.diffuse = new Color3(5.0, 0.0, 0.0);
        light2.specular = new Color3(15.0, 0.0, 0.0);
        current_scene.lights.push(light2);

        let light3 = new PointLight('light3', new Vector3(-5.0, 3.0, 0.0), scene);
        light3.diffuse = new Color3(0.0, 1.0, 0.0);
        light3.specular = new Color3(0.0, 1.0, 0.0);
        current_scene.lights.push(light3);


        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture('/heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.10, 0.65, 0.15),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // Create other models
        let sphere = CreateSphere('sphere', {segments: 32}, scene);
        sphere.position = new Vector3(1.0, 0.5, 3.0);
        sphere.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);
        
        
        let box = CreateBox('box', {width: 2, height: 1, depth: 1}, scene);
        box.position = new Vector3(-1.0, 0.5, 2.0);
        box.metadata = {
            mat_color: new Color3(0.75, 0.15, 0.05),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        box.material = materials['illum_' + this.shading_alg];
       current_scene.models.push(box);

       scene.onKeyboardObservable.add((kbInfo) => {
        //current_scene.lights[this.active_light]
        //console.log("Type: ", kbInfo.event.key);
        switch (kbInfo.event.key)
        {
            case "a":
                //translate negative x
                current_scene.lights[this.active_light].position.x -= 0.5;
                break;
            case "d":
                //translate positive x
                current_scene.lights[this.active_light].position.x += 0.5;
                break;
            case "f":
                //translate negative y
                current_scene.lights[this.active_light].position.y -= 0.5;
                break;
            case "r":
                //translate positive y
                current_scene.lights[this.active_light].position.y += 0.5;
                break;
            case "w":
                //translate negative z
                current_scene.lights[this.active_light].position.z -= 0.5;
                break;
            case "s":
                //translate positive z
                current_scene.lights[this.active_light].position.z += 0.5;
                break;
        }
      });

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...
            
            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    updateShaderUniforms(scene_idx, shader) {
        let current_scene = this.scenes[scene_idx];
        shader.setVector3('camera_position', current_scene.camera.position);
        shader.setColor3('ambient', current_scene.scene.ambientColor);
        shader.setInt('num_lights', current_scene.lights.length);
        let light_positions = [];
        let light_colors = [];
        current_scene.lights.forEach((light) => {
            light_positions.push(light.position.x, light.position.y, light.position.z);
            light_colors.push(light.diffuse);
        });
        shader.setArray3('light_positions', light_positions);
        shader.setColor3Array('light_colors', light_colors);
    }

    getActiveScene() {
        return this.scenes[this.active_scene].scene;
    }
    
    setActiveScene(idx) {
        this.active_scene = idx;
    }

    setShadingAlgorithm(algorithm) {
        this.shading_alg = algorithm;

        this.scenes.forEach((scene) => {
            let materials = scene.materials;
            let ground_mesh = scene.ground_mesh;

            ground_mesh.material = materials['ground_' + this.shading_alg];
            scene.models.forEach((model) => {
                model.material = materials['illum_' + this.shading_alg];
            });
        });
    }

    setHeightScale(scale) {
        this.scenes.forEach((scene) => {
            let ground_mesh = scene.ground_mesh;
            ground_mesh.metadata.height_scalar = scale;
        });
    }

    setActiveLight(idx) {
        console.log(idx);
        this.active_light = idx;
    }
}

export { Renderer }
