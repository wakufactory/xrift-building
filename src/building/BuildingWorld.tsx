import { Building } from './Building'
import type { BuildingMaterialCatalog } from './materials'
import type { BuildingPlan, Vec3 } from './types'

export type BuildingWorldProps = {
  plan: BuildingPlan
  materials: BuildingMaterialCatalog
  position?: Vec3
  scale?: number
  enableProfileLog?: boolean
}

export function BuildingWorld({
  plan,
  materials,
  position = [0, 0, 0],
  scale = 1,
  enableProfileLog = true,
}: BuildingWorldProps) {
  return (
    <group position={position} scale={scale}>
      <Building plan={plan} materials={materials} enableProfileLog={enableProfileLog} />
    </group>
  )
}
