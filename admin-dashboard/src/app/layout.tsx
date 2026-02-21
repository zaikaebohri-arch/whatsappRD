import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Admin Dashboard - WhatsApp Booking",
    description: "Manage your bookings and blocked slots",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-slate-50">
                    <nav className="bg-white border-b border-slate-200 px-4 py-3">
                        <div className="max-w-6xl mx-auto flex justify-between items-center">
                            <h1 className="text-xl font-bold text-slate-900">BrightSmile Admin</h1>
                            <div className="flex gap-4">
                                <a href="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Bookings</a>
                                <a href="/blocked" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Blocked Slots</a>
                            </div>
                        </div>
                    </nav>
                    <main className="max-w-6xl mx-auto p-4 md:p-8">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
