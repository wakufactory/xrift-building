// this plan is AI generated

import { RigidBody } from '@react-three/rapier'
import { BuildingWorld, BoxBatchProvider, BoxLayer, RoomObject, WallObject } from './building'
import type { BuildingPlan, BoxInstance, BoxPartColor, Vec2, Vec3 } from './building'
import { worldBuildingMaterials } from './worldMaterials'
import { Text } from '@react-three/drei'

const defaultMaterialKeys = {
  room: {
    floor: 'floor:warm-wood',
    wall: 'wall:plaster',
    ceiling: 'ceiling:soft-white',
  },
  exteriorGround: 'ground:outdoor',
  pillar: 'pillar:concrete',
  roof: 'roof:flat-concrete',
}

export const courtyardPlan1: BuildingPlan = {
  unit: 1,
  floorHeight: 5.2,
  wallThickness: 0.22,
  slabThickness: 0.12,
  exteriorGround: {
    margin: 6,
    thickness: 0.18,
    materialKey: 'ground:outdoor',
  },
  pillar: {
    thickness: 0.28,
  },
  materialKeys: defaultMaterialKeys,
  rooms: [
    {
      id: '1F-atrium',
      position: [0, 0],
      size: [8, 8],
      surfaces: {
        ceiling: { hidden: true, noCollider: true },
        floor: { materialKey: 'floor:stone' },
        wall: { materialKey: 'wall:gallery-white' },
        walls: {
          north: { color: '#2f8f61' },
          south: { color: '#d27d2d' },
        },
      },
      doors: [
        { side: 'south', offset: 0, width: 2.8, height: 2.35 },
        { side: 'north', offset: 0, width: 2.4, height: 2.35 },
        { side: 'east', offset: 0, width: 2.2, height: 2.25 },
        { side: 'west', offset: 0, width: 2.2, height: 2.25 },
      ],
      windows: [
        { side: 'east', offset: 2.5, width: 1.2, bottom: 1.2, height: 1.4 },
        { side: 'west', offset: 2.5, width: 1.2, bottom: 1.2, height: 1.4 },
      ],
    },
    {
      id: '1F-north-gallery',
      position: [0, -7],
      size: [12, 6],
      surfaces: {
        floor: { materialKey: 'floor:warm-wood' },
        wall: { materialKey: 'wall:plaster' },
        walls: {
          north: { color: '#536b8f' },
        },
      },
      doors: [
        { side: 'south', offset: 0, width: 2.4, height: 2.35 },
      ],
      windows: [
        { side: 'north', offset: -3.5, width: 1.7, bottom: 1.15, height: 1.25 },
        { side: 'north', offset: 0, width: 1.7, bottom: 1.15, height: 1.25 },
        { side: 'north', offset: 3.5, width: 1.7, bottom: 1.15, height: 1.25 },
      ],
    },
    {
      id: '1F-east-lounge',
      position: [7, 0],
      size: [6, 7],
      surfaces: {
        floor: { materialKey: 'floor:warm-wood' },
        wall: { materialKey: 'wall:accent' },
        walls: {
          east: { color: '#7a5c82' },
        },
      },
      doors: [
        { side: 'west', offset: 0, width: 2.2, height: 2.25 },
      ],
      windows: [
        { side: 'east', offset: -1.7, width: 1.4, bottom: 1.1, height: 1.2 },
        { side: 'east', offset: 1.7, width: 1.4, bottom: 1.1, height: 1.2 },
      ],
    },
    {
      id: '1F-west-workshop',
      position: [-7, 0],
      size: [6, 7],
      surfaces: {
        floor: { materialKey: 'floor:stone' },
        wall: { materialKey: 'wall:plaster' },
        walls: {
          west: { color: '#607a71' },
        },
      },
      doors: [
        { side: 'east', offset: 0, width: 2.2, height: 2.25 },
      ],
      windows: [
        { side: 'west', offset: -1.7, width: 1.4, bottom: 1.1, height: 1.2 },
        { side: 'west', offset: 1.7, width: 1.4, bottom: 1.1, height: 1.2 },
      ],
    },
    {
      id: '1F-south-entry',
      position: [0, 7],
      size: [7, 6],
      surfaces: {
        floor: { materialKey: 'floor:stone' },
        wall: { materialKey: 'wall:gallery-white' },
        walls: {
          south: { color: '#b56a48' },
        },
      },
      doors: [
        { side: 'north', offset: 0, width: 2.8, height: 2.35 },
        { side: 'south', offset: 0, width: 3.2, height: 2.6 },
      ],
      windows: [
        { side: 'south', offset: -2.2, width: 1, bottom: 1.1, height: 1.2 },
        { side: 'south', offset: 2.2, width: 1, bottom: 1.1, height: 1.2 },
      ],
    },
  ],
}

