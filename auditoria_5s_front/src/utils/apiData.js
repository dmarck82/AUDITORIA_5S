import api from '../api/axios'

export function collectionFromResponse(response) {
  return Array.isArray(response.data.data) ? response.data.data : response.data
}

export async function fetchAllPages(endpoint, config = {}) {
  const firstResponse = await api.get(endpoint, {
    ...config,
    params: {
      ...config.params,
      page: 1,
    },
  })
  const items = collectionFromResponse(firstResponse)
  const lastPage = firstResponse.data?.meta?.last_page || 1

  for (let page = 2; page <= lastPage; page += 1) {
    const response = await api.get(endpoint, {
      ...config,
      params: {
        ...config.params,
        page,
      },
    })

    items.push(...collectionFromResponse(response))
  }

  return items
}

export function getRelatedName(entity, relationName, fallbackIdName) {
  return entity?.[relationName]?.name || entity?.[fallbackIdName] || '-'
}
