import { useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== password2) {
            setError("Passwords do not match!");
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/register/', {
                username,
                email,
                password,
                password2
            });

            setSuccess(response.data.message);
            setUsername('');
            setEmail('');
            setPassword('');
            setPassword2('');

            // Redirect to login page after successful registration
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);

        } catch (error) {
            setError(error.response?.data || "Something went wrong!");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-96">
                <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
                
                {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
                {success && <p className="text-green-500 text-sm text-center mb-2">{success}</p>}

                <form onSubmit={submit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                        required
                    />
                    <button 
                        type="submit" 
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                        Register
                    </button>
                </form>

                <p className="text-sm text-center mt-4">
                    Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
