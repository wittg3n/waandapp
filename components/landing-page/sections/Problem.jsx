import React from "react";
import Marquee from "../../Marquee";
import Image from "next/image";

function Problem() {
  return (
    <div>
      <Marquee speed={60}>
        <Image
          src="/Marquee/mit.svg"
          height={80}
          width={80}
          alt="mit"
          className="ml-12"
        />
        <Image
          src="/Marquee/cergy.svg"
          height={80}
          width={80}
          alt="cergy"
          className="ml-12"
        />
        <Image
          src="/Marquee/central.svg"
          height={80}
          width={80}
          alt="central"
          className="ml-12"
        />
        <Image
          src="/Marquee/sorbon.svg"
          height={80}
          width={80}
          alt="sorbon"
          className="ml-12"
        />
        <Image
          src="/Marquee/polytech.svg"
          height={40}
          width={40}
          alt="polytech"
          className="ml-12"
        />
        <Image
          src="/Marquee/psl.svg"
          height={80}
          width={80}
          alt="psl"
          className="ml-12"
        />
        <Image
          src="/Marquee/udl.svg"
          height={80}
          width={80}
          alt="udl"
          className="ml-12"
        />
        <Image
          src="/Marquee/bordeaux.svg"
          height={80}
          width={80}
          alt="bordeaux"
          className="ml-12"
        />
        <Image
          src="/Marquee/pariscite.svg"
          height={80}
          width={80}
          alt="paris cite"
          className="ml-12"
        />
        <Image
          src="/Marquee/scalay.svg"
          height={80}
          width={80}
          alt="scalay"
          className="ml-12"
        />
      </Marquee>
    </div>
  );
}

export default Problem;
