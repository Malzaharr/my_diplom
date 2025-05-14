<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173/'); // РАЗРЕШИТЬ ТОЛЬКО С ЭТОГО ДОМЕНА
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost"; // Замените на свой хост
$username = "root"; // Замените на свое имя пользователя
$password = ""; // Замените на свой пароль
$dbname = "test"; // Замените на имя своей базы данных

// Создаем соединение
$conn = new mysqli($servername, $username, $password, $dbname);

// Проверяем соединение
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// SQL-запрос
$sql = "SELECT id, name, description, price FROM products"; // Замените на свой запрос
$result = $conn->query($sql);

$products = array();

if ($result->num_rows > 0) {
    // Выводим данные каждой строки
    while($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
} else {
    echo "0 results";
}
$conn->close();

echo json_encode($products, JSON_UNESCAPED_UNICODE); // Важно!
?>