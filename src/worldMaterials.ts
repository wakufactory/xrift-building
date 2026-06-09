import type { BoxMaterialCatalog } from './building'

export const worldBuildingMaterials = {
  'floor:warm-wood': {
    color: '#f4e5d8',
    roughness: 0.78,
    metalness: 0,
    texture: {
      map: 'textures/warm-wood.png',
      tileSize: [0.5, 0.5],
    },
  },
  'debug:measure-grid': {
    color: '#ffffff',
    roughness: 0.82,
    metalness: 0,
    texture: {
      map: 'textures/measure-grid.png',
      tileSize: [1, 1],
    },
  },
  'floor:gemin-wood': {
    color: '#9a9183',
    roughness: 0.8,
    metalness: 0,
    texture: {
      map: 'textures/gemin_tex1_wood.png',
      tileSize: [0.75, 0.75],
    },
  },
  'floor:gemin-concrete': {
    color: '#a8a8a1',
    roughness: 0.9,
    metalness: 0,
    texture: {
      map: 'textures/gemin_tex1_concrete.png',
      tileSize: [1, 1],
    },
  },
  'wall:gemin-wood': {
    color: '#e2b67a',
    roughness: 0.8,
    metalness: 0,
    texture: {
      map: 'textures/gemin_tex1_wood.png',
      tileSize: [0.75, 0.75],
    },
  },
  'wall:gemin-brick': {
    color: '#c5c4bb',
    roughness: 0.88,
    metalness: 0,
    texture: {
      map: 'textures/gemin_tex1_brick.png',
      tileSize: [1.5, 1.5],
    },
  },
  'wall:gemin-concrete': {
    color: '#a8a8a1',
    roughness: 0.9,
    metalness: 0,
    texture: {
      map: 'textures/gemin_tex1_concrete.png',
      tileSize: [1, 1],
    },
  },
  'trim:gemin-metal': {
    color: '#b7b9b6',
    roughness: 0.36,
    metalness: 0.65,
    texture: {
      map: 'textures/gemin_tex1_metal.png',
      tileSize: [1, 1],
    },
  },
  'floor:gemin-carpet': {
    color: '#8b8780',
    roughness: 0.96,
    metalness: 0,
    texture: {
      map: 'textures/gemini_tex2_carpet.png',
      tileSize: [0.75, 0.75],
    },
  },
  'wall:gemin-fabric': {
    color: '#e8e6df',
    roughness: 0.9,
    metalness: 0,
    texture: {
      map: 'textures/gemini_tex2_fabric.png',
      tileSize: [0.75, 0.75],
    },
  },
  'trim:gemin-brushed-metal': {
    color: '#c5c7c4',
    roughness: 0.32,
    metalness: 0.7,
    texture: {
      map: 'textures/gemini_tex2_brushed-metal.png',
      tileSize: [1, 1],
    },
  },
  'wall:gemin-tile': {
    color: '#a7a9a4',
    roughness: 0.72,
    metalness: 0,
    texture: {
      map: 'textures/gemini_tex2_tile.png',
      tileSize: [1.5, 1.5],
    },
  },
  'floor:stone': {
    color: '#747b7c',
    roughness: 0.9,
    metalness: 0,
  },
  'ground:outdoor': {
    color: '#7c8778',
    roughness: 0.92,
    metalness: 0,
  },
  'wall:plaster': {
    color: '#d7d0c2',
    roughness: 0.86,
    metalness: 0,
  },
  'wall:gallery-white': {
    color: '#ece8dd',
    roughness: 0.82,
    metalness: 0,
  },
  'wall:accent': {
    color: '#536b63',
    roughness: 0.75,
    metalness: 0,
  },
  'ceiling:soft-white': {
    color: '#f1eee6',
    roughness: 0.86,
    metalness: 0,
  },
  'roof:flat-concrete': {
    color: '#5f686c',
    roughness: 0.88,
    metalness: 0,
  },
  'trim:dark-metal': {
    color: '#2f3538',
    roughness: 0.45,
    metalness: 0.25,
  },
  'pillar:concrete': {
    color: '#9b9b91',
    roughness: 0.88,
    metalness: 0,
  },
  'furniture:neutral': {
    color: '#a8826f',
    roughness: 0.72,
    metalness: 0,
  },
} satisfies BoxMaterialCatalog
