import { SpawnPoint } from '@xrift/world-components'
import { RigidBody} from '@react-three/rapier'
import type { Vec3 } from './building/types'
import {Buildings} from './worldPlan.tsx'

export interface WorldProps {
  position?: Vec3
  scale?: number
  enableProfileLog?: boolean
}

export const World: React.FC<WorldProps> = ({

}) => {
  return (
    <>
      <color attach="background" args={['#b9c6cc']} />
      <fog attach="fog" args={['#b9c6cc', 28, 150]} />
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={0}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshLambertMaterial color={'#847e0a'} />
        </mesh>
      </RigidBody>
    
      <group position={[10, 0.05, 5]} rotation={[0, 90, 0]}>
        <SpawnPoint />
      </group>

      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={1}>
      <mesh  position={[5, 1.5, 11]} castShadow>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial color="#a0a0a0" />
      </mesh>
      </RigidBody>

      <mesh  position={[5, 0.75, 7]} castShadow>
        <boxGeometry args={[1, 1.5, 1]} />
        <meshStandardMaterial color="#a0a0a0" />
      </mesh>

      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#f4efe3', '#526069', 1.1]} />
      <directionalLight
        position={[4, 12, 8]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={0.1}
        shadow-camera-far={60}
      />
      {Buildings() }
    </>
  )
}
