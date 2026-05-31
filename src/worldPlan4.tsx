import { BuildingWorld, BoxBatchProvider } from './building'
import type { BuildingPlan, OpeningSpec, RoomSpec, SlabOpeningSpec, Vec2, Vec3 } from './building'
import { worldBuildingMaterials } from './worldMaterials'

const roomSize = 8
const roomHeight = 4
const gridSize = 6
const floorCount = 6
const doorWidth = 1.35
const doorHeight = 2.35
const windowWidth = 1.15
const verticalOpeningSize: Vec2 = [1.45, 1.45]
const topCeilingOpeningRooms = [
  [1, 1],
  [4, 4],
]

// 6x6x6 の部屋グリッドを、roomSize x roomSize x roomHeight の部屋で組む。
const materialKeys = {
  room: {
    floor: 'floor:warm-wood',
    wall: 'wall:gemin-concrete',
    ceiling: 'ceiling:soft-white',
  },
  exteriorGround: 'ground:outdoor',
  pillar: 'pillar:concrete',
  roof: 'roof:flat-concrete',
}

const wallColors = [
  '#d6d0c2',
  '#c9d2c4',
  '#c8d1d9',
  '#d6c8c1',
  '#cbc6d5',
  '#d9d2bd',
]

// Math.random は使わず、部屋座標から毎回同じ疑似乱数を作る。
function random01(a: number, b: number, c: number, salt: number): number {
  let value = (a + 1) * 73856093
  value ^= (b + 1) * 19349663
  value ^= (c + 1) * 83492791
  value ^= salt * 2654435761
  value = Math.imul(value ^ (value >>> 16), 2246822507)
  value = Math.imul(value ^ (value >>> 13), 3266489909)
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295
}

function randomInRange(min: number, max: number, a: number, b: number, c: number, salt: number): number {
  return min + (max - min) * random01(a, b, c, salt)
}

function horizontalDoorOffset(x: number, z: number, level: number, salt: number): number {
  const limit = (roomHeight - doorWidth) / 2 - 0.35
  return randomInRange(-limit, limit, x, z, level, salt)
}

function horizontalWindowOffset(x: number, z: number, level: number, salt: number): number {
  const limit = (roomSize - windowWidth) / 2 - 0.45
  return randomInRange(-limit, limit, x, z, level, salt)
}

function hasVerticalOpening(x: number, z: number, level: number): boolean {
  return random01(x, z, level, 307) < 1 / 2
}

function verticalOpening(x: number, z: number, level: number): SlabOpeningSpec {
  const margin = 1.15
  const limitX = roomSize / 2 - verticalOpeningSize[0] / 2 - margin
  const limitZ = roomSize / 2 - verticalOpeningSize[1] / 2 - margin

  return {
    position: [
      randomInRange(-limitX, limitX, x, z, level, 401),
      randomInRange(-limitZ, limitZ, x, z, level, 409),
    ],
    size: verticalOpeningSize,
  }
}

function hasTopCeilingOpening(level: number, x: number, z: number): boolean {
  return level === floorCount - 1 && topCeilingOpeningRooms.some(([openingX, openingZ]) => (
    openingX === x && openingZ === z
  ))
}

