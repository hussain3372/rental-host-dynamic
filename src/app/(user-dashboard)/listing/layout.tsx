import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "./(components)/Navbar";


// Define props type
type ListingLayoutProps = {
  children: ReactNode;
};

export default function ListingLayout({ children }: ListingLayoutProps) {
  return (
    // Remove <html> and <body> tags - just return the content directly
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "white",
            color: "black",
          },
          success: {
            duration: 3000,
          },
        }}
      />
      <Navbar />
      <main>{children}</main>
    </>
  );
}