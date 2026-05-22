import type { BoxPart, BuildingPlan, OpeningSpec, RoomMaterials, RoomSpec, Vec3, WallSide } from './types'

type WallSegment = {
  start: number
  end: number
  bottom: number
  top: number
}

const OPENING_DEFAULTS = {
  doorBottom: 0,
  doorHeight: 2.15,
  windowBottom: 1.05,
  windowHeight: 1.05,
}

const EPSILON = 0.001

export function compileBuildingPlan(plan: BuildingPlan): BoxPart[] {
  // 建物コンパイルの出力は、単一のフラットな BoxPart 配列に統一する。
  // 描画と物理の両方がこの中間表現を使うため、生成される建築要素は
  // すべて軸に沿った box として表現できる必要がある。
  return dedupeExactBoxParts([
    ...compileExteriorGround(plan),
    ...plan.rooms.flatMap((room) => compileRoom(plan, room)),
  ])
}

function compileExteriorGround(plan: BuildingPlan): BoxPart[] {
  if (plan.exteriorGround === false || plan.rooms.length === 0) {
    return []
  }

  const ground = plan.exteriorGround ?? {}
  const margin = ground.margin ?? 14
  const thickness = ground.thickness ?? plan.slabThickness
  const bounds = getRoomBounds(plan.rooms)
  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerZ = (bounds.minZ + bounds.maxZ) / 2
  const width = bounds.maxX - bounds.minX + margin * 2
  const depth = bounds.maxZ - bounds.minZ + margin * 2

  return [
    {
      id: 'exterior:ground',
      kind: 'exteriorGround',
      // 室内床と同じ高さに見せつつ、室内床と重なる部分で z-fighting
      // しないように、外部地面だけごくわずかに下げている。
      position: [centerX, -thickness / 2 - 0.002, centerZ],
      size: [width, thickness, depth],
      materialKey: ground.materialKey ?? plan.materialKeys.exteriorGround,
      collider: true,
    },
  ]
}

function getRoomBounds(rooms: RoomSpec[]) {
  return rooms.reduce(
    (bounds, room) => {
      const [x, z] = room.position
      const [width, depth] = room.size
      return {
        minX: Math.min(bounds.minX, x - width / 2),
        maxX: Math.max(bounds.maxX, x + width / 2),
        minZ: Math.min(bounds.minZ, z - depth / 2),
        maxZ: Math.max(bounds.maxZ, z + depth / 2),
      }
    },
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minZ: Number.POSITIVE_INFINITY,
      maxZ: Number.NEGATIVE_INFINITY,
    },
  )
}

function compileRoom(plan: BuildingPlan, room: RoomSpec): BoxPart[] {
  const materials: RoomMaterials = {
    ...plan.materialKeys.room,
    ...room.material,
  }
  const [x, z] = room.position
  const [width, depth] = room.size
  const floorY = -plan.slabThickness / 2
  const ceilingY = plan.floorHeight + plan.slabThickness / 2

  const parts: BoxPart[] = [
    {
      id: `${room.id}:floor`,
      kind: 'floor',
      position: [x, floorY, z],
      size: [width, plan.slabThickness, depth],
      materialKey: materials.floor,
      collider: true,
    },
    {
      id: `${room.id}:ceiling`,
      kind: 'ceiling',
      position: [x, ceilingY, z],
      size: [width, plan.slabThickness, depth],
      materialKey: materials.ceiling,
      collider: false,
    },
  ]

  for (const side of ['north', 'south', 'east', 'west'] as WallSide[]) {
    // 隣接する部屋は同じ境界面を共有することがある。同じ面に mesh と
    // collider が二重生成されないよう、辞書順で先の部屋だけが共有壁を
    // 所有して生成する。
    if (isSharedWallOwnedByAnotherRoom(plan.rooms, room, side)) {
      continue
    }

    // ドアと窓は、壁ローカル座標上の矩形開口として扱う。壁生成では
    // まず一枚の壁からそれらの開口を引き、残った矩形を独立した
    // box セグメントとして出力する。
    const wallOpenings = [
      ...normalizeOpenings(room.doors ?? [], side, true),
      ...normalizeOpenings(room.windows ?? [], side, false),
    ]

    parts.push(
      ...compileWall({
        roomId: room.id,
        side,
        roomCenter: [x, z],
        roomSize: [width, depth],
        wallThickness: plan.wallThickness,
        floorHeight: plan.floorHeight,
        materialKey: materials.wall,
        openings: wallOpenings,
      }),
    )
  }

  parts.push(...compileRoomTrim(plan, room))
  return parts
}

