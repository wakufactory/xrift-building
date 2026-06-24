import type { BoxPart, BoxPartColor, OpeningSpec, SurfaceSpec, Vec3, WallSide } from '../types'
import { applySurfaceSpec } from './surface'

// 壁ローカルの開口矩形を分割し、軸整列した BoxPart へ変換する。
// north/south/east/west の座標差は、このモジュール内だけで吸収する。
export const OPENING_DEFAULTS = {
  doorBottom: 0,
  doorHeight: 2.15,
  windowBottom: 1.05,
  windowHeight: 1.05,
}

export const EPSILON = 0.001

export type WallSegment = { start: number, end: number, bottom: number, top: number }
export type WallOpening = WallSegment & { splitAxis: 'horizontal' | 'vertical' }

// 指定方向のドア・窓を抽出し、AO/壁生成で共有する省略値を補完する。
export function normalizeOpenings(openings: OpeningSpec[], side: WallSide, isDoor: boolean): (OpeningSpec & { splitAxis: WallOpening['splitAxis'] })[] {
  return openings
    .filter((opening) => opening.side === side)
    .map((opening) => ({
      ...opening,
      bottom: opening.bottom ?? (isDoor ? OPENING_DEFAULTS.doorBottom : OPENING_DEFAULTS.windowBottom),
      height: opening.height ?? (isDoor ? OPENING_DEFAULTS.doorHeight : OPENING_DEFAULTS.windowHeight),
      splitAxis: 'vertical',
    }))
}

// 分割済み壁セグメントを world-space の BoxPart 群にする。
export function compileWall(input: {
  roomId: string
  side: WallSide
  roomCenter: [number, number]
  roomSize: [number, number]
  wallThickness: number
  bottomY: number
  height: number
  materialKey: string
  color?: BoxPartColor
  surface?: SurfaceSpec
  openings: (OpeningSpec & { splitAxis?: WallOpening['splitAxis'] })[]
}): BoxPart[] {
  const { roomId, side, roomCenter, roomSize, wallThickness, bottomY, height, materialKey, color, surface, openings } = input
  const [roomX, roomZ] = roomCenter
  const [width, depth] = roomSize
  const wallLength = side === 'north' || side === 'south' ? width : depth

  return splitWallSegments(wallLength, height, openings).map((segment, index) => {
    const centerAlongWall = (segment.start + segment.end) / 2
    const segmentLength = segment.end - segment.start
    const centerY = bottomY + (segment.bottom + segment.top) / 2
    const segmentHeight = segment.top - segment.bottom

    return applySurfaceSpec({
      id: `${roomId}:wall:${side}:${index}`,
      kind: 'wall',
      position: wallPartPosition(side, roomX, roomZ, width, depth, centerAlongWall, centerY),
      size: wallPartSize(side, segmentLength, segmentHeight, wallThickness),
      materialKey,
      color,
      collider: true,
    }, surface)
  })
}

export function splitWallSegments(
  wallLength: number,
  floorHeight: number,
  openings: (OpeningSpec & { splitAxis?: WallOpening['splitAxis'] })[],
): WallSegment[] {
  let segments: WallSegment[] = [{ start: -wallLength / 2, end: wallLength / 2, bottom: 0, top: floorHeight }]

  for (const opening of openings) {
    const openingBottom = opening.bottom ?? 0
    segments = segments.flatMap((segment) => subtractOpening(segment, {
      start: opening.offset - opening.width / 2,
      end: opening.offset + opening.width / 2,
      bottom: openingBottom,
      top: openingBottom + (opening.height ?? OPENING_DEFAULTS.doorHeight),
      splitAxis: opening.splitAxis ?? 'horizontal',
    }))
  }

  return segments.filter((segment) => segment.end - segment.start > EPSILON && segment.top - segment.bottom > EPSILON)
}

function subtractOpening(segment: WallSegment, opening: WallOpening): WallSegment[] {
  const overlapStart = Math.max(segment.start, opening.start)
  const overlapEnd = Math.min(segment.end, opening.end)
  const overlapBottom = Math.max(segment.bottom, opening.bottom)
  const overlapTop = Math.min(segment.top, opening.top)
  if (overlapStart >= overlapEnd || overlapBottom >= overlapTop) return [segment]

  const pieces: WallSegment[] = []
  if (opening.splitAxis === 'vertical') {
    if (segment.bottom < overlapBottom) pieces.push({ ...segment, top: overlapBottom })
    if (overlapTop < segment.top) pieces.push({ ...segment, bottom: overlapTop })
    if (segment.start < overlapStart) pieces.push({ start: segment.start, end: overlapStart, bottom: overlapBottom, top: overlapTop })
    if (overlapEnd < segment.end) pieces.push({ start: overlapEnd, end: segment.end, bottom: overlapBottom, top: overlapTop })
    return pieces
  }
  if (segment.start < overlapStart) pieces.push({ ...segment, end: overlapStart })
  if (overlapEnd < segment.end) pieces.push({ ...segment, start: overlapEnd })
  if (segment.bottom < overlapBottom) pieces.push({ start: overlapStart, end: overlapEnd, bottom: segment.bottom, top: overlapBottom })
  if (overlapTop < segment.top) pieces.push({ start: overlapStart, end: overlapEnd, bottom: overlapTop, top: segment.top })
  return pieces
}

export function wallPartPosition(side: WallSide, roomX: number, roomZ: number, width: number, depth: number, centerAlongWall: number, centerY: number): Vec3 {
  switch (side) {
    case 'north': return [roomX + centerAlongWall, centerY, roomZ - depth / 2]
    case 'south': return [roomX + centerAlongWall, centerY, roomZ + depth / 2]
    case 'east': return [roomX + width / 2, centerY, roomZ - centerAlongWall]
    case 'west': return [roomX - width / 2, centerY, roomZ - centerAlongWall]
  }
}

function wallPartSize(side: WallSide, length: number, height: number, wallThickness: number): Vec3 {
  return side === 'north' || side === 'south' ? [length, height, wallThickness] : [wallThickness, height, length]
}
