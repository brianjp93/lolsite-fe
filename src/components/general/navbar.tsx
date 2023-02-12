import { useFavorites, useUser } from "@/hooks";
import { loginPath } from "@/pages/login";
import Image from "next/image";
import Link from "next/link";
import { SearchForm } from "./searchForm";
import LogoutButton from "./logoutButton";
import { useState } from "react";
import { Dropdown } from "./dropdown";
import {profileRoute} from "@/routes";

export default function NavBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const user = useUser().data;
  const favoritesQuery = useFavorites();
  const favorites = favoritesQuery.data || [];

  return (
    <div className="flex h-20 items-center bg-gradient-to-r from-slate-800/70 to-cyan-900/30 px-4 drop-shadow-md">
      <div>
        <Link href="/">
          <Image
            alt="hardstuck logo"
            src="/gen/logo-clean.png"
            height={45}
            width={45}
            className="h-fit drop-shadow-[0_0_.25rem_rgba(109,154,220,.6)] hover:drop-shadow-[0_0_.25rem_rgba(109,154,220,1)]"
          />
        </Link>
      </div>

      <div className="ml-3 flex h-full items-center bg-white/10 pl-2">
        <SearchForm
          showButton={false}
          showLabel={false}
          inputClass="border-none"
          formClass="h-full flex"
        />
      </div>

      <div className="ml-auto flex h-full">
        {user ? (
          <div
            onClick={() => setIsDropdownOpen((x) => !x)}
            className="relative flex h-full cursor-pointer items-center"
          >
            {user.email}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="ml-2 h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5"
              />
            </svg>
            <Dropdown
              isOpen={isDropdownOpen}
              close={() => setIsDropdownOpen(false)}
            >
              <>
                {favorites.map((fav) => {
                  return (
                    <Link
                      href={profileRoute({region: fav.region, name: fav.name})}
                      className="flex px-2 py-1"
                      key={`${fav.region} ${fav.name}`}>
                      <div className="mr-2 font-bold">
                        {fav.region}
                      </div>
                      <div>
                        {fav.name}
                      </div>
                    </Link>
                  );
                })}
                <div>
                  <LogoutButton className="w-full" />
                </div>
              </>
            </Dropdown>
          </div>
        ) : (
          <Link href={loginPath()}>login</Link>
        )}
      </div>
    </div>
  );
}
