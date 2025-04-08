import { FaShoppingCart, FaSearch, FaUser } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { Menu, MenuItem, MenuButton, SubMenu } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import { ToastContainer, toast } from 'react-toastify';
import '@szhsin/react-menu/dist/transitions/zoom.css';
import { Link } from "react-router-dom";


const MainProducts = () => {
    const [products, setProducts] = useState([]);
    useEffect(() => {

          fetch("http://127.0.0.1:8000/api/products/")
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              console.log("Fetched Data:", data);
    
              if (data?.safe && data?.products) {
                setProducts(data.products);
                console.log("Products are here now:", data.products);
              } else {
                console.error("Data is not properly formatted!");
              }
            })
            .catch((error) => console.error("Error fetching categories:", error));
       
      }, []);

  return (
    <div className="w-[100vw] flex gap-0 flex-col border-b-[0.5px] border-gray-300 mt-10">
        <div className="p-4 space-y-10">
                {Object.entries(products).map(([category, items]) => (
                  <div key={category} className="w-full bg-white">
                    <div className="w-[95vw] mx-auto pt-5 px-10 rounded-2xl">
                      <div className="">
                        <h2 className="text-3xl font-bold mb-2">{category}</h2>
                        <div className="w-full mx-auto flex py-4 gap-4 overflow-x-auto whitespace-nowrap my-horizontal-scroll">
        
                          {items.map((item, index) => (
        
                            <Link key={index} className="w-[220px] flex-shrink-0 p-4 rounded-lg shadow-md" to={`/products_list_article/${item.articleType}`}>
                              <img src={item.link} alt={item.productDisplayName} className="w-full h-40 object-cover mb-2 rounded-md" />
                              <h3 className="font-medium text-wrap text-center">{item.articleType}</h3>
                            </Link>
        
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
    </div>
  )
}

export default MainProducts