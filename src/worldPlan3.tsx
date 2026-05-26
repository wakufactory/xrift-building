import { BuildingWorld, BoxBatchProvider } from './building'
import type { BuildingPlan, Vec3 } from './building'
import { worldBuildingMaterials } from './worldMaterials'

const materialKeys = {
  room: {
    floor: 'floor:warm-wood',
    wall: 'wall:plaster',
    ceiling: 'ceiling:soft-white',
  },
  exteriorGround: 'ground:outdoor',
  pillar: 'pillar:concrete',
  roof: 'roof:flat-concrete',
}

const wallPalettes = [
  { firstFloor: '#b56a48', secondFloor: '#536b8f' },
  { firstFloor: '#6f8f63', secondFloor: '#8b6d9b' },
  { firstFloor: '#c7924f', secondFloor: '#4f7f92' },
  { firstFloor: '#8f5f5f', secondFloor: '#6885a8' },
  { firstFloor: '#5d7f75', secondFloor: '#a07259' },
]

function makeGridHousePlan1(index: number, column: number, row: number): BuildingPlan {
  const palette = wallPalettes[index % wallPalettes.length]
  const windowWidth = 1 + (column % 3) * 0.18
  const sideWindowOffset = (row % 3 - 1) * 0.45
  const northWindows =
    row % 2 === 0
      ? [
          { side: 'north' as const, offset: -1.05, width: windowWidth, bottom: 1, height: 1 },
          { side: 'north' as const, offset: 1.05, width: windowWidth, bottom: 1, height: 1 },
        ]
      : [
          { side: 'north' as const, offset: 0, width: windowWidth + 0.35, bottom: 1, height: 1 },
        ]

  return {
    unit: 1,
    floorHeight: 3.2,
    wallThickness: 0.18,
    slabThickness: 0.12,
    exteriorGround: {
      margin: 1.4,
      thickness: 0.16,
      materialKey: 'ground:outdoor',
    },
    pillar: {
      thickness: 0.26,
    },
    materialKeys,
    rooms: [
      {
        id: '1F-room',
        position: [0, 0],
        size: [5, 5],
        surfaces: {
          floor: { materialKey: 'floor:stone' },
          wall: { materialKey: 'wall:plaster' },
          walls: {
            south: { color: palette.firstFloor },
            east: { color: index % 2 === 0 ? '#d7d0c2' : '#cfc7b8' },
          },
        },
        doors: [
          { side: 'south', offset: (column % 3 - 1) * 0.25, width: 1.2 + (row % 2) * 0.2, height: 2.2 },
        ],
        windows: [
          ...northWindows,
          { side: 'east', offset: sideWindowOffset, width: 1.1, bottom: 1, height: 1 },
          { side: 'west', offset: -sideWindowOffset, width: 1.1, bottom: 1, height: 1 },
        ],
      },
    ],
  }
}

function makeGridHousePlan2(index: number, column: number, row: number): BuildingPlan {
  const palette = wallPalettes[index % wallPalettes.length]
  const windowBottom = 0.9 + (index % 3) * 0.08
  const sideWindowWidth = 0.95 + (row % 3) * 0.12

  return {
    unit: 1,
    floorHeight: 3,
    wallThickness: 0.18,
    slabThickness: 0.12,
    exteriorGround: false,
    pillar: {
      thickness: 0.26,
    },
    materialKeys,
    roof: {
      overhang: 0.25,
      thickness: 0.14,
      heightOffset: -0,
      materialKey: 'roof:flat-concrete',
    },
    rooms: [
      {
        id: '2F-room',
        position: [0, 0],
        size: [5, 5],
        surfaces: {
          floor: { materialKey: 'floor:warm-wood' },
          wall: { materialKey: 'wall:gallery-white' },
          walls: {
            south: { color: palette.secondFloor },
            west: { color: column % 2 === 0 ? '#ece8dd' : '#e3ded3' },
          },
        },
        windows: [
          { side: 'north', offset: row % 2 === 0 ? -0.8 : 0.8, width: 1.2, bottom: windowBottom, height: 1 },
          { side: 'south', offset: column % 2 === 0 ? 0 : 0.7, width: 1.25, bottom: windowBottom, height: 1 },
          { side: 'east', offset: -0.55, width: sideWindowWidth, bottom: 1, height: 1 },
          { side: 'west', offset: 0.55, width: sideWindowWidth, bottom: 1, height: 1 },
        ],
      },
    ],
  }
}

const gridSize = 10
const spacing = 12
const floor2Y = 3.2

const houses = Array.from({ length: gridSize * gridSize }, (_, index) => {
  const column = index % gridSize
  const row = Math.floor(index / gridSize)
  const position: Vec3 = [
    (column - (gridSize - 1) / 2) * spacing,
    0,
    (row - (gridSize - 1) / 2) * spacing,
  ]

  return {
    index,
    position,
    plan1: makeGridHousePlan1(index, column, row),
    plan2: makeGridHousePlan2(index, column, row),
  }
})

export function Buildings3({ position = [0, 0, 0] }: { position?: Vec3 }) {
  return (
    <BoxBatchProvider>
      <group position={position}>
        {houses.map((house) => (
          <group key={`grid-house-${house.index}`} position={house.position}>
            <BuildingWorld
              id={`grid-house-${house.index}-floor-1`}
              name={`Grid house ${house.index + 1} 1F`}
              plan={house.plan1}
              materials={worldBuildingMaterials}
              position={[0, 0, 0]}
            />
            <BuildingWorld
              id={`grid-house-${house.index}-floor-2`}
              name={`Grid house ${house.index + 1} 2F`}
              plan={house.plan2}
              materials={worldBuildingMaterials}
              position={[0, floor2Y, 0]}
            />
          </group>
        ))}
      </group>
    </BoxBatchProvider>
  )
}
