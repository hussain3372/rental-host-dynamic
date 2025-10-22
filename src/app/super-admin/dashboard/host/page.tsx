import React from 'react'
import Status from './top-section/tracking/Status'
import Tracking from './top-section/tracking/Tracking'
import Graph from './top-section/tracking/Graph'
export default function page() {
  return (
    <>
    <div className='z-[1000] relative'>
    <Status/>
    <Graph/>
    <Tracking/>
    </div>
      </>
  )
}