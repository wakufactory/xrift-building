
import { BoxLayer, useRoomInfo, useWallObjectContext } from './building'
import type { BoxInstance, BoxPartColor, Vec2 } from './building'
import { worldBuildingMaterials } from './worldMaterials'

//テーブル
export const TableObject = ({
    size = [1,1],
    color = '#5d4646'
  } : {
    size?:Vec2,
    color?:BoxPartColor
}) => {
  const tableBoxes: BoxInstance[] = [
    {
      id: 'table-leg',
      position: [0, 0.5, 0],
      size: [0.2, 1, 0.2],
      materialKey: 'furniture:neutral',
      collider: false,
      color:color
    },
    {
      id: 'table-f',
      position: [0, 1.0, 0],
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
export const WindowFrame = ({
  windowSize = [1, 1],
  frameSize = [0.1, 0.3],
  color = '#5d4646',
}: {
  windowSize: Vec2
  frameSize?: Vec2
  color?: BoxPartColor
}) => {
  const wallObject = useWallObjectContext()
  const effectiveRoomId = wallObject?.roomId ?? ''
  const effectiveSide = wallObject?.side ?? 'south'
  const room = useRoomInfo(effectiveRoomId)
  const wallThickness = room.wallThickness
  const frameWidth = frameSize[0]
  const frameDepth = frameSize[1]
  const frameZ = -wallThickness / 2
  const materialKey = 'furniture:neutral'

  // WindowFrame は WallObject の子として、X=壁方向、Y=高さ、+Z=室内側の
  // 壁ローカル座標で作る。親 WallObject が side ごとの回転を担当する。
  const frameBoxes: BoxInstance[] = [
    {
      id: 'r',
      position: [windowSize[0] / 2 - frameWidth / 2, 0, frameZ],
      size: [frameWidth, windowSize[1], frameDepth],
      materialKey,
      collider: false,
      color,
    },
    {
      id: 'l',
      position: [-windowSize[0] / 2 + frameWidth / 2, 0, frameZ],
      size: [frameWidth, windowSize[1], frameDepth],
      materialKey,
      collider: false,
      color,
    },
    {
      id: 't',
      position: [0, windowSize[1] / 2 - frameWidth / 2, frameZ],
      size: [windowSize[0] - frameWidth * 2, frameWidth, frameDepth],
      materialKey,
      collider: false,
      color,
    },
    {
      id: 'b',
      position: [0, -windowSize[1] / 2 + frameWidth / 2, frameZ],
      size: [windowSize[0] - frameWidth * 2, frameWidth, frameDepth],
      materialKey,
      collider: false,
      color,
    },
  ]

  return(
    <BoxLayer
      id={`window-frame:${effectiveRoomId}:${effectiveSide}`}
      parts={frameBoxes}
      materials={worldBuildingMaterials}
    />
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

  const frameBoxes: BoxInstance[] = [
    {
      id: 'r',
      position: [0,0, frameZ],
      size: [...doorSize, doorThickness],
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
