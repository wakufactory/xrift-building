import type { BuildingPlan,BoxInstance } from './building/types'
import { BuildingWorld } from './building/BuildingWorld'
import { worldBuildingMaterials } from './worldMaterials'
import { BoxBatchProvider, BoxLayer } from './building/InstancedBoxLayer'
import { BoxColliders } from './building/BuildingColliders'

/// north -z east +x south +z west x

export const plan1: BuildingPlan = {
  unit: 1,
  floorHeight: 5.5,
  wallThickness: 0.22,
  slabThickness: 0.12,
  exteriorGround: {
    margin: 5,
    thickness: 0.2,
    materialKey: 'ground:outdoor',
  },
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
      position: [0, 7],
      size: [8, 8],
      surfaces: {
        floor: { hidden:true, noCollider:true },
        wall: { materialKey: 'wall:gallery-white' },
        walls: {
          north: { color: '#208020' },
        },
      },
      doors: [
        { side: 'east', offset: -2.5, width: 2.1, height: 2.25 },
      ],
      windows: [
        { side: 'north', offset :0, width:2.4, bottom:1, height:2},
        { side: 'west', offset: 1, width: 1.5, bottom: 1, height: 1.1 },
        { side: 'west', offset: -2., width: 1.5, bottom: 1, height: 1.1 },
        { side: 'south', offset: -0, width: 5, bottom: 1.1, height: 2 },
      ],
    },
  ]
}


const exteriorBoxes: BoxInstance[] = [
  {
    id: 'sample-fixed-post',
    position: [5, 1.5, 11],
    size: [1, 3, 1],
    materialKey: 'furniture:neutral',
  },
  {
    id: 'sample-low-block',
    position: [5, 0.75, 7],
    size: [1, 1.5, 1],
    materialKey: 'furniture:neutral',
  },
]

export function Buildings() {
  return (
    <BoxBatchProvider>
      <group position={[-1, 0, 1]} rotation={[0,Math.PI*0,0]}>
      <BoxLayer
        id={'exterior-boxes'}
        parts={exteriorBoxes}
        materials={worldBuildingMaterials}
      />
      <BoxColliders parts={[exteriorBoxes[0]]} />

      <BuildingWorld
        id="floor-1"
        name="1F"
        plan={plan1}
        materials={worldBuildingMaterials}
        position={[0,0,0]}
        enableProfileLog={true}
      />
      <BuildingWorld
        id="floor-2"
        name="2F"
        plan={plan2}
        materials={worldBuildingMaterials}
        position={[0,5.5 ,0]}
        enableProfileLog={true}
      />
      </group>
    </BoxBatchProvider>
  )
}
