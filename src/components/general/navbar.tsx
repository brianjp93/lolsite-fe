import {useUser} from "@/hooks";
import {loginPath} from "@/pages/login";
import Image from "next/image";
import Link from "next/link";
import { SearchForm } from "./searchForm";
import LogoutButton from "./logoutButton";

export default function NavBar() {
  const user = useUser()
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

      <div className="ml-3 pl-2 flex h-full items-center bg-white/10">
        <SearchForm
          showButton={false}
          showLabel={false}
          inputClass="border-none"
          formClass="h-full flex"
        />
      </div>

      <div className="ml-auto">
        {user ?
          <div>{user.email} <LogoutButton /></div>
          : <Link href={loginPath()}>login</Link>
        }
      </div>
    </div>
  );
}
