import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { prisma } from "./prisma";
import { randomUUID } from "crypto";

export const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: "2023-08-16",
});

export async function createCustomerIfNull() {
  const session = await getServerSession(authOptions);

  if (session) {
    const user = await prisma.user.findFirst({
      where: { email: session?.user?.email },
    });

    if (!user?.api_key) {
      await prisma.user.update({
        where: {
          email: String(user?.email),
        },
        data: {
          api_key: "secret_" + randomUUID(),
        },
      });
    }

    if (!user?.stripe_customer_id) {
      const customer = await stripe.customers.create({
        email: user?.email!,
      });

      await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          stripe_customer_id: customer.id,
        },
      });
    }
  }
}

export async function getInvoices(customerId: string) {
  const invoices = await stripe.invoices.retrieveUpcoming({
    customer: customerId,
  });

  return invoices;
}

export async function hasSubscription() {
  const session = await getServerSession(authOptions);

  if (session) {
    const user = await prisma.user.findFirst({
      where: {
        email: session.user?.email,
      },
    });

    const subscriptions = await stripe.subscriptions.list({
      customer: String(user?.stripe_customer_id),
    });

    return subscriptions.data.length > 0;
  }

  return false;
}

export async function createCheckoutLink() {
  const session = await getServerSession(authOptions);

  if (session) {
    const user = await prisma.user.findFirst({
      where: { email: session.user?.email },
    });

    const customerId = user?.stripe_customer_id;

    const checkoutUrl = await stripe.checkout.sessions.create({
      success_url: "http://localhost:3000/dashboard?success=true",
      cancel_url: "http://localhost:3000/dashboard?success=false",
      customer: String(customerId),
      line_items: [
        {
          price: "price_1NnzZ2SEOQ1nLCzF9gdJIOL2",
        },
      ],
      mode: "subscription",
    });

    return checkoutUrl.url;
  }
}

export async function createPaymentLink(quantity: number) {
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: "price_1NnzZ2SEOQ1nLCzF9gdJIOL2",
        quantity: quantity,
      },
    ],
  });

  return paymentLink;
}

export async function getUsage(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: String(customerId),
  });

  const subItemId = subscriptions.data[0].items.data[0].id;

  const usage = await stripe.subscriptionItems.listUsageRecordSummaries(
    subItemId
  );

  return usage;
}
