
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// ==========================================
// NOVA RACING - VERSION 1
// ==========================================

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8abbd1);
scene.fog = new THREE.Fog(0x8abbd1, 65, 180);

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.getElementById('game').prepend(renderer.domElement);

// Lighting
const ambient = new THREE.HemisphereLight(
    0xffffff,
    0x405044,
    2
);
scene.add(ambient);

const sunlight = new THREE.DirectionalLight(0xffffff, 2.5);
sunlight.position.set(-30, 60, -20);
sunlight.castShadow = true;
scene.add(sunlight);

// ==========================================
// WORLD
// ==========================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshStandardMaterial({
        color: 0x27613c,
        roughness: 1
    })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.2;
ground.receiveShadow = true;
scene.add(ground);

// Create oval racing track
function createTrack() {
    const shape = new THREE.Shape();
    const hole = new THREE.Path();

    const segments = 128;

    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;

        const x = 34 * Math.cos(angle);
        const z = 24 * Math.sin(angle);

        if (i === 0) shape.moveTo(x, -z);
        else shape.lineTo(x, -z);
    }

    for (let i = segments; i >= 0; i--) {
        const angle = (i / segments) * Math.PI * 2;

        const x = 24 * Math.cos(angle);
        const z = 14 * Math.sin(angle);

        if (i === segments) hole.moveTo(x, -z);
        else hole.lineTo(x, -z);
    }

    shape.holes.push(hole);

    const geometry = new THREE.ShapeGeometry(shape, 1);

    const road = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
            color: 0x303943,
            roughness: 0.9,
            side: THREE.DoubleSide
        })
    );

    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.02;
    road.receiveShadow = true;
    scene.add(road);

    // Track edge lines
    function makeLine(rx, rz, color) {
        const points = [];

        for (let i = 0; i <= 200; i++) {
            const a = i / 200 * Math.PI * 2;

            points.push(new THREE.Vector3(
                rx * Math.cos(a),
                0.08,
                rz * Math.sin(a)
            ));
        }

        const geometry = new THREE.BufferGeometry()
            .setFromPoints(points);

        const line = new THREE.Line(
            geometry,
            new THREE.LineBasicMaterial({ color })
        );

        scene.add(line);
    }

    makeLine(34, 24, 0xffffff);
    makeLine(24, 14, 0xffffff);
    makeLine(29, 19, 0xffdf65);

    // Start / finish line
    const start = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.08, 0.7),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );

    start.position.set(29, 0.12, 0);
    scene.add(start);

    // Barrier sections
    const barrierMaterial = new THREE.MeshStandardMaterial({
        color: 0x00a995,
        metalness: 0.4,
        roughness: 0.5
    });

    for (let i = 0; i < 120; i++) {
        const a = i / 120 * Math.PI * 2;

        for (const [rx, rz] of [[35, 25], [23, 13]]) {
            const barrier = new THREE.Mesh(
                new THREE.BoxGeometry(1.7, 0.8, 0.5),
                barrierMaterial
            );

            barrier.position.set(
                rx * Math.cos(a),
                0.4,
                rz * Math.sin(a)
            );

            barrier.rotation.y = -a;
            barrier.castShadow = true;
            scene.add(barrier);
        }
    }
}

createTrack();

// Decorations
function addTree(x, z) {
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.4, 2.2),
        new THREE.MeshStandardMaterial({ color: 0x70452b })
    );

    trunk.position.set(x, 1, z);
    scene.add(trunk);

    const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(1.8, 4, 7),
        new THREE.MeshStandardMaterial({ color: 0x145c36 })
    );

    leaves.position.set(x, 3.8, z);
    leaves.castShadow = true;
    scene.add(leaves);
}

for (let i = 0; i < 55; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 39 + Math.random() * 25;

    addTree(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
    );
}

// ==========================================
// CAR CREATION
// ==========================================

