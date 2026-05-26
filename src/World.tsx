import { SpawnPoint } from '@xrift/world-components'
import { RigidBody } from '@react-three/rapier'
import { Buildings } from './worldPlan.tsx'
import { Buildings2 } from './worldPlan2.tsx'
import { Buildings3 } from './worldPlan3.tsx'
import { PlayerShadowLight } from './components/PlayerShadowLight'
import {SimpleBuilding} from './worldPlan0.tsx' 

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
          <planeGeometry args={[300, 300]} />
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
      <Buildings3 position={[0, 0, -75]} />

      <SimpleBuilding position={[0,0,60]} />
    </>
  )
}
