import React, { useState, useEffect } from "react";
import "./currency.css"; // если есть css

interface Rates {
  [currency: string]: number;
}

const Currency: React.FC = () => {
  const [base, setBase] = useState("EUR");  // базовая валюта, можно по умолчанию EUR
  const [date, setDate] = useState("");    // дата в формате YYYY-MM-DD или пусто
  const [rates, setRates] = useState<Rates>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Для установки max-значения для input date (сегодняшняя дата)
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (!date) setDate(today);
  }, [date]);

  async function loadRates() {
    setLoading(true);
    setError(null);
    try {
      const url = date
        ? `https://api.frankfurter.app/${date}?from=${base}`
        : `https://api.frankfurter.app/latest?from=${base}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setRates(data.rates);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки");
      setRates({});
    } finally {
      setLoading(false);
    }
  }

  // Загрузка при изменении base или date
  useEffect(() => {
    loadRates();
  }, [base, date]);

  return (
    <div className="currency-container">
      <h1>Конвертер валют</h1>
      
      <div className="controls">
        <label>
          Базовая валюта:{" "}
          <input 
            type="text" 
            value={base} 
            onChange={(e) => setBase(e.target.value.toUpperCase())} 
            maxLength={3} 
            style={{textTransform: "uppercase"}}
          />
        </label>

        <label>
          Дата:{" "}
          <input 
            type="date" 
            value={date} 
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)} 
          />
        </label>

        <button onClick={loadRates} disabled={loading}>
          {loading ? "Загрузка..." : "Обновить"}
        </button>
      </div>

      {error && <div className="error-message">Ошибка: {error}</div>}

      <table id="currency-table">
        <thead>
          <tr>
            <th>Валюта</th>
            <th>Курс</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(rates).slice(0, 50).map(([currency, rate]) => (
            <tr key={currency}>
              <td>{currency}</td>
              <td>{rate.toFixed(4)}</td>
            </tr>
          ))}

          {!loading && Object.keys(rates).length === 0 && !error && (
            <tr>
              <td colSpan={2}>Нет данных</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Currency;
