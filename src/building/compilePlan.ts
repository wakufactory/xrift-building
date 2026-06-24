import type { BoxPart, BoxPartColor, BuildingPlan, CompiledBuildingPlan, RoomSpec, SlabOpeningSpec, SurfaceSpec, WallSide } from './types'
import { scalePlanToWorldUnits } from './compiler/planScale'
import { applySurfaceSpec } from './compiler/surface'
import { compileWall, EPSILON, normalizeOpenings } from './compiler/walls'
import { compileRoomAmbientOcclusion } from './compiler/ambientOcclusion'
import { getSharedWallOpeningsOwnedByAnotherRoom, nearlyEqual } from './compiler/roomTopology'

// 壁ローカル座標上の矩形セグメントを表す。
type Rect2D = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

// BuildingPlan を描画・物理用の BoxPart 配列へ変換する。
export function compileBuildingPlan(plan: BuildingPlan): BoxPart[] {
  return compileBuildingRenderPlan(plan).boxes
}

// BuildingPlan を構造 box と視覚 effect plane にコンパイルする。
export function compileBuildingRenderPlan(plan: BuildingPlan): CompiledBuildingPlan {
  const worldPlan = scalePlanToWorldUnits(plan)

  // 建物コンパイルの出力は、単一のフラットな BoxPart 配列に統一する。
  // 描画と物理の両方がこの中間表現を使うため、生成される建築要素は
  // すべて軸に沿った box として表現できる必要がある。
  return {
    boxes: dedupeExactBoxParts([
      ...compileExteriorGround(worldPlan),
      ...worldPlan.rooms.flatMap((room) => compileRoom(worldPlan, room)),
      ...compileRoof(worldPlan),
    ]),
    planes: worldPlan.rooms.flatMap((room) => compileRoomAmbientOcclusion(worldPlan, room)),
  }
}

// 部屋群の外接矩形から外部地面の BoxPart を生成する。
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
      position: [centerX, plan.slabThickness - thickness / 2 - 0.002, centerZ],
      size: [width, thickness, depth],
      materialKey: ground.materialKey ?? plan.materialKeys.exteriorGround,
      collider: true,
    },
  ]
}

// 部屋群全体の XZ 境界を計算する。
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

// 部屋群の平面形状に沿って、非重複の平面屋根 BoxPart を生成する。
function compileRoof(plan: BuildingPlan): BoxPart[] {
  if (plan.roof === false || !plan.roof || plan.rooms.length === 0) {
    return []
  }

  const roof = plan.roof
  const overhang = roof.overhang ?? 0
  const thickness = roof.thickness ?? plan.slabThickness
  const heightOffset = roof.heightOffset ?? 0
  const y = plan.floorHeight + heightOffset
  const roofRects = plan.rooms.map((room) => {
    const [x, z] = room.position
    const [width, depth] = room.size
    return {
      minX: x - width / 2 - overhang,
      maxX: x + width / 2 + overhang,
      minZ: z - depth / 2 - overhang,
      maxZ: z + depth / 2 + overhang,
    }
  })
  const openingRects = plan.rooms.flatMap((room) => (
    room.roofOpenings?.map((opening) => slabOpeningToWorldRect(room, opening)) ?? []
  ))
  const rects = splitCoveredRects(roofRects, openingRects)

  return rects.map((rect, index) => (
    applySurfaceSpec({
      id: `roof:flat:${index}`,
      kind: 'roof',
      // 同じ高さで重なる roof box を作らないため、room 矩形の union を
      // 小さな非重複矩形に分けてから box 化する。
      position: [(rect.minX + rect.maxX) / 2, y, (rect.minZ + rect.maxZ) / 2],
      size: [rect.maxX - rect.minX, thickness, rect.maxZ - rect.minZ],
      materialKey: roof.materialKey ?? plan.materialKeys.roof ?? plan.materialKeys.room.ceiling,
      color: roof.color,
      collider: true,
    }, roof)
  ))
}

