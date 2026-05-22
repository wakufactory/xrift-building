import type { ColorRepresentation } from 'three'

export type Vec2 = [number, number]
export type Vec3 = [number, number, number]

export type WallSide = 'north' | 'south' | 'east' | 'west'
export type BoxPartColor = ColorRepresentation | Vec3
export type WallColorMap = Partial<Record<WallSide, BoxPartColor>>

export type BuildingPlan = {
  unit?: number
  floorHeight: number
  wallThickness: number
  slabThickness: number
  pillar?: PillarSpec
  materialKeys: BuildingMaterialKeys
  exteriorGround?: ExteriorGroundSpec | false
  rooms: RoomSpec[]
}

export type BuildingMaterialKeys = {
  room: RoomMaterials
  exteriorGround: string
  pillar: string
}

export type ExteriorGroundSpec = {
  margin?: number
  thickness?: number
  materialKey?: string
}

export type PillarSpec = {
  thickness?: number
}

export type RoomSpec = {
  id: string
  position: Vec2
  size: Vec2
  material?: Partial<RoomMaterials>
  wallColors?: WallColorMap
  doors?: OpeningSpec[]
  windows?: OpeningSpec[]
}

export type OpeningSpec = {
  side: WallSide
  offset: number
  width: number
  height?: number
  bottom?: number
}

export type RoomMaterials = {
  floor: string
  wall: string
  ceiling: string
}

export type BoxPartKind =
  | 'floor'
  | 'exteriorGround'
  | 'wall'
  | 'ceiling'
  | 'pillar'
  | 'trim'
  | 'colliderOnly'

export type BoxPart = {
  id: string
  kind: BoxPartKind
  position: Vec3
  size: Vec3
  rotation?: Vec3
  materialKey: string
  color?: BoxPartColor
  collider?: boolean
}
