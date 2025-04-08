import React from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import MainProducts from "./MainProducts";

const FlipkartLanding = () => {
    return (
      <div className="bg-gray-100 w-[100vw]">
        <HeroSection />
        <MainProducts/>
      </div>
    );
  };
  
  export default FlipkartLanding;
  