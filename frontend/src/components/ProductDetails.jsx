import { redirect, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { RiMedalLine } from "react-icons/ri";
import { CheckCircle, ShoppingCart, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';



const ProductDetails = () => {
    const { productid } = useParams();

    const [productData, setProductData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [similarProducts, setsimilarProducts] = useState([])
    const [similarProductsByCV, setsimilarProductsByCV] = useState([])
    const notify = (message) => toast(message);
    const [review, setReview] = useState("");
    const [isAuth, setIsAuth] = useState(false);
    const [ReviewList, setReviewList] = useState([]);

    useEffect(() => {
        // const token = localStorage.getItem('access_token');
        if (localStorage.getItem('access') !== null) {
            setIsAuth(true);
        }
        fetch_reviews(productid);
    }, [isAuth]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isAuth) {
            document.getElementById("review-status").innerText = "User is not Login";
            notify("Login First!!");
            return;
        }

        const token = localStorage.getItem("access"); // Get JWT token from storage

        fetch("http://127.0.0.1:8000/api/review/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,  // Send JWT token
            },
            body: JSON.stringify({ review, productid }),
        })
            .then((response) => {
                console.log(response.body)
                console.log("Review Response:", review, productid);
                // setReviewList([...ReviewList, { review }])
                fetch_reviews(productid);
                if (response.status === 401) {
                    console.log("redirect")
                    window.location.href = "/login/";
                }
                return response.json();
            }).catch((error) => {
                console.error("Error Saving Feedback:", error);
            })
            .finally(() => { });
    };


    useEffect(() => {
        console.log("Fetching products from API...");

        setLoading(true);

        const storedData = sessionStorage.getItem(productid);
        const storedSimilarData = sessionStorage.getItem(`similar${productid}`);
        const storedSimilarDataCV = sessionStorage.getItem(`similar${productid}cv`);
        const storedProductReview = sessionStorage.getItem(`review${productid}`);

        if (storedData) {
            console.log("Data found in session storage, using cached data.");
            setProductData(JSON.parse(storedData));
            setsimilarProducts(JSON.parse(storedSimilarData))
            setsimilarProductsByCV(JSON.parse(storedSimilarDataCV))


            console.log(JSON.parse(storedData))
            setLoading(false);
        } else {

            fetch(`http://127.0.0.1:8000/api/product/${productid}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Fetched Data:", data);

                    if (data?.safe && data?.product_data && data?.similar_products && data?.similar_products_by_cv) {
                        setProductData([]); // Clear previous state first
                        setsimilarProducts([])
                        setTimeout(() => {
                            setProductData(data.product_data); // Update state properly
                            setsimilarProducts(data.similar_products)
                            setsimilarProductsByCV(data.similar_products_by_cv)

                            sessionStorage.setItem(`review${productid}`, JSON.stringify(data.reviews));
                            sessionStorage.setItem(`${productid}`, JSON.stringify(data.product_data));
                            sessionStorage.setItem(`similar${productid}`, JSON.stringify(data.similar_products));
                            sessionStorage.setItem(`similar${productid}cv`, JSON.stringify(data.similar_products_by_cv));
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

    }, [productid]);


    const addToCart = async () => {
        if (!isAuth) {
            document.getElementById("review-status").innerText = "User is not Login";
            notify("Login First!!");
            return;
        }

        const token = localStorage.getItem("access"); // Get JWT token from storage
        const quantity = 1
        fetch("http://127.0.0.1:8000/api/setcart/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,  // Send JWT token
            },
            body: JSON.stringify({ quantity, productid }),
        })
            .then((response) => {
                console.log(response.body)
                console.log("Review Response:", quantity, productid);
                console.log("Added to Cart", response)
                notify("Product added to Cart Successfully!!");
                if (response.status === 401) {
                    console.log("redirect")
                    window.location.href = "/login/";
                }
                return response.json();
            }).catch((error) => {
                console.error("Error Saving Feedback:", error);
            })
            .finally(() => { });
    }

    const fetch_reviews = async (productid) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/getreviews/${productid}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetched Reviews:", data);
            setReviewList(data.response); // Update state with the latest reviews
            console.log("Updated ReviewList:", data.response);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const formatDate = (isoString) => {
        const options = { year: "numeric", month: "short", day: "numeric" };
        return new Date(isoString).toLocaleDateString(undefined, options);
      };



    return (
        <div className="min-h-[100vh]">
            <div className="w-[100vw]">
                {loading ? (
                    <p>Loading...</p>
                ) : productData.length > 0 ? (
                    <div className="flex justify-center items-center bg-gray-100 p-4">
                        <div className="max-w-4xl w-full bg-white shadow-lg rounded-xl p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Product Image */}
                                <div>
                                    <div className="flex-shrink-0">
                                        <img
                                            src={productData[0].link} // Replace with actual image URL
                                            alt="Motorola Edge 50 Pro"
                                            className="w-80 h-auto rounded-lg shadow-md"
                                        />
                                    </div>
                                    <div className="w-full flex justify-evenly gap-4 mt-4 flex-wrap">
                                        <img src={productData[0].Image_Default} alt="Image 1" className="w-[100px] h-[100px] rounded-lg shadow-md object-contain" />
                                        <img src={productData[0].Image_Front || productData[0].Image_Default} alt="Image 2" className="w-[100px] h-[100px] rounded-lg shadow-md object-contain" />
                                        <img src={productData[0].Image_Search || productData[0].Image_Default} alt="Image 3" className="w-[100px] h-[100px] rounded-lg shadow-md object-contain" />
                                        <img src={productData[0].Image_Back || productData[0].Image_Default} alt="Image 4" className="w-[100px] h-[100px] rounded-lg shadow-md object-contain" />
                                    </div>
                                </div>
                                {/* Product Info */}
                                <div className="flex flex-col justify-between w-full">
                                    <h2 className="text-2xl font-semibold text-gray-800">
                                        {productData[0].productDisplayName} ({productData[0].usage})
                                    </h2>
                                    <div className="text-green-600 text-lg font-bold flex items-center gap-2 mt-2">
                                        <CheckCircle className="w-5 h-5" /> {productData[0].myntraRating} ★ (Myntra Rating)

                                    </div>
                                    <div className="text-blue-600 text-lg font-bold flex items-center gap-2 mt-2">
                                        <RiMedalLine /> {productData[0].brandName}
                                    </div>

                                    <p className="text-2xl font-bold text-gray-900 mt-4 ">
                                        ₹ {productData[0].discountedPrice}
                                    </p>
                                    <p className="text-gray-500 line-through">
                                        ₹{productData[0].price}
                                    </p>

                                    {/** Discount Calculation **/}
                                    <p className="text-green-600 font-semibold">
                                        {Math.round(
                                            ((productData[0].price - productData[0].discountedPrice) / productData[0].price) * 100
                                        )} % Off
                                    </p>

                                    {productData[0].Description ? (
                                        <div className="mt-4">
                                            <h3 className=" text-gray-700 font-bold">Description:</h3>


                                            <p className="text-gray-600 text-sm space-y-1 mt-2">
                                                <span dangerouslySetInnerHTML={{ __html: productData[0].Description || " N/A" }} ></span>
                                            </p>
                                        </div>
                                    ) : ("")}




                                    {/* Product Details */}
                                    <div className="mt-4">
                                        <h3 className=" text-gray-700 font-bold">Product Details:</h3>


                                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 mt-2">
                                            <li className="px-2">
                                                <span className="font-bold ">Age Group:</span>
                                                <span> {productData[0].ageGroup}</span>
                                            </li>
                                            <li className="px-2">
                                                <span className="font-bold ">Material:</span>
                                                <span dangerouslySetInnerHTML={{ __html: productData[0].Material || " N/A" }} ></span>
                                            </li>
                                            <li className="px-2">
                                                <span className="font-bold ">Style:</span>
                                                <span dangerouslySetInnerHTML={{ __html: productData[0]?.Style || " N/A" }} ></span>
                                            </li>

                                        </ul>
                                    </div>

                                    {/* Buttons */}
                                    <div className="mt-6 flex gap-4">
                                        <button
                                            onClick={addToCart}
                                            className="w-full  text-gray-600 hover:text-gray-900 hover:bg-gray-200  font-semibold py-3 rounded-lg transition duration-300">
                                            🛒 Add to Cart
                                        </button>
                                        <button className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-200  font-semibold py-3 rounded-lg transition duration-300">
                                            ⚡ Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>No products found.</p>
                )
                }
            </div >
            <div className="w-[100vw] mx-auto py-8 px-10">
                {loading ? (
                    <p>Loading...</p>
                ) : similarProducts && similarProducts.length > 0 ? (
                    <div className="">
                        <div className="text-3xl w-full pb-4 font-semibold">Similar Products </div>
                        <div className="w-full flex py-4 gap-4 overflow-x-auto whitespace-nowrap my-horizontal-scroll-s">

                            {similarProducts.map((item, index) => (
                                <Link key={index} className="w-[220px] flex-shrink-0 border border-gray-200 p-4 rounded-lg shadow-md" to={`/product/${item.id}`}>
                                    <img src={item.link} alt={item.productDisplayName} className="w-full h-40 object-cover mb-2 rounded-md" />
                                    <h3 className="font-medium text-wrap">{item.productDisplayName}</h3>
                                    <h3 className="font-medium text-2xl text-black">₹ {item.discountedPrice}</h3>
                                    <p className="text-sm text-gray-600">{item.baseColour}</p>
                                    <p className="text-sm text-gray-500">{item.usage} - {item.season} {item.year}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p>No products found.</p>
                )}
            </div>
            <div className="w-[100vw] mx-auto pt-10 px-10">
                {loading ? (
                    <p>Loading...</p>
                ) : similarProductsByCV && similarProductsByCV.length > 0 ? (
                    <div className="">
                        <div className="text-3xl w-full pb-4 font-semibold">Similar Products By CV</div>
                        <div className="w-full flex py-4 gap-4 overflow-x-auto whitespace-nowrap my-horizontal-scroll-s">

                            {similarProductsByCV.map((item, index) => (
                                <Link key={index} className="w-[220px] flex-shrink-0 border border-gray-200 p-4 rounded-lg shadow-md" to={`/product/${item.id}`}>
                                    <img src={item.link} alt={item.productDisplayName} className="w-full h-40 object-cover mb-2 rounded-md" />
                                    <h3 className="font-medium text-wrap">{item.productDisplayName}</h3>
                                    <h3 className="font-medium text-2xl text-black">₹ {item.discountedPrice}</h3>
                                    <p className="text-sm text-gray-600">{item.baseColour}</p>
                                    <p className="text-sm text-gray-500">{item.usage} - {item.season} {item.year}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p>No products found.</p>
                )}
            </div>
            <div>

                <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg  my-5 text-gray-900 ">
                    <h2 className="text-2xl font-semibold mb-6">Customer Feedbacks</h2>
                    <div id="review-status"></div>
                    <form onSubmit={handleSubmit} className="mb-6 p-4 shadow-sm  bg-gray-100  text-gray-900  " >

                        <h3 className="text-lg font-semibold mb-2">Write a Review</h3>

                        <textarea
                            placeholder="Your Review"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mb-2"
                            required
                        ></textarea>
                        <button
                            type="submit"
                            className="  border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white  px-4 py-2 rounded "
                        >
                            Submit Review
                        </button>
                    </form>
                

                </div>

            </div>

            {Array.isArray(ReviewList) ? (
                        ReviewList.map((item, index) => (
            <article key={index} class="p-6 mb-3 text-base bg-gray-100 rounded-lg max-w-2xl mx-auto border-b-[1px]">
                <footer class="flex justify-between items-center mb-2">
                    <div class="flex items-center">
                        <p class="inline-flex items-center text-sm text-gray-900  font-semibold">
                        <svg class="w-6 h-6 text-gray-400 border rounded-full mx-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
                                {item.username}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400 ml-4">{item.date}</p>
                        {item.sentiment === "Negative" ? (
                                            <p className=" ml-2 bg-red-400 text-white text-sm rounded-xl px-2 py-1 font-semibold">{item.sentiment}</p>
                                        ) : (
                                            <p className=" ml-2 bg-green-400 text-white text-sm rounded-xl px-2 py-1 font-semibold">{item.sentiment}</p>
                                        )}
                    </div>
                    {/* <button id="dropdownComment2Button" data-dropdown-toggle="dropdownComment2"
                        class="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 dark:text-gray-40 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        type="button">
                        <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
                            <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                        </svg>
                        <span class="sr-only">Comment settings</span>
                    </button> */}

                    <div id="dropdownComment2"
                        class="hidden z-10 w-36 bg-white rounded divide-y divide-gray-100 shadow ">
                        <ul class="py-1 text-sm text-gray-700 "
                            aria-labelledby="dropdownMenuIconHorizontalButton">
                            <li>
                                <a href="#"
                                    class="block py-2 px-4 hover:bg-gray-100 ">Edit</a>
                            </li>
                            <li>
                                <a href="#"
                                    class="block py-2 px-4 hover:bg-gray-100 ">Remove</a>
                            </li>
                            <li>
                                <a href="#"
                                    class="block py-2 px-4 hover:bg-gray-100 ">Report</a>
                            </li>
                        </ul>
                    </div>
                </footer>
                <p class="text-gray-500  ml-6">{item.review}</p>
                <div class="flex items-center mt-4 space-x-4">
                    {/* <button type="button"
                        class="flex items-center text-sm text-gray-500 hover:underline dark:text-gray-400 font-medium">
                        <svg class="mr-1.5 w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 18">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5h5M5 8h2m6-3h2m-5 3h6m2-7H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3v5l5-5h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z" />
                        </svg>
                        Reply
                    </button> */}
                </div>
            </article>
            ))) : (
                <p className="text-center">No reviews available</p>
            )}

        </div>
    );
};

export default ProductDetails;
