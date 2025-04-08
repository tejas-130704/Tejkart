import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useContext } from 'react';
import { AuthContext } from './AuthContext';


const ShoppingCart = () => {
  
  const [allcartItems, setallCartItems] = useState([]);

  const subtotal = Array.isArray(allcartItems)
    ? allcartItems.reduce((acc, item) => acc + item.price * item.cart_quantity, 0)
    : 0;
  

    const shipping = 5.0;
    const tax = 8.32;
  
  
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
  
    if (!token) {
      window.location.href = "/login/";
    } else {
      setIsAuth(true);
    }
  }, []);
  
    
    
    const total = subtotal + shipping + tax;
    
   

  const getCart = () => {
    const token = localStorage.getItem("access");
    fetch("http://127.0.0.1:8000/api/getcart/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,  // Send JWT token
      },
    })
      .then((response) => {
        // setallCartItems(response.body)
        return response.json();
      })
      .then((data) => {
        console.log(data)
        console.log("Details of Cart:", data.response)
        setallCartItems(data.response)
      }).catch((error) => {
        console.error("Error Fetching Data:", error);
      })
      .finally(() => { });

  };

  const deleteCartProduct = (productid) => {
    const quantity = 1;
    const token = localStorage.getItem("access");
    fetch("http://127.0.0.1:8000/api/deleteCart/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,  // Send JWT token
      },
      body: JSON.stringify({ quantity, productid }),
    })
      .then((response) => {
        console.log(response.response)
        getCart();
        return response.json();
      }).catch((error) => {
        console.error("Error Fetching Data:", error);
      })
      .finally(() => {});
  }

 useEffect(()=>{
  getCart();
 },[])

  return (
    <div className="p-6 md:p-10 mx-10">
      <h1 className="text-3xl font-bold mb-10">Shopping Cart</h1>

      <div className="grid md:grid-cols-3 gap-15">
        <div className="md:col-span-2 space-y-8">

          {(Array.isArray(allcartItems) &&  allcartItems.length > 0 ) ? (
            allcartItems.map((item, index) => (
              <div key={index} className="flex gap-4 border-b pb-4">
                <img src={item.link} alt={item.name} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <h2 className="font-medium">{item.productDisplayName
                  }</h2>
                  {item.baseColour && (
                    <p className="text-sm text-gray-500">
                      {item.articleType} | {item.baseColour}
                    </p>
                  )}
                  {item.material && <p className="text-sm text-gray-500">Material: {item.material}</p>}
                  {item.description && <p className="text-sm text-gray-700 mt-1">{item.description}</p>}
                  <p className="text-sm ">${item.price.toFixed(2)}</p>
                  <p className="text-sm ">Quantity : {item.cart_quantity}</p>
                  <p
                    className={`text-sm mt-1 text-green-600`}
                  >
                    In Stock
                  </p>
                </div>
                <div className="h-fit mt-2 flex gap-3">
                  <button 
                  onClick={()=>{
                    deleteCartProduct(item.id);
                  }}
                  className="p-2 rounded-md border border-gray-300 hover:bg-red-100 transition-colors duration-200 flex items-center justify-center">
                    <MdDelete className="text-red-500" size={18} />
                  </button>

                  <button
                    onClick={() => {
                      window.location.href = `/product/${item.id}`;
                    }}
                    className="p-2 rounded-md border border-gray-300 hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center"
                  >
                    <FaRegEye className="text-blue-600" size={18} />
                  </button>
                </div>
              </div>
            ))) : ("No items in cart")}
        </div>

{(Array.isArray(allcartItems) &&  allcartItems.length > 0 )? (
        <div className="border rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Order summary</h2>
          <div className="flex justify-between text-sm mb-2">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>Shipping estimate</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span>Tax estimate</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base mb-4">
            <span>Order total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-md">
            Checkout
          </button>
        </div>):
        ("")}
      </div>
    </div>
  );
};

export default ShoppingCart;
