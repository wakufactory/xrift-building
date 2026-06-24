import type { AmbientOcclusionSpec, BuildingPlan, OpeningSpec, SlabOpeningSpec } from '../types'

// ドア・窓の省略値。unit 指定時も world units に正規化する。
const OPENING_DEFAULTS = {
  doorBottom: 0,
  doorHeight: 2.15,
  windowBottom: 1.05,
  windowHeight: 1.05,
}

// plan.unit を考慮して plan 全体を world units に正規化する。
export function scalePlanToWorldUnits(plan: BuildingPlan): BuildingPlan {
  const unit = plan.unit ?? 1

  if (unit === 1) return plan

  return {
    ...plan,
    unit: 1,
    floorHeight: plan.floorHeight * unit,
    wallThickness: plan.wallThickness * unit,
    slabThickness: plan.slabThickness * unit,
    ambientOcclusion: scaleAmbientOcclusion(plan.ambientOcclusion, unit),
    pillar: plan.pillar ? { ...plan.pillar, thickness: scaleOptional(plan.pillar.thickness, unit) } : undefined,
    roof: plan.roof === false ? false : plan.roof ? {
      ...plan.roof,
      overhang: scaleOptional(plan.roof.overhang, unit),
      thickness: scaleOptional(plan.roof.thickness, unit),
      heightOffset: scaleOptional(plan.roof.heightOffset, unit),
    } : undefined,
    exteriorGround: plan.exteriorGround === false ? false : plan.exteriorGround ? {
      ...plan.exteriorGround,
      margin: scaleOptional(plan.exteriorGround.margin, unit),
      thickness: scaleOptional(plan.exteriorGround.thickness, unit),
    } : undefined,
    rooms: plan.rooms.map((room) => ({
      ...room,
      position: scaleVec2(room.position, unit),
      size: scaleVec2(room.size, unit),
      wallThickness: scaleOptional(room.wallThickness, unit),
      ambientOcclusion: scaleAmbientOcclusion(room.ambientOcclusion, unit),
      doors: room.doors?.map((opening) => scaleOpening(opening, unit, true)),
      windows: room.windows?.map((opening) => scaleOpening(opening, unit, false)),
      floorOpenings: room.floorOpenings?.map((opening) => scaleSlabOpening(opening, unit)),
      ceilingOpenings: room.ceilingOpenings?.map((opening) => scaleSlabOpening(opening, unit)),
      roofOpenings: room.roofOpenings?.map((opening) => scaleSlabOpening(opening, unit)),
    })),
  }
}

function scaleAmbientOcclusion(value: AmbientOcclusionSpec | false | undefined, unit: number): AmbientOcclusionSpec | false | undefined {
  if (!value || unit === 1) return value
  return { ...value, width: scaleOptional(value.width, unit) }
}

function scaleOptional(value: number | undefined, unit: number): number | undefined {
  return value === undefined ? undefined : value * unit
}

function scaleVec2(value: [number, number], unit: number): [number, number] {
  return [value[0] * unit, value[1] * unit]
}

function scaleOpening(opening: OpeningSpec, unit: number, isDoor: boolean): OpeningSpec {
  const defaultBottom = isDoor ? OPENING_DEFAULTS.doorBottom : OPENING_DEFAULTS.windowBottom
  const defaultHeight = isDoor ? OPENING_DEFAULTS.doorHeight : OPENING_DEFAULTS.windowHeight

  return {
    ...opening,
    offset: opening.offset * unit,
    width: opening.width * unit,
    bottom: (opening.bottom ?? defaultBottom) * unit,
    height: (opening.height ?? defaultHeight) * unit,
  }
}

function scaleSlabOpening(opening: SlabOpeningSpec, unit: number): SlabOpeningSpec {
  return { ...opening, position: scaleVec2(opening.position, unit), size: scaleVec2(opening.size, unit) }
}
