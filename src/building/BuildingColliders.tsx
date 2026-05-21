import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { BoxPart } from './types'

type BuildingCollidersProps = {
  parts: BoxPart[]
}

export function BuildingColliders({ parts }: BuildingCollidersProps) {
  return (
    <RigidBody type="fixed" colliders={false} restitution={0} friction={0.7}>
      {parts.filter((part) => part.collider !== false).map((part) => (
        <CuboidCollider
          key={part.id}
          args={[part.size[0] / 2, part.size[1] / 2, part.size[2] / 2]}
          position={part.position}
          rotation={part.rotation}
        />
      ))}
    </RigidBody>
  )
}
