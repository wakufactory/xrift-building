
import { BoxLayer, useRoomInfo, useWallObjectContext } from './building'
import type { BoxInstance, BoxPartColor, Vec2 } from './building'
import { worldBuildingMaterials } from './worldMaterials'
import { useWallOpeningPlacement } from './building'

//1つ足テーブル
export const TableObject = ({
    size = [1,1],
    height = 1,
    color = '#5d4646'
  } : {
    size?:Vec2,
    height?:number,
    color?:BoxPartColor
}) => {
  const tableBoxes: BoxInstance[] = [
    {
      id: 'table-leg',
      position: [0, 0.5, 0],
      size: [0.2, height, 0.2],
      materialKey: 'furniture:neutral',
      collider: false,
      color:color
    },
    {
      id: 'table-f',
      position: [0, height, 0],
      size: [size[0], 0.05, size[1]],
      materialKey: 'furniture:neutral',
      color:color
    },
  ]
  return(
    <BoxLayer
      id={'table-boxes'}
      parts={tableBoxes}
      materials={worldBuildingMaterials}
      collider
    />
  )
}

//窓枠
export const WindowFrameObject = ({
  frameSize = [0.1, 0.3],
  color = '#5d4646',
  roomId = '',
  windowId = ''
}: {
  roomId: string
  windowId: string
  windowSize?: Vec2
  frameSize?: Vec2
  color?: BoxPartColor
}) => {
  const room = useRoomInfo(roomId)
  const wallThickness = room.wallThickness
  const frameZ = -wallThickness / 2
  const windowPlacement = useWallOpeningPlacement({
    roomId: roomId,
    kind: 'window',
    id: windowId,
    inset: frameZ,
  })
  const windowSize = windowPlacement.size

  const frameWidth = frameSize[0]
  const frameDepth = frameSize[1]

  const materialKey = 'furniture:neutral'

  // WindowFrame は WallObject の子として、X=壁方向、Y=高さ、+Z=室内側の
  // 壁ローカル座標で作る。親 WallObject が side ごとの回転を担当する。
  const frameBoxes: BoxInstance[] = [
    {
      id: 'r',
      position: [windowSize[0] / 2 - frameWidth / 2, 0, 0],
      size: [frameWidth, windowSize[1], frameDepth],
      materialKey,
      collider: false,
      color,
    },
    {
      id: 'l',
      position: [-windowSize[0] / 2 + frameWidth / 2, 0, 0],
      size: [frameWidth, windowSize[1], frameDepth],
      materialKey,
      collider: false,
      color,
    },
    {
      id: 't',
      position: [0, windowSize[1] / 2 - frameWidth / 2, 0],
      size: [windowSize[0] - frameWidth * 2, frameWidth, frameDepth],
      materialKey,
      collider: false,
      color,
    },
    {
      id: 'b',
      position: [0, -windowSize[1] / 2 + frameWidth / 2, 0],
      size: [windowSize[0] - frameWidth * 2, frameWidth, frameDepth],
      materialKey,
      collider: false,
      color,
    },
  ]

  return(
    <group position={windowPlacement.position} rotation={windowPlacement.rotation}>
    <BoxLayer
      id={`window-frame:${roomId}:${windowId}`}
      parts={frameBoxes}
      materials={worldBuildingMaterials}
    />
    </group>
  )
}

//開かないけど通れるドア
export const DoorFrame = ({
  doorSize = [1.5, 2],
  doorThickness = 0.2,
  color = '#dacf89',
}: {
  doorSize: Vec2
  doorThickness?: number
  color?: BoxPartColor
}) => {
  const wallObject = useWallObjectContext()
  const effectiveRoomId = wallObject?.roomId ?? ''
  const effectiveSide = wallObject?.side ?? 'south'
  const room = useRoomInfo(effectiveRoomId)
  const wallThickness = room.wallThickness
  const frameZ = -wallThickness / 2
  const materialKey = 'furniture:neutral'
  const width = doorSize[0]
  const height = doorSize[1]
  const frameBoxes: BoxInstance[] = [
    {
      id: 'r',
      position: [width/4,0, frameZ],
      size: [width/2-0.01,height, doorThickness],
      materialKey,
      collider: false,
      color,
    },
    {
      id: 'l',
      position: [-width/4,0, frameZ],
      size: [width/2-0.01,height, doorThickness],
      materialKey,
      collider: false,
      color,
    }
  ]

  return(
    <BoxLayer
      id={`door-frame:${effectiveRoomId}:${effectiveSide}`}
      parts={frameBoxes}
      materials={worldBuildingMaterials}
    />
  )
}