export const courtyardPlan2: BuildingPlan = {
  unit: 1,
  floorHeight: 4.4,
  wallThickness: 0.22,
  slabThickness: 0.12,
  exteriorGround: false,
  pillar: {
    thickness: 0.28,
  },
  materialKeys: defaultMaterialKeys,
  roof: {
    overhang: 0.55,
    thickness: 0.16,
    heightOffset: -0,
    materialKey: 'roof:flat-concrete',
  },
  rooms: [
    {
      id: '2F-bridge',
      position: [0, 0],
      size: [5, 8],
      surfaces: {
        floor: { materialKey: 'floor:warm-wood' },
        wall: { materialKey: 'wall:gallery-white' },
        ceiling: { hidden: true, noCollider: true },
        walls: {
          east: { hidden: true, noCollider: true },
          west: { hidden: true, noCollider: true },
        },
      },
      doors: [
        { side: 'north', offset: 0, width: 2.2, height: 2.2 },
        { side: 'south', offset: 0, width: 2.2, height: 2.2 },
      ],
    },
    {
      id: '2F-north-studio',
      position: [0, -7],
      size: [10, 5.5],
      surfaces: {
        floor: { materialKey: 'floor:warm-wood' },
        wall: { materialKey: 'wall:plaster' },
        walls: {
          north: { color: '#405f7d' },
        },
      },
      doors: [
        { side: 'south', offset: 0, width: 2.2, height: 2.2 },
      ],
      windows: [
        { side: 'north', offset: -3, width: 1.4, bottom: 1, height: 1.2 },
        { side: 'north', offset: 0, width: 1.4, bottom: 1, height: 1.2 },
        { side: 'north', offset: 3, width: 1.4, bottom: 1, height: 1.2 },
      ],
    },
    {
      id: '2F-south-terrace',
      position: [0, 7],
      size: [8, 5],
      surfaces: {
        floor: { materialKey: 'floor:stone' },
        wall: { materialKey: 'wall:gallery-white' },
        ceiling: { hidden: true, noCollider: true },
        walls: {
          north: { hidden: true, noCollider: true },
          south: { color: '#bf7c3f' },
        },
      },
      doors: [
        { side: 'north', offset: 0, width: 2.2, height: 2.2 },
      ],
      windows: [
        { side: 'south', offset: -2.4, width: 1.2, bottom: 1, height: 1.2 },
        { side: 'south', offset: 2.4, width: 1.2, bottom: 1, height: 1.2 },
      ],
    },
  ],
}

function BoxFurniture({
  id,
  size,
  color,
}: {
  id: string
  size: Vec2
  color: BoxPartColor
}) {
  const parts: BoxInstance[] = [
    {
      id: `${id}-top`,
      position: [0, 0.75, 0],
      size: [size[0], 0.12, size[1]],
      materialKey: 'furniture:neutral',
      color,
    },
    {
      id: `${id}-base`,
      position: [0, 0.36, 0],
      size: [size[0] * 0.18, 0.72, size[1] * 0.18],
      materialKey: 'furniture:neutral',
      color,
    },
  ]

  return (
    <BoxLayer
      id={id}
      parts={parts}
      materials={worldBuildingMaterials}
      collider
    />
  )
}

