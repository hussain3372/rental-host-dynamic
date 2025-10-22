'use client'
import React from "react";
import HeroSection from "./HeroSection";
import CardSection from "./CardSection";
import ValuePropositionsSection from "./ValuePropositionsSection";
import CertifiedProperties from "./CertifiedProperties";
import Testimonial from "./Testimonial";
import FaqSection from "./FaqSection";
import Plans from "./Plans";
import Unlock from "./Unlock";


const LandingPage = () => {
  return (

    <div>
      <section id="home">
        <HeroSection />
      </section>

      <div className="scroll-smooth">
        <section id="how-it-works" className="scroll-mt-[120px]">
          <CardSection />
        </section>
      </div>
      <ValuePropositionsSection />
      <div className="scroll-smooth">
        <section id="hosts" className="scroll-mt-[120px]">
          <CertifiedProperties />
        </section>
      </div>
      <Testimonial />
      <div className="scroll-smooth">
        <section id="plans" className="scroll-mt-[120px]">
          <Plans />
        </section>
      </div>
      <FaqSection />
      <Unlock />
    </div >
  );
};

export default LandingPage;
