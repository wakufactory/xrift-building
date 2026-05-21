import type { BuildingPlan } from './types'

export const demoBuildingPlan: BuildingPlan = {
  floorHeight: 5.5,
  wallThickness: 0.22,
  slabThickness: 0.12,
  rooms: [
    {
      id: 'lobby',
      position: [0, 0],
      size: [8, 6],
      material: {
        floor: 'floor:stone',
        wall: 'wall:plaster',
      },
      doors: [
        { side: 'north', offset: 0, width: 2.4, height: 2.25 },
        { side: 'west', offset: 1.8, width: 2, height: 2.15 },
      ],
      windows: [
        { side: 'south', offset: -2, width: 1.4, bottom: 1.1, height: 1 },
        { side: 'south', offset: 2, width: 1.4, bottom: 1.1, height: 1 },
      ],
    },
    {
      id: 'gallery',
      position: [0, 8],
      size: [8, 10],
      material: {
        floor: 'floor:warm-wood',
        wall: 'wall:gallery-white',
      },
      doors: [
        { side: 'south', offset: 0, width: 2.4, height: 2.25 },
        { side: 'east', offset: -2.8, width: 2.1, height: 2.15 },
      ],
      windows: [
        { side: 'west', offset: -2.5, width: 1.5, bottom: 1, height: 1.1 },
        { side: 'west', offset: 2.5, width: 1.5, bottom: 1, height: 1.1 },
      ],
    },
    {
      id: 'side-room',
      position: [-5.6, 2.8],
      size: [3.2, 4.6],
      material: {
        wall: 'wall:accent',
      },
      doors: [
        { side: 'east', offset: -0.5, width: 2, height: 2.15 },
      ],
      windows: [
        { side: 'north', offset: 0, width: 1.4, bottom: 1.05, height: 1 },
      ],
    },
  ],
}
