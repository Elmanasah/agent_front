import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GUI } from 'lil-gui';
import Stats from 'stats.js';
import { useTheme } from '../context/ThemeContext';

const RobotModel = ({ action: propAction, expressions: propExpressions }) => {
    const containerRef = useRef();
    const mixerRef = useRef();
    const actionsRef = useRef({});
    const activeActionRef = useRef();
    const faceRef = useRef();
    const { theme } = useTheme();
    const sceneRef = useRef();
    const gridRef = useRef();
    const groundRef = useRef();

    useEffect(() => {
        let stats, gui, mixer, actions, activeAction;
        let camera, scene, renderer, model, face;
        const api = { state: 'Walking' };

        const init = () => {
            const container = containerRef.current;
            const isDark = theme === 'dark';

            camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.25, 100);
            camera.position.set(-5, 3, 10);
            camera.lookAt(0, 2, 0);

            scene = new THREE.Scene();
            sceneRef.current = scene;

            // Lights
            const groundColor = isDark ? 0x0f172a : 0x8d8d8d;
            const skyColor = isDark ? 0x1e293b : 0xffffff;
            const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, isDark ? 1.5 : 3);
            hemiLight.position.set(0, 20, 0);
            scene.add(hemiLight);

            const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 1 : 3);
            dirLight.position.set(0, 20, 10);
            scene.add(dirLight);

            // Ground
            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(2000, 2000),
                new THREE.MeshPhongMaterial({ 
                    color: isDark ? 0x020617 : 0xf1f5f9, 
                    depthWrite: false 
                })
            );
            mesh.rotation.x = -Math.PI / 2;
            scene.add(mesh);
            groundRef.current = mesh;

            const grid = new THREE.GridHelper(200, 40, isDark ? 0x334155 : 0x94a3b8, isDark ? 0x1e293b : 0xe2e8f0);
            grid.material.opacity = isDark ? 0.2 : 0.5;
            grid.material.transparent = true;
            scene.add(grid);
            gridRef.current = grid;

            // Model
            const loader = new GLTFLoader();
            loader.load('/models/RobotExpressive.glb', (gltf) => {
                model = gltf.scene;
                scene.add(model);
                setupMixer(model, gltf.animations);
                createGUI(model, gltf.animations);
            }, undefined, (e) => {
                console.error(e);
            });

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setAnimationLoop(animate);
            container.appendChild(renderer.domElement);

            // Stats
            stats = new Stats();
            stats.dom.style.position = 'absolute';
            stats.dom.style.top = '0px';
            container.appendChild(stats.dom);

            const resizeObserver = new ResizeObserver(() => onWindowResize());
            resizeObserver.observe(container);
            
            return () => {
                resizeObserver.disconnect();
            };
        };

        const createGUI = (model, animations) => {
            const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
            const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];

            gui = new GUI({ container: containerRef.current });
            gui.domElement.style.position = 'absolute';
            gui.domElement.style.top = '0px';
            gui.domElement.style.right = '0px';

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
            // Expressions - find mesh with morph targets
            model.traverse((child) => {
                if (child.isMesh && child.morphTargetDictionary) {
                    face = child;
                }
            });
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
            
            if (!activeActionRef.current) {
                activeActionRef.current = actions['Walking'];
                if (activeActionRef.current) activeActionRef.current.play();
            }

            if (propAction && actions[propAction]) {
                fadeToAction(propAction, 0);
            }
        };

        const onWindowResize = () => {
            const container = containerRef.current;
            if (!container || !camera || !renderer) return;
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
            if (gui) gui.destroy();
            if (renderer) {
                renderer.dispose();
                if (renderer.domElement && renderer.domElement.parentNode) {
                    renderer.domElement.parentNode.removeChild(renderer.domElement);
                }
            }
        };
    }, []);

    const fadeToAction = (name, duration) => {
        const previousAction = activeActionRef.current;
        const newAction = actionsRef.current[name];

        if (!newAction || previousAction === newAction) return;

        if (previousAction) {
            previousAction.fadeOut(duration);
        }

        newAction
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .fadeIn(duration)
            .play();
        activeActionRef.current = newAction;
    };

    // Handle Theme Changes
    useEffect(() => {
        if (!groundRef.current || !gridRef.current || !sceneRef.current) return;
        
        const isDark = theme === 'dark';
        groundRef.current.material.color.setHex(isDark ? 0x020617 : 0xf1f5f9);
        
        const grid = gridRef.current;
        grid.material.color.setHex(isDark ? 0x334155 : 0x94a3b8);
        grid.material.opacity = isDark ? 0.2 : 0.5;

        // Update lights
        sceneRef.current.traverse((child) => {
            if (child.isHemisphereLight) {
                child.color.setHex(isDark ? 0x1e293b : 0xffffff);
                child.groundColor.setHex(isDark ? 0x0f172a : 0x8d8d8d);
                child.intensity = isDark ? 1.5 : 3;
            }
            if (child.isDirectionalLight) {
                child.intensity = isDark ? 1 : 3;
            }
        });
    }, [theme]);

    // Handle Action Prop Changes
    useEffect(() => {
        if (propAction) {
            fadeToAction(propAction, 0.5);
        }
    }, [propAction]);

    // Handle Expressions Prop Changes
    useEffect(() => {
        if (!propExpressions || !faceRef.current) return;

        const face = faceRef.current;
        const expressions = face.morphTargetDictionary;
        if (!expressions) return;
        
        // Reset all morph targets first for a clean state
        face.morphTargetInfluences.fill(0);
        
        Object.entries(propExpressions).forEach(([name, value]) => {
            // Case-insensitive lookup
            const targetName = Object.keys(expressions).find(
                k => k.toLowerCase() === name.toLowerCase()
            );
            
            if (targetName !== undefined) {
                const index = expressions[targetName];
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
