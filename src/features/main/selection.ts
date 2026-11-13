export type MapFocusRequest = { regionCode: string; version: number }
export type DashboardSelection = {
  regionCode: string | null
  mode: 'ranking' | 'preview'
  focusRequest: MapFocusRequest | null
}
export type SelectionAction =
  { type: 'select'; regionCode: string; focusMap: boolean } | { type: 'back' } | { type: 'reset' }

export const initialSelection: DashboardSelection = {
  regionCode: null,
  mode: 'ranking',
  focusRequest: null,
}

export function selectionReducer(
  state: DashboardSelection,
  action: SelectionAction,
): DashboardSelection {
  if (action.type === 'reset') return initialSelection
  if (action.type === 'back') return { ...state, mode: 'ranking' }
  return {
    regionCode: action.regionCode,
    mode: 'preview',
    focusRequest: action.focusMap
      ? {
          regionCode: action.regionCode,
          version: (state.focusRequest?.version ?? 0) + 1,
        }
      : state.focusRequest,
  }
}
