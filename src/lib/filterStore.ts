import { useSyncExternalStore } from 'react';
import { FilterState } from '../types/data';

export const INITIAL_FILTER_STATE: FilterState = {
  yearRange: [2000, 2024],
  selectedAreas: [],
  selectedItems: [],
  crossFilterArea: null,
  crossFilterItem: null,
};

let currentFilters: FilterState = { ...INITIAL_FILTER_STATE };
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export const filterStore = {
  getState(): FilterState {
    return currentFilters;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setYearRange(range: [number, number]): void {
    currentFilters = { ...currentFilters, yearRange: range };
    notify();
  },

  setSelectedAreas(areas: string[]): void {
    currentFilters = { ...currentFilters, selectedAreas: areas };
    notify();
  },

  toggleArea(area: string): void {
    const exists = currentFilters.selectedAreas.includes(area);
    const updated = exists
      ? currentFilters.selectedAreas.filter((a) => a !== area)
      : [...currentFilters.selectedAreas, area];
    currentFilters = { ...currentFilters, selectedAreas: updated };
    notify();
  },

  setSelectedItems(items: string[]): void {
    currentFilters = { ...currentFilters, selectedItems: items };
    notify();
  },

  toggleItem(item: string): void {
    const exists = currentFilters.selectedItems.includes(item);
    const updated = exists
      ? currentFilters.selectedItems.filter((i) => i !== item)
      : [...currentFilters.selectedItems, item];
    currentFilters = { ...currentFilters, selectedItems: updated };
    notify();
  },

  setCrossFilterArea(area: string | null): void {
    // If clicked on same area, clear it (toggle off)
    const nextArea = currentFilters.crossFilterArea === area ? null : area;
    currentFilters = { ...currentFilters, crossFilterArea: nextArea };
    notify();
  },

  setCrossFilterItem(item: string | null): void {
    // If clicked on same item, clear it (toggle off)
    const nextItem = currentFilters.crossFilterItem === item ? null : item;
    currentFilters = { ...currentFilters, crossFilterItem: nextItem };
    notify();
  },

  resetFilters(): void {
    currentFilters = { ...INITIAL_FILTER_STATE };
    notify();
  }
};

export function useFilters(): [FilterState, typeof filterStore] {
  const state = useSyncExternalStore(filterStore.subscribe, filterStore.getState);
  return [state, filterStore];
}
