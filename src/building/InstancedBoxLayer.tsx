import { useLayoutEffect, useMemo, useRef } from 'react'
import { BoxGeometry, Euler, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three'
import type { BoxPart } from './types'
import { MATERIALS } from './materials'

type InstancedBoxLayerProps = {
  parts: BoxPart[]
}

const unitBoxGeometry = new BoxGeometry(1, 1, 1)

export function InstancedBoxLayer({ parts }: InstancedBoxLayerProps) {
  const groups = useMemo(() => groupByMaterial(parts), [parts])

  return (
    <>
      {groups.map(([materialKey, materialParts]) => (
        <InstancedBoxes
          key={materialKey}
          materialKey={materialKey}
          parts={materialParts}
        />
      ))}
    </>
  )
}

function InstancedBoxes({ materialKey, parts }: { materialKey: string; parts: BoxPart[] }) {
  const meshRef = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

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
  }, [parts])

  return (
    <instancedMesh
      ref={meshRef}
      args={[unitBoxGeometry, undefined, parts.length]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial {...MATERIALS[materialKey as keyof typeof MATERIALS]} />
    </instancedMesh>
  )
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
