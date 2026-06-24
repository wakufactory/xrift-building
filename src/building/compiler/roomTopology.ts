import type { OpeningSpec, RoomSpec, WallSide } from '../types'
import { EPSILON } from './walls'

// 隣接 room の共有壁を一方だけが所有するためのトポロジー判定。
// 重複区間を全高の開口として返し、壁 mesh と collider の二重生成を防ぐ。
export function getSharedWallOpeningsOwnedByAnotherRoom(
  rooms: RoomSpec[],
  room: RoomSpec,
  side: WallSide,
  roomHeight: number,
): OpeningSpec[] {
  // 隣接する部屋は同じ境界面を共有することがある。同じ面に mesh と
  // collider が二重生成されないよう、辞書順で先の部屋が共有区間を
  // 所有する。ただし壁全体を skip すると、サイズ違いの部屋で非共有
  // 部分まで抜けるため、他の部屋が所有する重複区間だけを全高の開口
  // として差し引く。
  return rooms.flatMap((other) => {
    if (other.id === room.id) return []
    if (other.id > room.id) return []

    const overlap = getOppositeWallOverlap(room, side, other)
    if (!overlap) return []

    return [{
      side,
      offset: (overlap.start + overlap.end) / 2,
      width: overlap.end - overlap.start,
      bottom: 0,
      height: roomHeight,
    }]
  })
}

// 隣接する反対向きの壁同士が重なる区間を壁ローカル座標で返す。
function getOppositeWallOverlap(room: RoomSpec, side: WallSide, other: RoomSpec): { start: number, end: number } | undefined {
  const roomBounds = getRoomBoundary(room)
  const otherBounds = getRoomBoundary(other)
  const [roomX, roomZ] = room.position

  switch (side) {
    case 'north': {
      if (!nearlyEqual(roomBounds.minZ, otherBounds.maxZ)) return undefined
      const overlap = rangeIntersection(roomBounds.minX, roomBounds.maxX, otherBounds.minX, otherBounds.maxX)
      return overlap && { start: overlap.min - roomX, end: overlap.max - roomX }
    }
    case 'south': {
      if (!nearlyEqual(roomBounds.maxZ, otherBounds.minZ)) return undefined
      const overlap = rangeIntersection(roomBounds.minX, roomBounds.maxX, otherBounds.minX, otherBounds.maxX)
      return overlap && { start: overlap.min - roomX, end: overlap.max - roomX }
    }
    case 'east': {
      if (!nearlyEqual(roomBounds.maxX, otherBounds.minX)) return undefined
      const overlap = rangeIntersection(roomBounds.minZ, roomBounds.maxZ, otherBounds.minZ, otherBounds.maxZ)
      return overlap && zOverlapToNorthPositiveOffset(overlap.min, overlap.max, roomZ)
    }
    case 'west': {
      if (!nearlyEqual(roomBounds.minX, otherBounds.maxX)) return undefined
      const overlap = rangeIntersection(roomBounds.minZ, roomBounds.maxZ, otherBounds.minZ, otherBounds.maxZ)
      return overlap && zOverlapToNorthPositiveOffset(overlap.min, overlap.max, roomZ)
    }
  }
}

// Z 範囲の重なりを north 正方向の壁 offset 範囲に変換する。
function zOverlapToNorthPositiveOffset(minZ: number, maxZ: number, roomZ: number): { start: number, end: number } {
  return {
    start: roomZ - maxZ,
    end: roomZ - minZ,
  }
}

// 1 部屋の XZ 境界を計算する。
function getRoomBoundary(room: RoomSpec) {
  const [x, z] = room.position
  const [width, depth] = room.size

  return {
    minX: x - width / 2,
    maxX: x + width / 2,
    minZ: z - depth / 2,
    maxZ: z + depth / 2,
  }
}

// 2 つの一次元範囲の交差を計算する。
function rangeIntersection(aMin: number, aMax: number, bMin: number, bMax: number): { min: number, max: number } | undefined {
  const min = Math.max(aMin, bMin)
  const max = Math.min(aMax, bMax)

  if (max - min <= EPSILON) {
    return undefined
  }

  return { min, max }
}

// 2 つの数値が EPSILON 未満の差で等しいか判定する。
export function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON
}

// 完全一致する BoxPart だけを重複除去する。