// 入力矩形群の union から hole 矩形を引き、重ならない矩形群へ分割する。
function splitCoveredRects(rects: Rect2D[], holes: Rect2D[] = []): Rect2D[] {
  const clippedHoles = holes
    .flatMap((hole) => rects.map((rect) => intersectRects(rect, hole)))
    .filter((rect): rect is Rect2D => rect !== undefined)
  const xEdges = sortedUnique([
    ...rects.flatMap((rect) => [rect.minX, rect.maxX]),
    ...clippedHoles.flatMap((rect) => [rect.minX, rect.maxX]),
  ])
  const zEdges = sortedUnique([
    ...rects.flatMap((rect) => [rect.minZ, rect.maxZ]),
    ...clippedHoles.flatMap((rect) => [rect.minZ, rect.maxZ]),
  ])
  const coveredRows: Rect2D[] = []

  for (let zIndex = 0; zIndex < zEdges.length - 1; zIndex += 1) {
    const minZ = zEdges[zIndex]
    const maxZ = zEdges[zIndex + 1]
    let currentStartX: number | undefined

    for (let xIndex = 0; xIndex < xEdges.length - 1; xIndex += 1) {
      const minX = xEdges[xIndex]
      const maxX = xEdges[xIndex + 1]
      const covered = rects.some((rect) => rectCoversCell(rect, minX, maxX, minZ, maxZ))
      const removedByHole = clippedHoles.some((rect) => rectCoversCell(rect, minX, maxX, minZ, maxZ))
      const keep = covered && !removedByHole

      if (keep && currentStartX === undefined) {
        currentStartX = minX
      }

      if ((!keep || xIndex === xEdges.length - 2) && currentStartX !== undefined) {
        coveredRows.push({
          minX: currentStartX,
          maxX: keep ? maxX : minX,
          minZ,
          maxZ,
        })
        currentStartX = undefined
      }
    }
  }

  return mergeVerticalRects(coveredRows)
}

function rectCoversCell(rect: Rect2D, minX: number, maxX: number, minZ: number, maxZ: number): boolean {
  return rect.minX <= minX + EPSILON
    && rect.maxX >= maxX - EPSILON
    && rect.minZ <= minZ + EPSILON
    && rect.maxZ >= maxZ - EPSILON
}

function sortedUnique(values: number[]): number[] {
  return [...new Set(values.map((value) => Number(value.toFixed(4))))].sort((a, b) => a - b)
}

function mergeVerticalRects(rects: Rect2D[]): Rect2D[] {
  const merged: Rect2D[] = []

  for (const rect of rects) {
    const last = merged[merged.length - 1]
    if (
      last
      && nearlyEqual(last.minX, rect.minX)
      && nearlyEqual(last.maxX, rect.maxX)
      && nearlyEqual(last.maxZ, rect.minZ)
    ) {
      last.maxZ = rect.maxZ
    } else {
      merged.push({ ...rect })
    }
  }

  return merged
}

// 床・天井 slab を、開口を除いた非重複矩形 box 群として生成する。
function compileSlab(input: {
  room: RoomSpec
  kind: 'floor' | 'ceiling'
  y: number
  thickness: number
  materialKey: string
  color?: BoxPartColor
  surface?: SurfaceSpec
  openings: SlabOpeningSpec[]
}): BoxPart[] {
  const { room, kind, y, thickness, materialKey, color, surface, openings } = input
  const rects = splitRoomRectBySlabOpenings(room, openings)

  return rects.map((rect, index) => applySurfaceSpec({
    id: rects.length === 1 ? `${room.id}:${kind}` : `${room.id}:${kind}:${index}`,
    kind,
    position: [(rect.minX + rect.maxX) / 2, y, (rect.minZ + rect.maxZ) / 2],
    size: [rect.maxX - rect.minX, thickness, rect.maxZ - rect.minZ],
    materialKey,
    color,
    collider: true,
  }, surface))
}

