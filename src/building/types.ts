import type { ColorRepresentation } from 'three'

export type Vec2 = [number, number]
export type Vec3 = [number, number, number]

export type WallSide = 'north' | 'south' | 'east' | 'west'
export type BoxPartColor = ColorRepresentation | Vec3
export type WallSurfaceMap = Partial<Record<WallSide, SurfaceSpec>>

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
  surfaces?: RoomSurfaces
  doors?: OpeningSpec[]
  windows?: OpeningSpec[]
}

export type SurfaceSpec = {
  materialKey?: string
  color?: BoxPartColor
  hidden?: boolean
  noCollider?: boolean
}

export type SurfaceFlags = SurfaceSpec

export type RoomSurfaces = {
  floor?: SurfaceSpec
  wall?: SurfaceSpec
  ceiling?: SurfaceSpec
  walls?: WallSurfaceMap
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
  visible?: boolean
  collider?: boolean
}
