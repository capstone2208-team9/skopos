export function createSchedule(units: string, value: string) {
  let unit = ''
  if (value === '1' && units.endsWith('s')) {
    unit =  units.slice(0,  -1)
  }
  if (Number(value) > 1 && !units.endsWith('s')) {
    unit = units +'s'
  }
  return `${value} ${unit}`
}