import Header from '../components/header'
import React from 'react'
import { Outlet } from 'react-router-dom'

const AppLayout = () => {
  return (
    <>
      <div className='grid-background'></div>
      <main className='min-h-screen max-w-6xl mx-auto'>
        <Header />
        <Outlet />
      </main>
      <div className='p-10 text-center bg-gray-800 mt-10'>Made By Abdul Sami</div>
    </>
  )
}

export default AppLayout