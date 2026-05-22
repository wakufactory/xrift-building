import { useEffect, useMemo } from 'react'
import { compileBuildingPlan } from './compilePlan'
import { BuildingColliders } from './BuildingColliders'
import { InstancedBoxLayer } from './InstancedBoxLayer'
import type { BuildingMaterialCatalog } from './materials'
import type { BoxPart, BuildingPlan } from './types'

export type BuildingProps = {
  plan: BuildingPlan
  materials: BuildingMaterialCatalog
  enableProfileLog?: boolean
}

export function Building({ plan, materials, enableProfileLog = true }: BuildingProps) {
  const parts = useMemo(() => compileBuildingPlan(plan), [plan])

  useEffect(() => {
    if (!enableProfileLog) return
    console.log('[building profile]', createBuildingProfile(parts))
  }, [enableProfileLog, parts])

  return (
    <>
      <InstancedBoxLayer parts={parts} materials={materials} />
      <BuildingColliders parts={parts} />
    </>
  )
}

function createBuildingProfile(parts: BoxPart[]) {
  const byMaterial = countBy(parts, (part) => part.materialKey)
  const byKind = countBy(parts, (part) => part.kind)
  const renderInstances = parts.length
  const colliderInstances = parts.filter((part) => part.collider !== false).length

  return {
    renderInstances,
    colliderInstances,
    materialCount: byMaterial.size,
    kindCount: byKind.size,
    byMaterial: Object.fromEntries(byMaterial),
    byKind: Object.fromEntries(byKind),
  }
}

function countBy(parts: BoxPart[], getKey: (part: BoxPart) => string) {
  const counts = new Map<string, number>()

  for (const part of parts) {
    const key = getKey(part)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return counts
}
