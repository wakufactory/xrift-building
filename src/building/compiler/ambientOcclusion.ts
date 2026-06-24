import type { AmbientOcclusionSpec, BuildingPlan, PlanePart, RoomSpec, Vec2, Vec3, WallSide } from '../types'
import { getSharedWallOpeningsOwnedByAnotherRoom } from './roomTopology'
import { EPSILON, normalizeOpenings, splitWallSegments, wallPartPosition, type WallSegment } from './walls'

// 壁・床・天井の接点を描画する疑似 AO plane の生成を担当する。
// 入力・出力はコンパイラの中間表現だけに限定し、描画実装には依存しない。
const DEFAULT_AMBIENT_OCCLUSION: Required<AmbientOcclusionSpec> = {
  width: 0.16,
  strength: 0.16,
  falloff: 1.8,
  floor: true,
  ceiling: true,
  wallFloorCeiling: true,
  wallCorners: true,
  pillars: false,
}

// room ごとの指定を建物全体の指定へ重ね、AO を使わない場合は null を返す。
function resolveAmbientOcclusion(plan: BuildingPlan, room: RoomSpec): Required<AmbientOcclusionSpec> | null {
  if (plan.ambientOcclusion === false || room.ambientOcclusion === false) return null
  if (plan.ambientOcclusion === undefined && room.ambientOcclusion === undefined) return null

  return {
    ...DEFAULT_AMBIENT_OCCLUSION,
    ...(plan.ambientOcclusion ?? {}),
    ...(room.ambientOcclusion ?? {}),
  }
}

// 室内の壁接点、角、開口輪郭から AO 用の平面を生成する。
export function compileRoomAmbientOcclusion(plan: BuildingPlan, room: RoomSpec): PlanePart[] {
  const ao = resolveAmbientOcclusion(plan, room)
  if (!ao) return []

  const [roomX, roomZ] = room.position
  const [roomWidth, roomDepth] = room.size
  const wallThickness = room.wallThickness ?? plan.wallThickness
  const planes: PlanePart[] = []
  const sides = ['north', 'south', 'east', 'west'] as WallSide[]
  const wallSegments = new Map<WallSide, WallSegment[]>()

  for (const side of sides) {
    const wallSurface = {
      ...room.surfaces?.wall,
      ...room.surfaces?.walls?.[side],
    }
    if (wallSurface.hidden) continue

    const openings = [
      ...getSharedWallOpeningsOwnedByAnotherRoom(plan.rooms, room, side, plan.floorHeight),
      ...normalizeOpenings(room.doors ?? [], side, true),
      ...normalizeOpenings(room.windows ?? [], side, false),
    ]
    const wallLength = side === 'north' || side === 'south' ? roomWidth : roomDepth
    const segments = splitWallSegments(wallLength, plan.floorHeight, openings)
    wallSegments.set(side, segments)

    if (ao.floor && room.surfaces?.floor?.hidden !== true) {
      for (const [index, segment] of segments.entries()) {
        if (segment.bottom > EPSILON) continue
        const span = getWallContactAoSpan(segment, wallLength, wallThickness)
        if (!span) continue
        const input: AoWallInput & { length: number, y: number } = {
          id: `${room.id}:ao:floor:${side}:${index}`,
          side,
          roomCenter: [roomX, roomZ],
          roomSize: [roomWidth, roomDepth],
          wallThickness,
          along: (span.start + span.end) / 2,
          length: span.end - span.start,
          y: plan.slabThickness + 0.001,
          width: ao.width,
          strength: ao.strength,
          falloff: ao.falloff,
        }
        planes.push(createFloorWallAoPlane(input))
        if (ao.wallFloorCeiling) {
          planes.push(createFloorWallFaceAoPlane(input))
        }
      }
    }

    if (ao.ceiling && room.surfaces?.ceiling?.hidden !== true) {
      for (const [index, segment] of segments.entries()) {
        if (segment.top < plan.floorHeight - EPSILON) continue
        const span = getWallContactAoSpan(segment, wallLength, wallThickness)
        if (!span) continue
        const input: AoWallInput & { length: number, y: number } = {
          id: `${room.id}:ao:ceiling:${side}:${index}`,
          side,
          roomCenter: [roomX, roomZ],
          roomSize: [roomWidth, roomDepth],
          wallThickness,
          along: (span.start + span.end) / 2,
          length: span.end - span.start,
          y: plan.floorHeight - plan.slabThickness - 0.002,
          width: ao.width,
          strength: ao.strength,
          falloff: ao.falloff,
        }
        planes.push(createCeilingWallAoPlane(input))
        if (ao.wallFloorCeiling) {
          planes.push(createCeilingWallFaceAoPlane(input))
        }
      }
    }
  }

  if (ao.wallCorners) {
    for (const corner of [
      { id: 'north-west', sides: ['north', 'west'] as WallSide[], ends: ['start', 'end'] as const },
      { id: 'north-east', sides: ['north', 'east'] as WallSide[], ends: ['end', 'end'] as const },
      { id: 'south-east', sides: ['south', 'east'] as WallSide[], ends: ['end', 'start'] as const },
      { id: 'south-west', sides: ['south', 'west'] as WallSide[], ends: ['start', 'start'] as const },
    ]) {
      corner.sides.forEach((side, index) => {
        const segments = wallSegments.get(side)
        const end = corner.ends[index]
        const wallLength = side === 'north' || side === 'south' ? roomWidth : roomDepth
        if (!segments || !hasFullHeightWallAtEnd(segments, end, wallLength, plan.floorHeight)) return

        planes.push(createWallCornerAoPlane({
          id: `${room.id}:ao:corner:${corner.id}:${side}`,
          side,
          end,
          roomCenter: [roomX, roomZ],
          roomSize: [roomWidth, roomDepth],
          wallThickness,
          y: (plan.slabThickness + plan.floorHeight - plan.slabThickness) / 2,
          height: plan.floorHeight - plan.slabThickness * 2,
          width: ao.width,
          strength: ao.strength,
          falloff: ao.falloff,
        }))
      })
    }
  }

  return planes
}

