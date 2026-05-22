import { SpawnPoint } from '@xrift/world-components'
import { BuildingWorld } from './building/BuildingWorld'
import type { Vec3 } from './building/types'
import { worldBuildingMaterials } from './worldMaterials'
import { worldBuildingPlan } from './worldPlan'

export interface WorldProps {
  position?: Vec3
  scale?: number
  enableProfileLog?: boolean
}

export const World: React.FC<WorldProps> = ({
  position = [0, 0, 0],
  scale = 1,
  enableProfileLog = true,
}) => {
  return (
    <>
      <color attach="background" args={['#b9c6cc']} />
      <fog attach="fog" args={['#b9c6cc', 28, 72]} />

      <SpawnPoint position={[10, 0.05, 5]} yaw={90} />
    {/*
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={1}>
        <mesh  rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshLambertMaterial  color={[0.5,1.,1.]} />
        </mesh>
      </RigidBody>
      */}
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
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={0.1}
        shadow-camera-far={60}
      />

      <BuildingWorld
        plan={worldBuildingPlan}
        materials={worldBuildingMaterials}
        position={position}
        scale={scale}
        enableProfileLog={enableProfileLog}
      />
    </>
  )
}
