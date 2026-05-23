import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { getFloorPlacement, getWallPlacement } from './placement'
import type { BuildingPlan, Vec2, WallSide } from './types'

type BuildingPlacementContextValue = {
  plan: BuildingPlan
}

const BuildingPlacementContext = createContext<BuildingPlacementContextValue | null>(null)

export type BuildingPlacementProviderProps = {
  plan: BuildingPlan
  children?: ReactNode
}

export function BuildingPlacementProvider({ plan, children }: BuildingPlacementProviderProps) {
  const value = useMemo(() => ({ plan }), [plan])

  return (
    <BuildingPlacementContext.Provider value={value}>
      {children}
    </BuildingPlacementContext.Provider>
  )
}

export type RoomObjectProps = {
  roomId: string
  position?: Vec2
  height?: number
  rotationY?: number
  children?: ReactNode
}

export function RoomObject({
  roomId,
  position,
  height,
  rotationY,
  children,
}: RoomObjectProps) {
  const transform = useFloorPlacement({
    roomId,
    position,
    height,
    rotationY,
  })

  return (
    <group position={transform.position} rotation={transform.rotation}>
      {children}
    </group>
  )
}

export type UseFloorPlacementInput = {
  roomId: string
  position?: Vec2
  height?: number
  rotationY?: number
}

export function useFloorPlacement({
  roomId,
  position,
  height,
  rotationY,
}: UseFloorPlacementInput) {
  const { plan } = useBuildingPlacement()

  return useMemo(
    () => getFloorPlacement(plan, {
      roomId,
      offset: position,
      height,
      rotationY,
    }),
    [height, plan, position, roomId, rotationY],
  )
}

export type WallObjectProps = {
  roomId: string
  side: WallSide
  offset?: number
  position?: number
  height?: number
  inset?: number
  children?: ReactNode
}

export function WallObject({
  roomId,
  side,
  offset,
  position,
  height,
  inset,
  children,
}: WallObjectProps) {
  const transform = useWallPlacement({
    roomId,
    side,
    offset: offset ?? position,
    height,
    inset,
  })

  return (
    <group position={transform.position} rotation={transform.rotation}>
      {children}
    </group>
  )
}

export type UseWallPlacementInput = {
  roomId: string
  side: WallSide
  offset?: number
  position?: number
  height?: number
  inset?: number
}

export function useWallPlacement({
  roomId,
  side,
  offset,
  position,
  height,
  inset,
}: UseWallPlacementInput) {
  const { plan } = useBuildingPlacement()

  return useMemo(
    () => getWallPlacement(plan, {
      roomId,
      side,
      offset: offset ?? position,
      height,
      inset,
    }),
    [height, inset, offset, plan, position, roomId, side],
  )
}

function useBuildingPlacement(): BuildingPlacementContextValue {
  const context = useContext(BuildingPlacementContext)

  if (!context) {
    throw new Error('RoomObject and WallObject must be rendered inside BuildingWorld.')
  }

  return context
}
