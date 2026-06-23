import { BuildingWorld, BoxBatchProvider} from './building'
import type { BuildingPlan, Vec3 } from './building'
import { worldBuildingMaterials } from './worldMaterials'

//使用material
const materialKeys = {
  room: {
    floor: 'ceiling:soft-white',
    wall: 'wall:gallery-white',
    ceiling: 'wall:gallery-white',
  },
  exteriorGround: 'ground:outdoor',
  pillar: 'wall:gallery-white',
  roof: 'wall:gallery-white',
}

//一階間取りデータ
const courtyardPlan1:BuildingPlan= {
    unit: 1,
    floorHeight: 3.2,
    wallThickness: 0.2,
    slabThickness: 0.12,
    exteriorGround: {
      margin: 1.4,
      thickness: 0.16,
      materialKey: 'ground:outdoor',
    },
    pillar: {
      thickness: 0.2,
    },
  ambientOcclusion: {
    width: 0.12,
    strength: 0.2,
    falloff: 1.8,
  },
    materialKeys,
    rooms: [
      {
        id: '1F-room',
        position: [0, 0],
        size: [6, 6],
        surfaces: {

        },
        doors: [
          { side: 'south', offset: 0.25, width: 1.2 , height: 2.2 },
        ],
        windows: [
          { side: 'east', offset: 2, width: 1.1, bottom: 1, height: 1 },
          { side: 'west', offset: -2, width: 1.1, bottom: 1, height: 1 },
        ],
      },
    ],
  }

//全体まとめ
export function TestBuilding({position=[0,0,0]}:{
  position?:Vec3
}) {
  return (
    <BoxBatchProvider>
      <group position={position}>
        //一階
        <BuildingWorld
          id="courtyard-floor-1"
          name="Courtyard 1F"
          plan={courtyardPlan1}
          materials={worldBuildingMaterials}
          position={[0, 0, 0]}
          enableProfileLog={false}
        >

        </BuildingWorld>

      </group>
    </BoxBatchProvider>
  )
}