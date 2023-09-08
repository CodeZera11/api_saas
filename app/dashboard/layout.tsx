import { checkUserLoggedIn } from "@/lib/auth"

export default async function DashboardLayout(
    {
        children
    }:
        {
            children: React.ReactNode
        }
) {

    await checkUserLoggedIn();

    return (
        <div>
            {children}
        </div>
    )
}