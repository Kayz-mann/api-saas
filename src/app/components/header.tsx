import Link from 'next/link'
import React from 'react'

const header = () => {
    return (
        <nav className='max-w-5xl m-auto w-full px-4'>
            <div className='flex items-center gap-8 justify-between py-2'>
                <Link href={"/"}
                    className='text-2xl font-semibold text-black hover:opacity-90'>
                    Logo
                </Link>
                <div className='flex items-center gap-4'>
                    <Link href="/#features" className='font-medium text-sm text-black hover:opacity-90'>
                        Features
                    </Link>
                    <Link href="/#pricing" className='font-medium text-sm text-black hover:opacity-90'>
                        Pricing
                    </Link>
                    <Link href="/dashboard" className='font-medium text-sm hover:opacity-90 text-white bg-black px-4 py-2'>
                        Dashboard
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default header