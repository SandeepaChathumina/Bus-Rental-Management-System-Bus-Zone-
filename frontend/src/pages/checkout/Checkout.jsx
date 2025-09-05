import React from 'react'
import { FaArrowRightLong } from 'react-icons/fa6';


const Checkout = () => {
  return (
    <div className='w-full lg:px-28 md:px-16 sm:px-7 px-4 mt-[13ch] mb-[8ch] space-y-10'>
        <div className="grid grid-cols-5 gap-16 items-start">
            <div className="cols-span-3 space-y-7 pr-20">
                <h2 className="text-xl text-neutral-800 dark:text-neutral-100 font-medium">
                    Passenger Information
                </h2>
                <form className='space-y-6'>
                    <div className=''>
                        <label htmlFor="fullname" className="block mb-2 font-semibnold">
                            Full Name
                        </label>
                        <input type='fullname' placeholder='Enter your full name' id='fullname' name='fullname' className='w-full appearence-none text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 inline-block bg-neutral-200/60 dark:bg-neutral-900/60 px-3 h-12 border border-neutral-200 dark:border-neutral-900 rounded-md focus:outline-none focus:bg-neutral-100 dark:focus:bg-neutral-900'></input>
                    </div>

                    <div className=''>
                        <label htmlFor="email" className="block mb-2 font-semibnold">
                            Email Address
                        </label>
                        <input type='email' placeholder='Enter your email' id='email' name='email' className='w-full appearence-none text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 inline-block bg-neutral-200/60 dark:bg-neutral-900/60 px-3 h-12 border border-neutral-200 dark:border-neutral-900 rounded-md focus:outline-none focus:bg-neutral-100 dark:focus:bg-neutral-900'></input>
                        <small className="block mt-1 text-xs text-neutral-500 dark:text-neutral-600 font-normal">
                            You will get your booking via QR
                        </small>
                    </div>

                    <div className=''>
                        <label htmlFor="phone" className="block mb-2 font-semibnold">
                            Contact Number
                        </label>
                        <input type='number' placeholder='Enter your contact number' id='phone' name='phone' className='w-full appearence-none text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 inline-block bg-neutral-200/60 dark:bg-neutral-900/60 px-3 h-12 border border-neutral-200 dark:border-neutral-900 rounded-md focus:outline-none focus:bg-neutral-100 dark:focus:bg-neutral-900'></input>
                    </div>

                    
                </form>
            </div>

            <div className='space-y-8'>
                <div className="bg-neutral-200/50 dark:bg-neutral-900/70 rounded-md py-5 px-7">
                    <h2 className="text-xl text-center text-neutral-800 dark:text-neutral-100 font-medium border-b-2 border-neutral-200 dark:border-neutral-800/40 pb-3 mb-4">
                        Your Booking Status
                    </h2>

                    <div className='space-y-8 pb-3'>
                        <div className='space-y-4'>
                            <h6 className="text-base text-neutral-700 dark:text-neutral-200 font-medium">
                                Your Destination
                            </h6>

                            <div className='w-full flex items-center gap-x-3'>
                                <div className='w-fit text-base font-medium'>
                                    From:- <span className='ml-1.5'>
                                        Location 1
                                    </span>
                                </div>
                                <div className='flex-1'>
                                    <div className="w-full h-[1px] border border-dashed border-neutral-400 dark:border-neutral-700/80">
                                    
                                    </div>
                                </div>
                                <div className='w-fit text-base font-medium'>
                                    From:- <span className='ml-1.5'>
                                        Location 4
                                    </span>
                                </div>
                            </div>

                            <div className='w-full flex items-center gap-x-3'>
                                <div className='w-fit text-base font-medium'>
                                    Arrive at:- <span className='ml-1.5'>
                                        4.00 pm 
                                    </span>
                                </div>
                                <div className='flex-1'>
                                    <div className="w-full h-[1px] border border-dashed border-neutral-400 dark:border-neutral-700/80">
                                    
                                    </div>
                                </div>
                                <div className='w-fit text-base font-medium'>
                                    Depart at:- <span className='ml-1.5'>
                                        5.00 pm 
                                    </span>
                                </div>
                            </div>

                            <div className='space-y-4'>
                                <div className='w-full flex items-center justify-between'>
                                    <h6 className='text-base text-neutral-700 dark:text-neutral-200 font-medium'>
                                        Total No of seats
                                    </h6>

                                    <h6 className='text-base text-neutral-700 dark:text-neutral-200 font-medium'>
                                        10<span className='text-x5'>
                                            (Driver side)
                                        </span>
                                    </h6>
                                </div>
                            </div>

                            <div className='space-y-4'>
                                <div className='w-full flex items-center justify-between'>
                                    <h6 className='text-base text-neutral-700 dark:text-neutral-200 font-medium'>
                                        Total Amount
                                    </h6>

                                    <h6 className='text-base text-neutral-700 dark:text-neutral-200 font-medium'>
                                        Rs 5000
                                    </h6>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <button className="w-full px-8 h-12 bg-violet-600 text-neutral-50 text-base font-normal rounded-md flex items-center justify-center gap-x-2">
                    Processed to Payment<FaArrowRightLong />
                </button>
            </div>
        </div> 
    </div>
  )
}

export default Checkout