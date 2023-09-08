import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getSession } from "@/lib/utils";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const api_key = req.headers.get("api_key");

  if (!api_key) {
    return NextResponse.json(
      { message: "API Key is required" },
      { status: 401 }
    );
  }

  const session = await getSession();

  //   if (!session) {
  //     return NextResponse.json({ message: "User not logged in!" });
  //   }

  const user = await prisma.user.findFirst({
    where: {
      api_key,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "No user with this api key found!" });
  }

  const customer = await stripe.customers.retrieve(
    String(user.stripe_customer_id)
  );

  if (!customer) {
    return NextResponse.json({ message: "Not a stripe customer!" });
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripe_customer_id!,
  });

  const item = subscriptions.data[0].items.data[0];

  if (!item) {
    return NextResponse.json({ message: "No active subscription found!" });
  }

  const result = await stripe.subscriptionItems.createUsageRecord(
    String(item?.id),
    {
      quantity: 1,
    }
  );

  const data = randomUUID();

  const log = await prisma.log.create({
    data: {
      userId: user?.id,
      method: "GET",
      status: 200,
    },
  });

  return NextResponse.json({ data: data, log: log }, { status: 200 });
}
