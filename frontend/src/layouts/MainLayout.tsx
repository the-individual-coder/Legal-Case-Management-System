"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import SideNav from "@/components/SideNav";
import { SessionProvider } from "next-auth/react";
import { App as AntdApp, ConfigProvider, Button, message } from "antd";
import { MenuUnfoldOutlined } from "@ant-design/icons";
interface Props {
  children: ReactNode;
}

export function MainLayout({ children }: Props) {
  const [messageApi, contextHolder] = message.useMessage();
  const pathname = usePathname();

  // Skip layout for /login
  const hideLayout = pathname === "/login";

  const toggleSidebar = () => {
    console.log("toggled");
    const divSidebar = document.querySelector("#toggle-sidebar");
    if (divSidebar) divSidebar.classList.toggle("toggle-sidebar");
  };
  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <SessionProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#2563EB",
            colorText: "#0F172A",
            colorBgContainer: "#ffffff",
            borderRadius: 8,
          },
        }}
      >
        <AntdApp>
          {contextHolder}{" "}
          {
            <div
              id="toggle-sidebar"
              className="min-h-screen flex toggle-sidebar"
            >
              <aside className="w-64 bg-white border-r hidden md:block sidebar">
                <MenuUnfoldOutlined
                  onClick={toggleSidebar}
                  style={{ fontSize: "25px" }}
                />
                <SideNav />
              </aside>
              <div className="flex-1 flex flex-col">
                <header className="border-b bg-white">
                  <AppHeader />
                </header>
                <main className="p-6">{children}</main>
              </div>
            </div>
          }
        </AntdApp>
      </ConfigProvider>
    </SessionProvider>
  );
}
