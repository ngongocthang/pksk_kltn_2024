import AOS from 'aos';
import 'aos/dist/aos.css';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import banner_network from '../assets/banner_network.png';

const Banner = () => {
    const navigate = useNavigate()

    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, [])

    return (
        <div 
            className='flex bg-primary rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10'
            style={{ backgroundImage: `url(${banner_network})`, backgroundSize: 'cover', backgroundPosition: 'center' }} 
            data-aos="fade-up"
        >
            {/* ----- Left Side ----- */}
            <div 
                className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5 flex flex-col justify-center items-start' 
                data-aos="fade-right"
            >
                <div className='text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-[#00759c]'>
                    <p className='ml-0 md:ml-[-20px]'>Đặt lịch hẹn</p>
                    <p className='mt-4 ml-0 md:ml-[-20px]'>Với hơn 100 bác sĩ</p>
                    <p className='mt-4 ml-0 md:ml-[-20px]'>đáng tin cậy</p>
                </div>
                <button
                    onClick={() => { navigate('/account'); scrollTo(0, 0); }}
                    className='bg-white text-sm sm:text-base text-[#00759c] px-8 py-3 border rounded-full mt-6 hover:bg-[#00759c] hover:text-white hover:scale-105 transition-all'
                    data-aos="zoom-in"
                >
                    Tạo tài khoản
                </button>
            </div>
        </div>
    )
}

export default Banner;