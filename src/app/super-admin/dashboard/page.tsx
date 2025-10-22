import React from 'react'
import Status from './host/top-section/tracking/Status'
import Tracking from './host/top-section/tracking/Tracking'
import Graph from './host/top-section/tracking/Graph'
export default function page() {
  return (
    <>
    <div className='  relative'>
    <Status/>
    <Graph/>
    <Tracking/>
    </div>
      </>
  )
}
