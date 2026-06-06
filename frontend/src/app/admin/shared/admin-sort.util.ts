type SortableItem = {
  createdAt?: string | Date;
  updatedAt?: string | Date;
  orderedAt?: string | Date;
  _id?: string;
};

export function sortByLatest<T extends SortableItem>(items: T[]): T[] {
  return [...items].sort((a, b) => getSortTime(b) - getSortTime(a));
}

function getSortTime(item: SortableItem): number {
  const dateStr = item.createdAt || item.updatedAt || item.orderedAt;
  if (dateStr) return new Date(dateStr).getTime();
  if (item._id && item._id.length >= 8) {
    return parseInt(item._id.substring(0, 8), 16) * 1000;
  }
  return 0;
}
