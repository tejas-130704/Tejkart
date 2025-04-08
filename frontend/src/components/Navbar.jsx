import { FaShoppingCart, FaSearch, FaUser } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { Menu, MenuItem, MenuButton, SubMenu } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import { ToastContainer, toast } from 'react-toastify';
import '@szhsin/react-menu/dist/transitions/zoom.css';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const Navbar = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState({});
  const [search, setSearch] = useState("");
  const notify = (message) => toast(message);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('access') !== null) {
      setIsAuth(true);
    }
  }, [isAuth]);

  const searchRecords = () => {
    if (search.trim()) {
      console.log("Searching for:", search);
      navigate(`/search/${search}`);

      // Add your search logic here...
    } else {
      notify("The field is empty...!!");
    }
  }

  useEffect(() => {
    // Check if data exists in sessionStorage
    const storedCategories = sessionStorage.getItem("categories");
  

    if (storedCategories) {

      console.log("Loading categories from session storage...");
      setCategories(JSON.parse(storedCategories));
    } else {
      console.log("Fetching categories from API...");
      fetch("http://127.0.0.1:8000/api/landing/")
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Fetched Data:", data);

          if (data?.safe && data?.category_data) {
            setCategories(data.category_data);
            sessionStorage.setItem("categories", JSON.stringify(data.category_data));
          } else {
            console.error("Data is not properly formatted!");
          }
        })
        .catch((error) => console.error("Error fetching categories:", error));
    }

  }, []);

  return (
    <div className="w-[100vw] flex gap-0 flex-col border-b-[0.5px] border-gray-300">
      <ToastContainer />
      <nav className="bg-blue-600 p-4 flex justify-between items-center text-white w-full px-24">
        <Link to="/">
          <div>
            <div className="text-2xl font-bold text-white italic">Tejkart</div>
            <div className="text-sm  text-gray-200">Explore, <span className="text-yellow-300 font-bold">Plus</span></div>
          </div>
        </Link>
        <div className="flex items-center bg-white text-black p-2 rounded-md w-1/2">
          <FaSearch className="text-gray-500 mr-2" />
          <form onSubmit={(e) => { e.preventDefault(); searchRecords(); }} className="w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for products"
              className="w-full outline-none border border-gray-300 rounded-md px-4 py-2"
            />
          </form>
        </div>
        <div className="flex items-center gap-6 text-base font-medium align-middle justify-center ">

          {isAuth ? (
            <>
              {/* <Link to="/" className="text-red-500 hover:text-red-600 transition">
                Logout
              </Link> */}
              <Link to="/cart/" className="flex items-center gap-2  transition border-[1px]  text-white px-4 py-2 rounded-lg hover:bg-blue-900 duration-300">
                <FaShoppingCart /> Cart
              </Link>
              <Link to="/profile/" className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition">
                <FaUser className="text-gray-700" />
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-6 text-gray-600">
              <Link
                to="/login/"
                className="text-white border-[1px] flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition duration-200"
              >
                <FaUser className="text-lg" />
                <span className="font-medium">Login</span>
              </Link>
              <Link
                to="/register/"
                className="text-white border-[1px] flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition duration-200"
              >
                <FaUser className="text-lg" />
                <span className="font-medium">Register</span>
              </Link>
            </div>

          )}

        </div>
      </nav>
      <nav>
        <ul className="flex justify-evenly m-6">
          {Object.keys(categories).map((mainCategory) => (
            <li key={mainCategory} className="bg-white py-2 px-4 shadow-md rounded-md text-center font-semibold hover:bg-blue-500 hover:text-white transition" >

              <Menu menuButton={<MenuButton>{mainCategory}</MenuButton>}>
                <div className="max-h-[60vh] overflow-y-scroll">

                  {Object.keys(categories[mainCategory]).map((subCategory) => (
                    <Link key={subCategory} className="text-black" to={`/products_list/${subCategory}`}>
                      <MenuItem>{subCategory}</MenuItem>
                    </Link>
                  ))}
                </div>
              </Menu>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;