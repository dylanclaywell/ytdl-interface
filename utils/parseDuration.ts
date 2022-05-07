export function pluralize(singular: string, count: number) {
  return `${singular}${count === 1 ? '' : 's'}`
}

function parseDurationUnit(unit: 'hour' | 'minute' | 'second', count: number) {
  return count > 0 ? `${count} ${pluralize(unit, count)}` : undefined
}

export function parseDuration(duration: number) {
  const durationParts = {
    hours: Math.floor(duration / 60 / 60),
    minutes: Math.floor(duration / 60) % 60,
    seconds: duration % 60,
  }

  return (['hour', 'minute', 'second'] as const)
    .map((unit) => {
      return parseDurationUnit(unit, durationParts[`${unit}s`])
    })
    .filter(Boolean)
    .join(', ')
}
