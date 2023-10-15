import React from "react";
import Header from '@/app/components/header'
import { useLoggedIn } from "../lib/auth";
import { createCheckoutLink, createCustomerIfNull, hasSubscription } from "../lib/stripe";


export default async function DashBoardLayout({ children }: { children: React.ReactNode }) {
    await useLoggedIn();

    return (
        <div className="">
            <Header />
            <div className="max-w-5xl m-auto w-full px-4">
                {children}
            </div>
        </div>
    )
}