export function nextAvailableSortOrder(items = []) {
  const usedOrders = new Set(
    items
      .map((item) => Number(item.sort_order))
      .filter((order) => Number.isInteger(order) && order > 0),
  )

  let nextOrder = 1
  while (usedOrders.has(nextOrder)) {
    nextOrder += 1
  }

  return nextOrder
}
