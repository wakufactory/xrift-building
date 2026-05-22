import type { MeshStandardMaterialParameters } from 'three'

export type BuildingMaterialCatalog = Record<string, MeshStandardMaterialParameters>

export const missingBuildingMaterial: MeshStandardMaterialParameters = {
  color: '#ff4fb8',
  roughness: 0.8,
  metalness: 0,
}
