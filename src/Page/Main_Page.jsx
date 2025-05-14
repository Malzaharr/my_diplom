import Header from "./Page";
import Feedback from "../Items/FeedBack";
import "./Main_Page.css";
import Card from "./Card";
import Main_Card_Product from "./Main_Card_Product";
import React, { useState, useEffect } from "react";

export default function Main_Page() {
  const [tab, setTab] = useState("main");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]); // Состояние корзины

  const addToCart = (product) => {
    // Проверяем, есть ли товар уже в корзине
    const existingItemIndex = cart.findIndex((item) => item.id === product.id);

    if (existingItemIndex !== -1) {
      // Если товар уже есть, увеличиваем количество (можно изменить логику)
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // Если товара нет, добавляем его в корзину
      setCart([...cart, { ...product, quantity: 1 }]); // Добавляем свойство quantity
    }
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("api/get_products.php"); // Замените на ваш API
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return <p>Загрузка товаров...</p>;
  }

  if (error) {
    return <p>Ошибка при загрузке товаров: {error.message}</p>;
  }

  return (
    <div>
      <Header activeTab={tab} onTabChange={setTab} />
      <main>
        {tab === "main" && (
          <>
            <Card />
            <h1 style={{ fontSize: "1.5rem" }}>Главная страница:</h1>
            <div className="card-grid">
              {products.map((product) => (
                <Main_Card_Product
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart} // Передаем функцию
                />
              ))}
            </div>
          </>
        )}

        {/* {tab === "feedback" && (
          <>
            <Feedback />
          </>
        )} */}

        {tab === "feedback" && ( // Отображение корзины
          <div>
            <h2>Корзина</h2>
            {cart.length === 0 ? (
              <p>Корзина пуста.</p>
            ) : (
              <ul>
                {cart.map((item) => (
                  <li key={item.id}>
                    {item.name} - ${item.price} - Количество: {item.quantity}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}