export function serialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (value instanceof Date) {
        return value.toISOString()
      }
      if (value === undefined) {
        return null
      }
      return value
    })
  )
} 