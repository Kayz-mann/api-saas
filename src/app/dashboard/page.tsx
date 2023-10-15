import Link from "next/link";
import { createCheckoutLink, createCustomerIfNull, hasSubscription, stripe } from "../lib/stripe";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
const prisma = new PrismaClient()

export default async function Page() {
    const customer = await createCustomerIfNull();
    const hasSub = await hasSubscription();
    const checkoutLink = await createCheckoutLink(String(customer));
    const session: any = getServerSession(authOptions)

    const user = await prisma.user.findFirst({ where: { email: session.user?.email } });


    const top10RecentLogs = await prisma.log.findMany({
        where: {
            userId: user?.id
        },
        orderBy: {
            created: 'desc'
        },
        take: 10
    })


    let current_usage = 0;



    if (hasSub) {

        const subscriptions = await stripe.subscriptions.list({
            customer: String(user?.stripe_customer_id),
        })

        const invoice = await stripe.invoices.retrieveUpcoming({
            subscription: subscriptions.data.at(0)?.id
        });

        current_usage = invoice.amount_due
    }


    return (
        <main>
            {hasSub ?
                <>
                    <div className="flex flex-col gap-4">
                        <div className="rounded-md px-4 py-2 bg-emerald-400 font-medium text-white">
                            You have a subscription!
                        </div>

                        <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
                            <p className="text-sm text-black px-6 py-4 font-medium">Currennt Usage</p>
                            <p className="text-sm font-mono text-zinc-800 px-6n py-4">{current_usage}</p>
                        </div>

                        <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
                            <p className="text-sm text-black px-6 py-4 font-medium">API KEY</p>
                            <p className="text-sm font-mono text-zinc-800 px-6n py-4">{user?.api_key}</p>
                        </div>

                        <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
                            <p className="text-sm text-black px-6 py-4 font-medium">Log Events</p>
                            <p className="text-sm font-mono text-zinc-800 px-6n py-4">
                                {top10RecentLogs.map((item, index) => (
                                    <div className="flex items-center gap-4" key={index}>
                                        <p className="text-sm font-mono text-zinc-800 px-6n py-4">{item.method}</p>
                                        <p className="text-sm font-mono text-zinc-800 px-6n py-4">{item.status}</p>
                                        <p className="text-sm font-mono text-zinc-800 px-6n py-4">{item.created.toDateString()}</p>
                                    </div>
                                ))}
                            </p>
                        </div>
                    </div>
                </>
                :
                <div className="min-h-[60vh] grid place-items-center rounded-lg px-6 py-10 bg-slate-50">
                    <Link href={String(checkoutLink)}
                        className="font-medium text-base hover:underline"
                    >
                        You have no subscription, checkout now
                    </Link>
                </div>
            }
        </main>
    )
}