const exteriorParts: BoxInstance[] = [
  {
    id: 'front-steps',
    position: [0, 0.14, 12.1],
    size: [5.2, 0.28, 2.2],
    materialKey: 'floor:stone',
    color: '#8b8f8f',
  },
  {
    id: 'left-planter',
    position: [-3.6, 0.45, 12.1],
    size: [1.6, 0.9, 2],
    materialKey: 'wall:accent',
    color: '#48665a',
  },
  {
    id: 'right-planter',
    position: [3.6, 0.45, 12.1],
    size: [1.6, 0.9, 2],
    materialKey: 'wall:accent',
    color: '#48665a',
  },
  {
    id: 'west-roof-deck-rail',
    position: [-4.15, 5.85, 7],
    size: [0.12, 1.05, 4.8],
    materialKey: 'trim:dark-metal',
  },
  {
    id: 'east-roof-deck-rail',
    position: [4.15, 5.85, 7],
    size: [0.12, 1.05, 4.8],
    materialKey: 'trim:dark-metal',
  },
  {
    id: 'south-roof-deck-rail',
    position: [0, 5.56, 9.6],
    size: [8.2, 1.05, 0.12],
    materialKey: 'trim:dark-metal',
  },
]

export function Buildings2({position=[0,0,0]}:{
  position?:Vec3
}) {
  return (
    <BoxBatchProvider>
      <group position={position}>
        <BuildingWorld
          id="courtyard-floor-1"
          name="Courtyard 1F"
          plan={courtyardPlan1}
          materials={worldBuildingMaterials}
          position={[0, 0, 0]}
          enableProfileLog={true}
        >
          <RoomObject roomId="1F-atrium" position={[0, 0]} height={0.05}>
            <BoxFurniture id="atrium-table" size={[2.2, 2.2]} color="#9e735d" />
          </RoomObject>

          <RoomObject roomId="1F-east-lounge" position={[0.8, -1.2]}>
            <BoxFurniture id="lounge-low-table" size={[2.4, 1.1]} color="#c79a65" />
          </RoomObject>

          <RoomObject roomId="1F-west-workshop" position={[0, 1.3]}>
            <RigidBody type="dynamic" colliders="ball" restitution={0.45} friction={1}>
              <mesh position={[0, 0.5, 0]} castShadow>
                <sphereGeometry args={[0.5]} />
                <meshStandardMaterial color="#2d62ff" />
              </mesh>
            </RigidBody>
          </RoomObject>

          <WallObject roomId="1F-north-gallery" side="north" offset={0} height={2.2} inset={0.04}>
            <mesh position={[0, 0, 0.08]} castShadow>
              <boxGeometry args={[3.2, 1.2, 0.08]} />
              <meshStandardMaterial color="#e0b45b" />
            </mesh>
          </WallObject>
        </BuildingWorld>

        <BuildingWorld
          id="courtyard-floor-2"
          name="Courtyard 2F"
          plan={courtyardPlan2}
          materials={worldBuildingMaterials}
          position={[0, 5.2, 0]}
          enableProfileLog={true}
        >
          <RoomObject roomId="2F-south-terrace" position={[0, 0.8]}>
            <BoxFurniture id="terrace-table" size={[1.8, 1.2]} color="#d8bf82" />
          </RoomObject>
        </BuildingWorld>

        <BoxLayer
          id="courtyard-exterior"
          parts={exteriorParts}
          materials={worldBuildingMaterials}
          collider
        />
      <Text
        position={[-10, 1, 15]}
        fontSize={0.8}
        color="#161f3f"
        anchorX="center"
        anchorY="middle"
      >
       AI generated house
      </Text>
      </group>
    </BoxBatchProvider>
  )
}
