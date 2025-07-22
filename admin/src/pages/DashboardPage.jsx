import React from 'react'
import Header from "../components/common/Header";
import { useSelector } from "react-redux";
import DateChart from '../components/charts/DateChart';

const DashboardPage = () => {

  const { totalUploads, totalStorageUsedMB, recentUser, userCreationTimeline ,error} = useSelector((state) => state.dashboard);
  const authUser = useSelector((state) => state.auth.authUser);
  
  return (
    <>
    <Header title="Dashboard"/>
      <div className="p-8 min-h-screen bg-gray-100">
        {/* Welcome */}
        <h1 className="text-3xl font-bold mb-4">Welcome back, {authUser?.fullName} 👋</h1>
        <p className="text-gray-600 mb-8">Here's a quick overview of Users Excelytics activity.</p>

        {/* Error*/}
        {error && <p className="text-red-500">Error: {error}</p>}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <p className="text-sm text-gray-500">📁 Total Uploads</p>
            <h2 className="text-2xl font-bold">{totalUploads || 0}</h2>
          </div>
           <div className="bg-white p-6 rounded-2xl shadow-md">
            <p className="text-sm text-gray-500">📊 Recent User Name</p>
            <h2 className="text-lg font-semibold">{recentUser?.name || 'N/A'}</h2>
          </div>
          {console.log(userCreationTimeline)}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <p className="text-sm text-gray-500">💾 Storage Used</p>
            <h2 className="text-lg font-semibold">{totalStorageUsedMB  || '0'}MB</h2>
          </div>
        </div>



        {/* Date Chart */}
        {userCreationTimeline && (
          <div className="mt-10">
            <DateChart chartData={userCreationTimeline} />
          </div>
        )}
      </div>
    </>
  )
}

export default DashboardPage
