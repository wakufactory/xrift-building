import { useRef } from 'react'
import { useFrame} from '@react-three/fiber'
import { Mesh } from 'three'
import { RigidBody} from '@react-three/rapier'
import type { BuildingPlan,BoxInstance } from './building/types'
import { BuildingWorld } from './building/BuildingWorld'
import { worldBuildingMaterials } from './worldMaterials'
import { BoxBatchProvider, BoxLayer } from './building/InstancedBoxLayer'
import { RoomObject, WallObject } from './building/RoomObject'

/// north -z east +x south +z west x

//部屋定義一階
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
  roof: {
    overhang: 0.5,
    thickness: 0.16,
    heightOffset: -0.1,
    materialKey: 'roof:flat-concrete',
  },
  materialKeys: {
    room: {
      floor: 'floor:warm-wood',
      wall: 'wall:plaster',
      ceiling: 'ceiling:soft-white',
    },
    exteriorGround: 'ground:outdoor',
    pillar: 'pillar:concrete',
    roof: 'roof:flat-concrete',
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

//部屋定義二階
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
  roof: {
    overhang: 0.5,
    thickness: 0.16,
    heightOffset: -0.1,
    materialKey: 'roof:flat-concrete',
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

//テーブル
const TableObject:React.FC = () => {
  const exteriorBoxes: BoxInstance[] = [
    {
      id: 'table-leg',
      position: [0, 0.5, 0],
      size: [0.2, 1, 0.2],
      materialKey: 'furniture:neutral',
      collider: false,
    },
    {
      id: 'table-f',
      position: [0, 1.0, 0],
      size: [1.5, 0.05, 1.5],
      materialKey: 'furniture:neutral',
    },
  ]
  return(
    <BoxLayer
      id={'exterior-boxes'}
      parts={exteriorBoxes}
      materials={worldBuildingMaterials}
      collider
    />
  )
}
//回転オブジェクツ
const Rotateobj:React.FC = ()=>{
  const poll = useRef<Mesh>(null)

  useFrame((_,dt)=>{
    if(poll.current) poll.current.rotation.y += dt * 0.1
  })
  return (
    <mesh ref={poll} rotation={[0, Math.PI / 4, 0]} position={[1, 1.5, -1]} castShadow>
      <octahedronGeometry args={[0.8, 0]} />
      <meshStandardMaterial color={'#a020f0'} />
    </mesh> 
  )
}

export function Buildings() {

  return (
    //instanced box領域
    <BoxBatchProvider>
      //家全体 group
      <group position={[-1, 0, 1]} rotation={[0,Math.PI*0,0]}>

      //一階
      <BuildingWorld
        id="floor-1"
        name="1F"
        plan={plan1}
        materials={worldBuildingMaterials}
        position={[0,0,0]}
        enableProfileLog={true}
      >
        //テーブル
        <RoomObject roomId="1-robby" position={[-2,2]}>
          <TableObject />
        </RoomObject>
        //部屋オブジェクト
        <RoomObject roomId="2-gallery" position={[0, 0]} >
          <Rotateobj/>
        </RoomObject>
        //壁オブジェクト
        <WallObject roomId="1-robby" side="east" offset={-1} height={2} >
          <mesh position={[0, 0, 0.1]}>
            <planeGeometry args={[2, 2]} />
            <meshStandardMaterial color={'#f08080'} />
          </mesh> 
        </WallObject>
        //ball
        <RoomObject roomId="1-robby" position={[-0,-1]}>
          <RigidBody type="dynamic" colliders="ball" restitution={0.5} friction={1}>
            <mesh position={[0,0.5,0]} castShadow>
              <sphereGeometry args={[0.5]}/>
              <meshStandardMaterial color="#4400ff"/>
            </mesh>
          </RigidBody>
        </RoomObject>
      </BuildingWorld>
      //二階
      <BuildingWorld
        id="floor-2"
        name="2F"
        plan={plan2}
        materials={worldBuildingMaterials}
        position={[0,5.5 ,0]}
        enableProfileLog={true}
      >
        //テーブル
        <RoomObject roomId="2F-robby" position={[0,-1]}>
          <TableObject />
        </RoomObject>
      </BuildingWorld>

      //外階段
      <BoxLayer
        id="slope"
        parts={[
          {
            id:"slope",
            position:[6.9,2.65,9.5],
            size:[7.7,0.2,1],
            rotation:[0, 0, -45/180*Math.PI],
            materialKey:"floor:stone"
          }
        ]}
        materials={worldBuildingMaterials}
        collider
      />

      </group>  
    </BoxBatchProvider>
  )
}
