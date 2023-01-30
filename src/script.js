import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import px from '/environmentMaps/1/px.jpg'
import nx from '/environmentMaps/1/nx.jpg'
import py from '/environmentMaps/1/py.jpg'
import ny from '/environmentMaps/1/ny.jpg'
import pz from '/environmentMaps/1/pz.jpg'
import nz from '/environmentMaps/1/nz.jpg'

/**
 * Debug
 */
const gui = new dat.GUI()

/**
 * Textures
 */
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    px,
    nx,
    py,
    ny,
    pz,
    nz
])

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
material.metalness = 0.8
material.roughness = 0.2
material.envMap = environmentMapTexture

// Material debug
gui.add(material, 'metalness').name('Metalness of Objects').min(0).max(1).step(0.0001)
gui.add(material, 'roughness').name('Roughness of Objects').min(0).max(1).step(0.0001)



// Meshes
const objectsDistance = 4
const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(.8, 0.2, 64, 100),
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(.8, 2, 128),
    material
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(.6, 0.15, 116, 116),
    material
)
const mesh4 = new THREE.Mesh(
    new THREE.DodecahedronGeometry( .6, 0 ),
    material
)

mesh1.position.y = - objectsDistance * 0
mesh2.position.y = - objectsDistance * 1
mesh3.position.y = - objectsDistance * 2
mesh4.position.y = - objectsDistance * 3

function objectPosition() {
    if (window.innerWidth < 1000) {
        mesh1.position.x = 0
        mesh2.position.x = 0
        mesh3.position.x = 0
        mesh4.position.x = 0
        mesh1.position.y = 0
        mesh2.position.y = -4
        mesh3.position.y = -8
        mesh4.position.y = -13
    }
    else {
        mesh1.position.x = 1.5
        mesh2.position.x = -1.2
        mesh3.position.x = 1.5
        mesh4.position.x = 1.6
        mesh4.position.y = -12
    }
}
objectPosition()

window.addEventListener("resize", objectPosition)

scene.add(mesh1, mesh2, mesh3, mesh4)

const sectionMeshes = [mesh1, mesh2, mesh3, mesh4]

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () => {
    scrollY = window.scrollY

    const newSection = Math.round(scrollY / sizes.height)

    if (newSection != currentSection) {
        currentSection = newSection
        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration: 1.8,
                ease: 'power3.inOut',
                x: '+=8',
            })
    }
})

/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Animate camera
    camera.position.y = - scrollY / sizes.height * objectsDistance

    const parallaxX = cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

    // Animate meshes
    for (const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
    }


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


