import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useApp, useScene, useFrame} = metaversefile;

export default e => {
  const app = useApp();
  app.name = "sea";
  const scene = useScene();
  const waterGeometry = new THREE.PlaneGeometry(2,2,128,128);

  function rotationShader() { //vertex shader
    return `
    ${THREE.ShaderChunk.common}
    varying vec2 vUv;
    uniform mat4 rotationMatrix;
    uniform float uBigWavesElevation;
    uniform vec2 uBigWavesFrequency;

    ${THREE.ShaderChunk.logdepthbuf_pars_vertex}
    void main() {
        vec4 rotatedPosition  = rotationMatrix * vec4(position, 1.0);

        float elevation = sin(rotatedPosition.x * uBigWavesFrequency.x) * sin(rotatedPosition.z * uBigWavesFrequency.y)  * uBigWavesElevation;
        rotatedPosition.y += elevation;
        gl_Position = projectionMatrix * modelViewMatrix * rotatedPosition;
        vUv = uv;
        ${THREE.ShaderChunk.logdepthbuf_vertex}
    }
    `;
  }

  function fragmentShader() { //just applies yellow color
    return `
    ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
    varying vec2 vUv;

    void main() {
        gl_FragColor = vec4(0.5, 0.8 , 1.0, 1.0);
        ${THREE.ShaderChunk.logdepthbuf_fragment}
    }
    `;
  }

  function createRotationMatrix() { //rotates around Y axis
    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationX(-  Math.PI * 0.5 );
    return rotationMatrix;
  }

  const newWaterMaterial = new THREE.ShaderMaterial({
    uniforms : {
      rotationMatrix : { value : createRotationMatrix() },
      uBigWavesElevation : { value : 0.2},
      uBigWavesFrequency : { value : new THREE.Vector2(4, 1.5)}
    }, 
    vertexShader : rotationShader(),
    fragmentShader : fragmentShader()
  });

  const basicMaterial = new THREE.MeshBasicMaterial({
    side : THREE.DoubleSide
  });

  const sea = new THREE.Mesh(waterGeometry, newWaterMaterial);

  sea.position.set(0,0,0);
  sea.updateMatrixWorld();
  app.add(sea);

  return app;
};