// 部屋矩形から床・天井開口を引き、残った slab 領域を非重複矩形に分割する。
function splitRoomRectBySlabOpenings(room: RoomSpec, openings: SlabOpeningSpec[]): Rect2D[] {
  const [roomX, roomZ] = room.position
  const [width, depth] = room.size
  const roomRect: Rect2D = {
    minX: roomX - width / 2,
    maxX: roomX + width / 2,
    minZ: roomZ - depth / 2,
    maxZ: roomZ + depth / 2,
  }
  const openingRects = openings
    .map((opening) => slabOpeningToWorldRect(room, opening))
    .map((rect) => intersectRects(roomRect, rect))
    .filter((rect): rect is Rect2D => rect !== undefined)

  if (openingRects.length === 0) {
    return [roomRect]
  }

  const xEdges = sortedUnique([
    roomRect.minX,
    roomRect.maxX,
    ...openingRects.flatMap((rect) => [rect.minX, rect.maxX]),
  ])
  const zEdges = sortedUnique([
    roomRect.minZ,
    roomRect.maxZ,
    ...openingRects.flatMap((rect) => [rect.minZ, rect.maxZ]),
  ])
  const rows: Rect2D[] = []

  for (let zIndex = 0; zIndex < zEdges.length - 1; zIndex += 1) {
    const minZ = zEdges[zIndex]
    const maxZ = zEdges[zIndex + 1]
    let currentStartX: number | undefined

    for (let xIndex = 0; xIndex < xEdges.length - 1; xIndex += 1) {
      const minX = xEdges[xIndex]
      const maxX = xEdges[xIndex + 1]
      const insideRoom = rectCoversCell(roomRect, minX, maxX, minZ, maxZ)
      const coveredByOpening = openingRects.some((rect) => rectCoversCell(rect, minX, maxX, minZ, maxZ))
      const keep = insideRoom && !coveredByOpening

      if (keep && currentStartX === undefined) {
        currentStartX = minX
      }

      if ((!keep || xIndex === xEdges.length - 2) && currentStartX !== undefined) {
        rows.push({
          minX: currentStartX,
          maxX: keep ? maxX : minX,
          minZ,
          maxZ,
        })
        currentStartX = undefined
      }
    }
  }

  return mergeVerticalRects(rows)
}

// 部屋中心基準の床・天井開口を world-space XZ 矩形へ変換する。
function slabOpeningToWorldRect(room: RoomSpec, opening: SlabOpeningSpec): Rect2D {
  const [roomX, roomZ] = room.position
  const [offsetX, offsetZ] = opening.position
  const [width, depth] = opening.size
  const centerX = roomX + offsetX
  const centerZ = roomZ + offsetZ

  return {
    minX: centerX - width / 2,
    maxX: centerX + width / 2,
    minZ: centerZ - depth / 2,
    maxZ: centerZ + depth / 2,
  }
}

// 2 つの XZ 矩形の交差を返す。
function intersectRects(a: Rect2D, b: Rect2D): Rect2D | undefined {
  const minX = Math.max(a.minX, b.minX)
  const maxX = Math.min(a.maxX, b.maxX)
  const minZ = Math.max(a.minZ, b.minZ)
  const maxZ = Math.min(a.maxZ, b.maxZ)

  if (maxX - minX <= EPSILON || maxZ - minZ <= EPSILON) {
    return undefined
  }

  return { minX, maxX, minZ, maxZ }
}

