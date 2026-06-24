import type { BoxPart, SurfaceSpec } from '../types'

// SurfaceSpec の hidden / noCollider を BoxPart に反映する。
export function applySurfaceSpec(part: BoxPart, surface: SurfaceSpec | undefined): BoxPart {
  if (!surface) return part

  return {
    ...part,
    visible: surface.hidden ? false : part.visible,
    collider: surface.noCollider ? false : part.collider,
  }
}