function isSharedWallOwnedByAnotherRoom(rooms: RoomSpec[], room: RoomSpec, side: WallSide): boolean {
  // 共有壁とみなす条件は、境界線が接していて、かつ壁方向に範囲が
  // 重なっていること。単に同じ向きの平行壁は別物として残す。
  return rooms.some((other) => {
    if (other.id === room.id) return false
    if (!areOppositeWallsTouching(room, side, other)) return false

    return other.id < room.id
  })
}

function areOppositeWallsTouching(room: RoomSpec, side: WallSide, other: RoomSpec): boolean {
  const roomBounds = getRoomBoundary(room)
  const otherBounds = getRoomBoundary(other)

  switch (side) {
    case 'north':
      return (
        nearlyEqual(roomBounds.maxZ, otherBounds.minZ) &&
        rangesOverlap(roomBounds.minX, roomBounds.maxX, otherBounds.minX, otherBounds.maxX)
      )
    case 'south':
      return (
        nearlyEqual(roomBounds.minZ, otherBounds.maxZ) &&
        rangesOverlap(roomBounds.minX, roomBounds.maxX, otherBounds.minX, otherBounds.maxX)
      )
    case 'east':
      return (
        nearlyEqual(roomBounds.maxX, otherBounds.minX) &&
        rangesOverlap(roomBounds.minZ, roomBounds.maxZ, otherBounds.minZ, otherBounds.maxZ)
      )
    case 'west':
      return (
        nearlyEqual(roomBounds.minX, otherBounds.maxX) &&
        rangesOverlap(roomBounds.minZ, roomBounds.maxZ, otherBounds.minZ, otherBounds.maxZ)
      )
  }
}

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

function rangesOverlap(aMin: number, aMax: number, bMin: number, bMax: number): boolean {
  return Math.max(aMin, bMin) < Math.min(aMax, bMax) - EPSILON
}

function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON
}

