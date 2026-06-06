import { Suspense } from 'react'
import { SpawnPoint } from '@xrift/world-components'
import { RigidBody } from '@react-three/rapier'
import { Buildings } from './worldPlan.tsx'
import { Buildings2 } from './worldPlan2.tsx'
import { Buildings3 } from './worldPlan3.tsx'
import { Buildings4 } from './worldPlan4.tsx'
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
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <planeGeometry args={[300, 300]} />
          <meshLambertMaterial  color={'#0a843d'} />
        </mesh>
      </RigidBody>
    
      <group position={[10, 0.05, 30]} rotation={[0, 0, 0]}>
        <SpawnPoint />
      </group>

      <ambientLight intensity={0.15} />
      <hemisphereLight args={['#f4efe3', '#526069', .5]} />
      <PlayerShadowLight 
          direction = {[-2,10,10]}
          intensity = {2.2}
          shadowSize = {54}
          shadowDepth = {70}
          shadowDistance = {80}
          mapSize = {1024} 
      />

      <Suspense fallback={null}>
        <Buildings />
        <Buildings2 position={[30, 0, 2]} />
        <Buildings3 position={[0, 0, -75]} />
        <Buildings4 position={[45, 0, 55]} />
        <group position={[0, 0, 30]} rotation={[0, Math.PI * 0.5, 0]}>
          <SimpleBuilding />
        </group>
      </Suspense>
    </>
  )
}
