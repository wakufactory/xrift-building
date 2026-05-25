import { SpawnPoint } from '@xrift/world-components'
import { RigidBody } from '@react-three/rapier'
import { Buildings } from './worldPlan.tsx'
import { Buildings2 } from './worldPlan2.tsx'
import { PlayerShadowLight } from './components/PlayerShadowLight'


export interface WorldProps {
  position?: [number, number, number]
  scale?: number
}

export const World: React.FC<WorldProps> = () => {
  return (
    <>
      <color attach="background" args={['#b9c6cc']} />
      <fog attach="fog" args={['#b9c6cc', 28, 150]} />
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={0}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshLambertMaterial color={'#0a843d'} />
        </mesh>
      </RigidBody>
    
      <group position={[10, 0.05, 30]} rotation={[0, 0, 0]}>
        <SpawnPoint />
      </group>

      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#f4efe3', '#526069', 1.1]} />
      <PlayerShadowLight />

      <Buildings />
      <Buildings2 position={[30,0,2]}/>
    </>
  )
}
