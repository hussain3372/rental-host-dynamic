'use client'
import React from 'react'
import Detail from './Detail'
import Checklist from './Checklist'

export default function page() {
  return (
    <div className='space-y-[60px]'>
      <Detail/>
      <Checklist/>
    </div>
  )
}
