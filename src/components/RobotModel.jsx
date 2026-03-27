import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'lil-gui';
import Stats from 'stats.js';

const RobotModel = ({ action: propAction, expressions: propExpressions }) => {
    const containerRef = useRef();
    const mixerRef = useRef();
    const actionsRef = useRef({});
    const activeActionRef = useRef();
    const faceRef = useRef();

    useEffect(() => {
        let stats, gui, mixer, actions, activeAction, previousAction;
        let camera, scene, renderer, model, face;
        const api = { state: 'Walking' };

        const init = () => {
            const container = containerRef.current;

            camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.25, 100);
            camera.position.set(-5, 3, 10);
            camera.lookAt(0, 2, 0);

            scene = new THREE.Scene();
            // scene.background = new THREE.Color(0xe0e0e0);
            // scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

            // Lights
            const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
            hemiLight.position.set(0, 20, 0);
            scene.add(hemiLight);

            const dirLight = new THREE.DirectionalLight(0xffffff, 3);
            dirLight.position.set(0, 20, 10);
            scene.add(dirLight);

            // Ground
            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(2000, 2000),
                new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
            );
            mesh.rotation.x = -Math.PI / 2;
            scene.add(mesh);

            const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
            grid.material.opacity = 0.2;
            grid.material.transparent = true;
            scene.add(grid);

            // Model
            const loader = new GLTFLoader();
            loader.load('/models/RobotExpressive.glb', (gltf) => {
                model = gltf.scene;
                scene.add(model);
                setupMixer(model, gltf.animations); // Setup mixer and actions first
                createGUI(model, gltf.animations);
            }, undefined, (e) => {
                console.error(e);
            });

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setAnimationLoop(animate);
            container.appendChild(renderer.domElement);

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.target.set(0, 2, 0);
            controls.update();

            // Stats
            stats = new Stats();
            stats.dom.style.position = 'absolute';
            stats.dom.style.top = '0px';
            container.appendChild(stats.dom);

            window.addEventListener('resize', onWindowResize);
        };

        const createGUI = (model, animations) => {
            const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
            const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];

            gui = new GUI({ container: containerRef.current });
            gui.domElement.style.position = 'absolute';
            gui.domElement.style.top = '0px';
            gui.domElement.style.right = '0px';

            // Actions are already set up by setupMixer, retrieve them
            actions = actionsRef.current;

            // States
            const statesFolder = gui.addFolder('States');
            const clipCtrl = statesFolder.add(api, 'state').options(states);

            clipCtrl.onChange(() => {
                fadeToAction(api.state, 0.5);
            });

            statesFolder.open();

            // Emotes
            const emoteFolder = gui.addFolder('Emotes');
            function createEmoteCallback(name) {
                api[name] = () => {
                    fadeToAction(name, 0.2);
                    mixerRef.current.addEventListener('finished', restoreState);
                };
                emoteFolder.add(api, name);
            }

            function restoreState() {
                mixerRef.current.removeEventListener('finished', restoreState);
                fadeToAction(api.state, 0.2);
            }

            for (let i = 0; i < emotes.length; i++) {
                createEmoteCallback(emotes[i]);
            }

            emoteFolder.open();

            // Expressions
            face = model.getObjectByName('Head_4');
            faceRef.current = face;
            if (face) {
                const expressions = Object.keys(face.morphTargetDictionary);
                const expressionFolder = gui.addFolder('Expressions');
                for (let i = 0; i < expressions.length; i++) {
                    expressionFolder.add(face.morphTargetInfluences, i, 0, 1, 0.01).name(expressions[i]);
                }
                expressionFolder.open();
            }
        };

        const setupMixer = (model, animations) => {
            const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
            const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];

            mixer = new THREE.AnimationMixer(model);
            mixerRef.current = mixer;
            actions = {};

            for (let i = 0; i < animations.length; i++) {
                const clip = animations[i];
                const action = mixer.clipAction(clip);
                actions[clip.name] = action;

                if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
                    action.clampWhenFinished = true;
                    action.loop = THREE.LoopOnce;
                }
            }
            actionsRef.current = actions;
            
            // Initial Active Action if not already set by GUI
            if (!activeActionRef.current) {
                activeActionRef.current = actions['Walking'];
                if (activeActionRef.current) activeActionRef.current.play();
            }
        };

        const fadeToAction = (name, duration) => {
            previousAction = activeActionRef.current; // Use ref for previous action
            activeAction = actionsRef.current[name]; // Use ref for actions

            if (previousAction && previousAction !== activeAction) {
                previousAction.fadeOut(duration);
            }

            if (activeAction) {
                activeAction
                    .reset()
                    .setEffectiveTimeScale(1)
                    .setEffectiveWeight(1)
                    .fadeIn(duration)
                    .play();
                activeActionRef.current = activeAction;
            }
        };

        const onWindowResize = () => {
            const container = containerRef.current;
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };

        const clock = new THREE.Clock();
        const animate = () => {
            const dt = clock.getDelta();
            if (mixerRef.current) mixerRef.current.update(dt);
            renderer.render(scene, camera);
            if (stats) stats.update();
        };

        init();

        return () => {
            window.removeEventListener('resize', onWindowResize);
            if (gui) gui.destroy();
            if (renderer) {
                renderer.dispose();
                if (renderer.domElement && renderer.domElement.parentNode) {
                    renderer.domElement.parentNode.removeChild(renderer.domElement);
                }
            }
        };
    }, []);

    // Handle Action Prop Changes
    useEffect(() => {
        if (!propAction || !actionsRef.current[propAction]) return;

        const fadeToAction = (name, duration) => {
            const previousAction = activeActionRef.current;
            const newAction = actionsRef.current[name];

            if (previousAction && previousAction !== newAction) {
                previousAction.fadeOut(duration);
            }

            if (newAction) {
                newAction
                    .reset()
                    .setEffectiveTimeScale(1)
                    .setEffectiveWeight(1)
                    .fadeIn(duration)
                    .play();
                activeActionRef.current = newAction;
            }
        };

        fadeToAction(propAction, 0.5);
    }, [propAction]);

    // Handle Expressions Prop Changes
    useEffect(() => {
        if (!propExpressions || !faceRef.current) return;

        const face = faceRef.current;
        const expressions = face.morphTargetDictionary;
        
        Object.entries(propExpressions).forEach(([name, value]) => {
            const index = expressions[name];
            if (index !== undefined) {
                face.morphTargetInfluences[index] = value;
            }
        });
    }, [propExpressions]);

    return (
        <div 
            ref={containerRef} 
            className="relative w-full h-full overflow-hidden bg-transparent"
        />
    );
};

export default RobotModel;
