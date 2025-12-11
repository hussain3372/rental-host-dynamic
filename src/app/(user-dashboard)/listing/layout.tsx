import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "./(components)/Navbar";
import { Manrope } from "next/font/google";


// Define props type
type ListingLayoutProps = {
  children: ReactNode;
};

 const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope",
    display: "swap",
  });

export default function ListingLayout({ children }: ListingLayoutProps) {
 
  
  return (
    <html lang="en">
      <head>
       
      </head>

      <body className={`${manrope.className} !overflow-x-hidden`}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 1000,
            style: {
              background: "white",
              color: "black",
              zIndex:"9000000000"
            },
            success: {
              duration: 1000,
            },
          }}
        />


        <main>
          <Navbar/>
              {children}
        </main>
      </body>
    </html>
  );
}
