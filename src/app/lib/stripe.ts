import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient()

export const stripe = new Stripe(String(process.env.STRIPE_SECRET), {
    apiVersion: '2023-08-16',
});

//price_1O0wSYGcjbyIRuKVwZXw5X8x

export async function hasSubscription() {
    const session = await getServerSession(authOptions);

    if (session) {
        const user = await prisma.user.findFirst({ where: { email: session.user?.email } });

        const subscriptions = await stripe.subscriptions.list({
            customer: String(user?.stripe_customer_id)
        })

        return subscriptions.data.length > 0;
    }

    return false;
}


export async function createCheckoutLink(customerId: string) {
    const checkout = await stripe.checkout.sessions.create({
        success_url: "http://localhost:3000/dashboard/billing?success=true",
        cancel_url: "http://localhost:3000/dashboard/billing?success=true",
        line_items: [
            {
                price: 'price_1O0wSYGcjbyIRuKVwZXw5X8x'
            }
        ],
        mode: 'subscription'
    })

    return checkout.url
}

export async function createCustomerIfNull() {
    const session = await getServerSession(authOptions);



    if (session) {
        const user: any = await prisma.user.findFirst({ where: { email: session.user?.email } });

        if (!user?.api_key) {
            await prisma.user.update({
                where: {
                    id: user?.id
                },
                data: {
                    api_key: "secret_" + randomUUID()
                } as any
            })
        }

        if (!user?.stripe_customer_id) {
            const customer = stripe.customers.create({
                email: String(user?.email)
            });

            await prisma.user.update({
                where: {
                    id: user?.id
                },
                data: {
                    stripe_customer_id: (await customer)?.id
                }
            })
        }
        const user2 = await prisma.user.findFirst({ where: { email: session.user?.email } });
        return user2?.stripe_customer_id;
    }


}
