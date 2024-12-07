// export default Login
import axios from 'axios';
import { Eye, EyeOff } from "lucide-react"; // Import Eye and EyeOff icons
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';

const Login = () => {
    const [state, setState] = useState('Admin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const { setAToken, backendUrl } = useContext(AdminContext)
    const { setDToken } = useContext(DoctorContext)

    const navigate = useNavigate()

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            const response = await axios.post(`${backendUrl}login`, { email, password })
            // const response = await axios.post(backendUrl + '/login', { email, password })

            if (response.data.user) {
                const { role, token, ...userInfo } = response.data.user;

                if (role === 'admin' && state === 'Admin') {
                    localStorage.setItem('aToken', token)
                    setAToken(token)
                    navigate('/admin-dashboard')
                } else if (role === 'doctor' && state === 'Doctor') {
                    localStorage.setItem('dToken', token)
                    setDToken(token)
                    sessionStorage.setItem('doctorInfo', JSON.stringify(userInfo));
                    navigate('/doctor-dashboard')
                } else {
                    toast.error("Vai trò không phù hợp đối với loại đăng nhập đã chọn.",)
                }
            } else {
                toast.error("Login failed!")
            }
        } catch (error) {
            console.error("Login error:", error)
            toast.error("Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.", {
            });
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
                <p className='text-2xl font-semibold m-auto'> Đăng nhập <span className='text-[#0091a1]'> {state}</span></p>
                <div className='w-full'>
                    <p>Email</p>
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        className='border border-[#DADADA] rounded w-full p-2 mt-1'
                        type="email"
                        required
                    />
                </div>
                <div className='w-full relative'>
                    <p>Password</p>
                    <input
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        className='border border-[#DADADA] rounded w-full p-2 mt-1 pr-10'
                        type={showPassword ? "text" : "password"}
                        required
                    />
                    {password && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none cursor-pointer flex items-center justify-center pt-6"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    )}
                </div>
                <button className='bg-[#0091a1] text-white w-full py-2 rounded-md text-base'>Đăng nhập</button>
                {state === 'Admin'
                    ? <p>Đăng nhập bác sĩ? <span className='text-[#0091a1] underline cursor-pointer' onClick={() => setState('Doctor')}>Nhấp vào đây</span></p>
                    : <p>Đăng nhập quản trị? <span className='text-[#0091a1] underline cursor-pointer' onClick={() => setState('Admin')}>Nhấp vào đây</span></p>
                }
            </div>
        </form>
    )
}

export default Login;
