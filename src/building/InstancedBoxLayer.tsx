import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useXRift } from '@xrift/world-components'
import { BoxGeometry, ClampToEdgeWrapping, Color, Euler, Float32BufferAttribute, InstancedBufferAttribute, InstancedMesh, Matrix4, MeshStandardMaterial, MirroredRepeatWrapping, Quaternion, RepeatWrapping, SRGBColorSpace, Texture, Vector3 } from 'three'
import type { BoxPart, BoxPartColor } from './types'
import { missingBuildingMaterial, type BuildingMaterialCatalog, type BuildingMaterialParameters, type BuildingTextureSpec } from './materials'

type InstancedBoxLayerProps = {
  parts: BoxPart[]
  materials: BuildingMaterialCatalog
}

const unitBoxGeometry = createUnitBoxGeometry()

export function InstancedBoxLayer({ parts, materials }: InstancedBoxLayerProps) {
  const visibleParts = useMemo(() => parts.filter((part) => part.visible !== false), [parts])
  const groups = useMemo(() => groupByMaterial(visibleParts), [visibleParts])

  return (
    <>
      {groups.map(([materialKey, materialParts]) => (
        <InstancedBoxes
          key={materialKey}
          materialKey={materialKey}
          parts={materialParts}
          materials={materials}
        />
      ))}
    </>
  )
}

function InstancedBoxes({
  materialKey,
  parts,
  materials,
}: {
  materialKey: string
  parts: BoxPart[]
  materials: BuildingMaterialCatalog
}) {
  const material = materials[materialKey] ?? missingBuildingMaterial

  if (material.texture) {
    return (
      <TexturedInstancedBoxes
        material={material}
        texture={material.texture}
        parts={parts}
      />
    )
  }

  return <PlainInstancedBoxes material={material} parts={parts} />
}

function PlainInstancedBoxes({
  material,
  parts,
}: {
  material: BuildingMaterialParameters
  parts: BoxPart[]
}) {
  const sharedMaterial = useMemo(() => {
    const { color: _color, texture: _texture, ...rest } = material
    return rest
  }, [material])
  const meshMaterial = useMemo(() => {
    return new MeshStandardMaterial({
      ...sharedMaterial,
      color: '#ffffff',
      vertexColors: true,
    })
  }, [sharedMaterial])

  return (
    <InstancedBoxesMesh
      baseColor={material.color ?? '#ffffff'}
      material={meshMaterial}
      parts={parts}
    />
  )
}

function TexturedInstancedBoxes({
  material,
  texture,
  parts,
}: {
  material: BuildingMaterialParameters
  texture: BuildingTextureSpec
  parts: BoxPart[]
}) {
  const { baseUrl } = useXRift()
  const textureUrl = resolveTextureUrl(baseUrl, texture.map)
  const sourceMap = useTexture(textureUrl)
  const map = useMemo(() => {
    const nextMap = sourceMap.clone()
    configureTexture(nextMap, texture)
    return nextMap
  }, [sourceMap, texture])
  const sharedMaterial = useMemo(() => {
    const { color: _color, texture: _texture, ...rest } = material
    return rest
  }, [material])
  const meshMaterial = useMemo(() => {
    return new MeshStandardMaterial({
      ...sharedMaterial,
      color: '#ffffff',
      map,
      vertexColors: true,
    })
  }, [map, sharedMaterial])

  useEffect(() => {
    return () => {
      map.dispose()
    }
  }, [map])

  return (
    <InstancedBoxesMesh
      baseColor={material.color ?? '#ffffff'}
      material={meshMaterial}
      parts={parts}
    />
  )
}

function InstancedBoxesMesh({
  baseColor,
  material,
  parts,
}: {
  baseColor: BoxPartColor
  material: MeshStandardMaterial
  parts: BoxPart[]
}) {
  const invalidate = useThree((state) => state.invalidate)
  const instanceColors = useMemo(() => {
    const buffer = new Float32Array(parts.length * 3)
    const color = new Color()

    parts.forEach((part, index) => {
      setInstanceColor(color, part.color ?? baseColor)
      color.toArray(buffer, index * 3)
    })

    return buffer
  }, [baseColor, parts])
  const instanceColorAttribute = useMemo(
    () => new InstancedBufferAttribute(instanceColors, 3),
    [instanceColors],
  )
  const mesh = useMemo(() => {
    const instancedMesh = new InstancedMesh(
      unitBoxGeometry,
      material,
      parts.length,
    )

    instancedMesh.instanceColor = instanceColorAttribute
    instancedMesh.castShadow = true
    instancedMesh.receiveShadow = true
    return instancedMesh
  }, [instanceColorAttribute, material, parts.length])

  useEffect(() => {
    return () => {
      mesh.material.dispose()
    }
  }, [mesh])

  useLayoutEffect(() => {
    mesh.instanceColor = instanceColorAttribute
    mesh.instanceColor.needsUpdate = true

    const matrix = new Matrix4()
    const euler = new Euler()
    const position = new Vector3()
    const scale = new Vector3()
    const quaternion = new Quaternion()

    parts.forEach((part, index) => {
      position.set(...part.position)
      scale.set(...part.size)
      euler.set(part.rotation?.[0] ?? 0, part.rotation?.[1] ?? 0, part.rotation?.[2] ?? 0)
      quaternion.setFromEuler(euler)
      matrix.compose(position, quaternion, scale)
      mesh.setMatrixAt(index, matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
    invalidate()
  }, [instanceColorAttribute, invalidate, mesh, parts])

  return <primitive object={mesh} />
}

function resolveTextureUrl(baseUrl: string, path: string) {
  if (/^(https?:|data:|blob:)/.test(path)) {
    return path
  }

  return `${baseUrl}${path.replace(/^\/+/, '')}`
}

function configureTexture(texture: Texture, spec: BuildingTextureSpec) {
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = texture.wrapT = getTextureWrapping(spec.wrap)

  if (spec.repeat) {
    texture.repeat.set(spec.repeat[0], spec.repeat[1])
  }

  if (spec.offset) {
    texture.offset.set(spec.offset[0], spec.offset[1])
  }

  if (spec.rotation !== undefined) {
    texture.rotation = spec.rotation
  }

  texture.needsUpdate = true
}

function getTextureWrapping(wrap: BuildingTextureSpec['wrap']) {
  if (wrap === 'clamp') return ClampToEdgeWrapping
  if (wrap === 'mirror') return MirroredRepeatWrapping
  return RepeatWrapping
}

function createUnitBoxGeometry() {
  const geometry = new BoxGeometry(1, 1, 1)
  const colorValues = new Float32Array(geometry.attributes.position.count * 3).fill(1)
  geometry.setAttribute('color', new Float32BufferAttribute(colorValues, 3))
  return geometry
}

function setInstanceColor(target: Color, color: BoxPartColor) {
  if (Array.isArray(color)) {
    target.setRGB(color[0], color[1], color[2])
    return
  }

  target.set(color)
}

function groupByMaterial(parts: BoxPart[]): [string, BoxPart[]][] {
  const groups = new Map<string, BoxPart[]>()

  for (const part of parts) {
    const group = groups.get(part.materialKey)
    if (group) {
      group.push(part)
    } else {
      groups.set(part.materialKey, [part])
    }
  }

  return [...groups.entries()]
}
