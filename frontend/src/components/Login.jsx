import React, { useEffect } from 'react'
import axios from "axios";
import { Link } from "react-router-dom";

import { useState } from "react";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {   
        const accessToken = localStorage.getItem('access');
        if (accessToken) {
            window.location.href = '/profile/';
        }
    })
    const submit = async (e) => {
        e.preventDefault();

        try {
            const { data } = await axios.post('http://127.0.0.1:8000/api/login/', {
                username,
                password
            });
            console.log("login s")
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);

            axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
            console.log("Login succ")
            console.log("redi")
            // Redirect to home page after login
            console.log("redirect end")
            window.location.href = '/profile/';
        } catch (error) {
            console.error('Login error:', error.response ? error.response.data : error.message);
            alert('Login failed! Check your credentials.');
        }
    };


return (
    <div>
        <div className="flex items-center justify-center h-screen w-full px-5 sm:px-0">
            <div className="flex bg-white rounded-lg shadow-lg border overflow-hidden max-w-sm lg:max-w-4xl w-full">
                <div
                    className="hidden md:block lg:w-1/2 bg-cover bg-blue-700"
                    style={{
                        backgroundImage: `url(https://www.tailwindtap.com//assets/components/form/userlogin/login_tailwindtap.jpg)`,
                    }}
                ></div>
                <form 
                onSubmit={submit}
                className="w-full p-8 lg:w-1/2">
                    <p className="text-xl text-gray-600 text-center">Welcome back!</p>
                    <div className="mt-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                           Username
                        </label>
                        <input
                            className="text-gray-700 border border-gray-300 rounded py-2 px-4 block w-full focus:outline-2 focus:outline-blue-700"
                            type="username"
                            value={username}
                            onChange={(e)=>{
                                setUsername(e.target.value)
                            }}
                            required
                        />
                    </div>
                    <div className="mt-4 flex flex-col justify-between">
                        <div className="flex justify-between">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Password
                            </label>
                        </div>
                        <input
                            className="text-gray-700 border border-gray-300 rounded py-2 px-4 block w-full focus:outline-2 focus:outline-blue-700"
                            type="password"
                            onChange={(e)=>{
                                setPassword(e.target.value)
                            }}
                            value={password}
                        />
                        {/* <a
                            href="#"
                            className="text-xs text-gray-500 hover:text-gray-900 text-end w-full mt-2"
                        >
                            Forget Password?
                        </a> */}
                    </div>
                    <div className="mt-8">
                        <button className="bg-blue-700 text font-blue-600 py-2 px-4 w-full rounded hover:bg-blue-600"
                        type="submit">
                            Login
                        </button>
                    </div>
                    <Link
                        href="#"
                        className=" flex items-center justify-center mt-4 text-white rounded-lg shadow-md hover:bg-gray-100"
                    >
                        <div className="flex px-5 justify-center w-full py-3">
                            <div className="min-w-[30px]">
                                <svg className="h-6 w-6" viewBox="0 0 40 40">
                                    <path
                                        d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                                        fill="#FFC107"
                                    />
                                    <path
                                        d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z"
                                        fill="#FF3D00"
                                    />
                                    <path
                                        d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z"
                                        fill="#4CAF50"
                                    />
                                    <path
                                        d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                                        fill="#1976D2"
                                    />
                                </svg>
                            </div>
                            <div className="flex w-full justify-center">
                                <div className="whitespace-nowrap text-gray-600 font-bold text-xl">
                                    Sign in with Google
                                </div>
                            </div>
                        </div>
                    </Link>
                    <div className="mt-4 flex items-center w-full text-center">
                        <Link
                            href="#"
                            className="text-xs text-gray-500 capitalize text-center w-full"
                        >
                            Don&apos;t have any account yet?
                            <Link className="text-blue-700" href="/"> Sign Up</Link>
                        </Link>
                    </div>
                </form>
            </div>
        </div>


    </div>
)
}

export default Login