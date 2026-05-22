import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { BoxGeometry, Color, Euler, Float32BufferAttribute, InstancedBufferAttribute, InstancedMesh, Matrix4, MeshStandardMaterial, Quaternion, Vector3 } from 'three'
import type { BoxPart, BoxPartColor } from './types'
import { missingBuildingMaterial, type BuildingMaterialCatalog } from './materials'

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
  const invalidate = useThree((state) => state.invalidate)
  const material = materials[materialKey] ?? missingBuildingMaterial
  const baseColor = material.color ?? '#ffffff'
  const sharedMaterial = useMemo(() => {
    const { color: _color, ...rest } = material
    return rest
  }, [material])
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
      new MeshStandardMaterial({
        ...sharedMaterial,
        color: '#ffffff',
        vertexColors: true,
      }),
      parts.length,
    )

    instancedMesh.instanceColor = instanceColorAttribute
    instancedMesh.castShadow = true
    instancedMesh.receiveShadow = true
    return instancedMesh
  }, [instanceColorAttribute, parts.length, sharedMaterial])

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
