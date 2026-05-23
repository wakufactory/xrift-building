import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { BoxInstance } from './types'

// BoxColliders に渡す collider 対象の box 配列を表す。
export type BoxCollidersProps = {
  parts: BoxInstance[]
}

// 既存の BuildingColliders API と互換にするための props alias。
export type BuildingCollidersProps = BoxCollidersProps

// BoxInstance 配列から固定 CuboidCollider 群を生成する。
export function BoxColliders({ parts }: BoxCollidersProps) {
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

// 既存の BuildingColliders 名を BoxColliders として維持する。
export const BuildingColliders = BoxColliders
