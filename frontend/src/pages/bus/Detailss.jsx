import React from 'react'
import Bus from '../../assets/bus9.png'
import { FaStar } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import Destination from '../../components/destination/Destination'
import DepartTime from '../../components/departtime/DepartTime'
import Seat from '../../components/seat/Seat'

const Details = () => {
  return (
    <div className='w-full lg:px-28 md:px-16 sm:px-7 px-4 mt-[13ch] mb-[10ch]'>
        <div className="w-full grid grid-cols-2 gap-16 items-center">
            <div className='col-span-1 space-y-8'>
                <img src={Bus} alt='detail img' className='w-full aspect-[3/2] rounded-md object-contain'/>
                <div className='space-y-4'>
                    <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50">
                        Luxury Bus
                        <span className="text-base font-normal text-neutral-400 dark:text-neutral-500 ml-3">
                            (Bus Number Plate)
                        </span>
                    </h1>

                    <div className="flex items-center gap-x-2">
                        <div className="flex items-center gap-x-1 text-sm text-yellow-500 dark:text-yellow-600">
                            <FaStar/>
                            <FaStar/>
                            <FaStar/>
                            <FaStar/>
                            <FaStar/>
                        </div>
                        <p className="text-neutral-900 dark:text-neutral-200 text-sm font-normal">
                            (4.5)
                        </p>
                    </div>

                    <p className="text-neutral-900 dark:text-neutral-200 text-sm font-normal">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rem impedit et pariatur qui deserunt error, commodi doloremque quasi necessitatibus! Odio error dicta possimus labore accusamus voluptas debitis eveniet amet itaque.
                    </p>
                </div>
            </div>
            <div className="col-span-1 space-y-10">
                <div className='space-y-6'>
                    {/*Destination Card*/}
                    <Destination/>

                    {/*Depature Card*/}
                    <DepartTime/>

                </div>

                {/*Seat Selection*/}
                <Seat />

                {/*Checkout Button*/}
                <div className="flex">
                    <Link to={'/bus/bus-details/checkout'} className="w-fit bg-violet-600 text-neutral-50 font-medium text-base px-6 py-2 rounded-md hover:bg-violet-700 ease-in-out duration-300">
                        Processed to Checkout
                    </Link>
                </div>

            </div>

        </div>
    </div>
  )
}

export default Details