import { useEffect, useMemo } from 'react'
import { compileBuildingRenderPlan } from './compilePlan'
import { BoxLayer } from './InstancedBoxLayer'
import { InstancedPlaneLayer } from './InstancedPlaneLayer'
import type { BuildingMaterialCatalog } from './materials'
import type { BoxInstanceSource, BoxPart, BuildingPlan, PlanePart } from './types'

// Fast Refresh 時にも compiler 変更後の box / plane を再生成する。
const BUILDING_COMPILE_VERSION = 6

// Building コンポーネントへ渡す plan、material、ログ設定を表す。
export type BuildingProps = {
  plan: BuildingPlan
  materials: BuildingMaterialCatalog
  source?: BoxInstanceSource
  enableProfileLog?: boolean
}

// BuildingPlan を BoxPart にコンパイルし、描画と collider に分配する。
export function Building({ plan, materials, source, enableProfileLog = false }: BuildingProps) {
  const compiled = useMemo(
    () => compileBuildingRenderPlan(plan),
    [plan, BUILDING_COMPILE_VERSION],
  )
  const parts = compiled.boxes
  const sourcedParts = useMemo(() => {
    if (!source) return parts
    return parts.map((part) => ({
      ...part,
      source: part.source ?? source,
    }))
  }, [parts, source])

  useEffect(() => {
    if (!enableProfileLog) return
    console.log('[building profile]', source, createBuildingProfile(parts, compiled.planes))
  }, [compiled.planes, enableProfileLog, parts, source])

  return (
    <>
      <BoxLayer parts={sourcedParts} materials={materials} collider />
      <InstancedPlaneLayer parts={compiled.planes} />
    </>
  )
}

// コンパイル済み box / plane 群の instance 数、collider 数、分類数を集計する。
function createBuildingProfile(parts: BoxPart[], planes: PlanePart[]) {
  const byMaterial = countBy(parts, (part) => part.materialKey)
  const byKind = countBy(parts, (part) => part.kind)
  const byPlaneKind = countBy(planes, (part) => part.kind)
  const renderInstances = parts.filter((part) => part.visible !== false).length
  const colliderInstances = parts.filter((part) => part.collider !== false).length

  return {
    renderInstances,
    planeInstances: planes.length,
    totalRenderInstances: renderInstances + planes.length,
    colliderInstances,
    materialCount: byMaterial.size,
    kindCount: byKind.size,
    planeKindCount: byPlaneKind.size,
    byMaterial: Object.fromEntries(byMaterial),
    byKind: Object.fromEntries(byKind),
    byPlaneKind: Object.fromEntries(byPlaneKind),
  }
}

// 指定した key で instance 配列を集計する。
function countBy<T>(parts: T[], getKey: (part: T) => string) {
  const counts = new Map<string, number>()

  for (const part of parts) {
    const key = getKey(part)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return counts
}
