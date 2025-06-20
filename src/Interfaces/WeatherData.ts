
// types.ts
export interface WeatherEntry {
  dt_txt: string
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  clouds: {
    all: number
  }
  wind: {
    speed: number
    deg: number
  }
  visibility: number
}
