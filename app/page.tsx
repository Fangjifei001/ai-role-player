"use client";

import { BankOutlined, SettingOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { Manrope } from "next/font/google";
import Image from "next/image";
import { useRouter } from "next/navigation";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full">
      <Image
        src="/bg-light.jpg"
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        quality={85}
        className="-z-10 object-cover object-center"
        aria-hidden
      />
      {/* Soft vignette: keeps photo visible, helps white type read like a floating layer */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_42%,rgba(15,23,42,0.42),transparent_72%),linear-gradient(to_bottom,rgba(15,23,42,0.12),transparent_35%,rgba(15,23,42,0.2))]"
        aria-hidden
      />
      <main
        className={`${manrope.className} relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-14`}
      >
        <div className="flex max-w-4xl flex-col items-center text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.42em] text-white/75 sm:text-xs">
            AI Role Player
          </p>
          <h1
            className="mt-7 max-w-[20ch] text-balance text-[clamp(1.65rem,4.5vw+0.6rem,3.65rem)] font-semibold leading-[1.08] tracking-[0.04em] text-white sm:max-w-[22ch] sm:tracking-[0.055em] md:max-w-none"
            style={{
              textShadow:
                "0 2px 28px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.5)",
            }}
          >
            Embark on your{" "}
            <span className="font-medium tracking-[0.07em] text-white/95 sm:tracking-[0.1em]">
              fantastic sales skills journey
            </span>
          </h1>
          <p
            className="mt-9 max-w-xl text-pretty text-base font-normal leading-relaxed tracking-wide text-white/88 sm:text-lg"
            style={{ textShadow: "0 1px 18px rgba(0,0,0,0.35)" }}
          >
            Choose where to go next. Learners open the dashboard; admins configure scenarios and
            personas.
          </p>
          <div className="mt-12 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Button
              size="large"
              icon={<BankOutlined />}
              className="!h-12 !rounded-full !border-white/90 !bg-white/10 !px-7 !font-medium !text-white !backdrop-blur-sm hover:!border-white hover:!bg-white/20 hover:!text-white"
              block
              onClick={() => router.push("/dashboard")}
            >
              Learner
            </Button>
            <Button
              size="large"
              icon={<SettingOutlined />}
              className="!h-12 !rounded-full !border-white/55 !bg-transparent !px-7 !font-medium !text-white hover:!border-white hover:!bg-white/10 hover:!text-white"
              block
              onClick={() => router.push("/admin")}
            >
              Admin
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
