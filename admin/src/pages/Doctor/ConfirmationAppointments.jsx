import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DoctorContext } from '../../context/DoctorContext';

const ConfirmationSchedule = () => {
  const { appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingId, setLoadingId] = useState(null);
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const appointmentsPerPage = 10;

  // Định dạng ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // Xử lý xác nhận lịch hẹn
  const handleCompleteAppointment = async (id) => {
    setLoadingId(id);
    setLoading(true); // Bắt đầu quá trình xác nhận
    try {
      await completeAppointment(id);
      toast.success('Lịch hẹn đã được xác nhận.');
      await getAppointments(); // Cập nhật danh sách lịch hẹn sau khi xác nhận
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xác nhận lịch hẹn.');
    } finally {
      setLoadingId(null);
      setLoading(false); // Kết thúc quá trình xác nhận
    }
  };

  // Xử lý hủy lịch hẹn
  const handleCancelAppointment = async (id) => {
    setLoadingId(id);
    setLoading(true); // Bắt đầu quá trình hủy
    try {
      await cancelAppointment(id);
      toast.success('Lịch hẹn đã được hủy.');
      await getAppointments(); // Cập nhật danh sách lịch hẹn sau khi hủy
    } catch (error) {
      toast.error('Có lỗi xảy ra khi hủy lịch hẹn.');
    } finally {
      setLoadingId(null);
      setLoading(false); // Kết thúc quá trình hủy
    }
  };

  const pendingAppointments = appointments.filter(
    (appointment) => !appointment.isCompleted && !appointment.cancelled && appointment.status === 'pending'
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = parseInt(params.get('page')) || 1;
    setCurrentPage(page);
  }, [location.search]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        await getAppointments(); // Gọi lại danh sách lịch hẹn
      } catch (error) {
        toast.error('Có lỗi xảy ra khi tải dữ liệu lịch hẹn.');
      } finally {
        setLoading(false); // Kết thúc tải dữ liệu
      }
    };

    fetchAppointments(); // Lần đầu tiên khi component mount
  }, [getAppointments]);

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = pendingAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(pendingAppointments.length / appointmentsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    navigate(`/confirmation-schedule?page=${pageNumber}`);
  };

  // Hàm render phân trang
  const renderPagination = () => {
    const delta = 1; // Số trang hiển thị trước và sau trang hiện tại
    const paginationItems = [];

    // Nút "Trang trước"
    paginationItems.push(
      <button
        key="prev"
        onClick={() => paginate(Math.max(1, currentPage - 1))}
        className={`py-1 px-3 border rounded w-[70px] flex items-center justify-center ${currentPage === 1
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "text-gray-600"
          }`}
        disabled={currentPage === 1}
      >
        <span className="hidden md:block">Trước</span>
        <i className="fa-solid fa-angle-left block md:hidden"></i>
      </button>
    );

    // Hiển thị trang 1
    paginationItems.push(
      <button
        key={1}
        onClick={() => paginate(1)}
        className={`py-1 px-3 border rounded ${currentPage === 1 ? "bg-indigo-500 text-white" : "text-gray-600"
          }`}
      >
        1
      </button>
    );

    // Hiển thị dấu ba chấm nếu cần, khi currentPage > 3
    if (currentPage > 2) {
      paginationItems.push(
        <span key="start-dots" className="px-2">...</span>
      );
    }

    // Hiển thị các trang xung quanh trang hiện tại
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      paginationItems.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`py-1 px-3 border rounded ${i === currentPage ? "bg-indigo-500 text-white" : "text-gray-600"
            }`}
        >
          {i}
        </button>
      );
    }

    // Hiển thị dấu ba chấm nếu cần, khi currentPage < totalPages - 1
    if (currentPage < totalPages - 1) {
      paginationItems.push(
        <span key="end-dots" className="px-2">...</span>
      );
    }

    // Hiển thị trang cuối
    if (totalPages > 1) {
      paginationItems.push(
        <button
          key={totalPages}
          onClick={() => paginate(totalPages)}
          className={`py-1 px-3 border rounded ${currentPage === totalPages ? "bg-indigo-500 text-white" : "text-gray-600"
            }`}
        >
          {totalPages}
        </button>
      );
    }

    // Nút "Trang tiếp theo"
    paginationItems.push(
      <button
        key="next"
        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
        className={`py-1 px-3 border rounded w-[70px] flex items-center justify-center ${currentPage === totalPages
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "text-gray-600"
          }`}
        disabled={currentPage === totalPages}
      >
        <span className="hidden md:block">Tiếp</span>
        <i className="fa-solid fa-angle-right block md:hidden"></i>
      </button>
    );

    return (
      <div className="flex justify-center items-center mt-6 space-x-2">
        {paginationItems}
      </div>
    );
  };

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-4 text-lg font-medium'>Các lịch hẹn chờ xác nhận:</p>
      <div className='bg-white border rounded-xl text-sm max-h-[80vh] min-h-[50vh] overflow-y-auto'>

        {/* Header Row */}
        <div className='hidden md:grid grid-cols-[0.5fr_2fr_2fr_2fr_1fr] gap-4 py-4 px-6 bg-gray-200 border-b text-center'>
          <p className='font-bold text-[16px]'>#</p>
          <p className='font-bold text-[16px]'>Bệnh nhân</p>
          <p className='font-bold text-[16px]'>Ngày khám</p>
          <p className='font-bold text-[16px]'>Ca khám</p>
          <p className='font-bold text-[16px] justify-self-end'>Hành động</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-6">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-solid rounded-full border-[#219c9e] border-t-transparent" role="status">
            </div>
          </div>
        )}
        {/* Appointment Rows */}
        {!loading && currentAppointments.length > 0 ? (
          currentAppointments.map((item, index) => (
            <div
              className='border-b hover:bg-gray-50 p-4 md:p-6'
              key={item._id}
            >
              <div className='md:grid md:grid-cols-[0.5fr_2fr_2fr_2fr_1fr] items-center gap-4'>
                <p className='text-center font-bold md:col-span-1'>{index + 1 + (currentPage - 1) * appointmentsPerPage}</p>

                {/* Mobile-friendly stacking */}
                <div className='flex flex-col gap-1 md:gap-0'>
                  <p className='text-base text-center md:text-center font-medium md:font-normal'>
                    <span className="md:hidden font-semibold">Bệnh nhân: </span>
                    {item.patient_id.user_id.name}
                  </p>
                  <div className='md:hidden'>
                    <p className='text-sm py-2 font-semibold'>Ngày khám: {formatDate(item.work_date)}</p>
                  </div>
                  <div className='md:hidden flex items-center'>
                    <p className='text-sm font-semibold'>Ca khám:</p>
                    <p
                      className={`py-0 ml-1 p-2 md:py-1 rounded-full text-white text-sm text-center max-w-[100px] 
                      ${item.work_shift === "afternoon" ? "bg-orange-300" : "bg-blue-300"} shadow-lg max-w-[70px] w-full`}
                    >
                      {item.work_shift === "morning" ? "Sáng" : "Chiều"}
                    </p>
                  </div>
                </div>

                {/* Desktop-specific layout */}
                <p className='text-base text-center hidden md:block'>
                  {formatDate(item.work_date)}
                </p>

                {/* Updated 'Ca khám' with centered text */}
                <div className='flex justify-center items-center'>
                  <p
                    className={`py-1 rounded-full text-white text-sm text-center max-w-[100px] hidden md:block 
                    ${item.work_shift === "afternoon" ? "bg-orange-300" : "bg-blue-300"} shadow-lg max-w-[100px] w-full`}
                  >
                    {item.work_shift === "morning" ? "Sáng" : "Chiều"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-row gap-2 md:gap-3 justify-center md:justify-end mr-2'>
                  <div className="md:hidden flex gap-2 mt-5">
                    <button
                      onClick={() => handleCompleteAppointment(item._id)}
                      className='bg-green-500 text-white px-3 py-1 rounded-md shadow-md'
                    >
                      Xác nhận
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(item._id)}
                      className='bg-red-500 text-white px-3 py-1 rounded-md shadow-md'
                    >
                      Hủy
                    </button>
                  </div>

                  {/* Desktop SVG icons */}
                  <svg
                    onClick={() => handleCompleteAppointment(item._id)}
                    className='hidden md:block w-[30px] h-[30px] cursor-pointer bg-green-500 p-2 rounded-full shadow-lg'
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>

                  <svg
                    onClick={() => handleCancelAppointment(item._id)}
                    className='hidden md:block w-[30px] h-[30px] cursor-pointer bg-red-500 p-2 rounded-full shadow-lg'
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          ))
        ) : (
          !loading && <p className='text-gray-500 py-3 px-1 text-center'>Không có lịch hẹn nào chờ được xác nhận.</p>
        )}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && renderPagination()}
    </div>
  );
};

export default ConfirmationSchedule;