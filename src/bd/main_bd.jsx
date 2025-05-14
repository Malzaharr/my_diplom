import React, { useState, useEffect, useCallback } from 'react';
import './style_bd.css';

function Bd() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTable, setActiveTable] = useState(null);
    const [priceFilter, setPriceFilter] = useState('');
    const [newRecord, setNewRecord] = useState({});
    const [editingRow, setEditingRow] = useState(null);
    const [editedValues, setEditedValues] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [deliveryAddresses, setDeliveryAddresses] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [orderFormValues, setOrderFormValues] = useState({
        user_id: '',
        delivery_address_id: '',
    });
    const [filterColumn, setFilterColumn] = useState('');
    const [notifications, setNotifications] = useState([]);

    const fetchData = useCallback(async (table) => {
        setLoading(true);
        setError(null);
        setActiveTable(table);

        try {
            let url = `http://localhost:3000/${table}`;
            if (table === 'users' && searchTerm) {
                url = `http://localhost:3000/users/search?email=${searchTerm}`;
            }
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setData(data);

            if (data && data.length > 0) {
                const keys = Object.keys(data[0]);
                const initialNewRecord = {};
                keys.forEach(key => {
                    initialNewRecord[key] = '';
                });
                setNewRecord(initialNewRecord);
            } else {
                setNewRecord({});
            }
        } catch (error) {
            console.error(`Failed to fetch ${table}:`, error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        if (activeTable) {
            fetchData(activeTable);
        }
    }, [activeTable, fetchData]);

    const handleFieldChange = (event, row, key) => {
        setEditedValues(prev => ({
            ...prev,
            [row.id]: {
                ...prev[row.id],
                [key]: event.target.value,
            },
        }));
    };

    const handleEditClick = (row) => {
        setEditingRow(row.id);
        setEditedValues(prev => ({
            ...prev,
            [row.id]: { ...row },
        }));
    };

    const handleCancelClick = () => {
        setEditingRow(null);
        setEditedValues({});
    };

    const handleDeleteClick = async (row) => {
        try {
            const response = await fetch(`http://localhost:3000/delete/${activeTable}/${row.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.error) {
                    alert(errorData.error);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Item deleted:', result);
            fetchData(activeTable);
            setEditingRow(null);
            setEditedValues({});
        } catch (error) {
            console.error('Error deleting item:', error);
            setError(error);
        }
    };

    const handleSaveClick = async (row) => {
        try {
            const updateData = editedValues[row.id];
            console.log("Saving data:", activeTable, updateData);

            const response = await fetch(`http://localhost:3000/update/${activeTable}/${row.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.error) {
                    alert(errorData.error);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Record updated:', result);
            fetchData(activeTable);
            setEditingRow(null);
            setEditedValues(prev => {
                const { [row.id]: deletedKey, ...rest } = prev;
                return rest;
            });
        } catch (error) {
            console.error('Error updating record:', error);
            setError(error);
        }
    };

    const handleAddRecord = async () => {
        try {
            console.log("Sending data:", activeTable, newRecord);
            const response = await fetch(`http://localhost:3000/add/${activeTable}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRecord),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.error) {
                    alert(errorData.error);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('New record added:', result);
            fetchData(activeTable);
            setNewRecord({});
        } catch (error) {
            console.error('Error adding new record:', error);
            setError(error);
        }
    };

    // Фильтрация по цене (только для таблицы products)
    const handlePriceFilter = async () => {
        if (activeTable === 'products') {
            try {
                const response = await fetch(`http://localhost:3000/products/below/${priceFilter}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setData(data);
            } catch (error) {
                console.error('Error filtering by price:', error);
                setError(error);
            }
        } else {
            alert('Price filter is only applicable to the "Products" table.');
        }
    };

    // Фильтрация по столбцу
    const handleColumnFilter = async () => {
        if (activeTable && filterColumn && searchTerm) {
            try {
                const url = `http://localhost:3000/${activeTable}/search?column=${filterColumn}&value=${searchTerm}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setData(data);
            } catch (error) {
                console.error('Error filtering by column:', error);
                setError(error);
            }
        } else {
            alert('Please select a table, a column, and enter a search term.');
        }
    };

    const renderTable = () => {
        if (!data || data.length === 0) {
            return <p>No data available for {activeTable}.</p>;
        }

        const keys = Object.keys(data[0]);

        return (
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            {keys.map(key => (
                                <th key={key}>{key}</th>
                            ))}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                {keys.map(key => (
                                    <td key={key}>
                                        {editingRow === row.id ? (
                                            <input
                                                type="text"
                                                name={key}
                                                value={editedValues[row.id]?.[key] || ''}
                                                onChange={(event) => handleFieldChange(event, row, key)}
                                                className="edit-input"
                                            />
                                        ) : (
                                            row[key] == null ? 'NULL' : row[key]
                                        )}
                                    </td>
                                ))}
                                <td>
                                    {editingRow === row.id ? (
                                        <>
                                            <button onClick={() => handleSaveClick(row)} className="save-button">Save</button>
                                            <button onClick={handleCancelClick} className="cancel-button">Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleEditClick(row)} className="edit-button">Edit</button>
                                            <button onClick={() => handleDeleteClick(row)} className="delete-button">Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {/* Строка для добавления новой записи */}
                        <tr>
                            {keys.map(key => (
                                <td key={key}>
                                    <input
                                        type="text"
                                        name={key}
                                        value={newRecord[key] || ''}
                                        onChange={(e) => {
                                            setNewRecord({ ...newRecord, [key]: e.target.value });
                                        }}
                                        className="add-input"
                                    />
                                </td>
                            ))}
                            <td>
                                <button onClick={handleAddRecord} className="add-button">Add</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };


    // Получение списка товаров и адресов доставки при монтировании компонента
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:3000/products');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const productsData = await response.json();
                setProducts(productsData);
                // Инициализируем quantities нулями для каждого товара
                const initialQuantities = {};
                productsData.forEach(product => {
                    initialQuantities[product.id] = 1; // Начальное количество 1 для каждого товара
                });
                setQuantities(initialQuantities);

            } catch (error) {
                console.error('Error fetching products:', error);
                setError(error);
            }
        };

        const fetchDeliveryAddresses = async () => {
            try {
                const userId = 1; // ЗАМЕНИТЬ НА ID ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
                const response = await fetch(`http://localhost:3000/delivery_addresses?user_id=${userId}`); // Параметр user_id для фильтрации
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const addressesData = await response.json();
                setDeliveryAddresses(addressesData);
            } catch (error) {
                console.error('Error fetching delivery addresses:', error);
                setError(error);
            }
        };

        fetchProducts();
        fetchDeliveryAddresses();
    }, []);

    const handleQuantityChange = (productId, newQuantity) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: newQuantity,
        }));
    };

    const handleOrderFormChange = (event) => {
        const { name, value } = event.target;
        setOrderFormValues(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddProductToOrder = (productId) => {
        setOrderItems(prevItems => [...prevItems, productId]);
    };

    const handleRemoveProductFromOrder = (productId) => {
        setOrderItems(prevItems => prevItems.filter(id => id !== productId));
    };

    const handleSubmitOrder = async (event) => {
        event.preventDefault();

        if (!orderFormValues.user_id || !orderFormValues.delivery_address_id || orderItems.length === 0) {
            alert("Please select a user, a delivery address, and add at least one product.");
            return;
        }

        try {
            // 1. Рассчитываем общую сумму заказа на клиенте
            let total = 0;
            for (const productId of orderItems) {
                const product = products.find(p => p.id === productId);
                const quantity = quantities[productId] || 1; // 1 по умолчанию
                total += product.price * quantity;
            }

            // 2. Создаем заказ в таблице `orders`
            const orderResponse = await fetch('http://localhost:3000/add/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: orderFormValues.user_id,
                    delivery_address_id: orderFormValues.delivery_address_id,
                    total: total,
                }),
            });

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json();
                alert(`Error creating order: ${errorData.error}`);
                return;
            }
            const orderData = await orderResponse.json();
            const orderId = orderData.id;

            // 3. Добавляем товары в таблицу `order_items`
            for (const productId of orderItems) {
                const quantity = quantities[productId] || 1; // 1 по умолчанию
                const orderItemResponse = await fetch('http://localhost:3000/add/order_items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        order_id: orderId,
                        product_id: productId,
                        quantity: quantity,
                    }),
                });
                if (!orderItemResponse.ok) {
                    const errorData = await orderItemResponse.json();
                    alert(`Error adding order item: ${errorData.error}`);
                    // Возможно, откатить заказ, если добавление товара не удалось (транзакция)
                    return;
                }
            }

            alert('Order created successfully!');
            setShowOrderForm(false);
            setOrderItems([]);
            setQuantities({}); // Reset quantities
            setOrderFormValues({ user_id: '', delivery_address_id: '' }); // Сбрасываем форму
            fetchData('orders');
        } catch (error) {
            console.error('Error submitting order:', error);
            setError(error);
        }
    };

    // Получение уведомлений
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('http://localhost:3000/order_expiration_notifications');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const notificationsData = await response.json();
                setNotifications(notificationsData);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setError(error);
            }
        };

        fetchNotifications();

        // Обновлять уведомления каждые 5 секунд (или как вам нужно)
        const intervalId = setInterval(fetchNotifications, 5000);

        return () => clearInterval(intervalId); // Очистка интервала при размонтировании компонента
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Wildberries Database Viewer</h1>
            </header>

            <nav className="table-selector">
                <button onClick={() => setActiveTable('users')}>Users</button>
                <button onClick={() => setActiveTable('products')}>Products</button>
                <button onClick={() => setActiveTable('orders')}>Orders</button>
                <button onClick={() => setActiveTable('categories')}>Categories</button>
                <button onClick={() => setActiveTable('brands')}>Brands</button>
                <button onClick={() => setActiveTable('delivery_addresses')}>Delivery Addresses</button>
                <button onClick={() => setActiveTable('order_items')}>Order Items</button>
                <button onClick={() => setActiveTable('reviews')}>Reviews</button>
                <button onClick={() => setActiveTable('payment_methods')}>Payment Methods</button>
                <button onClick={() => setActiveTable('tovar')}>Promotions</button>
            </nav>

            <main className="content">
                {loading && <div>Loading...</div>}
                {error && <div>Error: {error.message}</div>}

                {/* Фильтрация и поиск только для таблицы Users */}
                {activeTable === 'users' && (
                    <div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Email"
                        />
                    </div>
                )}

                {activeTable === 'products' && (
                    <div>
                        <input
                            type="number"
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value)}
                            placeholder="Max Price"
                        />
                        <button onClick={handlePriceFilter}>Filter by Price</button>
                    </div>
                )}

                {/* Общий фильтр по столбцу */}
                {activeTable && (
                    <div>
                        <select value={filterColumn} onChange={(e) => setFilterColumn(e.target.value)}>
                            <option value="">Select Column</option>
                            {activeTable && data && data.length > 0 &&
                                Object.keys(data[0]).map(key => (
                                    <option key={key} value={key}>{key}</option>
                                ))
                            }
                        </select>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search Term"
                        />
                        <button onClick={handleColumnFilter}>Filter</button>
                    </div>
                )}

                {activeTable && data && renderTable()}

                {/* Кнопка для отображения формы заказа */}
                <button onClick={() => setShowOrderForm(true)} className="add-order-button">Create Order</button>

                {/* Форма создания заказа */}
                {showOrderForm && (
                    <div className="order-form">
                        <h2>Create Order</h2>
                        <form onSubmit={handleSubmitOrder}>
                            <div>
                                <label htmlFor="user_id">User:</label>
                                <select id="user_id" name="user_id" value={orderFormValues.user_id} onChange={handleOrderFormChange} required>
                                    <option value="">Select User</option>
                                    {data && activeTable === 'users' && data.map(user => (
                                        <option key={user.id} value={user.id}>{user.email}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="delivery_address_id">Delivery Address:</label>
                                <select id="delivery_address_id" name="delivery_address_id" value={orderFormValues.delivery_address_id} onChange={handleOrderFormChange} required>
                                    <option value="">Select Address</option>
                                    {deliveryAddresses.map(address => (
                                        <option key={address.id} value={address.id}>{address.address_line_1}, {address.city}, {address.zip_code}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label>Products:</label>
                                <div className="products-list">
                                    {products.map(product => (
                                        <div key={product.id} className="product-item">
                                            <span>{product.name} - ${product.price}</span>
                                            <input
                                                type="number"
                                                min="1"
                                                value={quantities[product.id] || 1}
                                                onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                                                className="quantity-input"
                                            />
                                            <button type="button" onClick={() => handleAddProductToOrder(product.id)} disabled={orderItems.includes(product.id)} className="add-product-button">Add</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label>Selected Products:</label>
                                <div className="selected-products">
                                    {orderItems.map(productId => {
                                        const product = products.find(p => p.id === productId);
                                        return (
                                            <div key={productId} className="selected-product-item">
                                                <span>{product ? `${product.name} (Qty: ${quantities[productId] || 1})` : `Product ID: ${productId}`}</span>
                                                <button type="button" onClick={() => handleRemoveProductFromOrder(productId)} className="remove-product-button">Remove</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <button type="submit" className="submit-order-button">Create Order</button>
                            <button type="button" onClick={() => setShowOrderForm(false)} className="cancel-order-button">Cancel</button>
                        </form>
                    </div>
                )}
            </main>

            {/* Отображение уведомлений */}
            <div className="notifications-container">
                {notifications.map(notification => (
                    <div key={notification.id} className="notification">
                        {notification.message}
                    </div>
                ))}
            </div>

            <footer className="App-footer">
                <p>&copy; {new Date().getFullYear()} Wildberries Database App</p>
            </footer>
        </div>
    );
}

export default Bd;