'use client'
import React from 'react'
import Detail from './Detail'
// import Checklist from './Checklist'

export default function ApplicationDetailPage() {
  return (
    <div className='space-y-[60px]'>
      <Detail/>
      {/* Checklist will be rendered inside Detail component now */}
    </div>
  )
}