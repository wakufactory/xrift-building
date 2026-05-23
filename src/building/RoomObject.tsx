import { useMemo, type ReactNode } from 'react'
import { getFloorPlacement, getWallPlacement } from './placement'
import type { BuildingPlan, Vec2, WallSide } from './types'

export type RoomObjectProps = {
  plan: BuildingPlan
  roomId: string
  position?: Vec2
  height?: number
  rotationY?: number
  children?: ReactNode
}

export function RoomObject({
  plan,
  roomId,
  position,
  height,
  rotationY,
  children,
}: RoomObjectProps) {
  const transform = useMemo(
    () => getFloorPlacement(plan, {
      roomId,
      offset: position,
      height,
      rotationY,
    }),
    [height, plan, position, roomId, rotationY],
  )

  return (
    <group position={transform.position} rotation={transform.rotation}>
      {children}
    </group>
  )
}

export type WallObjectProps = {
  plan: BuildingPlan
  roomId: string
  side: WallSide
  position?: number
  height?: number
  inset?: number
  children?: ReactNode
}

export function WallObject({
  plan,
  roomId,
  side,
  position,
  height,
  inset,
  children,
}: WallObjectProps) {
  const transform = useMemo(
    () => getWallPlacement(plan, {
      roomId,
      side,
      offset: position,
      height,
      inset,
    }),
    [height, inset, plan, position, roomId, side],
  )

  return (
    <group position={transform.position} rotation={transform.rotation}>
      {children}
    </group>
  )
}