function hasFullHeightWallAtEnd(segments: WallSegment[], end: 'start' | 'end', wallLength: number, height: number) {
  const edge = end === 'start' ? -wallLength / 2 : wallLength / 2
  const spans = segments
    .filter((segment) => end === 'start' ? segment.start <= edge + EPSILON : segment.end >= edge - EPSILON)
    .map((segment) => ({ bottom: segment.bottom, top: segment.top }))
    .sort((a, b) => a.bottom - b.bottom)
  let coveredTop = 0

  for (const span of spans) {
    if (span.bottom > coveredTop + EPSILON) return false
    coveredTop = Math.max(coveredTop, span.top)
  }

  return coveredTop >= height - EPSILON
}

// floor / ceiling の壁際 AO は、直交する壁と重なる両端を除いて配置する。
// 開口で分割された途中端は wall 境界ではないため、縮めない。
function getWallContactAoSpan(segment: WallSegment, wallLength: number, wallThickness: number) {
  const wallStart = -wallLength / 2
  const wallEnd = wallLength / 2
  const start = segment.start <= wallStart + EPSILON
    ? segment.start + wallThickness / 2
    : segment.start
  const end = segment.end >= wallEnd - EPSILON
    ? segment.end - wallThickness / 2
    : segment.end

  if (end - start <= EPSILON) return undefined
  return { start, end }
}

type AoWallInput = {
  id: string
  side: WallSide
  roomCenter: [number, number]
  roomSize: [number, number]
  wallThickness: number
  along: number
  width: number
  strength: number
  falloff: number
}

function createFloorWallAoPlane(input: AoWallInput & { length: number, y: number }): PlanePart {
  const face = getInteriorWallFacePosition(input)
  const normal = getInteriorWallNormal(input.side)

  return {
    id: input.id,
    kind: 'ambientOcclusion',
    position: [face[0] + normal[0] * input.width / 2, input.y, face[2] + normal[1] * input.width / 2],
    size: [input.length, input.width],
    rotation: getFloorAoRotation(input.side),
    gradientAxis: 'y',
    strength: input.strength,
    falloff: input.falloff,
  }
}

function createCeilingWallAoPlane(input: AoWallInput & { length: number, y: number }): PlanePart {
  const face = getInteriorWallFacePosition(input)
  const normal = getInteriorWallNormal(input.side)

  return {
    id: input.id,
    kind: 'ambientOcclusion',
    position: [face[0] + normal[0] * input.width / 2, input.y, face[2] + normal[1] * input.width / 2],
    size: [input.length, input.width],
    rotation: getCeilingAoRotation(input.side),
    gradientAxis: 'y',
    strength: input.strength,
    falloff: input.falloff,
  }
}

// 床と壁の接点を、壁面側からも縦方向に暗くする。
function createFloorWallFaceAoPlane(input: AoWallInput & { length: number, y: number }): PlanePart {
  const face = getInteriorWallFacePosition(input)

  return {
    id: `${input.id}:wall-face`,
    kind: 'ambientOcclusion',
    position: [face[0], input.y + input.width / 2, face[2]],
    size: [input.length, input.width],
    rotation: getWallAoRotation(input.side),
    gradientAxis: 'y',
    strength: input.strength,
    falloff: input.falloff,
  }
}

