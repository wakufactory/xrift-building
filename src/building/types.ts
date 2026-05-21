export type Vec2 = [number, number]
export type Vec3 = [number, number, number]

export type WallSide = 'north' | 'south' | 'east' | 'west'

export type BuildingPlan = {
  floorHeight: number
  wallThickness: number
  slabThickness: number
  exteriorGround?: ExteriorGroundSpec | false
  rooms: RoomSpec[]
}

export type ExteriorGroundSpec = {
  margin?: number
  thickness?: number
  materialKey?: string
}

export type RoomSpec = {
  id: string
  position: Vec2
  size: Vec2
  material?: Partial<RoomMaterials>
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
  collider?: boolean
}