function makeRoom(level: number, x: number, z: number): RoomSpec {
  const doors: OpeningSpec[] = []
  const windows: OpeningSpec[] = []
  const entranceIndex = Math.floor(gridSize / 2)
  const internalDoorCandidates: OpeningSpec[] = []

  // 共有壁は辞書順で先の room が所有するため、内部ドアの候補は east/south 側だけにする。
  if (x < gridSize - 1) {
    internalDoorCandidates.push({
      side: 'east',
      offset: horizontalDoorOffset(x, z, level, 101),
      width: doorWidth,
      height: doorHeight,
    })
  }

  if (z < gridSize - 1) {
    internalDoorCandidates.push({
      side: 'south',
      offset: horizontalDoorOffset(x, z, level, 211),
      width: doorWidth,
      height: doorHeight,
    })
  }

  if (internalDoorCandidates.length > 0) {
    const index = Math.floor(random01(x, z, level, 107) * internalDoorCandidates.length)
    doors.push(internalDoorCandidates[index])
  }

  // 1F の外周には東西南北 1 つずつ入口を開ける。
  if (level === 0 && x === entranceIndex && z === 0) {
    doors.push({
      side: 'north',
      offset: 0,
      width: 1.7,
      height: 2.55,
    })
  }

  if (level === 0 && x === entranceIndex && z === gridSize - 1) {
    doors.push({
      side: 'south',
      offset: 0,
      width: 1.7,
      height: 2.55,
    })
  }

  if (level === 0 && x === gridSize - 1 && z === entranceIndex) {
    doors.push({
      side: 'east',
      offset: 0,
      width: 1.7,
      height: 2.55,
    })
  }

  if (level === 0 && x === 0 && z === entranceIndex) {
    doors.push({
      side: 'west',
      offset: 0,
      width: 1.7,
      height: 2.55,
    })
  }

  // 外壁には、入口ドアと重ならない範囲で約 1/3 の確率の窓を置く。
  if (!(level === 0 && x === entranceIndex && z === 0) && z === 0 && random01(x, z, level, 701) < 1 / 3) {
    windows.push({
      side: 'north',
      offset: horizontalWindowOffset(x, z, level, 711),
      width: windowWidth,
      bottom: 1.7,
      height: 1.25,
    })
  }

  if (!(level === 0 && x === entranceIndex && z === gridSize - 1) && z === gridSize - 1 && random01(x, z, level, 719) < 1 / 3) {
    windows.push({
      side: 'south',
      offset: horizontalWindowOffset(x, z, level, 727),
      width: windowWidth,
      bottom: 1.7,
      height: 1.25,
    })
  }

  if (!(level === 0 && x === gridSize - 1 && z === entranceIndex) && x === gridSize - 1 && random01(x, z, level, 733) < 1 / 3) {
    windows.push({
      side: 'east',
      offset: horizontalWindowOffset(x, z, level, 739),
      width: windowWidth,
      bottom: 1.7,
      height: 1.25,
    })
  }

  if (!(level === 0 && x === 0 && z === entranceIndex) && x === 0 && random01(x, z, level, 743) < 1 / 3) {
    windows.push({
      side: 'west',
      offset: horizontalWindowOffset(x, z, level, 751),
      width: windowWidth,
      bottom: 1.7,
      height: 1.25,
    })
  }

  // 上下階は 1/2 の確率で、下階の ceiling と上階の floor に同じ位置の穴を開ける。
  const floorOpenings = level > 0 && hasVerticalOpening(x, z, level - 1)
    ? [verticalOpening(x, z, level - 1)]
    : undefined
  const ceilingOpenings = level < floorCount - 1 && hasVerticalOpening(x, z, level)
    ? [verticalOpening(x, z, level)]
    : undefined
  const topCeilingOpenings = hasTopCeilingOpening(level, x, z)
    ? [verticalOpening(x, z, level)]
    : undefined
  const color = wallColors[(level + x + z) % wallColors.length]

  return {
    id: `room-${level}-${z}-${x}`,
    position: [
      (x - (gridSize - 1) / 2) * roomSize,
      (z - (gridSize - 1) / 2) * roomSize,
    ],
    size: [roomSize, roomSize],
    surfaces: {
      wall: { materialKey: 'wall:gemin-brick', color },
      floor: { materialKey: level % 2 === 0 ? 'floor:gemin-wood' : 'floor:gemin-concrete' },
    },
    doors,
    windows,
    floorOpenings,
    ceilingOpenings: topCeilingOpenings ?? ceilingOpenings,
    roofOpenings: topCeilingOpenings,
  }
}

function makeLevelPlan(level: number): BuildingPlan {
  const rooms = Array.from({ length: gridSize * gridSize }, (_, index) => {
    const x = index % gridSize
    const z = Math.floor(index / gridSize)
    return makeRoom(level, x, z)
  })

  return {
    unit: 1,
    floorHeight: roomHeight,
    wallThickness: 0.18,
    slabThickness: 0.12,
    exteriorGround: level === 0
      ? {
          margin: 4,
          thickness: 0.18,
          materialKey: 'ground:outdoor',
        }
      : false,
    pillar: {
      thickness: 0.24,
    },
    roof: level === floorCount - 1
      ? {
          overhang: 0.35,
          thickness: 0.16,
          materialKey: 'roof:flat-concrete',
        }
      : false,
    materialKeys,
    rooms,
  }
}

const levelPlans = Array.from({ length: floorCount }, (_, level) => makeLevelPlan(level))

export function Buildings4({ position = [0, 0, 0] }: { position?: Vec3 }) {
  return (
    <BoxBatchProvider>
      <group position={position}>
        {levelPlans.map((plan, level) => (
          <BuildingWorld
            key={`cube-building-level-${level}`}
            id={`cube-building-level-${level}`}
            name={`Cube building level ${level + 1}`}
            plan={plan}
            materials={worldBuildingMaterials}
            position={[0, level * roomHeight, 0]}
          />
        ))}
      </group>
    </BoxBatchProvider>
  )
}
