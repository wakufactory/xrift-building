export { Building } from './Building'
export type { BuildingProps } from './Building'

export { BuildingWorld } from './BuildingWorld'
export type { BuildingWorldProps } from './BuildingWorld'

export { BoxColliders, BuildingColliders } from './BuildingColliders'
export type { BoxCollidersProps, BuildingCollidersProps } from './BuildingColliders'

export { BoxBatchProvider, BoxLayer } from './InstancedBoxLayer'
export type {
  BoxBatchProviderProps,
  BoxLayerProps,
  InstancedBoxLayerProps,
} from './InstancedBoxLayer'

export {
  BuildingPlacementProvider,
  RoomObject,
  WallObject,
  useFloorPlacement,
  useWallPlacement,
} from './RoomObject'
export type {
  BuildingPlacementProviderProps,
  RoomObjectProps,
  UseFloorPlacementInput,
  UseWallPlacementInput,
  WallObjectProps,
} from './RoomObject'

export { compileBuildingPlan } from './compilePlan'

export {
  getFloorPlacement,
  getRoomFloorFrame,
  getRoomWallFrame,
  getWallPlacement,
} from './placement'
export type {
  FloorPlacementInput,
  PlacementTransform,
  RoomFloorFrame,
  RoomWallFrame,
  WallPlacementInput,
} from './placement'

export { missingBoxMaterial, missingBuildingMaterial } from './materials'
export type {
  BoxMaterialCatalog,
  BoxMaterialParameters,
  BoxTextureSpec,
  BoxTextureWrap,
  BuildingMaterialCatalog,
  BuildingMaterialParameters,
  BuildingTextureSpec,
  BuildingTextureWrap,
} from './materials'

export type {
  BoxInstance,
  BoxInstanceSource,
  BoxInstanceSourceKind,
  BoxPart,
  BoxPartColor,
  BoxPartKind,
  BuildingMaterialKeys,
  BuildingPlan,
  ExteriorGroundSpec,
  OpeningSpec,
  PillarSpec,
  RoofSpec,
  RoomMaterials,
  RoomSpec,
  RoomSurfaces,
  SlabOpeningSpec,
  SurfaceFlags,
  SurfaceSpec,
  Vec2,
  Vec3,
  WallSide,
  WallSurfaceMap,
} from './types'