// 1 部屋から床、天井、壁、柱の BoxPart を生成する。
function compileRoom(plan: BuildingPlan, room: RoomSpec): BoxPart[] {
  const [x, z] = room.position
  const [width, depth] = room.size
  const wallThickness = room.wallThickness ?? plan.wallThickness
  const floorY = plan.slabThickness / 2
  const ceilingY = plan.floorHeight - plan.slabThickness / 2 - 0.001
  const floorSurface = room.surfaces?.floor
  const ceilingSurface = room.surfaces?.ceiling

  const parts: BoxPart[] = [
    ...compileSlab({
      room,
      kind: 'floor',
      y: floorY,
      thickness: plan.slabThickness,
      materialKey: floorSurface?.materialKey ?? plan.materialKeys.room.floor,
      color: floorSurface?.color,
      surface: floorSurface,
      openings: room.floorOpenings ?? [],
    }),
    ...compileSlab({
      room,
      kind: 'ceiling',
      y: ceilingY,
      thickness: plan.slabThickness,
      materialKey: ceilingSurface?.materialKey ?? plan.materialKeys.room.ceiling,
      color: ceilingSurface?.color,
      surface: ceilingSurface,
      openings: room.ceilingOpenings ?? [],
    }),
  ]

  for (const side of ['north', 'south', 'east', 'west'] as WallSide[]) {
    // ドアと窓は、壁ローカル座標上の矩形開口として扱う。壁生成では
    // まず一枚の壁からそれらの開口を引き、残った矩形を独立した
    // box セグメントとして出力する。
    const wallOpenings = [
      ...getSharedWallOpeningsOwnedByAnotherRoom(plan.rooms, room, side, plan.floorHeight),
      ...normalizeOpenings(room.doors ?? [], side, true),
      ...normalizeOpenings(room.windows ?? [], side, false),
    ]
    const wallSurface = {
      ...room.surfaces?.wall,
      ...room.surfaces?.walls?.[side],
    }

    parts.push(
      ...compileWall({
        roomId: room.id,
        side,
        roomCenter: [x, z],
        roomSize: [width, depth],
        wallThickness,
        bottomY: 0,
        height: plan.floorHeight,
        materialKey: wallSurface.materialKey ?? plan.materialKeys.room.wall,
        color: wallSurface.color,
        surface: wallSurface,
        openings: wallOpenings,
      }),
    )
  }

  parts.push(...compileRoomTrim(plan, room))
  return parts
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
      part.color === undefined ? '' : colorToDedupeKey(part.color),
      part.visible === false ? 'hidden' : 'visible',
      part.collider === false ? 'noCollider' : 'collider',
      ...part.position.map(toDedupeKey),
      ...part.size.map(toDedupeKey),
      ...(part.rotation ?? [0, 0, 0]).map(toDedupeKey),
    ].join(':')

    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// 重複判定用に数値を固定桁の文字列へ変換する。
function toDedupeKey(value: number): string {
  return value.toFixed(4)
}

// 重複判定用に色指定を文字列へ変換する。
function colorToDedupeKey(color: BoxPartColor): string {
  if (Array.isArray(color)) {
    return color.map(toDedupeKey).join(',')
  }

  return String(color)
}

// 部屋の四隅に柱 BoxPart を生成する。
function compileRoomTrim(plan: BuildingPlan, room: RoomSpec): BoxPart[] {
  const [x, z] = room.position
  const [width, depth] = room.size
  const wallThickness = room.wallThickness ?? plan.wallThickness
  const pillarSize = plan.pillar?.thickness ?? wallThickness * 1.4
  const pillarHeight = plan.floorHeight + 0.001
  const pillarSurface = plan.pillar
  const y = pillarHeight / 2

  // 角柱は装飾であり、衝突境界を分かりやすくする役割も持つ。隣接部屋
  // から同じ角柱が生成された場合は、最後の dedupe で除去される。
  return [
    [-width / 2, -depth / 2],
    [width / 2, -depth / 2],
    [-width / 2, depth / 2],
    [width / 2, depth / 2],
  ].map(([dx, dz], index) => applySurfaceSpec({
    id: `${room.id}:pillar:${index}`,
    kind: 'pillar',
    position: [x + dx, y, z + dz],
    size: [pillarSize, pillarHeight, pillarSize],
    materialKey: pillarSurface?.materialKey ?? plan.materialKeys.pillar,
    color: pillarSurface?.color,
    collider: true,
  }, pillarSurface))
}
