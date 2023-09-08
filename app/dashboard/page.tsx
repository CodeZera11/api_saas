import { prisma } from '@/lib/prisma';
import { createCheckoutLink, createCustomerIfNull, getInvoices, getUsage, hasSubscription } from '@/lib/stripe';
import { getApiKey, getUser } from '@/lib/utils';
import Link from 'next/link';

const DashboardPage = async () => {

  const p = await Promise.all([
    await createCustomerIfNull(),

    await hasSubscription(),

    await createCheckoutLink(),

    await getApiKey(),

    await getUser()
  ])

  const hasSub = p[1];
  const checkoutLink = p[2];
  const api_key = p[3];
  const user = p[4];

  const top10Logs = await prisma.log.findMany({
    where: {
      userId: user?.id
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 10
  })

  let current_usage = 0;
  if (hasSub) {
    const invoices = await getInvoices(user?.stripe_customer_id!);
    current_usage = invoices.amount_due;
  }

  return (
    <>
      {
        hasSub ? (
          <div className='flex flex-col gap-10'>
            <div className='bg-emerald-500 text-black flex items-center p-5 rounded-lg justify-between'>
              <h1 className='text-xl'>Subscription Active.</h1>
            </div>
            <div className="divide-y border-white border">
              <h1 className='flex items-center px-5 py-5 text-4xl font-semibold'>API Key</h1>
              <p className='px-5 py-7 text-lg transition-colors duration-500'>
                <Link href={`/dashboard/${api_key}`} className='hover:underline'>
                  {api_key}
                </Link>
              </p>
            </div>
            <div className="divide-y border-white border">
              <h1 className='flex items-center px-5 py-5 text-4xl font-semibold'>Amount Due</h1>
              <p className='px-5 py-7 text-lg transition-colors duration-500'>
                ₹{current_usage / 100} /-
              </p>
            </div>
            <div className="divide-y border-white border">
              <h1 className='flex items-center px-5 py-5 text-4xl font-semibold'>LOGS</h1>
              {top10Logs.map((log) => (
                <>
                  <div key={log.id} className='px-5 py-7 text-lg flex gap-10'>
                    <p>{log.method}</p>
                    <p>{log.status}</p>
                    <p>{log.createdAt.toLocaleTimeString()}</p>
                  </div>
                </>
              ))}

            </div>
          </div >
        ) : (
          <div className='min-h-[60vh] text-white flex-col flex items-center justify-center gap-10'>
            <h1 className='text-4xl'>You have no active subscription!</h1>
            <Link href={checkoutLink!} className='bg-green-400 text-black rounded-xl py-2 px-4'>
              Checkout
            </Link>
          </div>
        )
      }
    </>
  )
}

export default DashboardPage