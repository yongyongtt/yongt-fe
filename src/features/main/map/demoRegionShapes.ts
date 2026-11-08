export type RegionShape = {
  regionCode: string
  points: ReadonlyArray<readonly [number, number]>
  labelPosition: readonly [number, number]
  rings?: ReadonlyArray<ReadonlyArray<readonly [number, number]>>
}

export const DEMO_MAP_VIEWBOX = '0 0 942 612'

/** 임의의 도식 좌표. 실제 위치·면적·행정 경계가 아니며 API 점수와 코드로만 연결한다. */
export const demoRegionShapes: RegionShape[] = [
  {
    regionCode: '4146551000',
    points: [
      [110, 145],
      [245, 105],
      [325, 160],
      [295, 275],
      [210, 350],
      [125, 300],
    ],
    labelPosition: [215, 235],
  },
  {
    regionCode: '4146125000',
    points: [
      [325, 160],
      [465, 125],
      [590, 185],
      [565, 315],
      [430, 350],
      [295, 275],
    ],
    labelPosition: [435, 245],
  },
  {
    regionCode: '4146136000',
    points: [
      [590, 185],
      [735, 155],
      [850, 240],
      [870, 365],
      [735, 405],
      [565, 315],
    ],
    labelPosition: [720, 280],
  },
  {
    regionCode: '4146134000',
    points: [
      [430, 350],
      [565, 315],
      [735, 405],
      [705, 485],
      [585, 510],
      [465, 465],
    ],
    labelPosition: [580, 420],
  },
  {
    regionCode: '4146135000',
    points: [
      [465, 465],
      [585, 510],
      [705, 485],
      [780, 535],
      [665, 575],
      [500, 560],
      [405, 535],
    ],
    labelPosition: [595, 540],
  },
]
