import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import ProductsListing from './components/ProductsListing'
import FlipkartLanding from './components/FlipkartLanding'
import Navbar from "./components/Navbar";
import ProductDetails from "./components/ProductDetails";
import SearchProduct from './components/SearchProduct';

import { AuthProvider } from './components/AuthContext';

import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import ShoppingCart from './components/ShoppingCart';
import Footer from './components/Footer';
import ProductsListingByArt from './components/ProductsListingByArt';


function App() {


  return (
    <>
    <AuthProvider>

      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<FlipkartLanding />} />
          <Route path="/products_list/:product" element={<ProductsListing />} />
          <Route path="/products_list_article/:product" element={<ProductsListingByArt />} />
          <Route path="/product/:productid" element={<ProductDetails />} />
          <Route path="/search/:search" element={<SearchProduct />} />
          <Route path="/login/" element={<Login />} />
          <Route path="/register/" element={<Register />} />
          <Route path="/profile/" element={<Profile />} />
          <Route path="/cart/" element={<ShoppingCart />} />
        </Routes>
        <Footer/>
      </Router>
    </AuthProvider>
    </>
  )
}

export default App
