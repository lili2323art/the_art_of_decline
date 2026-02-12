import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "AI 极限推拉模拟器",
    description: "中国式过年的精髓——红包拉扯模拟器",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh">
            <body suppressHydrationWarning={true}>
                {children}
            </body>
        </html>
    );
}