function dedupeExactBoxParts(parts: BoxPart[]): BoxPart[] {
  const seen = new Set<string>()

  return parts.filter((part) => {
    // これは幾何的なマージではない。隣接部屋から生成された角柱など、
    // 完全一致する box だけを消し、接しているだけ・一部重なるだけの
    // 建築要素はそのまま残す。
    const key = [
      part.kind,
      part.materialKey,
      ...part.position.map(toDedupeKey),
      ...part.size.map(toDedupeKey),
      ...(part.rotation ?? [0, 0, 0]).map(toDedupeKey),
    ].join(':')

    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function toDedupeKey(value: number): string {
  return value.toFixed(4)
}

function normalizeOpenings(openings: OpeningSpec[], side: WallSide, isDoor: boolean): OpeningSpec[] {
  return openings
    .filter((opening) => opening.side === side)
    .map((opening) => ({
      ...opening,
      bottom: opening.bottom ?? (isDoor ? OPENING_DEFAULTS.doorBottom : OPENING_DEFAULTS.windowBottom),
      height: opening.height ?? (isDoor ? OPENING_DEFAULTS.doorHeight : OPENING_DEFAULTS.windowHeight),
    }))
}

function compileWall(input: {
  roomId: string
  side: WallSide
  roomCenter: [number, number]
  roomSize: [number, number]
  wallThickness: number
  floorHeight: number
  materialKey: string
  openings: OpeningSpec[]
}): BoxPart[] {
  const { roomId, side, roomCenter, roomSize, wallThickness, floorHeight, materialKey, openings } = input
  const [roomX, roomZ] = roomCenter
  const [width, depth] = roomSize
  const wallLength = side === 'north' || side === 'south' ? width : depth
  const segments = splitWallSegments(wallLength, floorHeight, openings)

  // 壁の分割は、まず壁ローカルの 2D 空間で解く。開口を引き終わって
  // から world-space の position と box size に戻すことで、分割処理を
  // 壁の向きから独立させている。
  return segments.map((segment, index) => {
    const centerAlongWall = (segment.start + segment.end) / 2
    const segmentLength = segment.end - segment.start
    const centerY = (segment.bottom + segment.top) / 2
    const segmentHeight = segment.top - segment.bottom

    return {
      id: `${roomId}:wall:${side}:${index}`,
      kind: 'wall',
      position: wallPartPosition(side, roomX, roomZ, width, depth, centerAlongWall, centerY),
      size: wallPartSize(side, segmentLength, segmentHeight, wallThickness),
      materialKey,
      collider: true,
    }
  })
}

function splitWallSegments(wallLength: number, floorHeight: number, openings: OpeningSpec[]): WallSegment[] {
  // 最初は壁全面を表す 1 枚の矩形から始める。各開口は現在のセグメント
  // 集合から矩形の穴をくり抜き、残った矩形が box instance になる。
  let segments: WallSegment[] = [
    {
      start: -wallLength / 2,
      end: wallLength / 2,
      bottom: 0,
      top: floorHeight,
    },
  ]

  for (const opening of openings) {
    const openingStart = opening.offset - opening.width / 2
    const openingEnd = opening.offset + opening.width / 2
    const openingBottom = opening.bottom ?? 0
    const openingTop = openingBottom + (opening.height ?? OPENING_DEFAULTS.doorHeight)

    segments = segments.flatMap((segment) => subtractOpening(segment, {
      start: openingStart,
      end: openingEnd,
      bottom: openingBottom,
      top: openingTop,
    }))
  }

  return segments.filter((segment) => segment.end - segment.start > EPSILON && segment.top - segment.bottom > EPSILON)
}

function subtractOpening(segment: WallSegment, opening: WallSegment): WallSegment[] {
  const overlapStart = Math.max(segment.start, opening.start)
  const overlapEnd = Math.min(segment.end, opening.end)
  const overlapBottom = Math.max(segment.bottom, opening.bottom)
  const overlapTop = Math.min(segment.top, opening.top)

  if (overlapStart >= overlapEnd || overlapBottom >= overlapTop) {
    return [segment]
  }

  const pieces: WallSegment[] = []

  // 1 つの矩形開口を引くと、最大で 4 つの独立した壁矩形が残る。
  // 開口の左、右、下、上の各部分。
  if (segment.start < overlapStart) {
    pieces.push({ ...segment, end: overlapStart })
  }
  if (overlapEnd < segment.end) {
    pieces.push({ ...segment, start: overlapEnd })
  }
  if (segment.bottom < overlapBottom) {
    pieces.push({
      start: overlapStart,
      end: overlapEnd,
      bottom: segment.bottom,
      top: overlapBottom,
    })
  }
  if (overlapTop < segment.top) {
    pieces.push({
      start: overlapStart,
      end: overlapEnd,
      bottom: overlapTop,
      top: segment.top,
    })
  }

  return pieces
}

function wallPartPosition(
  side: WallSide,
  roomX: number,
  roomZ: number,
  width: number,
  depth: number,
  centerAlongWall: number,
  centerY: number,
): Vec3 {
  // segment の中心位置は壁の長手方向に沿った座標で表す。north/south の
  // 壁ではその座標を X に、east/west の壁では Z に割り当てる。
  switch (side) {
    case 'north':
      return [roomX + centerAlongWall, centerY, roomZ + depth / 2]
    case 'south':
      return [roomX + centerAlongWall, centerY, roomZ - depth / 2]
    case 'east':
      return [roomX + width / 2, centerY, roomZ + centerAlongWall]
    case 'west':
      return [roomX - width / 2, centerY, roomZ + centerAlongWall]
  }
}

function wallPartSize(side: WallSide, length: number, height: number, wallThickness: number): Vec3 {
  // 壁はすべて回転なしの box として生成する。向きは、長辺を X に置くか
  // Z に置くかで表現する。
  if (side === 'north' || side === 'south') {
    return [length, height, wallThickness]
  }

  return [wallThickness, height, length]
}

function compileRoomTrim(plan: BuildingPlan, room: RoomSpec): BoxPart[] {
  const [x, z] = room.position
  const [width, depth] = room.size
  const pillarSize = plan.wallThickness * 1.4
  const pillarHeight = plan.floorHeight
  const y = pillarHeight / 2

  // 角柱は装飾であり、衝突境界を分かりやすくする役割も持つ。隣接部屋
  // から同じ角柱が生成された場合は、最後の dedupe で除去される。
  return [
    [-width / 2, -depth / 2],
    [width / 2, -depth / 2],
    [-width / 2, depth / 2],
    [width / 2, depth / 2],
  ].map(([dx, dz], index) => ({
    id: `${room.id}:pillar:${index}`,
    kind: 'pillar',
    position: [x + dx, y, z + dz],
    size: [pillarSize, pillarHeight, pillarSize],
    materialKey: plan.materialKeys.pillar,
    collider: true,
  }))
}
