import React from 'react'
import Header from "../components/common/Header";
import { useDispatch, useSelector } from "react-redux";
import { deleteUser } from '../store/dashboard-slice/dashboardSlice';


const UserData = () => {
    const { userUploadStats } = useSelector((state) => state.dashboard);
    const dispatch = useDispatch();
    const handleDelete = (id) => {
        dispatch(deleteUser(id));
    };


    return (
        <>
            <Header title="Users Data" />
            <div className='min-h-screen bg-gray-100'>
                {userUploadStats && (
                    <div className="p-6 bg-white rounded-xl shadow-md overflow-x-auto mx-5">
                        <h2 className="text-xl font-semibold mb-4 text-center">📋 User Upload Statistics</h2>
                        <table className="min-w-full border border-gray-300 text-sm text-left">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-2 px-4 border">Name</th>
                                    <th className="py-2 px-4 border">Created At</th>
                                    <th className="py-2 px-4 border">Total Uploads</th>
                                    <th className="py-2 px-4 border">Storage Used (MB)</th>
                                    <th className="py-2 px-4 border">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userUploadStats.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition">
                                        <td className="py-2 px-4 border capitalize">{user.fullName}</td>
                                        <td className="py-2 px-4 border">{user.createdAt}</td>
                                        <td className="py-2 px-4 border text-center">{user.totalUploads}</td>
                                        <td className="py-2 px-4 border text-center">{user.totalStorageUsedMB}</td>
                                        <td className="py-2 px-4 border text-center">
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {userUploadStats.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-gray-500">No users found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </>
    )
}

export default UserData
