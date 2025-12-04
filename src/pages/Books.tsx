import React, { useState, useEffect } from "react";
import "./books.css";

interface Book {
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  edition_count?: number;
}

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = "https://openlibrary.org";

  // ===========================================
  // Загрузка ТОПа книг при открытии
  // ===========================================
  useEffect(() => {
    loadTopBooks();
  }, []);

  async function loadTopBooks() {
    setLoading(true);
    setError(null);
    setBooks([]);

    try {
      const res = await fetch(`${BASE_URL}/search.json?subject=fiction`);

      if (!res.ok) throw new Error("Ошибка загрузки данных");

      const data = await res.json();

      if (!data.docs || data.docs.length === 0) {
        setError("Не удалось загрузить книги");
        return;
      }

      const top = data.docs
        .sort((a: Book, b: Book) => (b.edition_count || 0) - (a.edition_count || 0))
        .slice(0, 12);

      setBooks(top);
    } catch (err: any) {
      setError(err.message || "Непредвиденная ошибка");
    } finally {
      setLoading(false);
    }
  }

  // ===========================================
  // Поиск книги по названию
  // ===========================================
  async function searchBooks() {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setBooks([]);

    try {
      const res = await fetch(
        `${BASE_URL}/search.json?title=${encodeURIComponent(query)}`
      );

      if (!res.ok) throw new Error("Ошибка запроса");

      const data = await res.json();

      if (!data.docs || data.docs.length === 0) {
        setError("Ничего не найдено. Попробуйте другое название.");
        return;
      }

      setBooks(data.docs.slice(0, 12));
    } catch (err: any) {
      setError(err.message || "Непредвиденная ошибка");
    } finally {
      setLoading(false);
    }
  }

  // ===========================================
  // Рендер
  // ===========================================
  return (
    <div className="books-container">
      <h1 className="header">Библиотека</h1>

      {/* Поле ввода + кнопка */}
      <fieldset>
        <input
          type="text"
          placeholder="Введите название книги на английском"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button onClick={searchBooks}>Enter</button>
      </fieldset>

      <button
        id="info"
        onClick={() =>
          alert(
            "Для использования введите название книги на английском и нажмите Enter"
          )
        }
      >
        Справка
      </button>

      {/* Ошибки */}
      {error && <div className="load">{error}</div>}

      {/* Загрузка */}
      {loading && <div className="load">Загрузка данных...</div>}

      {/* Список книг */}
      <ul id="result">
        {!loading &&
          books.map((book, i) => {
            const img = book.cover_i
              ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
              : "img.png";

            return (
              <li className="card" key={i}>
                <img src={img} alt={book.title} />

                <div className="info_card">
                  <span>{book.title}</span>
                  <span>Автор: {book.author_name?.join(", ")}</span>
                  <span>Год публикации: {book.first_publish_year}</span>
                </div>
              </li>
            );
          })}
      </ul>

      <footer>
        <h3>Дополнительно</h3>
        <a href="https://openlibrary.org/" target="_blank">
          Найдите больше информации о книгах
        </a>
      </footer>
    </div>
  );
};

export default Books;
