import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { DoubleSide, Euler, InstancedBufferAttribute, InstancedMesh, Matrix4, PlaneGeometry, Quaternion, ShaderMaterial, Vector3 } from 'three'
import type { PlanePart } from './types'

export type InstancedPlaneLayerProps = {
  parts: PlanePart[]
}

const unitPlaneGeometry = new PlaneGeometry(1, 1)
// Fast Refresh 時にも旧 shader material を再利用しないための明示的な版番号。
const AMBIENT_OCCLUSION_SHADER_VERSION = 2

// 視覚 effect 用の plane を instance 化して描画する。現在は AO を扱う。
export function InstancedPlaneLayer({ parts }: InstancedPlaneLayerProps) {
  if(parts.length>0) console.log(parts)
  const ambientOcclusionParts = useMemo(
    () => parts.filter((part) => part.kind === 'ambientOcclusion'),
    [parts],
  )

  if (ambientOcclusionParts.length === 0) return null

  return <AmbientOcclusionPlanes parts={ambientOcclusionParts} />
}

function AmbientOcclusionPlanes({ parts }: { parts: PlanePart[] }) {
  const invalidate = useThree((state) => state.invalidate)
  const gradientAxis = useMemo(
    () => new InstancedBufferAttribute(new Float32Array(parts.map((part) => part.gradientAxis === 'x' ? 0 : 1)), 1),
    [parts],
  )
  const gradientReverse = useMemo(
    () => new InstancedBufferAttribute(new Float32Array(parts.map((part) => part.gradientReverse ? 1 : 0)), 1),
    [parts],
  )
  const strength = useMemo(
    () => new InstancedBufferAttribute(new Float32Array(parts.map((part) => part.strength)), 1),
    [parts],
  )
  const falloff = useMemo(
    () => new InstancedBufferAttribute(new Float32Array(parts.map((part) => part.falloff)), 1),
    [parts],
  )
  const material = useMemo(
    () => createAmbientOcclusionMaterial(),
    [AMBIENT_OCCLUSION_SHADER_VERSION],
  )
  const mesh = useMemo(() => {
    const geometry = unitPlaneGeometry.clone()
    geometry.setAttribute('aoUv', geometry.getAttribute('uv').clone())
    geometry.setAttribute('instanceGradientAxis', gradientAxis)
    geometry.setAttribute('instanceGradientReverse', gradientReverse)
    geometry.setAttribute('instanceStrength', strength)
    geometry.setAttribute('instanceFalloff', falloff)

    const nextMesh = new InstancedMesh(geometry, material, parts.length)
    nextMesh.renderOrder = 20
    return nextMesh
  }, [falloff, gradientAxis, gradientReverse, material, parts.length, strength])

  useEffect(() => {
    return () => {
      mesh.geometry.dispose()
      mesh.material.dispose()
    }
  }, [mesh])

  useLayoutEffect(() => {
    const matrix = new Matrix4()
    const position = new Vector3()
    const scale = new Vector3()
    const quaternion = new Quaternion()
    const euler = new Euler()

    parts.forEach((part, index) => {
      position.set(...part.position)
      scale.set(part.size[0], part.size[1], 1)
      euler.set(...part.rotation)
      quaternion.setFromEuler(euler)
      matrix.compose(position, quaternion, scale)
      mesh.setMatrixAt(index, matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
    invalidate()
  }, [invalidate, mesh, parts])

  return <primitive object={mesh} />
}

// 黒から透明へ減衰する 1D gradient を instance attribute で制御する。
// Material chunk の差し替えを避け、透明度をこの shader で直接出力する。
function createAmbientOcclusionMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthTest: true,
    depthWrite: false,
    side: DoubleSide,
    toneMapped: false,
    vertexShader: `
attribute vec2 aoUv;
attribute float instanceGradientAxis;
attribute float instanceGradientReverse;
attribute float instanceStrength;
attribute float instanceFalloff;
varying vec2 vAoUv;
varying float vAoGradientAxis;
varying float vAoGradientReverse;
varying float vAoStrength;
varying float vAoFalloff;

void main() {
  vAoUv = aoUv;
  vAoGradientAxis = instanceGradientAxis;
  vAoGradientReverse = instanceGradientReverse;
  vAoStrength = instanceStrength;
  vAoFalloff = instanceFalloff;
  vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`,
    fragmentShader: `
varying vec2 vAoUv;
varying float vAoGradientAxis;
varying float vAoGradientReverse;
varying float vAoStrength;
varying float vAoFalloff;

void main() {
  float coordinate = mix(vAoUv.x, vAoUv.y, vAoGradientAxis);
  coordinate = mix(coordinate, 1.0 - coordinate, vAoGradientReverse);
  float edgeDistance = clamp(1.0 - coordinate, 0.0, 1.0);
  float alpha = pow(smoothstep(0.0, 1.0, edgeDistance), max(vAoFalloff, 0.001)) * vAoStrength;
  gl_FragColor = vec4(vec3(0.0), alpha);
}
`,
  })
}