function createCar(color) {
    const car = new THREE.Group();

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.65,
        roughness: 0.25
    });

    // Main body
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.65, 3.8),
        bodyMaterial
    );

    body.position.y = 0.85;
    body.castShadow = true;
    car.add(body);

    // Cabin
    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 0.65, 1.8),
        new THREE.MeshStandardMaterial({
            color: 0x102b3b,
            metalness: 0.7,
            roughness: 0.15
        })
    );

    cabin.position.set(0, 1.4, -0.2);
    car.add(cabin);

    // Front section
    const hood = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.25, 1),
        bodyMaterial
    );

    hood.position.set(0, 1.15, -1.25);
    car.add(hood);

    // Wheels
    const wheels = [];

    for (const x of [-1.05, 1.05]) {
        for (const z of [-1.2, 1.2]) {
            const wheel = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.42, 0.42, 0.28, 16
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x101010
                })
            );

            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(x, 0.48, z);
            car.add(wheel);
            wheels.push(wheel);
        }
    }

    // Headlights
    for (const x of [-0.65, 0.65]) {
        const light = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.16, 0.12),
            new THREE.MeshBasicMaterial({ color: 0x9fffff })
        );

        light.position.set(x, 1.05, -1.92);
        car.add(light);
    }

    // Rear lights
    for (const x of [-0.65, 0.65]) {
        const light = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.15, 0.12),
            new THREE.MeshBasicMaterial({ color: 0xff2020 })
        );

        light.position.set(x, 1.05, 1.92);
        car.add(light);
    }

    car.userData.wheels = wheels;

    scene.add(car);
    return car;
}

// Player
const player = createCar(0x00cdb0);

player.position.set(29, 0, 0);
player.rotation.y = Math.PI;

// AI opponents
const opponents = [];

const opponentColors = [
    0xff3030,
    0x2879ff,
    0xffd43b,
    0xb34cff
];

for (let i = 0; i < 4; i++) {
    const car = createCar(opponentColors[i]);

    opponents.push({
        mesh: car,
        angle: 0.12 + i * 0.1,
        speed: 0.29 + Math.random() * 0.025,
        laps: 0
    });
}

// ==========================================
// GAME STATE
// ==========================================

let started = false;
let finished = false;

let speed = 0;
let maxSpeed = 24;
let nitro = 100;
let usingNitro = false;

let raceTime = 0;
let playerLaps = 0;
let previousAngle = 0;

const TOTAL_LAPS = 3;

const keys = {};

