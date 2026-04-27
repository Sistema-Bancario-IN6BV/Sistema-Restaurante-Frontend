import React from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export const DashboardContainer = ({ children }) => {
  return (
    <div className='min-h-screen bg-bg-dark flex flex-col text-text-body'>
      <Navbar/>
      <div className='flex flex-1'>
        <Sidebar/>
        
        <main className='flex-1 p-6 md:p-8 overflow-x-hidden'>
          {children}
        </main>
      </div>
    </div>
  )
}