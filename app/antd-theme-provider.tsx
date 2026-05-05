"use client";

import { App, ConfigProvider } from "antd";
import type { ReactNode } from "react";

const brandPrimary = "#d00000";

export default function AntdThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: brandPrimary,
          colorLink: brandPrimary,
          colorInfo: brandPrimary,
        },
        components: {
          Menu: {
            itemSelectedColor: brandPrimary,
            itemSelectedBg: "var(--brand-surface)",
            itemHoverColor: brandPrimary,
            itemHoverBg: "var(--brand-surface)",
            itemActiveBg: "var(--brand-muted-bg)",
          },
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
