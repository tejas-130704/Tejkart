// SearchProduct.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

const SearchProduct = () => {
  const { search } = useParams();
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true); // To handle loading state

  useEffect(() => {
    console.log("Fetching products from API...");

    setLoading(true); // Start loading
    // sessionStorage.removeItem(`${product}`); // Ensure old data is cleared

    const storedData = sessionStorage.getItem(search);

    if (storedData) {
      console.log("Data found in session storage, using cached data.");
      setProductData(JSON.parse(storedData));
      setLoading(false);
    } else {
        setProductData({})
      fetch(`http://127.0.0.1:8000/api/search/${search}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Fetched Data:", data);

          if (data?.safe && data?.products_data) {
            setProductData([]); // Clear previous state first
            setTimeout(() => {
              setProductData(data.products_data); // Update state properly
              sessionStorage.setItem(`${search}`, JSON.stringify(data.products_data));
            }, 0);
          } else {
            console.error("Data is not properly formatted!");
            setProductData([]); // Clear state if data is invalid
          }
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
          setProductData([]); // Ensure UI updates properly on error
        })
        .finally(() => setLoading(false)); // Stop loading after fetch
    }

  }, [search]); // Runs when `product` changes

  return (
    <div className="p-6 mx-auto w-[100vw] min-h-[100vh]">
      <h2 className="text-xl font-semibold mb-4">Search for {search}</h2>

      {loading ? (
        <p>Loading...</p>
      ) : productData.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {productData.map((item, index) => (
            <Link key={index} className="border p-4 rounded-lg shadow-md" to={`/product/${item.id}`}>
              <img src={item.link} alt={item.productDisplayName} className="w-full h-40 object-cover mb-2 rounded-md" />
              <h3 className="font-medium">{item.productDisplayName}</h3>
              <h3 className="font-medium text-2xl text-black">₹ { item.discountedPrice}</h3>
              <p className="text-sm text-gray-600">{item.baseColour}</p>
              <p className="text-sm text-gray-500">{item.usage} - {item.season} {item.year}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p>No products found.</p>
      )}
    </div>
  );
};

export default SearchProduct;
