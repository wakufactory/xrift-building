import type { MeshStandardMaterialParameters } from 'three'

export type BuildingTextureWrap = 'repeat' | 'clamp' | 'mirror'

export type BuildingTextureSpec = {
  map: string
  repeat?: [number, number]
  offset?: [number, number]
  rotation?: number
  wrap?: BuildingTextureWrap
}

export type BuildingMaterialParameters = Omit<MeshStandardMaterialParameters, 'map'> & {
  texture?: BuildingTextureSpec
}

export type BuildingMaterialCatalog = Record<string, BuildingMaterialParameters>

export const missingBuildingMaterial: BuildingMaterialParameters = {
  color: '#ff4fb8',
  roughness: 0.8,
  metalness: 0,
}
