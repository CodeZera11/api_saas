import { checkUserLoggedIn } from "@/lib/auth"
import Link from "next/link"

const Header = async () => {

    const userSession = await checkUserLoggedIn();

    return (
        <nav className="max-w-5xl mx-auto py-10">
            <div className="flex items-center justify-between gap-8">
                <Link className="text-4xl font-bold" href={"/"}>Logo</Link>
                <div className="flex items-center gap-8">
                    <Link href={"/features"} className="text-lg ">Features</Link>
                    <Link href={"/pricing"} className="text-lg ">Pricing</Link>
                    <Link href={"/dashboard"} className="bg-white text-whtie px-4 py-2 rounded-xl text-black">Dashboard</Link>
                    {
                        userSession ? (
                            <Link href={"/api/auth/signout"} className="bg-white text-whtie px-4 py-2 rounded-xl text-black">Sign Out</Link>
                        ) : (
                            <Link href={"/api/auth/signin"} className="bg-white text-whtie px-4 py-2 rounded-xl text-black">Sign In</Link>
                        )

                    }

                </div>
            </div>
        </nav>
    )
}

export default Header