// 天井と壁の接点を、壁面側からも縦方向に暗くする。
function createCeilingWallFaceAoPlane(input: AoWallInput & { length: number, y: number }): PlanePart {
  const face = getInteriorWallFacePosition(input)

  return {
    id: `${input.id}:wall-face`,
    kind: 'ambientOcclusion',
    position: [face[0], input.y - input.width / 2, face[2]],
    size: [input.length, input.width],
    rotation: getWallAoRotation(input.side),
    gradientAxis: 'y',
    gradientReverse: true,
    strength: input.strength,
    falloff: input.falloff,
  }
}

function createWallCornerAoPlane(input: Omit<AoWallInput, 'along'> & { end: 'start' | 'end', y: number, height: number }): PlanePart {
  const wallLength = input.side === 'north' || input.side === 'south' ? input.roomSize[0] : input.roomSize[1]
  // wall の境界線では、直交する wall box が厚みの半分だけ重なる。
  // そのまま AO を始めると勾配の先頭が隣の wall に隠れるため、室内側の
  // 実際の壁面交点まで wallThickness / 2 だけ移動してから配置する。
  const innerCornerInset = input.wallThickness / 2
  const along = input.end === 'start'
    ? -wallLength / 2 + innerCornerInset + input.width / 2
    : wallLength / 2 - innerCornerInset - input.width / 2
  const face = getInteriorWallFacePosition({ ...input, along })

  return {
    id: input.id,
    kind: 'ambientOcclusion',
    position: [face[0], input.y, face[2]],
    size: [input.width, input.height],
    rotation: getWallAoRotation(input.side),
    gradientAxis: 'x',
    // north / west は plane の local X と wall の along が同方向、
    // south / east は逆方向になる。
    gradientReverse: isWallPlaneLocalXAlignedWithWallAlong(input.side)
      ? input.end === 'end'
      : input.end === 'start',
    strength: input.strength,
    falloff: input.falloff,
  }
}

// wall box の中心から室内側の表面へ 1 mm 浮かせた plane 位置を返す。
function getInteriorWallFacePosition(input: Pick<AoWallInput, 'side' | 'roomCenter' | 'roomSize' | 'wallThickness' | 'along'>): Vec3 {
  const [roomX, roomZ] = input.roomCenter
  const [width, depth] = input.roomSize
  const base = wallPartPosition(input.side, roomX, roomZ, width, depth, input.along, 0)
  const normal = getInteriorWallNormal(input.side)

  return [
    base[0] + normal[0] * (input.wallThickness / 2 + 0.0015),
    0,
    base[2] + normal[1] * (input.wallThickness / 2 + 0.0015),
  ]
}

function getInteriorWallNormal(side: WallSide): Vec2 {
  switch (side) {
    case 'north': return [0, 1]
    case 'south': return [0, -1]
    case 'east': return [-1, 0]
    case 'west': return [1, 0]
  }
}

function getWallAoRotation(side: WallSide): Vec3 {
  switch (side) {
    case 'north': return [0, 0, 0]
    case 'south': return [0, Math.PI, 0]
    case 'east': return [0, -Math.PI / 2, 0]
    case 'west': return [0, Math.PI / 2, 0]
  }
}

// wallPartPosition() の along 増加方向と、AO plane の local X 方向の対応を返す。
function isWallPlaneLocalXAlignedWithWallAlong(side: WallSide) {
  return side === 'north' || side === 'west'
}

function getFloorAoRotation(side: WallSide): Vec3 {
  switch (side) {
    // plane を -X 回転で水平化し、Z 回転だけで gradient の室内向きを変える。
    case 'north': return [-Math.PI / 2, 0, Math.PI]
    case 'south': return [-Math.PI / 2, 0, 0]
    case 'east': return [-Math.PI / 2, 0, Math.PI / 2]
    case 'west': return [-Math.PI / 2, 0, -Math.PI / 2]
  }
}

function getCeilingAoRotation(side: WallSide): Vec3 {
  switch (side) {
    case 'north': return [Math.PI / 2, 0, 0]
    case 'south': return [Math.PI / 2, 0, Math.PI]
    case 'east': return [Math.PI / 2, 0, Math.PI / 2]
    case 'west': return [Math.PI / 2, 0, -Math.PI / 2]
  }
}

// 他の部屋が所有する共有壁区間を、この部屋側の開口として返す。
