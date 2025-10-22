import type { ReactNode } from "react";
import Navbar from "../Layout/Header";
import Footer from "../Layout/Footer";

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="main-content">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
