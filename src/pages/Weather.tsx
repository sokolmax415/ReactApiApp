import React, { useState, useEffect, useRef } from 'react'
import './weather.css';

interface WeatherData {
  location: {
    name: string
    country: string
    localtime: string
  }
  current: {
    temperature: number
    feelslike: number
    weather_icons: string[]
    weather_descriptions: string[]
    humidity: number
    wind_speed: number
    pressure: number
    visibility: number
  }
}

const WEATHER_API_KEY = 'df9facbcbc7370c8519f19b8c429a17e'
const WEATHER_BASE_URL = 'https://api.weatherstack.com'

const Weather: React.FC = () => {
  const [_, setCity] = useState<string>('Moscow')
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchLoading, setSearchLoading] = useState<boolean>(false)
  const cityInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadWeather('Moscow')
  }, [])

  const loadWeather = async (query: string = 'Moscow') => {
    setLoading(true)
    setError(null)
    
    try {
      const url = `${WEATHER_BASE_URL}/current?access_key=${WEATHER_API_KEY}&query=${encodeURIComponent(query)}&units=m`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Ошибка сети')
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error.info || 'Ошибка получения данных')
      }
      
      if (!data.current || !data.location) {
        throw new Error('Неверный формат данных')
      }
      
      setWeatherData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }

  const handleSearch = () => {
    const cityValue = cityInputRef.current?.value.trim()
    if (cityValue) {
      setSearchLoading(true)
      setCity(cityValue)
      loadWeather(cityValue)
    } else {
      setError('Пожалуйста, введите название города')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Геолокация не поддерживается вашим браузером')
      return
    }
    
    setLoading(true)
    setError(null)
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        loadWeather(`${latitude},${longitude}`)
      },
      () => {
        setError('Не удалось получить ваше местоположение')
        setLoading(false)
      }
    )
  }

  const formatDate = (localtimeString: string) => {
    if (!localtimeString) return 'Дата не доступна'
    
    try {
      const [datePart, timePart] = localtimeString.split(' ')
      const [year, month, day] = datePart.split('-')
      const [hours, minutes] = timePart.split(':')
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes))
      
      return date.toLocaleDateString('ru-RU', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return localtimeString
    }
  }

  return (
    <div>
      <main className="main-content">
        <div className="container">
          <div className="weather-header">
            <h2>Текущая погода</h2>
            <p>Узнайте погоду в любом городе мира</p>
          </div>
          
          <div className="weather-container">
            <div className="search-section">
              <div className="search-group">
                <input 
                  type="text" 
                  ref={cityInputRef}
                  placeholder="Введите город (например: Moscow)" 
                  className="search-input"
                  onKeyPress={handleKeyPress}
                  defaultValue="Moscow"
                />
                <button 
                  onClick={handleSearch} 
                  disabled={searchLoading}
                  className="search-btn"
                >
                  {searchLoading ? (
                    <div className="btn-spinner"></div>
                  ) : (
                    <span className="btn-text">Поиск</span>
                  )}
                </button>
              </div>
              <div className="location-buttons">
                <button onClick={getCurrentLocation} className="location-btn">
                  📍 Моё местоположение
                </button>
              </div>
            </div>
            
            <div className="weather-widget">
              {loading ? (
                <div className="weather-loading">
                  <div className="spinner"></div>
                  <p>Загрузка данных о погоде...</p>
                </div>
              ) : error ? (
                <div className="weather-error">
                  <div className="error-icon">⚠️</div>
                  <h4>Ошибка загрузки</h4>
                  <p>{error}</p>
                  <button onClick={() => loadWeather('Moscow')} className="retry-btn">
                    Попробовать снова
                  </button>
                </div>
              ) : weatherData && (
                <div className="weather-content">
                  <div className="current-weather">
                    <div className="location-info">
                      <h3 className="city-name">{weatherData.location.name}</h3>
                      <div className="country">{weatherData.location.country}</div>
                      <div className="date">{formatDate(weatherData.location.localtime)}</div>
                    </div>
                    
                    <div className="weather-main">
                      <div className="temperature-section">
                        <div className="temperature">{Math.round(weatherData.current.temperature)}°C</div>
                        <div className="feels-like">Ощущается как: {Math.round(weatherData.current.feelslike)}°C</div>
                      </div>
                      <div className="weather-icon-container">
                        {weatherData.current.weather_icons?.[0] && (
                          <img 
                            src={weatherData.current.weather_icons[0]} 
                            alt={weatherData.current.weather_descriptions?.[0] || ''} 
                            className="weather-icon"
                          />
                        )}
                        {weatherData.current.weather_descriptions?.[0] && (
                          <div className="weather-desc">{weatherData.current.weather_descriptions[0]}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="weather-details-grid">
                    <div className="detail-card">
                      <div className="detail-icon">💧</div>
                      <div className="detail-info">
                        <div className="detail-label">Влажность</div>
                        <div className="detail-value">{weatherData.current.humidity}%</div>
                      </div>
                    </div>
                    
                    <div className="detail-card">
                      <div className="detail-icon">💨</div>
                      <div className="detail-info">
                        <div className="detail-label">Ветер</div>
                        <div className="detail-value">{weatherData.current.wind_speed} км/ч</div>
                      </div>
                    </div>
                    
                    <div className="detail-card">
                      <div className="detail-icon">🌡️</div>
                      <div className="detail-info">
                        <div className="detail-label">Давление</div>
                        <div className="detail-value">{weatherData.current.pressure} гПа</div>
                      </div>
                    </div>
                    
                    <div className="detail-card">
                      <div className="detail-icon">👁️</div>
                      <div className="detail-info">
                        <div className="detail-label">Видимость</div>
                        <div className="detail-value">{weatherData.current.visibility} км</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Weather;