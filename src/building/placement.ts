import type { BuildingPlan, RoomSpec, Vec2, Vec3, WallSide } from './types'

// 家具や装飾を置くための位置と回転を表す。
export type PlacementTransform = {
  position: Vec3
  rotation: Vec3
}

// 部屋の床基準で配置を計算するための入力を表す。
export type FloorPlacementInput = {
  roomId: string
  offset?: Vec2
  height?: number
  rotationY?: number
}

// 部屋の壁基準で配置を計算するための入力を表す。
export type WallPlacementInput = {
  roomId: string
  side: WallSide
  offset?: number
  height?: number
  inset?: number
}

// 部屋の床面フレームと境界を表す。
export type RoomFloorFrame = {
  room: RoomSpec
  center: Vec3
  size: Vec2
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

// 部屋の壁面フレーム、接線、内向き法線を表す。
export type RoomWallFrame = {
  room: RoomSpec
  side: WallSide
  center: Vec3
  length: number
  tangent: Vec3
  inwardNormal: Vec3
  rotation: Vec3
}

// 指定 room の床面中心と境界を取得する。
export function getRoomFloorFrame(plan: BuildingPlan, roomId: string): RoomFloorFrame {
  const unit = plan.unit ?? 1
  const sourceRoom = getRoom(plan, roomId)
  const room = scaleRoom(sourceRoom, unit)
  const [x, z] = room.position
  const [width, depth] = room.size

  return {
    room,
    center: [x, 0, z],
    size: [width, depth],
    minX: x - width / 2,
    maxX: x + width / 2,
    minZ: z - depth / 2,
    maxZ: z + depth / 2,
  }
}

// 指定 room の指定壁に沿った配置用フレームを取得する。
export function getRoomWallFrame(plan: BuildingPlan, input: Pick<WallPlacementInput, 'roomId' | 'side'>): RoomWallFrame {
  const unit = plan.unit ?? 1
  const sourceRoom = getRoom(plan, input.roomId)
  const room = scaleRoom(sourceRoom, unit)
  const [x, z] = room.position
  const [width, depth] = room.size
  const wallThickness = plan.wallThickness * unit
  const centerY = plan.floorHeight * unit / 2

  switch (input.side) {
    case 'north':
      return {
        room,
        side: input.side,
        center: [x, centerY, z - depth / 2 + wallThickness / 2],
        length: width,
        tangent: [1, 0, 0],
        inwardNormal: [0, 0, 1],
        rotation: [0, 0, 0],
      }
    case 'south':
      return {
        room,
        side: input.side,
        center: [x, centerY, z + depth / 2 - wallThickness / 2],
        length: width,
        tangent: [1, 0, 0],
        inwardNormal: [0, 0, -1],
        rotation: [0, Math.PI, 0],
      }
    case 'east':
      return {
        room,
        side: input.side,
        center: [x + width / 2 - wallThickness / 2, centerY, z],
        length: depth,
        tangent: [0, 0, -1],
        inwardNormal: [-1, 0, 0],
        rotation: [0, -Math.PI / 2, 0],
      }
    case 'west':
      return {
        room,
        side: input.side,
        center: [x - width / 2 + wallThickness / 2, centerY, z],
        length: depth,
        tangent: [0, 0, -1],
        inwardNormal: [1, 0, 0],
        rotation: [0, Math.PI / 2, 0],
      }
  }
}

// 床面基準の offset と高さから world 配置を計算する。
export function getFloorPlacement(plan: BuildingPlan, input: FloorPlacementInput): PlacementTransform {
  const unit = plan.unit ?? 1
  const frame = getRoomFloorFrame(plan, input.roomId)
  const [offsetX, offsetZ] = input.offset ?? [0, 0]

  return {
    position: [
      frame.center[0] + offsetX * unit,
      (input.height ?? 0) * unit,
      frame.center[2] + offsetZ * unit,
    ],
    rotation: [0, input.rotationY ?? 0, 0],
  }
}

// 壁面基準の offset、高さ、inset から world 配置を計算する。
export function getWallPlacement(plan: BuildingPlan, input: WallPlacementInput): PlacementTransform {
  const unit = plan.unit ?? 1
  const frame = getRoomWallFrame(plan, input)
  const offset = (input.offset ?? 0) * unit
  const height = (input.height ?? 0) * unit
  const inset = (input.inset ?? 0) * unit

  return {
    position: [
      frame.center[0] + frame.tangent[0] * offset + frame.inwardNormal[0] * inset,
      height,
      frame.center[2] + frame.tangent[2] * offset + frame.inwardNormal[2] * inset,
    ],
    rotation: frame.rotation,
  }
}

// plan 内から指定 ID の room を取得する。
function getRoom(plan: BuildingPlan, roomId: string): RoomSpec {
  const room = plan.rooms.find((candidate) => candidate.id === roomId)

  if (!room) {
    throw new Error(`Room "${roomId}" was not found in BuildingPlan.`)
  }

  return room
}

// plan.unit を考慮して room の位置とサイズを world units に変換する。
function scaleRoom(room: RoomSpec, unit: number): RoomSpec {
  if (unit === 1) {
    return room
  }

  return {
    ...room,
    position: scaleVec2(room.position, unit),
    size: scaleVec2(room.size, unit),
  }
}

// Vec2 を指定倍率でスケールする。
function scaleVec2(value: Vec2, unit: number): Vec2 {
  return [value[0] * unit, value[1] * unit]
}
