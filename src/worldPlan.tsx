import type { BuildingPlan } from './building/types'
import { BuildingWorld } from './building/BuildingWorld'
import { worldBuildingMaterials } from './worldMaterials'

/// north -z east +x south +z west x

export const plan1: BuildingPlan = {
  unit: 1,
  floorHeight: 5.5,
  wallThickness: 0.22,
  slabThickness: 0.12,
  pillar: {
    thickness: 0.25,
  },
  materialKeys: {
    room: {
      floor: 'floor:warm-wood',
      wall: 'wall:plaster',
      ceiling: 'ceiling:soft-white',
    },
    exteriorGround: 'ground:outdoor',
    pillar: 'pillar:concrete',
  },
  rooms: [
    {
      id: '1-robby',
      position: [0, 8],
      size: [8, 10],
      surfaces: {
        floor: { materialKey: 'floor:warm-wood' },
        wall: { materialKey: 'wall:gallery-white' },
        walls: {
          north: { color: '#208020' },
        },
      },
      doors: [
        { side: 'north', offset: 0, width: 2.4, height: 2.25 },
        { side: 'east', offset: 2.7, width: 2.1, height: 2.25 },
      ],
      windows: [
        { side: 'west', offset: 1, width: 1.5, bottom: 1, height: 1.1 },
        { side: 'west', offset: -2.5, width: 1.5, bottom: 1, height: 1.1 },
        { side: 'south', offset: -0, width: 5, bottom: 1.1, height: 2 },
      ],
    },
    {
      id: '2-gallery',
      position: [1, 0],
      size: [10, 6],
      surfaces: {
        ceiling: { hidden: true, noCollider: true },
        floor: { materialKey: 'floor:stone' },
        wall: { materialKey: 'wall:plaster' },
        walls: {
          south: { color: '#2aee7c' },
          north: { color: '#dc7310' },
        },
      },
      doors: [
        { side: 'south', offset: 0, width: 2.4, height: 2.25 },
        { side: 'west', offset: -1.8, width: 2, height: 2.15 },
      ],
      windows: [
        { side: 'north', offset: -2, width: 1.4, bottom: 1.1, height: 1 },
        { side: 'north', offset: 2, width: 1.4, bottom: 1.1, height: 1 },
      ],
    },
    {
      id: 'side-room',
      position: [-5.6, 2.8],
      size: [3.2, 4.6],
      surfaces: {
        wall: { materialKey: 'wall:accent' },
        walls: {
          north: { color: '#607a71' },
          west: { color: '#4c625b' },
        },
      },
      doors: [
        { side: 'east', offset: -0.5, width: 2, height: 2.25 },
      ],
      windows: [
        { side: 'north', offset: 0, width: 1.4, bottom: 1.05, height: 1 },
      ],
    },
  ],
}

export const plan2: BuildingPlan = {
  unit: 1,
  floorHeight: 5.5,
  wallThickness: 0.22,
  slabThickness: 0.12,
  exteriorGround: false,
  pillar: {
    thickness: 0.25,
  },
  materialKeys: {
    room: {
      floor: 'floor:warm-wood',
      wall: 'wall:plaster',
      ceiling: 'ceiling:soft-white',
    },
    exteriorGround: 'ground:outdoor',
    pillar: 'pillar:concrete',
  },
  rooms: [
    {
      id: '2F-robby',
      position: [0, 8],
      size: [8, 10],
      surfaces: {
        floor: { hidden:true  },
        wall: { materialKey: 'wall:gallery-white' },
        walls: {
          north: { color: '#208020' },
        },
      },
      doors: [
        { side: 'east', offset: -2.8, width: 2.1, height: 2.25 },
      ],
      windows: [
        { side: 'north', offset :0, width:2.4, bottom:1, height:2},
        { side: 'west', offset: 1, width: 1.5, bottom: 1, height: 1.1 },
        { side: 'west', offset: -2.5, width: 1.5, bottom: 1, height: 1.1 },
        { side: 'south', offset: -0, width: 5, bottom: 1.1, height: 2 },
      ],
    },
  ]
}

export function Buildings() {
  return (
    <>
      <BuildingWorld
        plan={plan1}
        materials={worldBuildingMaterials}
        position={[0,0,0]}
        enableProfileLog={true}
      />
      <BuildingWorld
        plan={plan2}
        materials={worldBuildingMaterials}
        position={[0,5.5 ,0]}
        enableProfileLog={true}
      />
    </>
  )
}
