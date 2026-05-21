import { SpawnPoint } from '@xrift/world-components'
import { Building } from './building/Building'
import { demoBuildingPlan } from './building/presets'

export interface WorldProps {
  position?: [number, number, number]
  scale?: number
}

export const World: React.FC<WorldProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  return (
    <>
      <color attach="background" args={['#b9c6cc']} />
      <fog attach="fog" args={['#b9c6cc', 28, 72]} />

      <group position={position} scale={scale}>
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

        <Building plan={demoBuildingPlan} />
      </group>
    </>
  )
}
