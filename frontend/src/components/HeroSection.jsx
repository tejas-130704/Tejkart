import React, { useState } from "react";
import { useEffect } from "react";
import { TECarousel, TECarouselItem } from "tw-elements-react";
import hero_section01 from "../assets/images/hero_section01.webp";
import hero_section02 from "../assets/images/hero_section02.webp";
import hero_section03 from "../assets/images/hero_section03.webp";
import hero_section04 from "../assets/images/hero_section04.webp";
import { Link } from "react-router-dom";

const heros = [
    {
        img: hero_section01,
        title: "First slide label",
        content: "Some representative placeholder content for the first slide."
    },
    {
        img: hero_section02,
        title: "Second slide label",
        content: "Some representative placeholder content for the second slide."
    },
    {
        img: hero_section03,
        title: "Third slide label",
        content: "Some representative placeholder content for the third slide."
    },
    {
        img: hero_section04,
        title: "Fourth slide label",
        content: "Some representative placeholder content for the Fourth slide."
    }
];

const HeroSection = () => {
    const [UserInterests, setUserInterests] = useState([]);
    useEffect(() => {
        get_user_interests();
    }, [])

    const get_user_interests = () => {
        console.log("In User intrest fethcing");
        const token = localStorage.getItem("access");
        if (token !== null) {

            fetch("http://127.0.0.1:8000/api/landing_user_int/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,  // Send JWT token
                },
            })
                .then((response) => {

                    return response.json();
                })
                .then((data) => {
                    console.log(data)
                    console.log("User_interest:", data.product_list);
                    if (data.status === 401) {
                        console.log("Unauthorized access. Please log in again.");
                    }
                    setUserInterests(data.product_list)
                })
                .catch((error) => {
                    console.error("Error:", error);
                })
                .finally(() => { });
        }
    }

    return (
        <>
            <div className="bg-yellow-400  text-center text-3xl font-bold text-gray-900">
                <TECarousel ride="carousel">
                    <div className="relative w-full overflow-hidden after:clear-both after:block after:content-['']">
                        {heros.map((hero, index) => (
                            <TECarouselItem
                                key={index}
                                itemID={index + 1} // Numerical IDs for compatibility
                                className="relative float-left -mr-[100%] w-full transition-transform duration-[600ms] ease-in-out motion-reduce:transition-none"// Ensure the first slide is visible initially
                            >
                                <img src={hero.img} className="block w-full" alt={hero.title} />
                            </TECarouselItem>
                        ))}
                    </div>
                </TECarousel>
            </div>
            <div>
                {UserInterests && UserInterests.length > 0 ? (
                    <div className="w-[100vw] mx-auto pt-10 px-8">
                        <div className="bg-white p-6 rounded-2xl">
                            <>
                                <h2 className="text-3xl font-bold mb-2">Your Interest</h2>
                                <div className="w-full flex py-4 gap-4 overflow-x-auto whitespace-nowrap my-horizontal-scroll">
                                    {UserInterests.map((item, index) => (
                                        <Link
                                            key={index}
                                            className="w-[220px] flex-shrink-0 border border-gray-200 p-4 rounded-lg shadow-md"
                                            to={`/product/${item.id}`}
                                        >
                                            <img
                                                src={item.link}
                                                alt={item.productDisplayName}
                                                className="w-full h-40 object-cover mb-2 rounded-md"
                                            />
                                            <h3 className="font-medium text-wrap">{item.productDisplayName}</h3>
                                            <h3 className="font-medium text-2xl text-black">₹ {item.discountedPrice}</h3>
                                            <p className="text-sm text-gray-600">{item.baseColour}</p>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        </div>

                    </div>
                ) : (
                    <p className="text-gray-500"></p>
                )}
            </div>
        </>
    );
};

export default HeroSection;
