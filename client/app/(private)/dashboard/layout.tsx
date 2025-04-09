"use client";
import { ChevronDown } from "lucide-react";
import { useAppSelector } from "@/app/store/hooks";
import BreadCrumb from "@/app/components/feedback/BreadCrumb";
import Image from "next/image";
import Sidebar from "../../components/layout/Sidebar";
import { usePathname, useRouter } from "next/navigation";
import useQueryParams from "@/app/hooks/network/useQueryParams";
import SearchBar from "@/app/components/atoms/SearchBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { updateQuery } = useQueryParams();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const onSearch = (data: { searchQuery: string }) => {
    const query = new URLSearchParams();
    query.set("searchQuery", data.searchQuery);

    if (pathname !== "/shop") {
      router.push(`/shop?${query.toString()}`);
    } else {
      updateQuery({ searchQuery: data.searchQuery });
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <BreadCrumb />
          <div className="flex items-center gap-6">
            <SearchBar onSearch={onSearch} />
            <div className="flex items-center gap-2">
              <Image
                src={user?.avatar || ""}
                alt="Profile"
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </header>

        <div className="px-4"></div>

        <main className="flex-1 p-2 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
