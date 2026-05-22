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

      <SpawnPoint position={[0, 0.05, -2.2]} yaw={180} />

      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#f4efe3', '#526069', 1.1]} />
      <directionalLight
        position={[8, 12, 6]}
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