window.addEventListener('keydown', (e) => {
    if ([
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Space'
    ].includes(e.code)) {
        e.preventDefault();
    }

    keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

window.addEventListener('blur', () => {
    for (const key in keys) keys[key] = false;
});

// ==========================================
// PLAYER MOVEMENT
// ==========================================

function updatePlayer(dt) {
    if (!started || finished) return;

    const accelerating = keys.ArrowUp;
    const braking = keys.ArrowDown;

    const left = keys.ArrowLeft;
    const right = keys.ArrowRight;

    usingNitro = keys.Space && nitro > 0 && speed > 2;

    const boost = usingNitro ? 1.55 : 1;

    if (accelerating) {
        speed += 13 * dt;
    } else {
        speed -= 3.5 * dt;
    }

    if (braking) {
        speed -= 19 * dt;
    }

    if (usingNitro) {
        speed += 12 * dt;
        nitro -= 28 * dt;
    } else {
        nitro += 5 * dt;
    }

    nitro = THREE.MathUtils.clamp(nitro, 0, 100);
    speed = THREE.MathUtils.clamp(
        speed,
        -5,
        maxSpeed * boost
    );

    // Steering
    const steering =
        (right ? 1 : 0) - (left ? 1 : 0);

    if (Math.abs(speed) > 0.5) {
        player.rotation.y -=
            steering * dt * 1.9 *
            Math.min(Math.abs(speed) / 10, 1.4) *
            Math.sign(speed);
    }

    // Move car forward
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(player.quaternion);

    player.position.addScaledVector(
        forward,
        speed * dt
    );

    // Off-road slowdown
    const roadValue =
        (player.position.x / 29) ** 2 +
        (player.position.z / 19) ** 2;

    if (roadValue < 0.65 || roadValue > 1.42) {
        speed *= Math.pow(0.88, dt * 60);
    }

    // Wheel animation
    player.userData.wheels.forEach(wheel => {
        wheel.rotation.x += speed * dt;
    });

    // Lap detection
    let angle = Math.atan2(
        player.position.z / 19,
        player.position.x / 29
    );

    if (angle < 0) angle += Math.PI * 2;

    if (
        previousAngle > 5.5 &&
        angle < 0.5 &&
        speed > 4
    ) {
        playerLaps++;

        if (playerLaps >= TOTAL_LAPS) {
            finishRace();
        }
    }

    previousAngle = angle;

    // HUD
    document.getElementById('speed').textContent =
        Math.round(Math.abs(speed) * 12);

    document.getElementById('nitro-fill').style.width =
        nitro + '%';

    document.getElementById('nitro-label').textContent =
        Math.round(nitro) + '%';

    document.getElementById('lap').textContent =
        `LAP ${Math.min(playerLaps + 1, TOTAL_LAPS)} / ${TOTAL_LAPS}`;
}

// ==========================================
// AI OPPONENTS
// ==========================================

function updateOpponents(dt) {
    if (!started || finished) return;

    opponents.forEach(opponent => {
        opponent.angle += opponent.speed * dt;

        if (opponent.angle >= Math.PI * 2) {
            opponent.angle -= Math.PI * 2;
            opponent.laps++;
        }

        const a = opponent.angle;

        opponent.mesh.position.set(
            29 * Math.cos(a),
            0,
            19 * Math.sin(a)
        );

        // Face direction of travel
        const direction = new THREE.Vector3(
            -29 * Math.sin(a),
            0,
            19 * Math.cos(a)
        ).normalize();

        opponent.mesh.rotation.y =
            Math.atan2(-direction.x, -direction.z);

        opponent.mesh.userData.wheels.forEach(wheel => {
            wheel.rotation.x += 12 * dt;
        });
    });
}

// ==========================================
// CAMERA
// ==========================================

const cameraOffset = new THREE.Vector3(0, 6, 11);

function updateCamera(dt) {
    const offset = cameraOffset.clone()
        .applyQuaternion(player.quaternion);

    const targetPosition = player.position.clone()
        .add(offset);

    camera.position.lerp(
        targetPosition,
        1 - Math.pow(0.001, dt)
    );

    const lookTarget = player.position.clone();
    lookTarget.y += 1.2;

    camera.lookAt(lookTarget);
}

// ==========================================
// RACE SYSTEM
// ==========================================

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hundredths = Math.floor((seconds % 1) * 100);

    return (
        String(minutes).padStart(2, '0') + ':' +
        String(secs).padStart(2, '0') + '.' +
        String(hundredths).padStart(2, '0')
    );
}

function finishRace() {
    finished = true;
    started = false;

    const opponentsAhead = opponents.filter(op => {
        const playerProgress =
            playerLaps + previousAngle / (Math.PI * 2);

        const aiProgress =
            op.laps + op.angle / (Math.PI * 2);

        return aiProgress > playerProgress;
    }).length;

    const position = opponentsAhead + 1;

    document.getElementById('result-title').textContent =
        position === 1 ? 'VICTORY!' : 'RACE COMPLETE';

    document.getElementById('result-text').textContent =
        `You finished ${position}${position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'}! Time: ${formatTime(raceTime)}`;

    document.getElementById('finish-screen')
        .classList.remove('hidden');
}

function startRace() {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('finish-screen').classList.add('hidden');

    document.getElementById('hud').style.display = 'block';

    started = true;
    finished = false;

    speed = 0;
    nitro = 100;
    raceTime = 0;
    playerLaps = 0;
    previousAngle = 0;

    player.position.set(29, 0, 0);
    player.rotation.y = Math.PI;

    opponents.forEach((op, i) => {
        op.angle = 0.12 + i * 0.1;
        op.laps = 0;
    });

    document.getElementById('center-message').textContent = 'GO!';

    setTimeout(() => {
        document.getElementById('center-message').textContent = '';
    }, 1200);
}

document.getElementById('start-button')
    .addEventListener('click', startRace);

document.getElementById('restart-button')
    .addEventListener('click', () => {
        window.location.reload();
    });

// ==========================================
// MAIN GAME LOOP
// ==========================================

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.05);

    if (started && !finished) {
        raceTime += dt;

        document.getElementById('timer').textContent =
            formatTime(raceTime);
    }

    updatePlayer(dt);
    updateOpponents(dt);
    updateCamera(dt);

    renderer.render(scene, camera);
}

// Initial camera
camera.position.set(29, 8, 11);
camera.lookAt(player.position);

animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.5)
    );
});

// Finished loading
document.getElementById('loading').style.display = 'none';

