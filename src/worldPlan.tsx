import { useRef } from 'react'
import { useFrame} from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { Mesh } from 'three'
import { RigidBody} from '@react-three/rapier'
import { BuildingWorld, BoxBatchProvider, BoxLayer, RoomObject, WallObject,CeilingObject } from './building'
import type { BuildingPlan, Vec3 } from './building'
import { worldBuildingMaterials } from './worldMaterials'
import { TableObject,WindowFrameObject,DoorFrame } from './fittings.tsx'

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
  //roof: {
  //  overhang: 0.5,
  //  thickness: 0.16,
  //  heightOffset: -0.1,
  //  materialKey: 'roof:flat-concrete',
  //},
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
        wall: { materialKey: 'debug:measure-grid' },
        walls: {
          north: { color: '#208020' },
        },
      },
      doors: [
        { side: 'north', offset: 0, width: 2.5, height: 2.25 },
        { side: 'east', id:'enterdoor', offset: 2.5, width: 2., height: 2.25 },
      ],
      windows: [
        { side: 'west', offset: 1, width: 1.5, bottom: 1, height: 1.},
        { side: 'west', offset: -2.5, width: 1.5, bottom: 1, height: 1. },
        { side: 'south', offset: -0, width: 5, bottom: 1., height: 2 },
      ],
      ceilingOpenings: [
        { position: [-2.5, -3], size: [2, 2] },
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
    heightOffset: -0.,
    materialKey: 'roof:flat-concrete',
  },
  rooms: [
    {
      id: '2F-robby',
      position: [0, 7],
      size: [8, 8],
      surfaces: {
        floor: { hidden:false, noCollider:false },
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
      floorOpenings: [
        { position: [-2.5, -2], size: [2, 2] },
      ],
       ceilingOpenings: [
        { position: [2, 2], size: [2, 2] },
      ],
       roofOpenings: [
        { position: [2, 2], size: [2-0.01, 2-0.01] },
      ],      
    },
  ]
}

//回転オブジェクト
const Rotateobj = ()=>{
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

//全体の組み立て
export function Buildings({position=[0,0,0]}:{position?:Vec3}) {

  return (
    //instanced box領域
    <BoxBatchProvider>
      //家全体 group
      <group position={position} rotation={[0,Math.PI*0,0]}>

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
          <TableObject size={[1.5,2]}/>
        </RoomObject>
        //部屋オブジェクト
        <RoomObject roomId="2-gallery" position={[0, 0]} >
          <Rotateobj/>
        </RoomObject>
        //壁オブジェクト(板)
        <WallObject roomId="1-robby" side="east" offset={-1} height={2} >
          <mesh position={[0, 0, 0.1]}>
            <planeGeometry args={[2, 2]} />
            <meshStandardMaterial color={'#f08080'} />
          </mesh> 
        </WallObject>
        //動かせるball
        <RoomObject roomId="1-robby" position={[-0,-1]}>
          <RigidBody type="dynamic" colliders="ball" restitution={0.5} friction={1}>
            <mesh position={[0,0.5,0]} castShadow>
              <sphereGeometry args={[0.5]}/>
              <meshStandardMaterial color="#4400ff"/>
            </mesh>
          </RigidBody>
        </RoomObject>
        //天井オブジェクト
        <CeilingObject roomId="1-robby" position={[0, 0]} height={0.1}>
          <mesh position={[0, 0, 0]} rotation={[Math.PI/2,0,0]}>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial color={'#ffffff'} roughness={1.} emissive={'#ffffff'}/>
          </mesh> 
        </CeilingObject>
        //窓枠  
        <WindowFrameObject roomId="1-robby" windowId="0" frameSize={[0.1,0.3]}/>
        <WindowFrameObject roomId="1-robby" windowId="1" frameSize={[0.1,0.3]}/>
        <WindowFrameObject roomId="1-robby" windowId="2" frameSize={[0.1,0.3]}/>

        //入口ドア  offset: 2.7, width: 2.1, height: 2.25 
        <WallObject roomId="1-robby" openingId="enterdoor" >
          <DoorFrame doorSize={[2.1,2.25]} doorThickness={0.1}/>
        </WallObject>
        //階段
        <RoomObject roomId="1-robby" position={[-2.5,-3]} rotationY={0}>
          <BoxLayer
            id="kaidan"
            parts={[
              {
                id:"k1",
                position:[0,1,-0.75],
                size:[2,0.1,0.5],
                materialKey:"floor:stone"
              },
              {
                id:"k2",
                position:[0,2,-0.25],
                size:[2,0.1,0.5],
                materialKey:"floor:stone"
              },
              {
                id:"k3",
                position:[0,3,0.25],
                size:[2,0.1,0.5],
                materialKey:"floor:stone"
              },
              {
                id:"k4",
                position:[0,4,0.75],
                size:[2,0.1,0.5],
                materialKey:"floor:stone"
              },
            ]}
            materials={worldBuildingMaterials}
            collider
          />
        </RoomObject>
      </BuildingWorld>
      //二階
      {true &&
      <BuildingWorld
        id="floor-2"
        name="2F"
        plan={plan2}
        materials={worldBuildingMaterials}
        position={[0,5.5 ,0]}
        enableProfileLog={true}
      >
        //テーブル
        <RoomObject roomId="2F-robby" position={[2,-2]}>
          <TableObject size={[1.5,1.5]} color={'#e4c98e'} />
        </RoomObject>
      </BuildingWorld>
 }
      //外斜面
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
      //ラベル
      <Text
        position={[5, 1, 15]}
        fontSize={0.8}
        color="#161f3f"
        anchorX="center"
        anchorY="middle"
      >
        SampleHouse
      </Text>

      </group>  
    </BoxBatchProvider>
  )
}
